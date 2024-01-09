const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = require("http").createServer(app);

const socketIO = new Server(server, {
	cors: {
		origin: true,
		credentials: true,
	},
});

const clients = {};

socketIO.use((socket, next) => {
	const clientID = socket.handshake.auth.clientID;
	if (clientID) {
		console.log(socket.id);
		clients[clientID] = { socket: socket.id };
		next();
	} else {
		next(new Error("Invalid client ID"));
	}
});

socketIO.on("connection", (socket) => {
	socket.on("message", (message) => {
		const { type, payload, callerId } = message;
		console.log(type, callerId);
		switch (type) {
			case "newuser":
				socketIO.to(clients[callerId].socket).emit("message", {
					type: "newuser",
					payload: "added successfull",
					callerId: callerId,
				});
				break;
			case "offer":
				if (callerId in clients) {
					clients[callerId].offer = payload;
					socket.broadcast.emit("message", {
						type: "offer",
						payload: payload,
						callerId: callerId,
					});
				}
				break;
			case "answer":
				if (callerId in clients) {
					clients[callerId].answer = payload;
                    socket.broadcast.emit("message",{
                        type: "answer",
                        payload: payload,
                        callerId: callerId,
                    });
				}
				break;
			case "candidate":
				if (callerId in clients) {
					clients[callerId].candidates = payload;
                    socket.broadcast.emit("message",{
                        type: "candidate",
                        payload: payload,
                        callerId: callerId,
                    });
				}
				break;
			case "join": // Handle user joining
				clients[callerId] = ws;
				break;
			case "leave": // Handle user leaving
				delete clients[callerId];
                socket.broadcast.emit("message",{
                    type: "leave",
                    callerId: callerId,
                });
				break;
			default:
				console.error("Unknown message type:", type);
				break;
		}
	});

	socket.on("disconnect", () => {
		console.log(`User with WebSocket ID deleted.`);
	});
});

server.listen(3001, () => {
	console.log("Server listening on port 3001");
});
