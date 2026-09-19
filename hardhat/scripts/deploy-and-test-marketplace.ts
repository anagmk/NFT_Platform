import { network } from "hardhat";

async function main() {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();

  // Hardhat gives us multiple test accounts — we'll use two:
  // one as the seller (you), one as a separate buyer
  const [seller, buyer] = await viem.getWalletClients();

  if (seller === undefined || buyer === undefined) {
    throw new Error(
      "Marketplace test requires seller and buyer accounts. Configure both Sepolia private keys.",
    );
  }

  console.log("Seller account:", seller.account.address);
  console.log("Buyer account:", buyer.account.address);

  // 1. Deploy the NFT contract
  const nft = await viem.deployContract("NFT", [seller.account.address]);
  console.log("NFT contract deployed to:", nft.address);

  // 2. Deploy the Marketplace contract, pointing it at the NFT contract
  const marketplace = await viem.deployContract("Marketplace", [nft.address]);
  console.log("Marketplace contract deployed to:", marketplace.address);

  // 3. Mint token #0 to the seller
  const mintTx = await nft.write.safeMint(
    [seller.account.address, 0n, "ipfs://YOUR_METADATA_CID/0.json"],
    { account: seller.account }
  );
  console.log("Mint tx hash:", mintTx);
  await publicClient.waitForTransactionReceipt({ hash: mintTx });

  const ownerAfterMint = await nft.read.ownerOf([0n]);
  console.log("Owner after mint:", ownerAfterMint);

  // 4. Approve the Marketplace to move this specific token
  const approveTx = await nft.write.approve(
    [marketplace.address, 0n],
    { account: seller.account }
  );
  console.log("Approve tx hash:", approveTx);
  await publicClient.waitForTransactionReceipt({ hash: approveTx });

  // 5. List the item for sale — price in wei (0.05 ETH here)
  const price = 1_000_000_000_000_000n; // 0.05 ETH in wei
  const listTx = await marketplace.write.listItem(
    [0n, price],
    { account: seller.account }
  );
  console.log("List tx hash:", listTx);
  await publicClient.waitForTransactionReceipt({ hash: listTx });

  const listingAfterList = await marketplace.read.listings([0n]);
  console.log("Listing after listItem:", listingAfterList);

  const ownerAfterList = await nft.read.ownerOf([0n]);
  console.log("NFT owner after listing (should be Marketplace contract):", ownerAfterList);

  // 6. Buyer purchases the item — must send exact price as value
  const buyTx = await marketplace.write.buyItem([0n], {
    account: buyer.account,
    value: price,
  });
  console.log("Buy tx hash:", buyTx);
  await publicClient.waitForTransactionReceipt({ hash: buyTx });

  const ownerAfterBuy = await nft.read.ownerOf([0n]);
  console.log("NFT owner after purchase (should be buyer):", ownerAfterBuy);

  const listingAfterBuy = await marketplace.read.listings([0n]);
  console.log("Listing after purchase (should be cleared/inactive):", listingAfterBuy);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
