<<<<<<< HEAD
let localStream;
let remoteStream;
let PeerConnection;

const ws = new WebSocket("ws://127.0.0.1:8080"); // Replace with your server's URL

ws.onopen = () => {
	console.log("WebSocket connection established");
	init(); // Proceed with WebRTC initialization
};

ws.onmessage = (event) => {
	const message = JSON.parse(event.data);

	switch (message.type) {
		case "offer":
			PeerConnection.setRemoteDescription(
				new RTCSessionDescription(message.sdp)
			);
			createAnswer();
			break;
		case "answer":
			PeerConnection.setRemoteDescription(
				new RTCSessionDescription(message.sdp)
			);
			break;
		case "candidate":
			PeerConnection.addIceCandidate(
				new RTCIceCandidate(message.candidate)
			);
			break;
	}
};
=======
/* 
    if running on ip address with lan connection make sure to enable to chrom flags
    chrome://flags
    Insecure origins treated as secure - enable and add your ip address
*/

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const callButton = document.getElementById("callButton");
const muteAudioButton = document.getElementById("muteAudioButton");
const muteVideoButton = document.getElementById("muteVideoButton");
const addUsers = document.getElementById("adduser");
const leaveButton = document.getElementById("leaveButton");
const messagesEvent = document.getElementById("messages");
let userId;
let localStream;
>>>>>>> f9dbc7bf11f0abe226c2d9feaad838231adf147f

const servers = {
	iceServers: [
		{
			urls: [
				"stun:stun1.l.google.com:19302",
				"stun:stun2.l.google.com:19302",
			],
		},
	],
};

<<<<<<< HEAD
let init = async () => {
	localStream = await navigator.mediaDevices.getUserMedia({
		video: true,
		audio: false,
	});
	document.getElementById("user-1").srcObject = localStream;

	createOffer();
};

let createOffer = async () => {
	PeerConnection = new RTCPeerConnection(servers);
	remoteStream = new MediaStream();
	document.getElementById("user-2").srcObject = remoteStream;

	localStream
		.getTracks()
		.forEach((track) => PeerConnection.addTrack(track, localStream));

	PeerConnection.ontrack = (event) => {
		event.streams[0].getTracks().forEach((track) => {
			remoteStream.addTrack();
		});
	};

	PeerConnection.onicecandidate = async (event) => {
		if (event.candidate) {
			console.log("new ice candidate");
		}
	};

	let offer = await PeerConnection.createOffer();
	await PeerConnection.setLocalDescription(offer);

	ws.send(JSON.stringify({ type: "offer", sdp: offer.sdp }));

	// Send ICE candidates to the server
	PeerConnection.onicecandidate = (event) => {
		if (event.candidate) {
			ws.send(
				JSON.stringify({
					type: "candidate",
					candidate: event.candidate,
				})
			);
		}
	};
};
=======
const peerConnection = new RTCPeerConnection(servers);
const ws = new WebSocket("ws://192.168.0.227:443"); // Replace with your server URL

// Add local media stream
navigator.mediaDevices
	.getUserMedia({
		video: {
			width: { ideal: 720 }, // Set the preferred video width
			height: { ideal: 480 }, // Set the preferred video height
			frameRate: { ideal: 24 }, // Set the preferred frame rate
		},
		audio: true,
	})
	.then((stream) => {
		localStream = stream;
		localVideo.srcObject = localStream;
		localStream
			.getTracks()
			.forEach((track) => peerConnection.addTrack(track, localStream));
	})
	.catch((error) => console.error("Error accessing media devices:", error));

// Handle WebSocket events
ws.onopen = () => {
	console.log("WebSocket connection established");
};

ws.onmessage = (event) => {
	const data = JSON.parse(event.data);
	const { type, payload, callerId } = data;
	console.log(type, callerId);
	switch (type) {
		case "newuser":
			console.log(type);
			messagesEvent.innerText="you joined the event"
			break;
		case "offer":
			peerConnection
				.setRemoteDescription(new RTCSessionDescription(payload))
				.then(() => peerConnection.createAnswer())
				.then((answer) => {
					peerConnection.setLocalDescription(answer);
					ws.send(
						JSON.stringify({
							type: "answer",
							payload: answer,
							callerId: userId,
						}),
					);
				})
				.catch((error) =>
					console.error("Error creating answer:", error),
				);
			break;
		case "answer":
			peerConnection.setRemoteDescription(
				new RTCSessionDescription(payload),
			);
			break;
		case "candidate":
			peerConnection.addIceCandidate(new RTCIceCandidate(payload));
			break;
		default:
			console.log("no event");
			remoteVideo.getTracks().forEach((track) => track.stop());
			peerConnection.close();
			messagesEvent.innerText=`${callerId} left the call`
			break;
	}
};

// Handle peer connection events
peerConnection.onicecandidate = (event) => {
	if (event.candidate) {
		ws.send(
			JSON.stringify({
				type: "candidate",
				payload: event.candidate,
				callerId: userId,
			}),
		);
	}
};

peerConnection.onaddstream = (event) => {
	remoteVideo.srcObject = event.stream;
};

callButton.addEventListener("click", () => {
	peerConnection
		.createOffer()
		.then((offer) => {
			peerConnection.setLocalDescription(offer);
			ws.send(
				JSON.stringify({
					type: "offer",
					payload: offer,
					callerId: userId,
				}),
			);
		})
		.catch((error) => console.error("Error creating offer:", error));
});

addUsers.addEventListener("click", () => {
	userId = document.getElementById("user").value;
	if (ws.readyState === WebSocket.OPEN) {
		ws.send(
			JSON.stringify({
				type: "newuser",
				payload: null,
				callerId: userId,
			}),
		);
	} else {
		console.error("WebSocket connection is not open");
	}
});

muteAudioButton.addEventListener("click", () => {
	const audioTracks = localStream.getAudioTracks();
	audioTracks.forEach((track) => {
		track.enabled = !track.enabled;
	});
});

muteVideoButton.addEventListener("click", () => {
	const videoTracks = localStream.getVideoTracks();
	videoTracks.forEach((track) => {
		track.enabled = !track.enabled;
	});
});

leaveButton.addEventListener("click", () => {
	localStream.getTracks().forEach((track) => track.stop());
	peerConnection.close();
	ws.send(JSON.stringify({ type: "leave", callerId: userId, payload: null }));
});
>>>>>>> f9dbc7bf11f0abe226c2d9feaad838231adf147f
