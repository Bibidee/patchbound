import { CHAIN_ID, RPC_URL, EXPLORER_URL } from "./constants";
export type EthereumProvider = {request(args:{method:string;params?:unknown[]}):Promise<unknown>;on?(event:string,cb:(...args:unknown[])=>void):void;removeListener?(event:string,cb:(...args:unknown[])=>void):void};
export const injected = (): EthereumProvider | null => typeof window === "undefined" ? null : ((window as unknown as {ethereum?:EthereumProvider}).ethereum ?? null);
export const chainHex = `0x${CHAIN_ID.toString(16)}`;
export async function ensureStudionet(p:EthereumProvider){
  const current = await p.request({method:"eth_chainId"}) as string;
  if(current.toLowerCase()===chainHex.toLowerCase()) return;
  try { await p.request({method:"wallet_switchEthereumChain",params:[{chainId:chainHex}]}); }
  catch { await p.request({method:"wallet_addEthereumChain",params:[{chainId:chainHex,chainName:"GenLayer Studionet",nativeCurrency:{name:"GEN",symbol:"GEN",decimals:18},rpcUrls:[RPC_URL],blockExplorerUrls:[EXPLORER_URL]}]}); }
}
