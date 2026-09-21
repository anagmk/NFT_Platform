import jwt from "jsonwebtoken";

import type { Request, Response } from "express";
import redis from "../../config/redis";
import nodemailer from "nodemailer";
import Admin from "../../models/admin.model";
import { logError } from "../../middleware/errorHandler";

type AuthRequest = Request<{}, {}, { email?: string; otp?: string }>;
type AdminProvisionRequest = Request<{}, {}, { name?: string; email?: string; otp?: string }>;

const adminProvisionOtpKey = (email: string) => `admin-create:otp:${email}`;
const adminProvisionNameKey = (email: string) => `admin-create:name:${email}`;

const sendEmailOtp = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: "OTP for Admin Authentication",
    text: `Your OTP is: ${otp}`,
  });
};

export const sendAdminCreationOtp = async (req: AdminProvisionRequest, res: Response) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.set(adminProvisionOtpKey(email), otp, "EX", 10 * 60);
    await redis.set(adminProvisionNameKey(email), name, "EX", 10 * 60);
    await sendEmailOtp(email, otp);

    return res.status(200).json({ message: "Admin creation OTP sent successfully" });
  } catch (error) {
    logError("Admin creation OTP request failed", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createAdmin = async (
  req: AdminProvisionRequest,
  res: Response
) => {
  try {
    const { name: rawName, email: rawEmail, otp: rawOtp } = req.body;

    const name = rawName?.trim();
    const email = rawEmail?.trim().toLowerCase();
    const otp = rawOtp?.trim();

    if (!name || !email || !otp) {
      return res.status(400).json({
        error: "Name, email, and OTP are required",
      });
    }

    const storedOtp = await redis.get(adminProvisionOtpKey(email));
    const storedName = await redis.get(adminProvisionNameKey(email));
    if (!storedOtp || storedOtp !== otp || storedName !== name) {
      return res.status(401).json({ error: "Invalid or expired admin creation OTP" });
    }

    // Check if this email already exists
    const existingUser = await Admin.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email already exists",
      });
    }

    // Create admin account
    const admin = await Admin.create({
      name,
      email,
      role: "admin",
      isEmailVerified: true,
    });

    await redis.del(adminProvisionOtpKey(email), adminProvisionNameKey(email));

    return res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    logError("Admin creation failed", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Dedicated endpoint handler for the second step of admin provisioning.
export const verifyAdminCreationOtp = createAdmin;

export const sendOtp = async (req: AuthRequest, res: Response) => {
  try {
    const { email: rawEmail } = req.body as { email?: string };
    const email = rawEmail?.trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const admin = await Admin.findOne({
      email,
      role: "admin",
    });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    const existingOtp = await redis.get(`otp:${email.toLowerCase()}`);

    if (existingOtp) {
      res.status(200).json({ message: "OTP already sent. Please check your email." });
    } else {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      await redis.set(`otp:${email.toLowerCase()}`, otp, "EX", 10 * 60); // Store OTP in Redis for 10 minutes

      await sendEmailOtp(email, otp);

      res.status(200).json({ message: "OTP sent successfully" });
    }
  } catch (error) {
    logError("Admin OTP request failed", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyOtp = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { email: rawEmail, otp } = req.body;
    const email = rawEmail?.trim().toLowerCase();
    const submittedOtp = otp?.trim();

    if (!email || !submittedOtp) {
      return res.status(400).json({
        error: "Email and OTP are required",
      });
    }

    // 1. Admin must already exist
    const admin = await Admin.findOne({
      email,
      role: "admin",
    });

    if (!admin) {
      return res.status(404).json({
        error: "Admin not found",
      });
    }

    // 2. Get OTP from Redis
    const otpKey = `otp:${email}`;
    const storedOtp = await redis.get(otpKey);

    if (!storedOtp || storedOtp !== submittedOtp) {
      return res.status(401).json({
        error: "Invalid or expired OTP",
      });
    }

    // 3. Delete OTP after successful verification
    await redis.del(otpKey);

    // 4. Require a configured JWT secret
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    // 5. Generate token for existing admin
    const token = jwt.sign(
      {
        id: admin._id.toString(),
        email: admin.email,
        role: "admin",
      },
      jwtSecret,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      token,
      message: "Admin authenticated successfully",
    });
  } catch (error) {
    logError("Admin OTP verification failed", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

