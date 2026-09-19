
const fs = require("fs");
const path = require("path");

const backendPath = path.join(__dirname, "backend");

// Folder structure
const folders = [
  "src/config",
  "src/controllers",
  "src/middleware",
  "src/models",
  "src/routes",
  "src/services",
  "src/utils",
  "src/validators",
  "src/types",
  "src/interfaces",
  "src/constants",
  "tests",
];

// Starter files
const files = {
  "src/app.ts": `import express from "express";

const app = express();

app.use(express.json());

// Routes will be registered here

export default app;
`,

  "src/server.ts": `import app from "./app";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`,

  "src/config/db.ts": `import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI as string
    );

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};
`,

  "src/routes/index.ts": `import { Router } from "express";

const router = Router();

// Register feature routes here

export default router;
`,

  "src/middleware/errorHandler.ts": `import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
`,

  ".env.example": `PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/myapp
NODE_ENV=development
`,

  ".gitignore": `node_modules/
dist/
.env
coverage/
`,

  "README.md": `# Backend

Node.js + Express + TypeScript + MongoDB

## Setup

1. Install dependencies.
2. Configure your .env file.
3. Start the development server.
`,
};

function createStructure() {
  // Create backend root
  fs.mkdirSync(backendPath, { recursive: true });

  // Create directories
  folders.forEach((folder) => {
    const fullPath = path.join(backendPath, folder);

    fs.mkdirSync(fullPath, { recursive: true });

    console.log("Folder:", folder);
  });

  // Create files without overwriting existing files
  Object.entries(files).forEach(([file, content]) => {
    const fullPath = path.join(backendPath, file);

    fs.mkdirSync(path.dirname(fullPath), {
      recursive: true,
    });

    try {
      fs.writeFileSync(fullPath, content, {
        flag: "wx",
      });

      console.log("File:", file);
    } catch (error) {
      if (error.code === "EEXIST") {
        console.log("Skipped existing file:", file);
      } else {
        throw error;
      }
    }
  });

  console.log("\nBackend structure created successfully!");
}

createStructure();