import express from "express";
import cors from "cors";
import http from "http";
import { initializeSockets } from "./socket/socket.js";

const app = express();
app.use(cors());
const server = http.createServer(app);
initializeSockets(server);

const { PORT, HOST } = process.env;

server.listen(PORT, HOST, () => {
	console.log("Server listening on port", HOST,  PORT);
});
