let socket = io();

let room = document.getElementById("room")

let formWelcome = document.getElementById("welcome")
let formNick = document.getElementById("nickname")
let formMSG = document.getElementById("msg")
let chatCont = document.getElementById("chatCont")
let roomTitle = document.getElementById("roomTitle")

formNick.hidden = true;
formMSG.hidden = true;
chatCont.hidden = true;

let roomName;
let ableToRecv = false;

document.querySelectorAll("form").forEach(form => form.addEventListener("submit", handleSubmit));

function handleSubmit(event) {
    event.preventDefault();
    let target = event.target;
    let input = target.querySelector("input")
    value = input.value;

    if (target.id === "welcome") {
        roomName = value;
        socket.emit("enterRoom", value, (userNum) => {
            roomTitle.innerText = `Room ${roomName} (${userNum})`;
            formWelcome.hidden = true;
            formNick.hidden = false;
        });
    } else if (target.id === "nickname") {
        socket.emit("nickname", value, roomName, () => {
            formNick.hidden = true;
            formMSG.hidden = false;
            chatCont.hidden = false;
            ableToRecv = true;
            addMSG("You login room #" + roomName + " with nickname: " + value)
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
socket.on("welcome", (nick, newCount) => {
    roomTitle.innerText = `Room ${roomName} (${newCount})`;
    addMSG(`${nick} joined`)
})
socket.on("bye", (nick, newCount) => {
    roomTitle.innerText = `Room ${roomName} (${newCount})`;
     addMSG(`${nick} left`) 
})
socket.on("newMessage", addMSG);
socket.on("nickname", addMSG);
socket.on("roomChange", (rooms) => {
    let ul = formWelcome.querySelector("ul");

    ul.innerText = "";
    rooms.forEach(room => {
        let li = document.createElement("li");
        li.innerText = room
        ul.appendChild(li)
    });
})