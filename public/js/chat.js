

// This file is executed in the browser, when people visit /chat/<random id>

$(function(){

	// getting the id of the room from the url
	var id = Number(window.location.pathname.match(/\/chat\/(\d+)$/)[1]);
	window.avatar="../img/unnamed.jpg"
	window.ids=window.location.href;
	// connect to the socket
	var socket = io();
	
	// variables which hold the data for each person
	var name = "",
		email = "",
		img = "",
		friend = "";

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
		var link=$(".link")
		
	// some more jquery objects
	var chatNickname = $(".nickname-chat"),
		leftNickname = $(".nickname-left"),
		loginForm = $(".loginForm"),
		yourName = $("#yourName"),
		yourEmail = $("#yourEmail"),
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
		


	// these variables hold images
	var ownerImage = $("#ownerImage"),
		leftImage = $("#leftImage"),
		noMessagesImage = $("#noMessagesImage");


	// on connection to server get the id of person's room
	socket.on('connect', function(){

		socket.emit('load', id);
	});

	// save the gravatar url
	socket.on('img', function(data){
		img = data;
	});

	// receive the names and avatars of all people in the chat room
	socket.on('peopleinchat', function(data){

		if(data.number === 0){

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

					showMessage("inviteSomebody");

					// call the server-side function 'login' and send user's parameters
					socket.emit('login', {user: name, avatar: window.avatar, id: id});
				}
			
			});
		}
		
		else if(data.number === 1) {

			showMessage("personinchat",data);

			loginForm.on('submit', function(e){

				e.preventDefault();

				name = $.trim(hisName.val());

				if(name.length < 1){
					alert("Please enter a nick name longer than 1 character!");
					return;
				}

				if(name == data.user){
					alert("There already is a \"" + name + "\" in this room!");
					return;
				}

				email = hisEmail.val();
				if(!isValid(email)){
					alert("Wrong e-mail format!");
				}
				else {
				
					
					
					socket.emit('login', {user: name, avatar: window.avatar, id: id});
				}

			});
		}

		else {
			showMessage("tooManyPeople");
		}

	});

	
var app = angular.module('myApp',['socket.io']);
app.config(function ( $socketProvider){
	$socketProvider.setConnectionUrl("https://messenger-chat-v1.herokuapp.com/");
})


app.controller('myCtrl', function($scope,$socket) {
	$scope.users=[];
	yourEnter.click(()=>{
	$socket.emit("user_name",{
		name :yourName.val(),
		username:window.location.href,
		img:window.avatar 	
		})
		})

	$socket.on("recieve_username",(data)=>{
		$scope.users=data
	});	
})
	 

	
// images transfer code


socket.on('img-chunk',function(chunk){
	var disp=$('#disp');
	imgChunks.push(chunk);
	disp.setAttribute('src','data:image/jpeg;base64,'+ window.btoa(imgChunks));
});

	socket.on('startChat', function(data){
		console.log(data);
		if(data.boolean && data.id == id) {

			chats.empty();

			if(name === data.users[0]) {

				showMessage("youStartedChatWithNoMessages",data);
			}
			else {

				showMessage("heStartedChatWithNoMessages",data);
			}

			chatNickname.text(friend);
		}
	});

	socket.on('leave',function(data){

		if(data.boolean && id==data.room){

			showMessage("somebodyLeft", data);
			chats.empty();
		}

	});

	socket.on('tooMany', function(data){

		if(data.boolean && name.length === 0) {

			showMessage('tooManyPeople');
		}
	});

	socket.on('receive', function(data){
		

		showMessage('chatStarted');

		if(data.msg.trim().length) {
			createChatMessage(data.msg, data.user, data.img, moment());
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
			createChatMessage(textarea.val(), name, window.avatar, moment());
			scrollToBottom();

			// Send the message to the other person in the chat
			socket.emit('msg', {msg: textarea.val(), user: name, img: window.avatar});

		}
		// Empty the textarea
		textarea.val("");
	});

	// Update the relative time stamps on the chat messages every minute

	setInterval(function(){

		messageTimeSent.each(function(){
			var each = moment($(this).data('time'));
			$(this).text(each.fromNow());
		});

	},60000);

	// Function that creates a new chat message

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
		var source=imgg;
		var li = $(
			'<li class=' + who + '>'+
				'<div class="image">' +
				// '<h6 class=' + chat +'></h6>'+
				'<img src ='+source+ '>'+
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


socket.on('addImages',function(data){
	showMessage("chatStarted")
	onlineusers(data.user,data.img,data.onl,moment())
	scrollToBottom()
})



$(function(){
	$("#myFile").on('change',function(e){
		showMessage("chatStarted")
		var file=e.originalEvent.target.files[0];
		var reader= new FileReader();
		
		reader.onload=function(evt){
			onlineusers(name,evt.target.result,window.avatar,moment())
			scrollToBottom()
			socket.emit('userimages',{user:name,onl:window.avatar,img:evt.target.result});
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
			onConnect.fadeIn(1200);
		}

		else if(status === "inviteSomebody"){

			// Set the invite link content window.location.href
			// $("#link").text(window.location.href+name);
            // $("#link2").text("chat with anu");
			onConnect.fadeOut(1200, function(){
				inviteSomebody.fadeIn(1200);
			});
		}

		else if(status === "personinchat"){

			onConnect.css("display", "none");
			personInside.fadeIn(1200);

			chatNickname.text(data.user);
			ownerImage.attr("src",data.avatar);
			
		}

		else if(status === "youStartedChatWithNoMessages") {

			left.fadeOut(1200, function() {
				inviteSomebody.fadeOut(1200,function(){
					noMessages.fadeIn(1200);
					footer.fadeIn(1200);
				});
			});

			friend = data.users[1];
			noMessagesImage.attr("src",data.avatars[1]);
		}

		else if(status === "heStartedChatWithNoMessages") {

			personInside.fadeOut(1200,function(){
				noMessages.fadeIn(1200);
				footer.fadeIn(1200);
			});

			friend = data.users[0];
			noMessagesImage.attr("src",data.avatars[0]);
		}

		else if(status === "chatStarted"){

			section.children().css('display','none');
			chatScreen.css('display','block');
		}

		else if(status === "somebodyLeft"){

			leftImage.attr("src",data.avatar);
			leftNickname.text(data.user);

			section.children().css('display','none');
			footer.css('display', 'none');
			left.fadeIn(1200);
		}

		else if(status === "tooManyPeople") {

			section.children().css('display', 'none');
			tooManyPeople.fadeIn(1200);
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
	
							$("#avatar6").click(function(){
								$("#creatorImage1").attr('src','../img/Avatar2.jpg')
								window.avatar="../img/Avatar2.jpg";
								
								})
								$("#avatar7").click(function(){
									$("#creatorImage1").attr('src','../img/Avatar1.jpg')
									window.avatar="../img/Avatar1.jpg";
									
									})
									$("#avatar8").click(function(){
										$("#creatorImage1").attr('src','../img/Avatar.jpg')
										window.avatar="../img/Avatar.jpg";
										
										})
										$("#avatar9").click(function(){
											$("#creatorImage1").attr('src','../img/Avatar3.jpg')
											window.avatar="../img/Avatar3.jpg";
											
											})
											$("#avatar10").click(function(){
												$("#creatorImage1").attr('src','../img/Avatar4.jpg')
												window.avatar="../img/Avatar4.jpg";
												
												})
												$("#avatar11").click(function(){
													$("#creatorImage1").attr('src','../img/Avatar5.jpg')
													window.avatar="../img/Avatar5.jpg";
													
													})						


});
