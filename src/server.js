

import express from "express";
import http from "http";
import WebSocket from "ws";
import SocketIO from "socket.io"

let app = express();
let PORT = process.env.PORT || 3000;

app.set('view engine', 'pug')
app.set('views', __dirname + "/views")
app.use('/public', express.static(__dirname + '/public'))

app.get("/", (_, res) => res.render("home"))
app.get("/*", (_, res) => res.redirect("/"))


let handleListen = () => console.log(`Listening on http://localhost:${PORT} and ws://localhost:${PORT}`)

let server = http.createServer(app)
let io = SocketIO(server);

io.on("connection", socket => {
	socket.on("enter_room", (roonName, done) => {
		socket.join(roonName);
		console.log(socket.rooms);
		done();
	});
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

server.listen(3000, handleListen)