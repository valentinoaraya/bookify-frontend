import { io, Socket } from "socket.io-client";
import { BACKEND_API_URL } from "./config";

const socketConfig = {
    transports: ["websocket", "polling"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
};

export const socket: Socket = io(BACKEND_API_URL, socketConfig);

export const connectSocket = (token: string) => {
    if (!token) {
        console.warn("No hay token para conectar el socket");
        return;
    }

    socket.auth = { token };

    socket.connect();

    socket.on("connect", () => {
        console.log("Socket conectado:", socket.id);
    });

    socket.on("connect_error", (error) => {
        console.error("Error de conexión del socket:", error);
    });

    socket.on("disconnect", (reason) => {
        console.log("Socket desconectado:", reason);
    });

    socket.on("reconnect", (attemptNumber) => {
        console.log("Socket reconectado en intento:", attemptNumber);
    });

    socket.on("reconnect_error", (error) => {
        console.error("Error de reconexión del socket:", error);
    });
};

export const disconnectSocket = () => {
    socket.disconnect();
};

export const isSocketConnected = (): boolean => {
    return socket.connected;
};

export const emitSocketEvent = (event: string, data: any) => {
    if (!socket.connected) {
        console.warn("Socket no está conectado, no se puede emitir evento:", event);
        return false;
    }

    try {
        socket.emit(event, data);
        return true;
    } catch (error) {
        console.error("Error al emitir evento del socket:", error);
        return false;
    }
};