import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { ExecutionResult, TransactionHashVariant, TransactionStatus } from "genlayer-js/types";
import type { EIP1193Provider } from "viem";
import { CONTRACT_ADDRESS, EXPLORER_URL, isConfigured } from "./constants";
import type { Agreement, Attempt } from "./types";

const readClient = createClient({chain: studionet});

function plain<T>(value: unknown): T {
  if (value instanceof Map) {
    const object: Record<string, unknown> = {};
    value.forEach((item, key) => object[String(key)] = plain(item));
    return object as T;
  }
  if (Array.isArray(value)) return value.map(plain) as T;
  if (typeof value === "bigint") return value.toString() as T;
  return value as T;
}

async function read<T>(name: string, args: unknown[] = []) {
  if (!isConfigured()) throw new Error("Contract address is not configured");
  return plain<T>(await readClient.readContract({
    address: CONTRACT_ADDRESS,
    functionName: name,
    args: args as never,
    transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
  }));
}

export const api = {
  agreement: (id: string) => read<Agreement>("get_agreement", [id]),
  attempts: (id: string) => read<Attempt[]>("get_attempts", [id]),
  forWallet: (address: string) => read<Agreement[]>("get_for_wallet", [address]),
  claimable: (address: string) => read<string>("get_claimable", [address]),
};

export type WriteProgress = {
  hash: string;
  status: "SUBMITTED" | "ACCEPTED" | "FINALIZED" | "TRACKING" | "UNKNOWN" | "FAILED";
  execution?: string;
  error?: string;
};

type Receipt = {
  statusName?: string;
  txExecutionResultName?: string;
  value_credited?: boolean;
};

export class SubmittedTransactionError extends Error {
  constructor(public readonly hash: string, message: string, public readonly status: WriteProgress["status"] = "TRACKING") {
    super(message);
    this.name = "SubmittedTransactionError";
  }
}

export class ExecutionFailedError extends Error {
  constructor(public readonly hash: string, public readonly execution: string, message: string) {
    super(message);
    this.name = "ExecutionFailedError";
  }
}

export function executionSucceeded(receipt: Receipt) {
  return receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_RETURN;
}

export function executionFailed(receipt: Receipt) {
  return receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_ERROR;
}

export function transferSucceeded(receipt: Receipt) {
  return receipt.value_credited === true;
}

function finalOutcome(hash: string, receipt: Receipt, onProgress?: (progress: WriteProgress) => void) {
  if (executionFailed(receipt)) {
    onProgress?.({hash, status: "FAILED", execution: receipt.txExecutionResultName, error: "GenVM execution failed."});
    throw new ExecutionFailedError(hash, receipt.txExecutionResultName || "FINISHED_WITH_ERROR", "The transaction finalized with a contract execution error.");
  }
  if (!executionSucceeded(receipt)) {
    onProgress?.({hash, status: "UNKNOWN", execution: receipt.txExecutionResultName, error: "Finality was reached but execution success was not proven."});
    throw new ExecutionFailedError(hash, receipt.txExecutionResultName || "NOT_VOTED", "Finality was reached but GenVM execution success was not proven.");
  }
  onProgress?.({hash, status: "FINALIZED", execution: receipt.txExecutionResultName});
  return {hash, status: "FINALIZED" as const, execution: receipt.txExecutionResultName, explorer: `${EXPLORER_URL}/tx/${hash}`};
}

async function waitForFinalization(client: ReturnType<typeof createClient>, hash: string, onProgress?: (progress: WriteProgress) => void) {
  try {
    const receipt = await client.waitForTransactionReceipt({hash: hash as never, status: TransactionStatus.FINALIZED, retries: 450, interval: 4000}) as unknown as Receipt;
    return finalOutcome(hash, receipt, onProgress);
  } catch (caught) {
    if (caught instanceof ExecutionFailedError) throw caught;
    onProgress?.({hash, status: "TRACKING", error: caught instanceof Error ? caught.message : String(caught)});
    throw new SubmittedTransactionError(hash, "The transaction was submitted, but finality is not confirmed yet.");
  }
}

export async function resumeTransaction(hash: string, onProgress?: (progress: WriteProgress) => void) {
  const tx = await readClient.getTransaction({hash: hash as never}) as unknown as Receipt;
  const status = String(tx.statusName || "").toUpperCase();
  if (status === TransactionStatus.FINALIZED) return finalOutcome(hash, tx, onProgress);
  if (status === TransactionStatus.ACCEPTED) {
    onProgress?.({hash, status: "ACCEPTED", execution: tx.txExecutionResultName});
    if (executionFailed(tx)) throw new ExecutionFailedError(hash, tx.txExecutionResultName || "FINISHED_WITH_ERROR", "The transaction was accepted with a contract execution error.");
    return waitForFinalization(readClient, hash, onProgress);
  }
  if ([TransactionStatus.CANCELED, TransactionStatus.UNDETERMINED, TransactionStatus.VALIDATORS_TIMEOUT, TransactionStatus.LEADER_TIMEOUT].includes(status as TransactionStatus)) {
    onProgress?.({hash, status: "UNKNOWN", error: `GenLayer status is ${status}.`});
    return {hash, status: "UNKNOWN" as const, execution: tx.txExecutionResultName, explorer: `${EXPLORER_URL}/tx/${hash}`};
  }
  return waitForFinalization(readClient, hash, onProgress);
}

export async function waitForExistingTransaction(hash: string, onProgress?: (progress: WriteProgress) => void) {
  try {
    const receipt = await readClient.waitForTransactionReceipt({hash: hash as never, status: TransactionStatus.FINALIZED, retries: 450, interval: 4000}) as unknown as Receipt;
    if (transferSucceeded(receipt)) {
      onProgress?.({hash, status: "FINALIZED", execution: "VALUE_CREDITED"});
      return {hash, status: "FINALIZED" as const, execution: "VALUE_CREDITED", explorer: `${EXPLORER_URL}/tx/${hash}`};
    }
    if (receipt.txExecutionResultName) return finalOutcome(hash, receipt, onProgress);
    throw new Error("The finalized transfer child did not prove recipient credit.");
  } catch (caught) {
    if (caught instanceof ExecutionFailedError) throw caught;
    onProgress?.({hash, status: "UNKNOWN", error: caught instanceof Error ? caught.message : String(caught)});
    throw new SubmittedTransactionError(hash, caught instanceof Error ? caught.message : "The transfer child result is not confirmed.", "UNKNOWN");
  }
}

export async function triggeredTransactions(hash: string) {
  return readClient.getTriggeredTransactionIds({hash: hash as never}) as Promise<string[]>;
}

export async function write(address: `0x${string}`, provider: EIP1193Provider, name: string, args: unknown[], value = 0n, onProgress?: (progress: WriteProgress) => void) {
  if (!isConfigured()) throw new Error("Contract address is not configured");
  const client = createClient({chain: studionet, account: address, provider});
  const hash = String(await client.writeContract({address: CONTRACT_ADDRESS, functionName: name, args: args as never, value}));
  onProgress?.({hash, status: "SUBMITTED"});
  let accepted: Receipt;
  try {
    accepted = await client.waitForTransactionReceipt({hash: hash as never, status: TransactionStatus.ACCEPTED, retries: 180, interval: 4000}) as unknown as Receipt;
  } catch (caught) {
    onProgress?.({hash, status: "TRACKING", error: caught instanceof Error ? caught.message : String(caught)});
    throw new SubmittedTransactionError(hash, "The transaction was submitted, but the accepted state is not confirmed yet.");
  }
  if (String(accepted.statusName || "").toUpperCase() === TransactionStatus.ACCEPTED) {
    onProgress?.({hash, status: "ACCEPTED", execution: accepted.txExecutionResultName});
    if (executionFailed(accepted)) throw new ExecutionFailedError(hash, accepted.txExecutionResultName || "FINISHED_WITH_ERROR", "The transaction was accepted with a contract execution error.");
  } else {
    onProgress?.({hash, status: "UNKNOWN", execution: accepted.txExecutionResultName, error: `GenLayer status is ${accepted.statusName || "unknown"}.`});
  }
  return waitForFinalization(client, hash, onProgress);
}
