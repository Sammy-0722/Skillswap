import { io } from "socket.io-client";

let socket = null;

// Creates (or reuses) a single socket connection authenticated with the current user's token.
export const getSocket = () => {
    if (socket) return socket;

    const token = localStorage.getItem("usertoken");

    socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:8000", {
        auth: { token },
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};