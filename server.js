const http = require("http");
const https = require("https");
const express = require("express");
const fs = require('fs');
const sio = require("socket.io");
const url = require("url");


const FILE_OPT = {root: "site"};



const app = express();
app.disable('x-powered-by');
app.enable('trust proxy');

const httpServer = http.createServer(app);
const port = 5888;
httpServer.listen(port);

const io = sio(httpServer);

let activeSockets = [];

app.get("/", function(req, res){
	res.sendFile("index.html", FILE_OPT);
});

app.get("*.html$|*.css$|*.js$|/images/*|/fonts/*$", function(req, res){
	//oh fuck
	res.sendFile(url.parse(req.url).pathname.substring(1), FILE_OPT);
});

io.on("connection", function(socket){
	console.log("connection: "+socket.id);

	let existingSocket = activeSockets.find(function(s){
		return s === socket.id;
	});

	if(!existingSocket){
		activeSockets.push(socket.id);

		//tell the user that just joined about everyone else on the server
		socket.emit("update-user-list", {
			users: activeSockets.filter(function(es){
				return es !== socket.id;
			})
		});

		//tell everyone else about the new user
		socket.broadcast.emit("update-user-list", {
			users: [socket.id]
		});

		socket.on("disconnect", function(){
			console.log("disconnect");
			activeSockets = activeSockets.filter(function(es){
				return es !== socket.id;
			});

			socket.broadcast.emit("remove-user", {
				socketId: socket.id
			});
		});

		socket.on("call-user", function(data){
			socket.to(data.to).emit("call-made", {
				offer: data.offer,
				socket: socket.id
			});
		});

		socket.on("make-answer", function(data){
			socket.to(data.to).emit("answer-made", {
				socket: socket.id,
				answer: data.answer
			});
		});

		socket.onAny(function(event){
			console.log(event);
		});
	}
});
