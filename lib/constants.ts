export const CHAIN_ID = 61999;
export const RPC_URL = "https://studio.genlayer.com/api";
export const EXPLORER_URL = "https://explorer-studio.genlayer.com";
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_PATCHBOUND_CONTRACT || "0x4CBb65036b3E688dAEE420127c2aeD14CDE41Db5") as `0x${string}`;
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const isConfigured = () => CONTRACT_ADDRESS !== ZERO_ADDRESS;
