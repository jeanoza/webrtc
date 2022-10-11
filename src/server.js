

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io"

let app = express();
let PORT = process.env.PORT || 3000;

app.set('view engine', 'pug')
app.set('views', __dirname + "/views")
app.use('/public', express.static(__dirname + '/public'))

app.get("/", (_, res) => res.render("home"))
app.get("/*", (_, res) => res.redirect("/"))



let httpServer = createServer(app);

let io = new Server(httpServer)

io.on("connection", socket => {
    socket.on("joinRoom", (roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit("welcome");
    })

    // #3. Peer to peer in server: receive 'offer' from Peer A then send offer to Peer B
    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
    })
    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    })
    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
    })
})


let handleListen = () => console.log(`Listening on http://localhost:${PORT} and ws://localhost:${PORT}`)
httpServer.listen(3000, handleListen)