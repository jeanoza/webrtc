// socket to server
let msgList = document.querySelector("ul");
let nickForm = document.getElementById("nickname");
let msgForm = document.getElementById("new_message");

let socket = new WebSocket(`ws://${window.location.host}`)

socket.addEventListener("open", () => {
    console.log("Connected to the Server ✅")
})
socket.addEventListener("message", (event) => {
    let li = document.createElement('li');
    li.innerText = event.data
    msgList.appendChild(li)
})
socket.addEventListener("close", () => {
    console.log("Disconnected from the Server ❌")
})


function handleSubmit (event) {
    event.preventDefault();
    let target = event.target;
    let input = target.querySelector("input");
    let data = {
        type:target.id,
        payload: input.value
    }
 
    socket.send(JSON.stringify(data));
    input.value = ""
}
msgForm.addEventListener("submit", handleSubmit)
nickForm.addEventListener("submit", handleSubmit);