const express = require("express");
const { WebSocket, WebSocketServer } = require("ws");
const webserver = express();

const sockserver = new WebSocketServer({ port: 443 });

webserver.use((req, res) => res.send("hi"));

webserver.listen(8080, () => console.log(`Listening on ${8080}`));

let clients = {};

sockserver.on("connection", (ws) => {
	ws.on("message", (message) => {
		const data = JSON.parse(message);
		const { type, payload, callerId } = data;
		console.log(type, callerId);
		switch (type) {
			case "newuser":
				clients[callerId] = {};
				ws.send(
					JSON.stringify({
						type: "newuser",
						payload: "added successfull",
						callerId: callerId,
					}),
				);
				break;
			case "offer":
				if (callerId in clients) {
					clients[callerId].offer = payload;
				}
				sockserver.clients.forEach(function each(client) {
					if (client !== ws && client.readyState === WebSocket.OPEN) {
						client.send(
							JSON.stringify({
								type: "offer",
								payload: clients[callerId].offer,
								callerId: callerId,
							}),
						);
					}
				});
				break;
			case "answer":
				if (callerId in clients) {
					clients[callerId].answer = payload;
				}
				sockserver.clients.forEach(function each(client) {
					if (client !== ws && client.readyState === WebSocket.OPEN) {
						client.send(
							JSON.stringify({
								type: "answer",
								payload: clients[callerId].answer,
								callerId: callerId,
							}),
						);
					}
				});
				break;
			case "candidate":
				if (callerId in clients) {
					clients[callerId].candidates = payload;
				}
				sockserver.clients.forEach(function each(client) {
					if (client !== ws && client.readyState === WebSocket.OPEN) {
						client.send(
							JSON.stringify({
								type: "candidate",
								payload: clients[callerId].candidates,
								callerId: callerId,
							}),
						);
					}
				});
				break;
			case "join": // Handle user joining
				clients[callerId] = ws;
				break;
			case "leave": // Handle user leaving
				delete clients[callerId];
				break;
			default:
				console.error("Unknown message type:", type);
		}
	});

	ws.on("close", () => {
		console.log(`User with WebSocket ID deleted.`);
	});
});
