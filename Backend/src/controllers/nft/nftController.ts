import type { Request, Response } from "express";
import Listing from "../../models/Listing";
import NFT from "../../models/NFT";

export async function saveMintedNFT(req: Request, res: Response) {
  try {
    const { tokenId, owner, tokenURI } = req.body as {
      tokenId?: number | string;
      owner?: string;
      tokenURI?: string;
    };

    if (!Number.isInteger(Number(tokenId)) || !owner || !tokenURI) {
      return res.status(400).json({ error: "tokenId, owner, and tokenURI are required" });
    }

    const contractAddress = process.env.CONTRACT_ADDRESS?.toLowerCase();
    if (!contractAddress) {
      return res.status(500).json({ error: "CONTRACT_ADDRESS is not configured" });
    }

    const nft = await NFT.findOneAndUpdate(
      { contractAddress, tokenId: Number(tokenId) },
      { contractAddress, tokenId: Number(tokenId), owner, creator: owner, tokenURI },
      { upsert: true, returnDocument: "after" }
    );

    await Listing.findOneAndUpdate(
      { tokenId: Number(tokenId) },
      { seller: owner, price: "0", tokenURI, listing: false, active: false },
      { upsert: true, returnDocument: "after" }
    );

    return res.status(200).json(nft);
  } catch (error) {
    console.error("Failed to save minted NFT:", error);
    return res.status(500).json({ error: "Failed to save minted NFT" });
  }
}

export async function getAllListings(_req: Request, res: Response) {
  try {
    const listings = await Listing.find({
      $or: [{ listing: true }, { listing: { $exists: false }, active: true }],
    });
    return res.status(200).json(listings);
  } catch {
    return res.status(500).json({ error: "Failed to fetch listings" });
  }
}

export async function getListingByTokenId(req: Request, res: Response) {
  try {
    const listing = await Listing.findOne({ tokenId: Number(req.params.tokenId) });
    if (!listing) return res.status(404).json({ error: "Not found" });
    return res.status(200).json(listing);
  } catch {
    return res.status(500).json({ error: "Failed to fetch listing" });
  }
}