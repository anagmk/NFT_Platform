import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";

export class AppError extends Error {
  statusCode: number;
  expose: boolean;

  constructor(message: string, statusCode = 500, expose = statusCode < 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.expose = expose;
  }
}

export function logError(context: string, error: unknown) {
  if (error instanceof Error) {
    console.error(`[${context}] ${error.message}`, error.stack);
    return;
  }

  console.error(`[${context}]`, error);
}

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof SyntaxError && "status" in error && error.status === 400) {
    logError("Invalid JSON request body", error);
    res.status(400).json({ error: "Request body must contain valid JSON" });
    return;
  }

  const appError = error instanceof AppError ? error : null;
  const statusCode = appError?.statusCode ?? 500;
  const message = appError?.expose ? appError.message : "Internal server error";

  logError("HTTP request failed", error);
  res.status(statusCode).json({ error: message });
};