/** @jsx React.DOM */
function Pong(){
	var self = this;
	this.gameLines = null;
	this.canvas = null;
	this.context = null;
	this.ball = null;
	this.down = false;
	this.downInterval = null;
	this.user = {
		pseudo: null,
		roomName: null
	};
	this.xValue = null;
	this.updateScores = null;

	this.initUI = function(){
		var LoginForm = React.createClass({
			render: function(){
				return (
					<div>
						<label for="username">{"UserName"}</label>{" : "}<input type="text" id="username" /><br />
						<label for="roomName">{"Room Name"}</label>{" : "}<input type="text" id="roomName" /><br />
						<input type="submit" id="submitAuth" />
					</div>
				);
			}
		});

		React.renderComponent(<LoginForm />, document.getElementById('login'));
	};

	this.initEvents = function(){
		var usernameInput = $('#username'),
			roomName = $('#roomName');
		var bothInputs = usernameInput.asEventStream('keydown').merge(roomName.asEventStream('keydown')),
		validate = bothInputs.filter(function(e){
			return e.keyCode === 13;
		}).merge($('#submitAuth').asEventStream('click')).filter(function(){
			return usernameInput.val().trim().length > 0 && roomName.val().trim().length > 0;
		});

		validate.onValue(function(){
			self.registerUser(usernameInput.val()).chain(function(){
				self.user.roomName = roomName.val().trim();
				self.initGameUI();
				initChat();
			});
		});
	};

	this.registerUser = function(val){
		this.user.pseudo = val.trim();
		return Promise.of();
	};

	this.initGameUI = function(gameInfos){
		var Results = React.createClass({
			getInitialState: function(){
				return {
					left: {
						pseudo: null,
						score: null
					},
					right: {
						pseudo: null,
						score: null
					}
				};
			},
			componentDidMount: function(){
				var scores = this;
				self.updateScores = function(scores){
					scores.setState(scores);
				};
			},
			render: function(){
				return (
					<div className="results">
						<div classNam="results__left">
							{this.state['left'].pseudo + ' ' + this.state['left'].score}
						</div>
						<div className="results__right">
							{this.state['right'].pseudo + ' ' + this.state['right'].score}
						</div>
					</div>
				);
			}
		});
		var GamePlateform = React.createClass({
			render: function(){
				return (
					<div id="gamePlateform">
						<canvas width="700" height="500" id="pongCanvas">
							{ "Your browser don't support canvas, please chose one from : "}
							<a href="http://browsehappy.com/">"http://browsehappy.com/"</a>
						</canvas>
						<Results />
					</div>
				);
			}
		});
		React.renderComponent(<GamePlateform />, document.getElementById('pong'));
		$('#chat, #pong').css('display', 'block');
		$('#login').css('display', 'none');
		this.initCanvas();
		socket.joinGame({
			room: self.user.roomName,
			pseudo: self.user.pseudo
		});
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
			'left': new Line(10).init(self.user.pseudo),
			'right': new Line(self.canvas.width - 10).init(self.user.pseudo + '2')
		};
		this.wireLinesEvent();
	};

	this.initBall = function(){
		console.log(this.xValue);
		this.ball = new Ball().init(self.xValue);
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
			var obj = this.gameLines['left'];
			obj.pos.start -= 20;
			obj.pos.stop -= 20;
			obj.update(status);
		} else if(status === 'down'){
			var obj = this.gameLines['left'];
			obj.pos.start += 20;
			obj.pos.stop += 20;
			obj.update(status);
		} else{
			_.each(this.gameLines, function(obj, key){
				obj.update();
			});
		}
		this.ball.outUpdate();
		if(status){
			this.gameLines['right'].update();
			socket.updateLine(this.gameLines['left'].pos);
		}
	};

	this.wireLinesEvent = function(){
		Bacon.fromEventTarget(document, 'keydown').onValue(function(e){
			if(self.down){
				return;
			}
			self.down = true;
			self.downInterval = setInterval(function(){
				if(e.keyCode === 40){
					self.updateLines('down');
				} else if(e.keyCode === 38){
					self.updateLines('up');
				}
			}, 50);
		});
		Bacon.fromEventTarget(document, 'keyup').onValue(function(e){
			if(!self.down){
				return;
			}
			self.down = false;
			clearInterval(self.downInterval);
			self.downInterval = null;
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

	this.updateEnnemyLine = function(pos){
		this.gameLines['right'].pos.start = pos.start;
		this.gameLines['right'].pos.stop = pos.stop;
		this.updateLines();
	};

	this.endGame = function(){
		this.playAgain();
	};

	this.playAgain = function(){
		if(confirm('Play again ?')){
			socket.playAgain(true);
		} else{
			socket.playAgain(false);
		}
	};

	this.announceLooser = function(pseudo){
		alert(pseudo + ' lost the game');
	};

	this.init = function(){
		this.initUI();
		this.initEvents();
		return this;
	};

	function Line(fromLeft){
		this.lineHeight = 100;
		this.pos = {
			start: (self.canvas.height / 2) - (this.lineHeight / 2),
			stop: (self.canvas.height / 2) - (this.lineHeight / 2) + this.lineHeight,
			fromLeft: fromLeft
		};
		this.currentUpdate = null;
		this.pseudo = null;

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

		this.init = function(pseudo){
			self.createLine(this.pos);
			this.pseudo = pseudo;
			return this;
		};
	}

	function Ball(xValue){
		var ball = this;
		this.radius = 5;
		this.pos = {
			x: (self.canvas.width / 2),
			y: (self.canvas.height / 2),
			radius: this.radius
		};
		this.refreshInterval = null;
		this.speed = {
			x: -7,
			y: -7
		};

		console.log(this.speed);

		this.startAnimate = function(){
			this.refreshInterval = setInterval(ball.animate, 1000/40)
		};

		this.animate = function(){
			var barsPositions = _.map(self.gameLines, function(obj){
				return obj.pos;
			});
			_.each(barsPositions, function(obj){
				if(ball.pos.y >= obj.start && ball.pos.y <= obj.stop && ball.pos.x < (obj.fromLeft + 5) && ball.pos.x > (obj.fromLeft - 5)){
					ball.speed.x *= -1;
				}
			});
			if(ball.pos.x <= (0 + (ball.radius / 2))){
				ball.kill();
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

		this.kill = function(player){
			clearInterval(ball.refreshInterval);
			socket.endGame();
		};

		this.init = function(xValue){
			this.speed.x *= xValue;
			self.createBall(this.pos);
			this.startAnimate();
			return this;
		};
	}
}
$(document).ready(function(){
	window.pong = new Pong().init();
	/*setTimeout(function(){
		$('#username').val('test');
		$('#roomName').val('yolo');
		$('#submitAuth').click();
	}, 100);*/
});
