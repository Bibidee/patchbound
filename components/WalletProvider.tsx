"use client";
import {createContext,useCallback,useContext,useEffect,useMemo,useState} from "react";
import {CHAIN_ID} from "@/lib/constants";import {ensureStudionet,injected,type EthereumProvider} from "@/lib/wallet";
type Ctx={address:string;chainId:number|null;connected:boolean;provider:EthereumProvider|null;connect:()=>Promise<void>;disconnect:()=>void;switchNetwork:()=>Promise<void>};
const WalletContext=createContext<Ctx|null>(null);
export function WalletProvider({children}:{children:React.ReactNode}){const [address,setAddress]=useState("");const [chainId,setChainId]=useState<number|null>(null);const p=injected();
const sync=useCallback(async()=>{const q=injected();if(!q)return;const a=await q.request({method:"eth_accounts"}) as string[];const c=await q.request({method:"eth_chainId"}) as string;setAddress(a[0]??"");setChainId(parseInt(c,16));},[]);
useEffect(()=>{void sync();const q=injected();if(!q?.on)return;const cb=()=>void sync();q.on("accountsChanged",cb);q.on("chainChanged",cb);return()=>{q.removeListener?.("accountsChanged",cb);q.removeListener?.("chainChanged",cb)}},[sync]);
const connect=async()=>{const q=injected();if(!q)throw new Error("No injected EVM wallet found. Install MetaMask or Rabby.");await q.request({method:"eth_requestAccounts"});await sync()};
const disconnect=()=>setAddress("");const switchNetwork=async()=>{const q=injected();if(!q)throw new Error("No injected wallet found");await ensureStudionet(q);await sync()};
const v=useMemo(()=>({address,chainId,connected:!!address,provider:p,connect,disconnect,switchNetwork}),[address,chainId,p]);return <WalletContext.Provider value={v}>{children}</WalletContext.Provider>}
export const useWallet=()=>{const c=useContext(WalletContext);if(!c)throw new Error("WalletProvider missing");return c};
export const onStudionet=(id:number|null)=>id===CHAIN_ID;
