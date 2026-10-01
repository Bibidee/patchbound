"use client";

export type PendingTransaction = {
  hash: string;
  action: string;
  agreementId?: string;
  wallet: string;
  network: number;
  submittedAt: number;
  route: string;
};

const STORAGE_KEY = "patchbound:pending-transactions";

function readAll(): PendingTransaction[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: PendingTransaction[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function savePendingTransaction(item: PendingTransaction) {
  writeAll([...readAll().filter(existing => existing.hash !== item.hash), item]);
}

export function removePendingTransaction(hash: string) {
  writeAll(readAll().filter(item => item.hash !== hash));
}

export function findPendingTransaction(query: {action: string; wallet: string; agreementId?: string}) {
  return readAll().find(item => item.action === query.action && item.wallet.toLowerCase() === query.wallet.toLowerCase() && item.agreementId === query.agreementId);
}
