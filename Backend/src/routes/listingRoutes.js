const express = require("express");
const { getAllListings, getListingByTokenId } = require("../controllers/listingController");

const router = express.Router();

router.get("/", getAllListings);
router.get("/:tokenId", getListingByTokenId);

module.exports = router;