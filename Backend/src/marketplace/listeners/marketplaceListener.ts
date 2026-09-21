import { provider, marketplace, contractAddress } from "../../config/blockchain";
import Listing from "../../models/Listing";
import NFT from "../../models/NFT";

const BLOCK_RANGE = 9_000;
const DEFAULT_INITIAL_SYNC_BLOCKS = 100_000;

type MarketplaceEvent = {
  fragment: { name: string };
  args: any;
  blockNumber: number;
  index: number;
};

function startMarketplaceListener() {
  const eventTopics = [
    marketplace.interface.getEvent("Listed")!.topicHash,
    marketplace.interface.getEvent("Sold")!.topicHash,
    marketplace.interface.getEvent("Cancelled")!.topicHash,
  ];

  const saveListing = async (tokenId: bigint, seller: string, price: bigint) => {
    await Listing.findOneAndUpdate(
      { tokenId: Number(tokenId) },
      { seller, price: price.toString(), listing: true, active: true },
      { upsert: true, returnDocument: "after" }
    );
  };

  const markInactive = async (tokenId: bigint) => {
    await Listing.findOneAndUpdate(
      { tokenId: Number(tokenId) },
      { listing: false, active: false }
    );
  };

  const updateTokenOwner = async (tokenId: bigint, owner: string) => {
    await NFT.findOneAndUpdate(
      { contractAddress: contractAddress!.toLowerCase(), tokenId: Number(tokenId) },
      { owner }
    );
  };

  const syncMarketplaceEvents = async () => {
    const latestBlock = await provider.getBlockNumber();
    const configuredStartBlock = process.env.MARKETPLACE_START_BLOCK;
    const startBlock = configuredStartBlock
      ? Number(configuredStartBlock)
      : Math.max(0, latestBlock - DEFAULT_INITIAL_SYNC_BLOCKS);

    if (!Number.isInteger(startBlock) || startBlock < 0 || startBlock > latestBlock) {
      throw new Error(`Invalid MARKETPLACE_START_BLOCK: ${configuredStartBlock}`);
    }

    console.log(`Syncing marketplace events from block ${startBlock} to ${latestBlock}`);
    const events: MarketplaceEvent[] = [];
    for (let fromBlock = startBlock; fromBlock <= latestBlock; fromBlock += BLOCK_RANGE + 1) {
      const toBlock = Math.min(fromBlock + BLOCK_RANGE, latestBlock);
      const logs = await provider.getLogs({
        address: marketplace.target,
        fromBlock,
        toBlock,
        topics: [eventTopics],
      });

      for (const log of logs) {
        const parsed = marketplace.interface.parseLog(log);
        if (parsed) {
          events.push({
            fragment: parsed.fragment,
            args: parsed.args,
            blockNumber: log.blockNumber,
            index: log.index,
          });
        }
      }
    }

    events.sort((left, right) => left.blockNumber - right.blockNumber || left.index - right.index);

    for (const event of events) {
      if (event.fragment.name === "Listed") {
        await saveListing(event.args.tokenId, event.args.seller, event.args.price);
        await updateTokenOwner(event.args.tokenId, event.args.seller);
      } else if (event.fragment.name === "Sold") {
        await markInactive(event.args.tokenId);
        await updateTokenOwner(event.args.tokenId, event.args.buyer);
      } else {
        await markInactive(event.args.tokenId);
        await updateTokenOwner(event.args.tokenId, event.args.seller);
      }
    }

    console.log(`Synced ${events.length} marketplace events`);
  };

  syncMarketplaceEvents().catch((error: unknown) => {
    console.error("Failed to sync marketplace listings:", error);
  });

  provider.on({ address: marketplace.target, topics: [eventTopics] }, async (log) => {
    try {
      const event = marketplace.interface.parseLog(log);
      if (!event) return;

      if (event.name === "Listed") {
        await saveListing(event.args.tokenId, event.args.seller, event.args.price);
        await updateTokenOwner(event.args.tokenId, event.args.seller);
      } else if (event.name === "Sold") {
        await markInactive(event.args.tokenId);
        await updateTokenOwner(event.args.tokenId, event.args.buyer);
      } else {
        await markInactive(event.args.tokenId);
        await updateTokenOwner(event.args.tokenId, event.args.seller);
      }
    } catch (error: unknown) {
      console.error("Failed to persist marketplace event:", error);
    }
  });

  console.log("Marketplace event listener started");
}

export default startMarketplaceListener;