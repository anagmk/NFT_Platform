import app from "./app";
import { connectDB } from "./config/db";
import "dotenv/config";
import startMarketplaceListener from "./marketplace/listeners/marketplaceListener";

const PORT = process.env.PORT

async function startServer() {
  await connectDB();
  startMarketplaceListener();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
