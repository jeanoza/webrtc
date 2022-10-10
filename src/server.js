

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


let handleListen = () => console.log(`Listening on http://localhost:${PORT} and ws://localhost:${PORT}`)

let httpServer = createServer(app);

let io = new Server(httpServer)




httpServer.listen(3000, handleListen)