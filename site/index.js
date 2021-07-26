document.addEventListener("DOMContentLoaded", function(){

	// Texture Vertex shader program
	var TEXTURE_VSHADER_SOURCE =
	  'attribute vec4 a_Position;\n' +
	  'attribute vec2 a_TexCoord;\n' +
	  'uniform mat4 u_Model;\n' +
	  'uniform mat4 u_View;\n' +
	  'uniform mat4 u_Projection;\n' +
	  'varying vec2 v_TexCoord;\n' +
	  'void main() {\n' +
	  '  mat4 mvp = u_Projection * u_View * u_Model;\n' +
	  '  gl_Position =  mvp * a_Position ;\n' +
	  '  v_TexCoord = a_TexCoord;\n' +
	  '}\n';

	// Texture Fragment shader program
	var TEXTURE_FSHADER_SOURCE =
	  '#ifdef GL_ES\n' +
	  'precision mediump float;\n' +
	  '#endif\n' +
	  'uniform sampler2D u_Sampler;\n' +
	  'varying vec2 v_TexCoord;\n' +
	  'void main() {\n' +
	  '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);// + vec4(1.0, 0.34, 0.45, 1.0);\n' +
	  '}\n';

	var LIGHT_VSHADER_SOURCE = 
	  'attribute vec4 a_Position;\n' +
	  'attribute vec4 a_Normal;\n' +
	  'uniform vec4 u_Color;\n' +
	  'uniform mat4 u_Model;\n' +
	  'uniform mat4 u_View;\n' +
	  'uniform mat4 u_Projection;\n' +
	  'varying vec4 v_Color;\n' +
	  'float det(mat4 a);\n'+
	  'mat4 inv(mat4 a);\n'+
	  'mat4 transpose(mat4 a);\n'+
	  'void main() {\n' +
	  '  vec3 lightDir = vec3(1,0,0);\n'+ //play with these 2 its fun!
	  '  vec3 lightColor = vec3(0.4,0.165,0.165);\n'+ 
	  '  vec3 ambientColor = vec3(0.05,0.05,0.05);\n' +
	  '  vec4 normal = normalize(a_Normal);\n'+ //only necessary once we rotate the cube (transform normals as well)
	  '  normal = transpose(inv(u_Model) ) * normal;\n'+
	  '  vec3 norm = normalize(vec3(normal));\n'+ //was normal...
	  '  float nDotL = max(dot(lightDir, norm), 0.0);\n'+
	  '  vec3 diffuse =  lightColor * vec3(0.5,0.5,0.5) * nDotL; //u_Color + a_Normal;\n' +
	  '  v_Color = vec4( (diffuse + ambientColor), 1);\n'+
	  '  //v_Color = u_Color + a_Normal;\n' +
	  '  mat4 mvp = u_Projection * u_View * u_Model;\n' +
	  '  gl_Position =  mvp * (a_Position);// + a_Normal) ;\n' +
	  '}\n' +
	   'float det(mat4 a){\n'+
	   '   return a[0][0]*a[1][1]*a[2][2]*a[3][3] + a[0][0]*a[2][1]*a[3][2]*a[1][3] + a[0][0]*a[3][1]*a[3][1]*a[1][2]*a[2][3] + a[1][0]*a[0][1]*a[3][2]*a[2][3] + a[1][0]*a[2][1]*a[0][2]*a[3][3] + a[1][0]*a[3][1]*a[2][2]*a[0][3] + a[2][0]*a[0][1]*a[1][2]*a[3][3] + a[2][0]*a[1][1]*a[3][2]*a[0][3] + a[2][0]*a[3][1]*a[0][2]*a[1][3] + a[3][0]*a[0][1]*a[2][2]*a[1][3] + a[3][0]*a[1][1]*a[0][2]*a[2][3] + a[3][0]*a[2][1]*a[1][2]*a[0][3] - a[0][0]*a[1][1]*a[3][2]*a[2][3] - a[0][0]*a[2][1]*a[1][2]*a[3][3] - a[0][0]*a[3][1]*a[2][2]*a[1][3] - a[1][0]*a[0][1]*a[2][2]*a[3][3] - a[1][0]*a[2][1]*a[1][2]*a[0][3] - a[1][0]*a[3][1]*a[0][2]*a[2][3] - a[2][0]*a[0][1]*a[3][2]*a[1][3] - a[2][0]*a[1][1]*a[0][2]*a[3][3] - a[2][0]*a[3][1]*a[1][2]*a[0][3] - a[3][0]*a[0][1]*a[1][2]*a[2][3] - a[3][0]*a[1][1]*a[2][2]*a[0][3] - a[3][0]*a[2][1]*a[0][2]*a[1][3];\n'+
	   '}\n'+
	  'mat4 inv(mat4 a){\n'+
	  '   float determinant = det(a);\n'+
	  '   if(determinant == 0.0)\n'+
	  '      return mat4(1.0);\n'+ //return identity4
	  '   mat4 b = mat4(1.0); //identity\n'+
	  '   b[0][0] = a[1][1]*a[2][2]*a[3][3] + a[2][1]*a[3][2]*a[1][3] + a[3][1]*a[1][2]*a[2][3] - a[1][1]*a[3][2]*a[2][3] - a[2][1]*a[1][2]*a[3][3] - a[3][1]*a[2][2]*a[1][3];\n'+
	  '   b[1][0] = a[1][0]*a[3][2]*a[2][3] + a[2][0]*a[1][2]*a[3][3] + a[3][0]*a[2][2]*a[1][3] - a[1][0]*a[2][2]*a[3][3] - a[2][0]*a[3][2]*a[1][3] - a[3][0]*a[1][2]*a[2][3];\n'+
	  '   b[2][0] = a[1][0]*a[2][1]*a[3][3] + a[2][0]*a[3][1]*a[1][3] + a[3][0]*a[1][1]*a[2][3] - a[1][0]*a[3][1]*a[2][3] - a[2][0]*a[1][1]*a[3][3] - a[3][0]*a[2][1]*a[1][3];\n'+
	  '   b[3][0] = a[1][0]*a[3][1]*a[2][2] + a[2][0]*a[1][1]*a[3][2] + a[3][0]*a[2][1]*a[1][2] - a[1][0]*a[2][1]*a[3][2] - a[2][0]*a[3][1]*a[1][2] - a[3][0]*a[1][1]*a[2][2];\n'+
	  '   b[0][1] = a[0][1]*a[3][2]*a[2][3] + a[2][1]*a[0][2]*a[3][3] + a[3][1]*a[2][2]*a[0][3] - a[0][1]*a[2][2]*a[3][3] - a[2][1]*a[3][2]*a[0][3] - a[3][1]*a[0][2]*a[2][3];\n'+
	  '   b[1][1] = a[0][0]*a[2][2]*a[3][3] + a[2][0]*a[3][2]*a[0][3] + a[3][0]*a[0][2]*a[2][3] - a[0][0]*a[3][2]*a[2][3] - a[2][0]*a[0][2]*a[3][3] - a[3][0]*a[2][2]*a[0][3];\n'+
	  '   b[2][1] = a[0][0]*a[3][1]*a[2][3] + a[2][0]*a[0][1]*a[3][3] + a[3][0]*a[2][1]*a[0][3] - a[0][0]*a[2][1]*a[3][3] - a[2][0]*a[3][1]*a[0][3] - a[3][0]*a[0][2]*a[2][3];\n'+
	  '   b[3][1] = a[0][0]*a[2][1]*a[3][2] + a[2][0]*a[3][1]*a[0][2] + a[3][0]*a[0][1]*a[2][2] - a[0][0]*a[3][1]*a[2][2] - a[2][0]*a[0][1]*a[3][2] - a[3][0]*a[2][1]*a[0][2];\n'+
	   '  b[0][2] = a[1][0]*a[1][2]*a[3][3] + a[1][1]*a[3][2]*a[0][3] + a[3][1]*a[0][2]*a[1][3] - a[0][1]*a[3][2]*a[1][3] - a[1][1]*a[0][2]*a[3][3] - a[3][1]*a[1][2]*a[0][3];\n'+
	   '  b[1][2] = a[0][0]*a[3][2]*a[1][3] + a[1][0]*a[0][2]*a[3][3] + a[3][0]*a[1][2]*a[0][3] - a[0][0]*a[2][1]*a[3][3] - a[1][0]*a[3][2]*a[0][3] - a[3][0]*a[0][2]*a[1][3];\n'+
	   '  b[2][2] = a[0][0]*a[1][1]*a[3][3] + a[1][0]*a[3][1]*a[0][3] + a[3][0]*a[0][1]*a[1][3] - a[0][0]*a[3][1]*a[1][3] - a[1][0]*a[0][1]*a[3][3] - a[3][0]*a[1][1]*a[0][3];\n'+
	   '  b[3][2] = a[0][0]*a[3][1]*a[1][2] + a[1][0]*a[0][1]*a[3][2] + a[3][0]*a[1][1]*a[0][2] - a[0][0]*a[1][1]*a[3][2] - a[1][0]*a[3][1]*a[0][2] - a[3][0]*a[0][1]*a[1][2];\n'+
	   '  b[0][3] = a[0][1]*a[2][2]*a[1][3] + a[1][1]*a[0][2]*a[2][3] + a[2][1]*a[1][2]*a[0][3] - a[0][1]*a[1][2]*a[2][3] - a[1][1]*a[2][2]*a[0][3] - a[2][1]*a[0][2]*a[1][3];\n'+
	   '  b[1][3] = a[0][0]*a[1][2]*a[2][3] + a[1][0]*a[2][2]*a[0][3] + a[2][0]*a[0][2]*a[1][3] - a[0][0]*a[2][2]*a[1][3] - a[1][0]*a[0][2]*a[2][3] - a[2][0]*a[1][2]*a[0][3];\n'+
	   '  b[2][3] = a[0][0]*a[2][1]*a[1][3] + a[1][0]*a[0][1]*a[2][3] + a[2][0]*a[1][1]*a[0][3] - a[0][0]*a[1][1]*a[2][3] - a[1][0]*a[2][1]*a[0][3] - a[2][0]*a[0][1]*a[1][3];\n'+
	   '  b[3][3] = a[0][0]*a[1][1]*a[2][2] + a[1][0]*a[2][1]*a[0][2] + a[2][0]*a[0][1]*a[1][2] - a[0][0]*a[2][1]*a[1][2] - a[1][0]*a[0][1]*a[2][2] - a[2][0]*a[1][1]*a[0][2];\n'+
	   '   return determinant*b;\n'+
	   '}\n'+
	   ' mat4 transpose(mat4 a){\n'+
	   '   vec4 c1 = a[0];\n'+
	   '   vec4 c2 = a[1];\n'+
	   '   vec4 c3 = a[2];\n'+
	   '   vec4 c4 = a[3];\n'+
	   '   return mat4( vec4(c1.x, c2.x, c3.x, c4.x), vec4(c1.y, c2.y, c3.y, c4.y), vec4(c1.z, c2.z, c3.z, c4.z), vec4(c1.w, c2.w, c3.w, c4.w) );\n'+
	   '}\n'; 
	   

	var LIGHT_FSHADER_SOURCE = 
	  '#ifdef GL_ES\n' +
	  'precision mediump float;\n' +
	  '#endif\n' +
	  'varying vec4 v_Color;\n' +
	  'void main() {\n' +
	  '   gl_FragColor = v_Color;//vec4(1,0,0,1);//v_Color;\n' +
	  '}\n';

	var PROJ_VSHADER_SOURCE =
	  'attribute vec4 a_Position;\n'+
	  'uniform vec4 u_Color;\n' +
	  'uniform mat4 u_Model;\n' +
	  'uniform mat4 u_View;\n' +
	  'uniform mat4 u_Projection;\n' +
	  'varying vec4 v_Color;\n' +
	  'void main(){\n'+
	  '   v_Color = u_Color;\n'+
	  '   mat4 mvp = u_Projection * u_View * u_Model;\n'+
	  '   gl_Position = mvp * a_Position;\n' +
	  '}\n';

	var PROJ_FSHADER_SOURCE = 
	  '#ifdef GL_ES\n' +
	  'precision mediump float;\n' +
	  '#endif\n' +
	  'varying vec4 v_Color;\n' +
	  'void main() {\n' +
	  '   gl_FragColor = v_Color;\n' +
	  '}\n';  

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

	//TODO init gl stuff: shaders, camera, texturing.
	const canvas = document.getElementById("canvas-gl");
	const gl = canvas.getContext("webgl2");//maybe figure out if 2 is not available and default to one

	//setup shaders see utils from another repo

	//setup camera see Camera.js from another repo

	//texture setup

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


