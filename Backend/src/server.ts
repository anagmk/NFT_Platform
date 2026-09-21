import app from "./app";
import { connectDB } from "./config/db";
import "dotenv/config";
import startMarketplaceListener from "./marketplace/listeners/marketplaceListener";
import { logError } from "./middleware/errorHandler";

const PORT = process.env.PORT

async function startServer() {
  await connectDB();
  startMarketplaceListener();
  app.listen(PORT, () => {
    console.info(`[HTTP] server running on port ${PORT}`);
  });
}

startServer().catch((error: unknown) => {
  logError("Server startup failed", error);
  process.exit(1);
});
