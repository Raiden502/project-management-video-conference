import {
	HandleSignaling,
	clientAnswer,
	clientPickupAns,
	clientOffer,
	clientCandidate,
	clientLeave,
	DisconnectSocket,
	clientPickup,
} from "./handler.js";
import { queryDatabase } from "../db/queryDb.js";

const SocketMiddleware = async (socket, next) => {
	const clientID = socket.handshake.auth.clientID;
	console.log("request", clientID)
	if (clientID) {
		const query = {
			name: "set-socket",
			text: "update users_info set video_socket_id = $1 where user_id = $2",
			values: [socket.id, clientID],
		};
		try {
			const data = await queryDatabase(query);
			next();
		} catch (error) {
			next(new Error(error));
		}
	} else {
		next(new Error("Invalid client ID"));
	}
};

const SocketConnection = (socket) => {
	socket.on("newcalls", (message) => {
		const { type, receiverInfo, userInfo } = message;
		clientPickup(type, receiverInfo, userInfo, socket);
	});
	socket.on("accepincoming", (message) => {
		const { accept, receiverInfo, userInfo } = message;
		clientPickupAns(accept, receiverInfo, userInfo, socket);
	});
	socket.on("offer", (message) => {
		const { payload, receiverId } = message;
		clientOffer(payload, receiverId, socket);
	});
	socket.on("answer", (message) => {
		const { payload, receiverId } = message;
		clientAnswer(payload, receiverId, socket);
	});
	socket.on("candidate", (message) => {
		const { payload, receiverId } = message;
		clientCandidate(payload, receiverId, socket);
	});
	socket.on("leave", (message) => {
		const { payload, receiverId } = message;
		clientLeave(payload, receiverId, socket);
	});
	socket.on("disconnect", () => {
		const clientID = socket.handshake.auth.clientID;
		if (clientID) {
			DisconnectSocket(clientID);
		} else {
			console.log("invalid id");
		}
	});
};
export { SocketMiddleware, SocketConnection };
