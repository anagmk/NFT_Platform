const express = require("express");
const multer = require("multer");
const { uploadFile, uploadMetadata } = require("../controllers/uploadController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/file", upload.single("file"), uploadFile);
router.post("/metadata", uploadMetadata);

module.exports = router;