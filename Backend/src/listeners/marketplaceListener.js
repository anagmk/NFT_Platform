const { provider, marketplace } = require("../config/blockchain");
const Listing = require("../models/Listing");
const BLOCK_RANGE = 9_000;
const DEFAULT_INITIAL_SYNC_BLOCKS = 100_000;

function startMarketplaceListener() {
  const eventTopics = [
    marketplace.interface.getEvent("Listed").topicHash,
    marketplace.interface.getEvent("Sold").topicHash,
    marketplace.interface.getEvent("Cancelled").topicHash,
  ];

  const saveListing = async (tokenId, seller, price) => {
    const listing = await Listing.findOneAndUpdate(
      { tokenId: Number(tokenId) },
      { seller, price: price.toString(), listing: true, active: true },
      { upsert: true, returnDocument: "after" }
    );

    console.log(`Saved listing ${listing.tokenId} to MongoDB`);
  };

  const markInactive = async (tokenId) => {
    await Listing.findOneAndUpdate(
      { tokenId: Number(tokenId) },
      { listing: false, active: false }
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
    const events = [];
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

    events.sort((left, right) => {
      if (left.blockNumber !== right.blockNumber) {
        return left.blockNumber - right.blockNumber;
      }
      return left.index - right.index;
    });

    for (const event of events) {
      if (event.fragment.name === "Listed") {
        await saveListing(event.args.tokenId, event.args.seller, event.args.price);
      } else {
        await markInactive(event.args.tokenId);
      }
    }

    console.log(`Synced ${events.length} marketplace events`);
  };

  syncMarketplaceEvents().catch((error) => {
    console.error("Failed to sync marketplace listings:", error);
  });

  provider.on({ address: marketplace.target, topics: [eventTopics] }, async (log) => {
    try {
      const event = marketplace.interface.parseLog(log);
      if (!event) return;

      if (event.name === "Listed") {
        console.log(`Listed: token ${event.args.tokenId} by ${event.args.seller}`);
        await saveListing(event.args.tokenId, event.args.seller, event.args.price);
      } else {
        console.log(`${event.name}: token ${event.args.tokenId}`);
        await markInactive(event.args.tokenId);
      }
    } catch (error) {
      console.error("Failed to persist marketplace event:", error);
    }
  });

  console.log("Marketplace event listener started");
}

module.exports = startMarketplaceListener;