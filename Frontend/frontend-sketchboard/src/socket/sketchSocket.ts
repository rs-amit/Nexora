import { io, type Socket } from "socket.io-client";

// Independent singleton from `socket.ts` (chat) — sketch-service is a
// separate socket.io server on its own port, and `ChatProvider`'s unmount
// hard-disconnects the chat socket, so the two features must not share one.
let socket: Socket | null = null;

export function getSketchSocket(): Socket {
  if (socket) return socket;

  socket = io(import.meta.env.VITE_SKETCH_SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: false,
    auth: (callback) => {
      callback({ token: localStorage.getItem("accessToken") });
    },
  });

  return socket;
}

export function disconnectSketchSocket() {
  socket?.disconnect();
  socket = null;
}
