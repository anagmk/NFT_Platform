import cors from "cors";
import express from "express";
import listingRoutes from "./routes/nft/listingRoutes";
import uploadRoutes from "./routes/upload/uploadRoutes";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/upload", uploadRoutes);
app.use("/api/listings", listingRoutes);

export default app;
