import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) return socket;

  socket = io(import.meta.env.VITE_SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: false,
    auth: (callback) => {
      callback({ token: localStorage.getItem("accessToken") });
    },
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
