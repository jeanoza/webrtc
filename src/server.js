

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io"
import { instrument } from "@socket.io/admin-ui";

let app = express();
let PORT = process.env.PORT || 3000;

app.set('view engine', 'pug')
app.set('views', __dirname + "/views")
app.use('/public', express.static(__dirname + '/public'))

app.get("/", (_, res) => res.render("home"))
app.get("/*", (_, res) => res.redirect("/"))


let handleListen = () => console.log(`Listening on http://localhost:${PORT} and ws://localhost:${PORT}`)

let httpServer = createServer(app);

let io = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
});

instrument(io, {
  auth: false
});

function publicRooms () {
	let {sockets : {adapter: {sids, rooms}}} = io;

	let publicRooms = [];
	rooms.forEach((_, key) => {
		if (sids.get(key) === undefined) publicRooms.push(key)
	})
	return publicRooms;
}

function countUserInRoom(roomName) {
	return io.sockets.adapter.rooms.get(roomName)?.size;
}

io.on("connection", socket => {
	socket["nickname"] = "Anonymous"
	socket.onAny(event => {
		console.log(event);
	})
	io.sockets.emit("roomChange", publicRooms())
	socket.on("enterRoom", (roomName, done) => {
		socket.join(roomName);
		done(countUserInRoom(roomName));
		socket.to(roomName).emit("welcome", socket.nickname, countUserInRoom(roomName))
		io.sockets.emit("roomChange", publicRooms())
	});
	socket.on("nickname", (nickname, roomName,done) => {
		socket["nickname"] = nickname
		socket.to(roomName).emit("nickname", `Anonymous change nickname to ${socket.nickname}`)
		done();
	})
	socket.on("newMessage", (msg, roomName, done) => {
		socket.to(roomName).emit("newMessage", `${socket.nickname}: ${msg}`);
		done();
	})
	socket.on("disconnecting", () => {
		socket.rooms.forEach(roomName => {
			socket.to(roomName).emit("bye", socket.nickname, countUserInRoom(roomName) - 1)
		})
	})
	socket.on("disconnect", () => {
		io.sockets.emit("roomChange", publicRooms());
	})
}) 

// Create WebSocket Server then put it on the top of http server (on the same port)
// It's not mandatory but I need this in this project 
// So, it's possible to use only wss with new Websocket.Server()

// keep this in comment to compare with socketIO
// let wss = new WebSocket.Server({server})
// let sockets = [];
// /** @type {WebSocket} socket to browser(client) */
// wss.on("connection", (socket) => {
// 	sockets.push(socket);
// 	socket["nickname"] = "Anonyme"
//     console.log("Connected to the Browser ✅")
// 	socket.on("close", () => console.log("Disconnected from the Browser ❌"))
// 	socket.on("message", msg => {
// 		let _msg = JSON.parse(msg)
// 		switch (_msg.type) {
// 			case "nickname":
// 				socket["nickname"] = _msg.payload
// 				break;
// 			case "new_message":
// 				sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${_msg.payload}`));
// 				break;
// 			default:
// 				break;
// 		}
// 	}) 
// })

httpServer.listen(3000, handleListen)