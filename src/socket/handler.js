import { socketIO } from "./socket.js";
import { queryDatabase } from "../db/queryDb.js";

const HandleSignaling = (message, clients, socket) => {
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
				socket.broadcast.emit("message", {
					type: "answer",
					payload: payload,
					callerId: callerId,
				});
			}
			break;
		case "candidate":
			if (callerId in clients) {
				clients[callerId].candidates = payload;
				socket.broadcast.emit("message", {
					type: "candidate",
					payload: payload,
					callerId: callerId,
				});
			}
			break;
		case "join":
			clients[callerId] = ws;
			break;
		case "leave":
			delete clients[callerId];
			socket.broadcast.emit("message", {
				type: "leave",
				callerId: callerId,
			});
			break;
		default:
			console.error("Unknown message type:", type);
			break;
	}
};

const clientPickup = async (type, receiverInfo, userInfo, socket) => {
	console.log(receiverInfo);
	const query = {
		name: "send-callpickup",
		text: "select video_socket_id from user_info where user_id = $1 and video_socket_id notnull",
		values: [receiverInfo.id],
	};
	try {
		const data = await queryDatabase(query);
		socket.to(data[0].video_socket_id).emit("newcalls", {
			receiverInfo,
			userInfo,
			type,
		});
		console.log("pickup successfull");
	} catch (error) {
		console.error("error unable to fetch in pickup", error);
	}
};

const clientPickupAns = async (accept, receiverInfo, userInfo, socket) => {
	const query = {
		name: "send-callpickup",
		text: "select video_socket_id from user_info where user_id = $1 and video_socket_id notnull",
		values: [receiverInfo.id],
	};
	try {
		const data = await queryDatabase(query);
		socket.to(data[0].video_socket_id).emit("accepincoming", {
			accept: accept,
			receiverInfo: receiverInfo,
			userInfo: userInfo,
		});
		console.log("answered successfull");
	} catch (error) {
		console.error("error unable to fetch in pickup", error);
	}
};

const clientOffer = async (payload, receiverId, socket) => {
	const query = {
		name: "send-offer",
		text: "select video_socket_id from user_info where user_id = $1 and video_socket_id notnull",
		values: [receiverId],
	};
	try {
		const data = await queryDatabase(query);
		socket.to(data[0].video_socket_id).emit("offer", {
			payload: payload,
			receiverId: receiverId,
		});
		console.log("offer successfull");
	} catch (error) {
		console.error("error unable to fetch in offer");
	}
};

const clientAnswer = async (payload, receiverId, socket) => {
	const query = {
		name: "send-answer",
		text: "select video_socket_id from user_info where user_id = $1 and video_socket_id notnull",
		values: [receiverId],
	};
	try {
		const data = await queryDatabase(query);
		socket.to(data[0].video_socket_id).emit("answer", {
			payload: payload,
			receiverId: receiverId,
		});
		console.log("answer successfull");
	} catch (error) {
		console.error("error unable to answer");
	}
};

const clientCandidate = async (payload, receiverId, socket) => {
	const query = {
		name: "send-answer",
		text: "select video_socket_id from user_info where user_id = $1 and video_socket_id notnull",
		values: [receiverId],
	};
	try {
		const data = await queryDatabase(query);
		socket.to(data[0].video_socket_id).emit("candidate", {
			payload: payload,
			receiverId: receiverId,
		});
		console.log("candidate successfull");
	} catch (error) {
		console.error("error unable to send cand");
	}
};

const clientLeave = async (payload, receiverId, socket) => {
	const query = {
		name: "send-leave",
		text: "select video_socket_id from user_info where user_id = $1 and video_socket_id notnull",
		values: [receiverId],
	};
	try {
		const data = await queryDatabase(query);
		socket.to(data[0].video_socket_id).emit("leave", {
			payload: payload,
			receiverId: receiverId,
		});
		console.log("leave successfull");
	} catch (error) {
		console.error("error unable to leave");
	}
};

const DisconnectSocket = async (clientID) => {
	const query = {
		name: "set-socket-null",
		text: "update user_info set video_socket_id = null where user_id = $1",
		values: [clientID],
	};
	try {
		const data = await queryDatabase(query);
		console.log("disconnected successfull");
	} catch (error) {
		console.error("error unable to discoonect");
	}
};
export {
	HandleSignaling,
	clientPickup,
	clientPickupAns,
	clientAnswer,
	clientOffer,
	clientCandidate,
	clientLeave,
	DisconnectSocket,
};
