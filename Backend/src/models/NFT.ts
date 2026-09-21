import mongoose, { Schema } from "mongoose";

export interface NFTDocument extends mongoose.Document {
  tokenId: number;
  contractAddress: string;
  owner: string;
  creator: string;
  tokenURI: string;
  name?: string;
  description?: string;
  image?: string;
  mintedAt: Date;
}

const nftSchema = new Schema<NFTDocument>({
  tokenId: { type: Number, required: true },
  contractAddress: { type: String, required: true, lowercase: true },
  owner: { type: String, required: true, lowercase: true },
  creator: { type: String, required: true, lowercase: true },
  tokenURI: { type: String, required: true },
  name: { type: String },
  description: { type: String },
  image: { type: String },
  mintedAt: { type: Date, default: Date.now },
}, { timestamps: true });

nftSchema.index({ contractAddress: 1, tokenId: 1 }, { unique: true });

export default mongoose.model<NFTDocument>("NFT", nftSchema);