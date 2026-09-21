import mongoose, { Schema } from "mongoose";

export interface ListingDocument extends mongoose.Document {
  tokenId: number;
  seller: string;
  price: string;
  tokenURI?: string;
  listing: boolean;
  active: boolean;
}

const listingSchema = new Schema<ListingDocument>({
  tokenId: { type: Number, required: true, unique: true },
  seller: { type: String, required: true },
  price: { type: String, required: true },
  tokenURI: { type: String },
  listing: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<ListingDocument>("Listing", listingSchema);