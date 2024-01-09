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
let userId = Math.floor(10000 + Math.random() * 90000);
let localStream;

let socket = io("http://localhost:3001", {
	auth: { clientID: userId },
});

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

const peerConnection = new RTCPeerConnection(servers);

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

socket.on("message", (message) => {
    const data = message
	const { type, payload, callerId } = data;
	console.log(type, callerId);
	switch (type) {
		case "newuser":
			console.log(type);
			messagesEvent.innerText = "you joined the event";
			break;
		case "offer":
			peerConnection
				.setRemoteDescription(new RTCSessionDescription(payload))
				.then(() => peerConnection.createAnswer())
				.then((answer) => {
					peerConnection.setLocalDescription(answer);
                    socket.emit("message",{
                        type: "answer",
                        payload: answer,
                        callerId: userId,
                    });
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
			messagesEvent.innerText = `${callerId} left the call`;
			break;
	}
})

// Handle peer connection events
peerConnection.onicecandidate = (event) => {
	if (event.candidate) {
        socket.emit("message",{
            type: "candidate",
            payload: event.candidate,
            callerId: userId,
        });
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
			socket.emit("message", {
				type: "offer",
				payload: offer,
				callerId: userId,
			});
		})
		.catch((error) => console.error("Error creating offer:", error));
});

addUsers.addEventListener("click", () => {
	socket.emit("message", {
		type: "newuser",
		payload: null,
		callerId: userId,
	});
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
	socket.emit("message", { type: "leave", callerId: userId, payload: null });
});
