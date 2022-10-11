let socket = io();

let myFace = document.getElementById("myFace");
let mute = document.getElementById("mute")
let camera = document.getElementById("camera")
let cameraSelect = document.getElementById("cameras");

let call = document.getElementById("call")

call.hidden = true;

let myStream;
let isMute = false;
let isCameraOff = false;
let roomName;
/** @type{RTCPeerConnection} */
let myPeerConnection;

document.querySelectorAll('button').forEach(btn => btn.addEventListener("click", handleBtn))
cameraSelect.addEventListener("input", handleChangeCamera)


async function handleChangeCamera (event) {
	await getMedia(cameraSelect.value);
	// code to handle change peer's camera
	if (myPeerConnection) {
		let videoTrack = myStream.getVideoTracks()[0]
		let videoSender = myPeerConnection
			.getSenders()
			.find(sender => sender.track.kind === "video")
		videoSender.replaceTrack(videoTrack)
	}
}

function handleBtn (event) {
	let target = event.target;
	if (target.id === "mute") {
		myStream.getAudioTracks()?.forEach(track =>  track.enabled = !track.enabled )
		mute.innerText = isMute ? "Mute" : "Unmute"
		isMute = !isMute;
	} else if (target.id === "camera") {
		myStream.getVideoTracks()?.forEach(track =>  track.enabled = !track.enabled )
		camera.innerText = isCameraOff ? "Turn Camera on" : "Turn Camera off"
		isCameraOff = !isCameraOff;
	}
}

async function getCameras() {
	try {
		let devices = await navigator.mediaDevices.enumerateDevices();
		let cameras = devices.filter(device => device.kind === "videoinput");
		let current = myStream.getVideoTracks()[0];

		cameras.forEach(camera => {
			let option = document.createElement("option");
			option.value = camera.deviceId
			option.innerText = camera.label
			cameraSelect.appendChild(option)
			if (current.label === camera.label)  option.seledted = true;
		})
	} catch(e) {
		console.log(e);
	}
}

async function getMedia(deviceId) {
	let initialConstrains = {
		audio:true,
		video: {facingMode: "user"}
	}
	let cameraConstrains = {
		audio:true,
		video: { deviceId : {exact: deviceId}}
	}
	try {
		myStream = await navigator.mediaDevices.getUserMedia( 
			deviceId ? cameraConstrains : initialConstrains
		)
		myFace.srcObject = myStream;
		if (!deviceId) await getCameras();
	} catch(e) {
		console.log(e);
	}
}


// Welcome
let welcome = document.getElementById("welcome")
let welcomeForm = welcome.querySelector("form")
welcomeForm.addEventListener("submit", handleSubmit)

async function initCall() {
	welcome.hidden = true;
	call.hidden = false;
	await getMedia();
	//webRTC Connection
	makeConnection();
}

async function handleSubmit (e) {
	e.preventDefault();

	let input = welcomeForm.querySelector("input");
	await initCall();
	roomName = input.value;
	socket.emit("joinRoom", roomName);
	input.value = "";
}

// Socket events

/**
 * TODO: Each Peer has to set two description(local/remote)
 * Peer A
 *  - setLocalDescription(offer)
 *  - setRemoteDescription(answer)
 * Peer B
 * 	- setLocalDescription(answer)
 * 	- setRemoteDescription(offer)
 */

// PeerA
socket.on("welcome", async () => {
	// #2-1. PeerA - createOffer()
	let offer = await myPeerConnection.createOffer();
	// #2-2. PeerA - setLocalDescription(offer)
	myPeerConnection.setLocalDescription(offer);
	// #2-3. PeerA - send this offer to server
	console.log("sent the offer(peerA)")
	socket.emit("offer", offer, roomName);
})
// PeerB
socket.on("offer", async (offer) => {
	// #4-1. PeerB - receive offer then setRemoteDescription(offer)
	console.log("receive offer(peerB)");
	myPeerConnection.setRemoteDescription(offer);
	// #4-2. PeerB - create answer 
	let answer = await myPeerConnection.createAnswer()
	// #4-3. PeerB - setLocalDescription(answer)
	myPeerConnection.setLocalDescription(answer)
	// #4-4. PeerB - send this answer to server
	socket.emit("answer", answer, roomName)
	console.log("send answer(peerB)")
})
// PeerA
socket.on("answer", async (answer) => {
	// #5-1. PeerA - receive answer and setRemoteDescription(answer)
	console.log("receive answer(peerA)")
	myPeerConnection.setRemoteDescription(answer)
})

// Ice candidate
socket.on("ice", ice => {
	console.log("receive candidate")
	myPeerConnection.addIceCandidate(ice);
})



// WebRTC 
function makeConnection () {
	//FIXME: need STUN Server to find public address
	// This configuration is only to test
	myPeerConnection = new RTCPeerConnection({
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
	myPeerConnection.addEventListener("icecandidate", handleIce)
	// addstream event not work in safari.
	// the reason why I use track event
	// https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addstream_event
	myPeerConnection.addEventListener("track", handleTrack)
	
	// #1. Peer to Peer Connection in Client - .addTrack(track, stream0...) - add track(stream) to RTCPeerConnection
	myStream
		.getTracks()
		.forEach(track => myPeerConnection.addTrack(track, myStream))
}

function handleIce(data) {
	console.log("send candidate");
	socket.emit("ice", data.candidate, roomName)
}


function handleTrack(data) {
	let peerFace = document.getElementById("peerFace")
	peerFace.srcObject = data.streams[0]
}