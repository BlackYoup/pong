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
					<canvas width="500" height="500" id="pongCanvas">
						{ "Your browser don't support canvas, please chose one from : "}
						<a href="http://browsehappy.com/">"http://browsehappy.com/"</a>
					</canvas>
				</div>
			);
		}
	});

	React.renderComponent(<GamePlateform />, document.getElementById('pong'));
	$('#chat, #pong').css('display', 'block');
	$('#login').css('display', 'none');
	initChat();
	initCanvas();
}

function initCanvas(){
	var canvas = document.getElementById('pongCanvas');
	if(!canvas){
		alert('Can\'t get the canvas');
	}
	var context = canvas.getContext('2d');
	if(!context){
		alert('Can\'t get canvas\'s context');
	}

	initBawl(context, canvas);
}

function initBawl(context, canvas){
	var lineHeight = 100,
		middleStart = (canvas.height / 2) - (lineHeight / 2),
		middleStop = (canvas.height / 2) + (lineHeight / 2);

	context.beginPath();
	context.moveTo(10, middleStart);
	context.lineTo(10, middleStop);
	context.stroke();
	context.lineWidth = 50;
	context.closePath();
}

$(document).ready(function(){
	initUI();
	initEvents();
});
