import { Server } from "socket.io";
import { SocketMiddleware, SocketConnection } from "./connection.js";

let socketIO;

const initializeSockets = (httpServer) => {
	socketIO = new Server(httpServer, {
		cors: {
			origin: true,
			credentials: true,
		},
	});

	socketIO.use((socket, next) => {
		SocketMiddleware(socket, next);
	});

	socketIO.on("connection", (socket) => {
		SocketConnection(socket);
	});
};

export { initializeSockets, socketIO };
