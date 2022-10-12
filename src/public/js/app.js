let socket = io();

let welcome = document.getElementById("welcome");
let call = document.getElementById("call")
let welcomeForm = welcome.querySelector("form");
let userVideo = document.getElementById("userVideo");
let roomName;
let stream;
/** @type{RTCPeerConnection} */
let peerClient;

call.hidden = true;

async function GetMedia() {
	let constrains = { audio: true, video: true }
	try {
		stream = await navigator.mediaDevices.getUserMedia(constrains)
		userVideo.srcObject = stream;
		call.hidden = false;
		welcome.hidden = true;
	} catch (e) {
		console.log(e);
	}
}

function MakeConnection () {
	//RTCPeerConnection
	peerClient = new RTCPeerConnection({
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
	});
	stream.getTracks().forEach(track => {
		peerClient.addTrack(track, stream);
	});
}

async function HandleSubmit (e) {
	e.preventDefault();

	let input = e.target.querySelector('input')
	roomName = input.value;
	input.value = "";
	socket.emit("joinRoom", roomName);
	await GetMedia();
	MakeConnection();
}

welcomeForm.addEventListener("submit", HandleSubmit);

socket.on("welcome", async () => {
	let offer = await peerClient.createOffer();
	peerClient.setLocalDescription(offer);
	socket.emit("offer", offer, roomName);
	console.log("send offer");
})