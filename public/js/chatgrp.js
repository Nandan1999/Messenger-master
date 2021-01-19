// This file is executed in the browser, when people visit /chat/<random id>

$(function(){

	// getting the id of the room from the url
	var id = Number(window.location.pathname.match(/\/chatgrp\/(\d+)$/)[1]);

	
	// connect to the socket
	var socket = io();
	
	// variables which hold the data for each person
	var name = "",
		email = "",
		img = "",
		friend = "";
window.avatar="../img/unnamed.jpg"
	// cache some jQuery objects
	var section = $(".section"),
		footer = $("footer"),
		onConnect = $(".connected"),
		inviteSomebody = $(".invite-textfield"),
		personInside = $(".personinside"),
		chatScreen = $(".chatscreen"),
		left = $(".left"),
		noMessages = $(".nomessages"),
		tooManyPeople = $(".toomanypeople");

	// some more jquery objects
	var chatNickname = $(".nickname-chat"),
		leftNickname = $(".nickname-left"),
		loginForm = $(".loginForm"),
		yourName = $("#yourName"),
		yourEmail = $("#yourEmail"),
		d1=$("#d1"),
		hisName = $("#hisName"),
		hisEmail = $("#hisEmail"),
		chatForm = $("#chatform"),
		textarea = $("#message"),
		messageTimeSent = $(".timesent"),
		chats = $(".chats"),
        chats2 = $(".chats2"),
		userlist = $("#userlist");
		yourEnter=$("#yourEnter");
		images=$('#images');
		var imgChunks=[];
		var upload=("upload")


	// these variables hold images
	var ownerImage = $("#ownerImage"),
		leftImage = $("#leftImage"),
		noMessagesImage = $("#noMessagesImage");


	// on connection to server get the id of person's room
	socket.on('connect' ,function(){
        socket.emit('loads',id)
    })
    // Function that creates a new chat message
socket.on('peeps',function(data){
    if(data.numbers === 0 ){
		showMessage("connected");

		loginForm.on('submit', function(e){

			e.preventDefault();

			name = $.trim(yourName.val());
			
			if(name.length < 1){
				alert("Please enter a nick name longer than 1 character!");
				return;
			}
			email = yourEmail.val();

			if(!isValid(email)) {
				alert("Please enter a valid email!");
			}
			else {
				

				   showMessage("chatStarted")
				   if(yourName.val().trim().length){
					// onlineusers(name,yourEmail.val().slice(0,1))
				   }
				// call the server-side function 'login' and send user's parameters
				socket.emit('loginse', {user: name, avatar: yourEmail.val().slice(0,1), id: id});
				
			}
		})
	}
	

})
var app = angular.module('myapp',['socket.io']);
app.config(function ( $socketProvider){
	$socketProvider.setConnectionUrl("https://messenger-chat-v1.herokuapp.com/");
})
app.controller('myctrl', function($scope,$socket) {
	$scope.user=[]
	$scope.img=[]
	yourEnter.click(()=>{
	$socket.emit('logins',{
		user:yourName.val(),
		avatar:window.location.href,
		img:window.avatar
		});
	})
	
	$socket.on("recieve_user",(data)=>{
		$scope.user=data,
		$scope.img=data
	})
})
socket.on('received', function(data){

	showMessage('chatStarted');

	if(data.msg.trim().length) {
		createChatMessage(data.msg, data.user,data.img, moment());
		scrollToBottom();
	}
});

textarea.keypress(function(e){

	// Submit the form on enter

	if(e.which == 13) {
		e.preventDefault();
		chatForm.trigger('submit');
	}

});


chatForm.on('submit', function(e){

	e.preventDefault();

	// Create a new chat message and display it directly

	showMessage("chatStarted");

	if(textarea.val().trim().length) {
		createChatMessage(textarea.val(), name,window.avatar, moment());
		scrollToBottom();

		// Send the message to the other person in the chat
		socket.emit('message', {msg: textarea.val(), user: name,img:window.avatar});

	}
	// Empty the textarea
	textarea.val("");
});

setInterval(function(){

	messageTimeSent.each(function(){
		var each = moment($(this).data('time'));
		$(this).text(each.fromNow());
	});

},60000);

// imgg
	function createChatMessage(msg,user,imgg,now){
        
		var who = '';

		if(user===name) {
			who = 'me';
		}
		else {
			who = 'you';
		}
        if(user===name) {
			chat='here';
		}
		else {
			chat = 'there';
		}
		var source=imgg
		var li = $(
			'<li class=' + who + '>'+
				'<div class="image">' +
					'<img src=' +source+  '>' +
					'<b></b>' +
					'<i class="timesent" data-time=' + now + '></i> ' +
				'</div>' +
				'<p></p>' +
			'</li>');

		// use the 'text' method to escape malicious user input
		li.find('p').text(msg);
		li.find('b').text(user);
		// li.find('h6').text(imgg);
        
		chats.append(li);

		messageTimeSent = $(".timesent");
		messageTimeSent.last().text(now.fromNow());
	}
	
	function onlineusers(user,image,imgg,now){
		var chat=""
		if(user===name){
			chat = "me"
		}
		else{
			chat="you"
		}
		var source=imgg
		// var source=imgg;
		var li = $(
			'<li class=' + chat + '>'+
				'<div class="image">' +
					'<img src=' +source+  '>' +
					'<b></b>' +
					'<i class="timesent" data-time=' + now + '></i> ' +
				'</div>' +
				'<img id="im1">' +
			'</li>');
		li.find('b').text(user);
		li.find('#im1').attr("src",image)
		chats.append(li);

		messageTimeSent = $(".timesent");
		messageTimeSent.last().text(now.fromNow());
	}


socket.on('addImage',function(data){
	onlineusers(data.user,data.img,data.onl,moment())
	scrollToBottom()
})



$(function(){
	$("#myFile").on('change',function(e){
		var file=e.originalEvent.target.files[0];
		var reader= new FileReader();
		
		reader.onload=function(evt){
			onlineusers(name,evt.target.result,window.avatar,moment())
			scrollToBottom()
			socket.emit('userimage',{user:name,onl:window.avatar,img:evt.target.result});
		}
		reader.readAsDataURL(file);
	})
})




	function scrollToBottom(){
		$("html, body").animate({ scrollTop: $(document).height()-$(window).height() },1000);
	}

	function isValid(thatemail) {

		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(thatemail);
	}

	function showMessage(status,data){

		if(status === "connected"){

			section.children().css('display', 'none');
			d1.css('display','none');
			onConnect.fadeIn(1200);

			
		}

	

		else if(status === "chatStarted"){

			section.children().css('display','none');
			chatScreen.css('display','block');
			d1.css('display','block');
			footer.fadeIn(1200);
		}

	
		
	}



	$("#avatar2").click(function(){
	$("#creatorImage").attr('src','../img/Avatar2.jpg')
	window.avatar="../img/Avatar2.jpg";
	})
	$("#avatar1").click(function(){
		$("#creatorImage").attr('src','../img/Avatar1.jpg')
		window.avatar="../img/Avatar1.jpg";
		})
		$("#avatar").click(function(){
			$("#creatorImage").attr('src','../img/Avatar.jpg')
			window.avatar="../img/Avatar.jpg";
			})
			$("#avatar3").click(function(){
				$("#creatorImage").attr('src','../img/Avatar3.jpg')
				window.avatar="../img/Avatar3.jpg";
				})
				$("#avatar4").click(function(){
					$("#creatorImage").attr('src','../img/Avatar4.jpg')
					window.avatar="../img/Avatar4.jpg";
					})
					$("#avatar5").click(function(){
						$("#creatorImage").attr('src','../img/Avatar5.jpg')
						window.avatar="../img/Avatar5.jpg";
						})


});
