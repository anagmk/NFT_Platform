const Listing = require("../models/Listing");

exports.getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find({ active: true });
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