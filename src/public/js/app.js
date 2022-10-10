let socket = io();

let myFace = document.getElementById("myFace");
let mute = document.getElementById("mute")
let camera = document.getElementById("camera")
let cameraSelect = document.getElementById("cameras");

let myStream;
let isMute = false;
let isCameraOff = false;

document.querySelectorAll('button').forEach(btn => btn.addEventListener("click", handleBtn))
cameraSelect.addEventListener("input", handleChangeCamera)

async function handleChangeCamera (event) {
	await getMedia(cameraSelect.value);
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

getMedia();

