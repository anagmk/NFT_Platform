import { Router } from "express";
import multer from "multer";
import {
  uploadFile,
  uploadMetadata,
} from "../../controllers/upload/uploadController";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/file", upload.single("file"), uploadFile);
router.post("/metadata", uploadMetadata);

export default router;