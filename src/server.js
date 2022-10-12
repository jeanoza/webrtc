import express from "express";
import { createServer } from "http";
import { Server } from "socket.io"
import {webrtc} from "webrtc"

let app = express();
let PORT = process.env.PORT || 3000;

app.set('view engine', 'pug')
app.set('views', __dirname + "/views")
app.use('/public', express.static(__dirname + '/public'))

app.get("/", (_, res) => res.render("home"))
app.get("/*", (_, res) => res.redirect("/"))



let httpServer = createServer(app);

let io = new Server(httpServer)

function publicRooms () {
	let {sockets : {adapter: {sids, rooms}}} = io;

	let publicRooms = [];
	rooms.forEach((_, key) => {
		if (sids.get(key) === undefined) publicRooms.push(key)
	})
	return publicRooms;
}

let userCameras = {};

io.on("connection", socket => {
    socket.on("joinRoom", (roomName) => {
        socket.join(roomName);
        if (!userCameras[roomName]) 
            userCameras[roomName] = new Map();

        userCameras[roomName].set(socket.id, {});
        socket.to(roomName).emit("welcome");
    })
    socket.on("offer", (offer, roomName) => {
        let current = userCameras[roomName].get(socket.id);
        if (!current["offer"]) {
            current["offer"] = offer;
            /** @type{RTCPeerConnection} */
            let peerServer = new webrtc.RTCPeerConnection({
                iceServers : [
                    {
                        urls: [
                            "stun:stun.l.google.com:19302",
                            "stun:stun1.l.google.com:19302",
                            "stun:stun2.l.google.com:19302",
                            "stun:stun3.l.google.com:19302",
                            "stun:stun4.l.google.com:19302",
                        ]
                    }
                ]
            })
        }
        console.log(userCameras);
    })
})


let handleListen = () => console.log(`Listening on http://localhost:${PORT} and ws://localhost:${PORT}`)
httpServer.listen(3000, handleListen)