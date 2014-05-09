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

	React.renderComponent(<GamePlateform />, document.getElementById('pong'));
	$('#chat, #pong').css('display', 'block');
	$('#login').css('display', 'none');
	initChat();
}

function initGameEvents(){

}

$(document).ready(function(){
	initUI();
	initEvents();
});
