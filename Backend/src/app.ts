import express from "express";
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

app.use(express.json());

app.use("/api/upload", uploadRoutes);

export default app;
