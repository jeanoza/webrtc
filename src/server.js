import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'pug')
app.set('views', __dirname + "/views")
app.use('/public', express.static(__dirname + '/public'))

app.get("/", (_, res) => res.render("home"))
app.get("/*", (_, res) => res.redirect("/"))
const handleListen = () => console.log(`Listening on http://localhost:${PORT}`)

app.listen(PORT, handleListen);