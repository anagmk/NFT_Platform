import { ethers } from "ethers";
import MarketplaceABI from "../abis/Marketplace.json";
import "dotenv/config";

const rpcUrl = process.env.SEPOLIA_RPC_URL;
const contractAddress: string | undefined = process.env.CONTRACT_ADDRESS;

if (!rpcUrl) {
  throw new Error("SEPOLIA_RPC_URL is not configured");
}

if (!contractAddress) {
  throw new Error("CONTRACT_ADDRESS is not configured");
}

export const provider = new ethers.JsonRpcProvider(
  rpcUrl,
  { name: "sepolia", chainId: 11155111 },
  { staticNetwork: true }
);

export const marketplace = new ethers.Contract(
  contractAddress,
  MarketplaceABI.abi,
  provider
);

export { contractAddress };