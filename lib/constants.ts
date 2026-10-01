export const CHAIN_ID = 61999;
export const RPC_URL = "https://studio.genlayer.com/api";
export const EXPLORER_URL = "https://explorer-studio.genlayer.com";
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_PATCHBOUND_CONTRACT || ZERO_ADDRESS) as `0x${string}`;
export const isConfigured = () => CONTRACT_ADDRESS !== ZERO_ADDRESS;
