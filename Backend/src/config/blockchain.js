const { ethers } = require("ethers");
const MarketplaceABI = require("../abis/Marketplace.json");
require("dotenv").config();

const rpcUrl = process.env.SEPOLIA_RPC_URL;
const contractAddress = process.env.CONTRACT_ADDRESS;

if (!rpcUrl) {
	throw new Error("SEPOLIA_RPC_URL is not configured");
}

if (!contractAddress) {
	throw new Error("CONTRACT_ADDRESS is not configured");
}

const provider = new ethers.JsonRpcProvider(
	 rpcUrl,
	 { name: "sepolia", chainId: 11155111 },
	 { staticNetwork: true }
);
const marketplace = new ethers.Contract(contractAddress, MarketplaceABI.abi, provider);

module.exports = { provider, marketplace };