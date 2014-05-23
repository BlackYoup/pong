var _ = require('underscore'),
	gameConf = require('../conf/conf.js');

function Ball(){
	this.game = null;
	this.radius = gameConf.ball.radius;
	this.pos = null;
	this.speed = null;
	this.refreshInterval = null;
	var self = this;
	
	this.startCompute = function(){
		this.refreshInterval = setInterval(function(){
			self.computeBall();
		}, 1000/40);
	};
	this.stopCompute = function(){
		clearInterval(self.refreshInterval);
	};
	
	this.computeBall = function(){
		var players = self.game.getPlayer(),
			left = players.left.paddle.pos,
			right = players.right.paddle.pos,
			hit = false;

		if(this.pos.y >= left.start && this.pos.y <= left.stop && this.pos.x < (gameConf.paddle.fromLeft + 5) && this.pos.x > (gameConf.paddle.fromLeft - 5)){
			this.speed.x *= -1;
			hit = true;
		}
		if(this.pos.y >= right.start && this.pos.y <= right.stop && this.pos.x > (gameConf.canvas.width - gameConf.paddle.fromLeft - 5) && (gameConf.canvas.width - self.pos.x) < (gameConf.canvas.width - gameConf.paddle.fromLeft + 5)){
			self.speed.x *= -1;
			hit = true;
		}
		if(!hit){
			if(this.pos.x <= (0 + (this.radius / 2))){
				this.stopCompute();
				this.game.end('left');
			} else if(this.pos.x > (gameConf.canvas.width - (this.radius / 2))){
				this.stopCompute();
				this.game.end('right');
			}
		}
		if(this.pos.y + (this.radius / 2) >= gameConf.canvas.height || this.pos.y <= (0 + (this.radius / 2))){
			this.speed.y *= -1;
		}

		this.pos.x += this.speed.x;
		this.pos.y += this.speed.y;
		this.updateCoords();
	};
	
	this.newBall = function(){
		this.pos = {
			x: (gameConf.canvas.width / 2),
			y: (gameConf.canvas.height / 2)
		};
		this.speed = {
			x: -7,
			y: -7
		};
		this.sendBallData();
		this.startCompute();
	};
	
	this.sendBallData = function(){
		var infos = {
			pos: self.pos,
			radius: self.radius
		};
		this.game.send('ballInfos', infos);
	};
	
	this.updateCoords = function(){
		this.game.sendToPlayer('left', 'ballCoords', {
			x: self.pos.x,
			y: self.pos.y
		});
		this.game.sendToPlayer('right', 'ballCoords', {
			x: gameConf.canvas.width - self.pos.x,
			y: self.pos.y
		});
	};
	
	this.init = function(game){
		this.game = game;
		this.newBall();
	};
}

module.exports = Ball;