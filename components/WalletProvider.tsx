"use client";

import {createContext,useCallback,useContext,useEffect,useMemo,useState} from "react";
import {CHAIN_ID} from "@/lib/constants";
import {ensureStudionet,injected,type EthereumProvider} from "@/lib/wallet";

type Ctx = {address: string;chainId: number|null;connected: boolean;provider: EthereumProvider|null;connect: () => Promise<void>;disconnect: () => void;switchNetwork: () => Promise<void>};
const WalletContext = createContext<Ctx|null>(null);

export function WalletProvider({children}: {children: React.ReactNode}) {
  const [address,setAddress] = useState("");
  const [chainId,setChainId] = useState<number|null>(null);
  const [provider,setProvider] = useState<EthereumProvider|null>(() => injected());
  const sync = useCallback(async () => {
    const q = injected();setProvider(q);if (!q) return;
    const accounts = await q.request({method: "eth_accounts"}) as string[];
    const chain = await q.request({method: "eth_chainId"}) as string;
    setAddress(accounts[0] ?? "");setChainId(parseInt(chain,16));
  }, []);
  useEffect(() => {void sync();const q = injected();if (!q?.on) return;const callback = () => void sync();q.on("accountsChanged",callback);q.on("chainChanged",callback);return () => {q.removeListener?.("accountsChanged",callback);q.removeListener?.("chainChanged",callback)}},[sync]);
  const connect = useCallback(async () => {const q = injected();if (!q) throw new Error("No injected EVM wallet found. Install MetaMask or Rabby.");await q.request({method: "eth_requestAccounts"});await sync()},[sync]);
  const disconnect = useCallback(() => setAddress(""),[]);
  const switchNetwork = useCallback(async () => {const q = injected();if (!q) throw new Error("No injected wallet found");await ensureStudionet(q);await sync()},[sync]);
  const value = useMemo(() => ({address,chainId,connected:Boolean(address),provider,connect,disconnect,switchNetwork}),[address,chainId,provider,connect,disconnect,switchNetwork]);
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export const useWallet = () => {const context = useContext(WalletContext);if (!context) throw new Error("WalletProvider missing");return context};
export const onStudionet = (id: number|null) => id === CHAIN_ID;
