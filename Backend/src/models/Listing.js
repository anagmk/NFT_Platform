const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  tokenId: { type: Number, required: true, unique: true },
  seller: { type: String, required: true },
  price: { type: String, required: true }, // store as string, wei is too big for Number
  tokenURI: { type: String },
  listing: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Listing", listingSchema);