let socket = io();

let room = document.getElementById("room")

let formWelcome = document.getElementById("welcome")
let formNick = document.getElementById("nickname")
let formMSG = document.getElementById("msg")

formNick.hidden = true;
formMSG.hidden = true;

let roomName;


document.querySelectorAll("form").forEach(form => form.addEventListener("submit", handleSubmit));

function handleSubmit(event) {
    event.preventDefault();
    let target = event.target;
    let input = target.querySelector("input")
    value = input.value;

    if (target.id === "welcome") {
        roomName = value;
        socket.emit("enterRoom", value, () => {
            document.getElementById("roomTitle").innerText = `Room ${value}`;
            formWelcome.hidden = true;
            formNick.hidden = false;
        });
    } else if (target.id === "nickname") {
        socket.emit("nickname", value, roomName, () => {
            formNick.hidden = true;
            formMSG.hidden = false;
            addMSG("You changed nickname to " + value)
        })
    } else if (target.id === "msg") {
        socket.emit("newMessage", value, roomName, () => {
            addMSG(("You: " + value))
        });
    }
    input.value = "";
}

function addMSG(msg) {
    let ul = room.querySelector("ul")
    let li = document.createElement("li");
    li.innerText = msg;
    ul.append(li);
}

//socket events
socket.on("welcome", (nick) => { addMSG(`${nick} joined`) })
socket.on("bye", (nick) => { addMSG(`${nick} left`) })
socket.on("newMessage", addMSG);
socket.on("nickname", addMSG);