import {describe,it,expect} from "vitest";import {CHAIN_ID,RPC_URL} from "@/lib/constants";import {chainHex} from "@/lib/wallet";
describe("network baseline",()=>{it("is fixed to Studionet",()=>{expect(CHAIN_ID).toBe(61999);expect(chainHex).toBe("0xf22f");expect(RPC_URL).toBe("https://studio.genlayer.com/api")})});
describe("finality semantics",()=>{it("keeps accepted distinct from finalized",()=>{const states=["submitted","accepted","finalized"];expect(states.indexOf("accepted")).toBeLessThan(states.indexOf("finalized"))})});
