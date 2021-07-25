document.addEventListener("DOMContentLoaded", function(){
	console.log("READY!");

	//to be used with new RTCPeerConnection
	const configuration = {
		iceServers: [{
			urls: 'stun:stun.l.google.com:19302' // Google's public STUN server
		}]
	};
	peerConnection = new RTCPeerConnection(configuration);
	peerConnection.ontrack = function(event){
		const remoteVideo = document.getElementById("remote-video");
		console.log(event);
		//console.log(
		if(remoteVideo){
			remoteVideo.srcObject = event.streams[0];
		}
	};

	var isAlreadyCalling = false;

	const localVideo = document.getElementById("local-video");

	navigator.mediaDevices.getUserMedia({ video: true, audio: true })
	.then(function(stream) {
		
		console.log(localVideo);
		if (localVideo) {
			console.log(stream);
			localVideo.srcObject = stream;
		}

		//ready our tracks to be streamed to other users
		stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
	})
	.catch(function(err) {
		console.log(err);
	  	console.warn(err.message);
	});

	let muted = true;
	document.getElementById("toggle-mute").addEventListener("click", function(el){
		console.log(el);
		console.log(localVideo.muted);
		console.log(localVideo);
		localVideo.muted = !localVideo.muted;
		el.target.innerText = localVideo.muted ? "Unmute" : "Mute";
	});

//socket = io();

	const socket = io();//defaults to whatever the url is (localhost in my case)
	let activeSockets = [];
	socket.on("connect", () => {
		console.log(socket);
		console.log(socket.id);
		const existingSocket = activeSockets.find(
			existingSocket => existingSocket === socket.id
		);

		if (!existingSocket) {
			console.log("new socket");
			activeSockets.push(socket.id);

			socket.emit("update-user-list", {
				//console.log("CLIENT: update-user-list");
				users: activeSockets.filter(
					existingSocket => existingSocket !== socket.id
				)
			});

			//socket.broadcast.emit("update-user-list", {
				//console.log("CLIENT: broadcast");
			//	users: [socket.id]
			//});

			socket.on("update-user-list", function(users){
				console.log("SERVER: broadcast");
				updateUserList(users);
			});

			socket.on("remove-user", function(socketId){
				console.log("SERVER: remove-user");
				const elToRemove = document.getElementById(socketId);

				if(elToRemove) {
					elToRemove.remove();
				}
			});

			socket.onAny(function(event){
				console.log(event);
			});

			socket.on("call-made", async function(data){
				//console.log("pc: "+peerConnection
				await peerConnection.setRemoteDescription(
					new RTCSessionDescription(data.offer)
				);

				const answer = await peerConnection.createAnswer();
				await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

				socket.emit("make-answer", {
					answer,
					to: data.socket
				});
			});

			socket.on("answer-made", async function(data){
				await peerConnection.setRemoteDescription(
					new RTCSessionDescription(data.answer)
				);

				if(!isAlreadyCalling){
					callUser(data.socket);
					isAlreadyCalling = true;
				}
			});
		}
	});

	function updateUserList(socketIds) {
		console.log("updateUserList");
		const activeUserContainer = document.getElementById("active-user-container");

		console.log(socketIds);
		/*for(let i=0; i < socketIds.users.length; i++){
			const alreadyExistingUser = document.getElementById(socketId);
			if (!alreadyExistingUser) {
				const userContainerEl = createUserItemContainer(socketId);
				activeUserContainer.appendChild(userContainerEl);
			}
		}*/
		socketIds.users.forEach( (socketId) => {
			const alreadyExistingUser = document.getElementById(socketId);
			if (!alreadyExistingUser) {
				const userContainerEl = createUserItemContainer(socketId);
				activeUserContainer.appendChild(userContainerEl);
			}
		});
	}

	function createUserItemContainer(socketId) {
		const userContainerEl = document.createElement("div");

		const usernameEl = document.createElement("p");

		userContainerEl.setAttribute("class", "active-user");
		userContainerEl.setAttribute("id", socketId);
		usernameEl.setAttribute("class", "username");
		usernameEl.innerHTML = `Socket: ${socketId}`;

		userContainerEl.appendChild(usernameEl);

		userContainerEl.addEventListener("click", () => {
			//unselectUsersFromList();
			userContainerEl.setAttribute("class", "active-user active-user--selected");
			const talkingWithInfo = document.getElementById("talking-with-info");
			talkingWithInfo.innerHTML = `Talking with: "Socket: ${socketId}"`;
			callUser(socketId);
		}); 
		return userContainerEl;
	}

	async function callUser(socketId) {
		
		const offer = await peerConnection.createOffer();
		await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

		socket.emit("call-user", {
			offer,
			to: socketId
		});
	}
});//ende document ready


