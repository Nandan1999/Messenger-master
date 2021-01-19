// This file is required by app.js. It sets up event listeners
// for the two main URL endpoints of the application - /create and /chat/:id
// and listens for socket.io messages.

// Use the gravatar module, to turn email addresses into avatar images:

var gravatar = require('gravatar');
var nickname=[];
var nick=[];
var fs = require('fs');
var path = require('path');
// Export a function, so that we can pass 
// the app and io instances from the app.js file:

module.exports = function(app,io){

	app.get('/', function(req, res){

		// Render views/home.html
		res.render('home');
	});

app.get('/creategrp',function(req,res){
	var id = Math.round((Math.random() * 1000000));

	res.redirect('/chatgrp/'+id);
});

app.get('/chatgrp/:id',function(req,res){
	res.render('grpchat');
})


	app.get('/create', function(req,res){

		// Generate unique id for the room
		var id = Math.round((Math.random() * 1000000));
        
		// Redirect to the random room
		res.redirect('/chat/'+id);
	});
    
	app.get('/chat/:id', function(req,res){

		// Render the chant.html view
		res.render('chat');
	});

	// Initialize a new socket.io application, named 'chat'
	var chat = io.on('connection', function (socket) {
	
    
		// When the client emits the 'load' event, reply with the 
		// number of people in this chat room
		socket.on("user_name",(data)=>{
			socket.name=data.name
			socket.yusername=data.username
			socket.image=data.img
			nickname[data.name]=socket
			var name=[]
			i = Object.keys(nickname);
			
			console.log(i)
			for(j=0;j<i.length;j++){
			
			socket_id=i[j];
			socket_data = nickname[socket_id];
			temp=({"pname":socket_data.name,"puser":socket_data.yusername,"pimg":socket_data.image})
			name.push(temp)
			}
			console.log(name)
			chat.emit("recieve_username",name)
		})
        
		socket.on('load',function(data){

			var room = findClientsSocket(io,data);
			if(room.length === 0 ) {

				socket.emit('peopleinchat', {number: 0});
			}
			else if(room.length === 1) {
  
				socket.emit('peopleinchat', {
					number: 1,
					user: room[0].username,
					avatar: room[0].avatar,
					id: data
				});
			}
			else if(room.length >= 2) {

				chat.emit('tooMany', {boolean: true});
			}
		});

		// When the client emits 'login', save his name and avatar,
		// and add them to the room
		socket.on('login', function(data) {
           
			var room = findClientsSocket(io, data.id);
			// Only two people per room are allowed
			if (room.length < 2) {

				// Use the socket object to store data. Each client gets
				// their own unique socket object

				socket.username = data.user;
				socket.room = data.id;
				socket.avatar = data.avatar
				// gravatar.url(data.avatar, {s: '140', r: 'x', d: 'mm'});

				// Tell the person what he should use for an avatar
				socket.emit('img', socket.avatar);


				// Add the client to the room
				socket.join(data.id);

				if (room.length == 1) {

					var usernames = [],
						avatars = [];

					usernames.push(room[0].username);
					usernames.push(socket.username);

					avatars.push(room[0].avatar);
					avatars.push(socket.avatar);

					// Send the startChat event to all the people in the
					// room, along with a list of people that are in it.

					chat.in(data.id).emit('startChat', {
						boolean: true,
						id: data.id,
						users: usernames,
						avatars: avatars
					});
				}
			}
			else {
				socket.emit('tooMany', {boolean: true});
			}
		});

		// Somebody left the chat
		socket.on('disconnect', function() {
			delete nickname[socket.name]

			// Notify the other person in the chat room
			// that his partner has left

			socket.broadcast.to(this.room).emit('leave', {
				boolean: true,
				room: this.room,
				user: this.username,
				avatar: this.avatar
			});

			// leave the room
			socket.leave(socket.room);
		});


		// Handle the sending of messages
		socket.on('msg', function(data){

			// When the server receives a message, it sends it to the other person in the room.
			socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user,img:data.img});
		});

		socket.on('userimages',function(image){
	
			socket.broadcast.to(socket.room).emit('addImages',{user:image.user,onl:image.onl,img:image.img});
		})

 // group chat code
 socket.on('loads',function(data){
	var room = findClientsSocket(io,data);
	if(room.length === 0){
	console.log("zero")
	socket.emit('peeps',{
		numbers:0,
	});
	}
	else{
		console.log("1")
		socket.emit('peeps',{
			numbers:0
		})
	}
})
socket.on('message',function(data){
	socket.broadcast.emit('received',{msg: data.msg, user: data.user, img: data.img})
})
socket.on("logins",(data)=>{
	        socket.yname=data.user
			socket.yusername=data.avatar
			socket.image=data.img;
			nick[data.user]=socket
			var names=[]
			k = Object.keys(nick);
			
			console.log(k)
			for(j=0;j<k.length;j++){
			
			socket_id=k[j];
			socket_data = nick[socket_id];
			temp=({"pname":socket_data.yname,"puser":socket_data.yusername,"pimg":socket_data.image})
			names.push(temp)
			} 
			console.log(names)
	chat.emit("recieve_user",names)
})

socket.on('userimage',function(image){
	
	socket.broadcast.emit('addImage',{user:image.user,onl:image.onl,img:image.img});
})
	socket.on('disconnect',function(){
		delete nick[socket.yname]
	})	
	});
};

function findClientsSocket(io,roomId, namespace) {
	var res = [],
		ns = io.of(namespace ||"/");    // the default namespace is "/"

	if (ns) {
		for (var id in ns.connected) {
			if(roomId) {
				var index = ns.connected[id].rooms.indexOf(roomId) ;
				if(index !== -1) {
					res.push(ns.connected[id]);
				}
			}
			else {
				res.push(ns.connected[id]);
			}
		}
	}
	return res;
}


