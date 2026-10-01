import {describe,expect,it,beforeEach,afterEach,vi} from "vitest";
import {cleanup,render,screen,waitFor} from "@testing-library/react";
import {ExecutionResult} from "genlayer-js/types";
import {executionFailed,executionSucceeded,transferSucceeded} from "@/lib/genlayer";
import {TxPanel} from "@/components/TxPanel";
import {LifecycleRail} from "@/components/LifecycleRail";
import {WalletButton} from "@/components/WalletButton";
import {WalletProvider} from "@/components/WalletProvider";
import {chainHex,ensureStudionet} from "@/lib/wallet";
import {short} from "@/lib/format";
import {findPendingTransaction,removePendingTransaction,savePendingTransaction} from "@/lib/tx-tracking";
import type {Agreement} from "@/lib/types";

const agreement = (overrides: Partial<Agreement> = {}): Agreement => ({
  id: "4", requester: "0xrequester", developer: "0xdeveloper", repo: "acme/widget", issue: 0,
  clauses: ["A bounded requirement exists."], ci_required: false, reward: "5000000000000000000",
  offer_deadline: 2000, delivery_deadline: 3000, status: "ACTIVE", accepted_at: 1500,
  winning_pr: 0, winning_sha: "", outcome: "", explanation: "", attempt_count: 0,
  created_at: 1000, closed_at: 0, refund_dispatched: false, dispatched_amount: "0", settlement_state: "NONE", ...overrides,
});

afterEach(() => cleanup());

const installProvider = (initialAccounts = ["0xabcdef1234567890abcdef1234567890abcdef12"], initialChain = "0xF1") => {
  let accounts = initialAccounts;
  let chain = initialChain;
  const listeners = new Map<string, (...args: unknown[]) => void>();
  const provider = {
    request: vi.fn(async ({method,params}: {method:string;params?:unknown[]}) => {
      if (method === "eth_accounts") return accounts;
      if (method === "eth_chainId") return chain;
      if (method === "eth_requestAccounts") return accounts;
      if (method === "wallet_switchEthereumChain") { chain = String((params?.[0] as {chainId:string}).chainId); return null; }
      if (method === "wallet_addEthereumChain") { chain = String((params?.[0] as {chainId:string}).chainId); return null; }
      throw new Error(`Unexpected provider method: ${method}`);
    }),
    on: vi.fn((event:string, callback:(...args:unknown[]) => void) => { listeners.set(event, callback); }),
    removeListener: vi.fn((event:string) => { listeners.delete(event); }),
    emit(event:string, ...args:unknown[]) { listeners.get(event)?.(...args); },
    setAccounts(next:string[]) { accounts = next; },
    setChain(next:string) { chain = next; },
  };
  Object.defineProperty(window, "ethereum", {configurable:true, writable:true, value:provider});
  return provider;
};

describe("GenLayer execution semantics", () => {
  it("requires FINISHED_WITH_RETURN for success", () => {
    expect(executionSucceeded({txExecutionResultName: ExecutionResult.FINISHED_WITH_RETURN})).toBe(true);
    expect(executionSucceeded({execution_result: "SUCCESS"})).toBe(true);
    expect(executionSucceeded({txExecutionResultName: ExecutionResult.FINISHED_WITH_ERROR})).toBe(false);
    expect(executionFailed({consensus_data:{leader_receipt:[{execution_result:"ERROR"}]}})).toBe(true);
    expect(executionFailed({txExecutionResultName: ExecutionResult.FINISHED_WITH_ERROR})).toBe(true);
  });

  it("recognizes finalized external value credit separately from GenVM execution", () => {
    expect(transferSucceeded({value_credited: true})).toBe(true);
    expect(transferSucceeded({value_credited: false})).toBe(false);
    expect(transferSucceeded({txExecutionResultName: ExecutionResult.FINISHED_WITH_RETURN})).toBe(false);
  });

  it("renders submitted tracking as unknown rather than a resubmit failure", () => {
    render(<TxPanel stage="tracking" hash="0xsubmitted" error="Polling timed out." onResume={() => undefined} />);
    expect(screen.getByText("Transaction submitted.")).toBeTruthy();
    expect(screen.getByText(/Do not submit this action again/)).toBeTruthy();
    expect(screen.getByRole("button", {name: "Resume tracking"})).toBeTruthy();
  });
});

describe("wallet boundary", () => {
  it("switches a wrong-network provider to Studionet", async () => {
    const provider = installProvider([], "0x1");
    await ensureStudionet(provider);
    expect(provider.request).toHaveBeenCalledWith({method:"wallet_switchEthereumChain",params:[{chainId:chainHex}]});
  });

  it("renders network changes, reacts to account events, and disconnects", async () => {
    const provider = installProvider(["0xabcdef1234567890abcdef1234567890abcdef12"], "0x1");
    render(<WalletProvider><WalletButton /></WalletProvider>);
    await waitFor(() => expect(screen.getByRole("button", {name:/NETWORK CHANGE REQUIRED/})).toBeTruthy());
    screen.getByRole("button", {name:/NETWORK CHANGE REQUIRED/}).click();
    await screen.findByRole("button", {name:"Switch to Studionet"});
    screen.getByRole("button", {name:"Switch to Studionet"}).click();
    await waitFor(() => expect(screen.getByRole("button", {name:/STUDIONET/})).toBeTruthy());
    provider.setAccounts(["0x1234567890abcdef1234567890abcdef12345678"]);
    provider.emit("accountsChanged", ["0x1234567890abcdef1234567890abcdef12345678"]);
    await waitFor(() => expect(screen.getByRole("button", {name:/STUDIONET.*0x12345…45678/})).toBeTruthy());
    provider.setAccounts([]);
    provider.emit("accountsChanged", []);
    await waitFor(() => expect(screen.getByRole("button", {name:"Connect wallet"})).toBeTruthy());
  });
});

describe("transaction tracking", () => {
  beforeEach(() => window.localStorage.clear());

  it("persists and restores a submitted transaction by action and agreement", () => {
    savePendingTransaction({hash:"0xabc", action:"agreement-write", agreementId:"4", wallet:"0xDeV", network:61999, submittedAt:123, route:"/work/4"});
    expect(findPendingTransaction({action:"agreement-write", agreementId:"4", wallet:"0xdev"})?.hash).toBe("0xabc");
    removePendingTransaction("0xabc");
    expect(findPendingTransaction({action:"agreement-write", agreementId:"4", wallet:"0xdev"})).toBeUndefined();
  });
});

describe("durable lifecycle rendering", () => {
  it("does not infer acceptance for cancellation before acceptance", () => {
    const {container} = render(<LifecycleRail agreement={agreement({status:"CANCELLED", accepted_at:0, closed_at:1800, settlement_state:"REFUNDABLE"})} txStage="idle" />);
    const terms = screen.getByText("Terms accepted").closest("li");
    expect(terms?.className.includes("done")).toBe(false);
    expect(screen.getByText("Not accepted before closure")).toBeTruthy();
    expect(container.querySelectorAll("li.done").length).toBe(2);
  });

  it("keeps payable settlement separate from accepted transaction language", () => {
    render(<LifecycleRail agreement={agreement({status:"PAYABLE", accepted_at:1500, attempt_count:1, outcome:"SATISFIED", settlement_state:"PAYABLE"})} txStage="finalized" />);
    expect(screen.getByText("Settlement payable")).toBeTruthy();
    expect(screen.getByText("Satisfied outcome is payable")).toBeTruthy();
  });

  it("labels a payout dispatch without claiming recipient credit", () => {
    render(<LifecycleRail agreement={agreement({status:"PAYABLE", accepted_at:1500, attempt_count:1, outcome:"SATISFIED", settlement_state:"PAYOUT_DISPATCHED", dispatched_amount:"5000000000000000000"})} txStage="finalized" />);
    expect(screen.getByText("Payout dispatched")).toBeTruthy();
    expect(screen.getByText("One external transfer was dispatched")).toBeTruthy();
    expect(screen.queryByText("PAID")).toBeNull();
  });

  it("labels a refund dispatch without claiming recipient credit", () => {
    render(<LifecycleRail agreement={agreement({status:"EXPIRED", accepted_at:1500, closed_at:1800, settlement_state:"REFUND_DISPATCHED", refund_dispatched:true, dispatched_amount:"5000000000000000000"})} txStage="finalized" />);
    expect(screen.getByText("Refund dispatched")).toBeTruthy();
    expect(screen.getByText("REFUND_DISPATCHED")).toBeTruthy();
  });
});
