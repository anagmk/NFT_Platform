import { network } from "hardhat";

async function main() {
  const { viem } = await network.create();

  const [owner] = await viem.getWalletClients();
  console.log(`Using account: ${owner.account.address}`);

  // `NFT` is the Solidity contract name; `MyNFT.sol` is only its source filename.
  // The NFT constructor's initialOwner must be the wallet allowed to mint.
  const nft = await viem.deployContract("NFT", [owner.account.address]);
  console.log(`Contract deployed to: ${nft.address}`);

  // Mint
  const tokenURI = "ipfs://exampleuri"; // or whatever your safeMint expects
  const txHash = await nft.write.safeMint(
    [owner.account.address, 0n, tokenURI],
    { account: owner.account },
  );
  console.log(`Mint tx hash: ${txHash}`);

  // Read back to confirm
  const ownerOfToken = await nft.read.ownerOf([0n]);
  console.log(`Owner of token 0: ${ownerOfToken}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
