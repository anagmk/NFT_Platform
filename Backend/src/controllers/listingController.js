const Listing = require("../models/Listing");

exports.saveMintedNFT = async (req, res) => {
  try {
    const { tokenId, owner, tokenURI } = req.body;
    if (!Number.isInteger(Number(tokenId)) || !owner || !tokenURI) {
      return res.status(400).json({ error: "tokenId, owner, and tokenURI are required" });
    }

    const nft = await Listing.findOneAndUpdate(
      { tokenId: Number(tokenId) },
      {
        seller: owner,
        price: "0",
        tokenURI,
        listing: false,
        active: false,
      },
      { upsert: true, returnDocument: "after" }
    );

    res.status(200).json(nft);
  } catch (error) {
    console.error("Failed to save minted NFT:", error);
    res.status(500).json({ error: "Failed to save minted NFT" });
  }
};

exports.getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find({
      $or: [{ listing: true }, { listing: { $exists: false }, active: true }],
    });
    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch listings" });
  }
};

exports.getListingByTokenId = async (req, res) => {
  try {
    const listing = await Listing.findOne({ tokenId: req.params.tokenId });
    if (!listing) return res.status(404).json({ error: "Not found" });
    res.status(200).json(listing);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch listing" });
  }
};