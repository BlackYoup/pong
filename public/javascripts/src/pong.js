/** @jsx React.DOM */

function initUI(){

	var LoginForm = React.createClass({
		render: function(){
			return (
				<div>
					<input type="text" id="username" />
					<input type="submit" id="submitAuth" />
				</div>
	        );
		}
	});

	React.renderComponent(<LoginForm />, document.getElementById('login'));
}

function initEvents(){

	var usernameInput = $('#username');
	var validate = usernameInput.asEventStream('keydown').filter(function(e){
		return e.keyCode === 13;
	}).merge($('#submitAuth').asEventStream('click')).filter(function(){
		return usernameInput.val().trim().length > 0;
	});

	validate.onValue(function(){
		registerUser(usernameInput.val()).chain(function(){
			initGameUI();
		});
	})
}

function registerUser(val){
	socket.user.pseudo = val;
	return Promise.of();
}

function initGameUI(){
	var GamePlateform = React.createClass({
		render: function(){
			return (
				<div id="gamePlateform">
					Game
				</div>
			);
		}
	});

	var Chat = React.createClass({
		render: function(){
			return (
				<div>
					<div id="chatMessages"></div>
					<div id="chatWrite">
						<input type="text" id="messageText" /><input type="button" value="Send" id="sendMessage"/>
					</div>
				</div>
			)
		}
	});

	React.renderComponent(<GamePlateform />, document.getElementById('pong'));
	React.renderComponent(<Chat />, document.getElementById('chat'));
	$('#chat, #pong').css('display', 'block');
	$('#login').css('display', 'none');
	initChatEvents();
}

function initGameEvents(){

}

function initChatEvents(){
	var inputMessage = $('#messageText');

	inputMessage.asEventStream('keyup').filter(function(e){
		return e.keyCode === 13;
	}).merge($('#sendMessage').asEventStream('click')).map(function(){
		return inputMessage.val().trim();
	}).filter(function(message){
		return message.length > 0;
	}).onValue(function(message){
		socket.emit(message);
	});

	socket.init().onChatMessage = function(message){
		console.log(message);
	};
}

$(document).ready(function(){
	initUI();
	initEvents();
});
