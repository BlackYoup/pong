/** @jsx React.DOM */
function Pong(){
	var self = this;
	this.gameLines = null;
	this.canvas = null;
	this.context = null;
	this.ball = null;

	this.initUI = function(){
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
	};

	this.initEvents = function(){
		var usernameInput = $('#username');
		var validate = usernameInput.asEventStream('keydown').filter(function(e){
			return e.keyCode === 13;
		}).merge($('#submitAuth').asEventStream('click')).filter(function(){
			return usernameInput.val().trim().length > 0;
		});

		validate.onValue(function(){
			self.registerUser(usernameInput.val()).chain(function(){
				self.initGameUI();
			});
		});
	};

	this.registerUser = function(val){
		socket.user.pseudo = val;
		return Promise.of();
	};

	this.initGameUI = function(){
		var GamePlateform = React.createClass({
			render: function(){
				return (
					<div id="gamePlateform">
						<canvas width="700" height="500" id="pongCanvas">
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
		this.initCanvas();
	};

	this.initCanvas = function(){
		this.canvas = document.getElementById('pongCanvas');
		if(!this.canvas){
			alert('Can\'t get the canvas');
		}
		this.context = this.canvas.getContext('2d');
		if(!this.context){
			alert('Can\'t get canvas\'s context');
		}
		this.context.clearRect(0, 0, self.canvas.width, self.canvas.height);

		this.gameLines = {
			'left': new Line(10).init(),
			'right': new Line(self.canvas.width - 10).init()
		};
		this.wireLinesEvent();
		this.ball = new Ball().init();
	};

	this.createLine = function(pos){
		this.context.beginPath();
		this.context.moveTo(pos.fromLeft, pos.start);
		this.context.lineTo(pos.fromLeft, pos.stop);
		this.context.lineWidth = 5;
		this.context.stroke();
		this.context.closePath();
	};

	this.updateLines = function(status){
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		if(status === 'up'){
			_.each(this.gameLines, function(obj, key){
				obj.pos.start -= 20;
				obj.pos.stop -= 20;
				obj.update(status);
			});
		} else if(status === 'down'){
			_.each(this.gameLines, function(obj, key){
				obj.pos.start += 20;
				obj.pos.stop += 20;
				obj.update(status);
			});
		} else{
			_.each(this.gameLines, function(obj, key){
				obj.update();
			});
		}
		this.ball.outUpdate();
	};

	this.wireLinesEvent = function(){
		Bacon.fromEventTarget(document, 'keydown').onValue(function(e){
			if(e.keyCode === 40){
				self.updateLines('down');
			} else if(e.keyCode === 38){
				self.updateLines('up');
			}
		});
	};

	this.updateChecks = function(obj){
		if(obj.pos.start < 0){
			return false;
		} else if(obj.pos.stop > this.canvas.height){
			return false;
		} else{
			return true;
		}
	};

	this.createBall = function(pos){
		this.context.beginPath();
		this.context.arc(pos.x, pos.y, pos.radius, 0, Math.PI*2);
		this.context.fill();
		this.context.closePath();
	};

	this.init = function(){
		this.initUI();
		this.initEvents();
		return this;
	};

	function Line(fromLeft){
		this.lineHeight = 50;
		this.pos = {
			start: (self.canvas.height / 2) - (this.lineHeight / 2),
			stop: (self.canvas.height / 2) - (this.lineHeight / 2) + this.lineHeight,
			fromLeft: fromLeft
		};
		this.currentUpdate = null;

		this.update = function(status){
			this.currentUpdate = status;
			if(!self.updateChecks(this) && this.currentUpdate){
				if(this.currentUpdate === 'up'){
					this.pos.start = 0;
					this.pos.stop = this.lineHeight;
				} else if(this.currentUpdate === 'down'){
					this.pos.start = self.canvas.height - this.lineHeight;
					this.pos.stop = self.canvas.height;
				}
				this.currentUpdate = null;
			}
			self.createLine(this.pos);
		};

		this.init = function(){
			self.createLine(this.pos);
			return this;
		};
	}

	function Ball(){
		var ball = this;
		this.radius = 5;
		this.pos = {
			x: (self.canvas.width / 2),
			y: (self.canvas.height / 2),
			radius: this.radius
		};
		this.refreshInterval = null;
		this.speed = {
			x: 7,
			y: 7
		};

		this.startAnimate = function(){
			this.refreshInterval = setInterval(ball.animate, 1000/40)
		};

		this.animate = function(){
			if(ball.pos.x + (ball.radius / 2) >= self.canvas.width || ball.pos.x <= (0 + (ball.radius / 2))){
				ball.speed.x *= -1;
			}
			if(ball.pos.y + (ball.radius / 2) >= self.canvas.height || ball.pos.y <= (0 + (ball.radius / 2))){
				ball.speed.y *= -1;
			}
			ball.pos.x += ball.speed.x;
			ball.pos.y += ball.speed.y;
			ball.update();
		};

		this.update = function(){
			self.updateLines();
			self.createBall(this.pos);
		};

		this.outUpdate = function(){
			self.createBall(this.pos);
		};

		this.init = function(){
			self.createBall(this.pos);
			this.startAnimate();
			return this;
		};
	}
}
$(document).ready(function(){
	var pong = new Pong().init();
	setTimeout(function(){
		$('#username').val('test');
		$('#submitAuth').click();
	}, 100);
});
