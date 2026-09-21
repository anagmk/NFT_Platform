import type { Request, Response } from "express";
import pinata from "../../config/pinata";
import { logError } from "../../middleware/errorHandler";

export async function uploadFile(req: Request, res: Response) {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const fileBytes = new Uint8Array(req.file.buffer);
    const blob = new Blob([fileBytes.buffer as ArrayBuffer], { type: req.file.mimetype });
    const file = new File([blob], req.file.originalname);
    const result = await pinata.upload.public.file(file);

    return res.status(200).json({ cid: result.cid, url: `ipfs://${result.cid}` });
  } catch (error) {
    logError("File upload failed", error);
    return res.status(500).json({ error: "Upload failed" });
  }
}

export async function uploadMetadata(req: Request, res: Response) {
  try {
    const { name, description, imageCid } = req.body as {
      name?: string;
      description?: string;
      imageCid?: string;
    };

    if (!name || !imageCid) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await pinata.upload.public.json({
      name,
      description,
      image: `ipfs://${imageCid}`,
    });

    return res.status(200).json({ cid: result.cid, tokenURI: `ipfs://${result.cid}` });
  } catch (error) {
    logError("Metadata upload failed", error);
    return res.status(500).json({ error: "Metadata upload failed" });
  }
}