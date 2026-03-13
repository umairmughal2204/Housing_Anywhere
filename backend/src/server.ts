import { createServer } from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { connectDatabase } from "./db/connect.js";
import { env } from "./config/env.js";
import { setupSocketServer } from "./socket/index.js";

async function bootstrap() {
  await connectDatabase();

  const app = createApp();
  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: { origin: env.CLIENT_ORIGIN, credentials: true },
    // Prefer WebSocket, fall back to long-polling
    transports: ["websocket", "polling"],
  });

  setupSocketServer(io);

  httpServer.listen(env.PORT, () => {
    console.log(`Backend running on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
