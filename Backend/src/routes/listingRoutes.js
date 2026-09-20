const express = require("express");
const {
	getAllListings,
	getListingByTokenId,
	saveMintedNFT,
} = require("../controllers/listingController");

const router = express.Router();

router.get("/", getAllListings);
router.post("/minted", saveMintedNFT);
router.get("/:tokenId", getListingByTokenId);

module.exports = router;