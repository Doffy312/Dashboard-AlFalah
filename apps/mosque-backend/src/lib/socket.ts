import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { getCorsOrigins, isLocalNetworkOrigin, env } from "../config/env.js";

let io: SocketIOServer | null = null;

export function initializeSocket(httpServer: HttpServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const allowedOrigins = getCorsOrigins(origin);
        if (allowedOrigins.includes(origin) || isLocalNetworkOrigin(origin) || env.NODE_ENV === "development") {
          return callback(null, true);
        }
        callback(null, false);
      },
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected via Socket.IO: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getSocketIO() {
  if (!io) {
    throw new Error("Socket.IO has not been initialized. Please call initializeSocket first.");
  }
  return io;
}
