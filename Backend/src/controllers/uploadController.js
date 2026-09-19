    const pinata = require("../config/pinata");

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    const file = new File([blob], req.file.originalname);

    const result = await pinata.upload.public.file(file);

    res.status(200).json({
      cid: result.cid,
      url: `ipfs://${result.cid}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
};

exports.uploadMetadata = async (req, res) => {
  try {
    const { name, description, imageCid } = req.body;

    if (!name || !imageCid) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const metadata = {
      name,
      description,
      image: `ipfs://${imageCid}`,
    };

    const result = await pinata.upload.public.json(metadata);

    res.status(200).json({
      cid: result.cid,
      tokenURI: `ipfs://${result.cid}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Metadata upload failed" });
  }
};