import cors from "cors";
import express from "express";
import listingRoutes from "./routes/nft/listingRoutes";
import uploadRoutes from "./routes/upload/uploadRoutes";
import adminAuthRoutes from "./routes/auth/adminAuth.routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth/admin", adminAuthRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/listings", listingRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
