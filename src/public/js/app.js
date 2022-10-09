let socket = io();

let welcome = document.getElementById("welcome");
let form = welcome.querySelector("form");
let room = document.getElementById("room");

room.hidden = true;

function handleRoomSubmit(event) {
    event.preventDefault();
    let input = form.querySelector("input")
    let roomName = input.value;
    //Advanatage of socketIO : able to send Object without stringify - parse
    socket.emit("enter_room", roomName, () => {
        welcome.hidden = true;
        room.hidden = false;
        document.getElementById("roomTitle").innerText = `Room ${roomName}`;
    });
    input.value = "";
}
form.addEventListener("submit", handleRoomSubmit);