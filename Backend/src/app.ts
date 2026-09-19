import express from "express";
const uploadRoutes = require("./routes/uploadRoutes");
const cors = require("cors");
const listingRoutes = require("./routes/listingRoutes");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/upload", uploadRoutes);
app.use("/api/listings", listingRoutes);

export default app;
