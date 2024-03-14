import express from "express";
import cors from "cors";
import http from "http";
import os from 'os'
import { initializeSockets } from "./socket/socket.js";

const app = express();
app.use(cors());
const server = http.createServer(app);
initializeSockets(server);

const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || "8082";

server.listen(PORT, HOST, () => {
	if (HOST === "0.0.0.0") {
		console.log(`Server listening on local: http://127.0.0.1:${PORT}`);
		const networkInterfaces = os.networkInterfaces();
		Object.keys(networkInterfaces).forEach((ifaceName) => {
			networkInterfaces[ifaceName].forEach((address) => {
				if (address.family === "IPv4" && !address.internal) {
					console.log(
						`Potential server address: http://${address.address}:${PORT}`
					);
				}
			});
		});
	} else {
		const address = `http://${HOST}:${PORT}`;
		console.log(`Server listening on address: ${address}`);
	}
});
