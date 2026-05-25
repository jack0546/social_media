import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
      auth: { token },
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const emitTyping = (roomId: string, userId: string, isTyping: boolean) => {
  socket?.emit("typing", { roomId, userId, isTyping });
};

export const sendMessage = (data: {
  roomId: string;
  text: string;
  senderId: string;
}) => {
  socket?.emit("send-message", data);
};

export const joinRoom = (roomId: string) => {
  socket?.emit("join-room", roomId);
};

export const leaveRoom = (roomId: string) => {
  socket?.emit("leave-room", roomId);
};