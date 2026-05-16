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

  const allowedOrigins = [
    env.CLIENT_ORIGIN,
    env.CLIENT_ORIGIN.replace("://", "://www."),
    "http://localhost:5173",
    "http://localhost:4173",
  ];

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`Socket CORS blocked: ${origin}`));
      },
      credentials: true,
    },
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
