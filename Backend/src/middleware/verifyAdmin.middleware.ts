import type { Request, Response, NextFunction } from "express";

export const verifyAdminProvisionSecret = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const providedSecret = req.headers["x-admin-provision-secret"];
  const expectedSecret = process.env.ADMIN_PROVISION_SECRET;

  if (
    !expectedSecret ||
    typeof providedSecret !== "string" ||
    providedSecret !== expectedSecret
  ) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  next();
};