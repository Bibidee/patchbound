import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type { EIP1193Provider } from "viem";
import { CONTRACT_ADDRESS, EXPLORER_URL, isConfigured } from "./constants";
import type { Agreement, Attempt } from "./types";
const readClient = createClient({chain:studionet});
function plain<T>(v:unknown):T{if(v instanceof Map){const o:Record<string,unknown>={};v.forEach((x,k)=>o[String(k)]=plain(x));return o as T}if(Array.isArray(v))return v.map(plain) as T;if(typeof v==="bigint")return v.toString() as T;return v as T}
async function read<T>(name:string,args:unknown[]=[]){if(!isConfigured()) throw new Error("Contract address is not configured");return plain<T>(await readClient.readContract({address:CONTRACT_ADDRESS,functionName:name,args:args as never}));}
export const api={agreement:(id:string)=>read<Agreement>("get_agreement",[id]),attempts:(id:string)=>read<Attempt[]>("get_attempts",[id]),forWallet:(address:string)=>read<Agreement[]>("get_for_wallet",[address]),claimable:(address:string)=>read<string>("get_claimable",[address])};
export type WriteProgress={hash:string;status:string};
export async function write(address:`0x${string}`,provider:EIP1193Provider,name:string,args:unknown[],value=0n,onAccepted?:(p:WriteProgress)=>void){
  if(!isConfigured()) throw new Error("Contract address is not configured");
  const client=createClient({chain:studionet,account:address,provider});
  const hash=await client.writeContract({address:CONTRACT_ADDRESS,functionName:name,args:args as never,value});
  onAccepted?.({hash:String(hash),status:"SUBMITTED"});
  const accepted=await client.waitForTransactionReceipt({hash:hash as never,status:"ACCEPTED" as never,retries:180,interval:4000}) as unknown as {statusName?:string};
  onAccepted?.({hash:String(hash),status:accepted.statusName??"ACCEPTED"});
  // Finalization is deliberately awaited separately. ACCEPTED is provisional.
  const finalized=await client.waitForTransactionReceipt({hash:hash as never,status:"FINALIZED" as never,retries:450,interval:4000}) as unknown as {statusName?:string};
  return {hash:String(hash),status:finalized.statusName??"FINALIZED",explorer:`${EXPLORER_URL}/tx/${hash}`};
}
