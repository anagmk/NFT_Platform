import { Router } from "express";
import {
  getAllListings,
  getListingByTokenId,
  saveMintedNFT,
} from "../../controllers/nft/nftController";

const router = Router();

router.get("/", getAllListings);
router.post("/minted", saveMintedNFT);
router.get("/:tokenId", getListingByTokenId);

export default router;