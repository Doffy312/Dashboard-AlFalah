import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { env } from "../config/env.js";

let io: SocketIOServer | null = null;

export function initializeSocket(httpServer: HttpServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
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
