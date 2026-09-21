import { Router } from "express";
import {
  createAdmin,
  sendAdminCreationOtp,
  verifyAdminCreationOtp,
  sendOtp,
  verifyOtp,
} from "../../controllers/auth/adminAuth.controller";
import { verifyAdminProvisionSecret } from "../../middleware/verifyAdmin.middleware";

const router = Router();

router.post("/create/send-otp", verifyAdminProvisionSecret, sendAdminCreationOtp);
router.post("/create", verifyAdminProvisionSecret, createAdmin);
router.post("/create/verify-otp", verifyAdminProvisionSecret, verifyAdminCreationOtp);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);


export default router;