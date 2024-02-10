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
