var gameConf = require('../conf/conf.js');

function Paddle(){
	this.fromLeft = null;
	this.lineHeight = gameConf.paddle.height;
	this.pos = null;
	this.player = null;
	this.paddle = null;
	var self = this;
	
	this.defineStart = function(){
		this.pos = {
			start: (gameConf.canvas.height / 2) - (self.lineHeight / 2),
			stop: (gameConf.canvas.height / 2) - (self.lineHeight / 2) + self.lineHeight,
			fromLeft: self.fromLeft
		};
		return this;
	};
	
	this.update = function(status){
		if(status === 'up'){
			this.pos.start -= 20;
			this.pos.stop -= 20;
		} else if(status === 'down'){
			this.pos.start += 20;
			this.pos.stop += 20;
		}
		if(!self.updateChecks(this)){
			if(status === 'up'){
				this.pos.start = 0;
				this.pos.stop = this.lineHeight;
			} else if(status === 'down'){
				this.pos.start = gameConf.canvas.height - this.lineHeight;
				this.pos.stop = gameConf.canvas.height;
			}
		}
		
		if(status === 'down' || status === 'up'){
			this.sendUpate();
		}
	};
	
	this.updateChecks = function(){
		if(this.pos.start - 20 < 0){
			return false;
		} else if(this.pos.stop > gameConf.canvas.height){
			return false;
		} else{
			return true;
		}
	};
	
	this.sendUpate = function(){
		this.player.myGame.updateMyPaddle(this.paddle, this.pos);
	};
	
	this.getInfos = function(){
		return {
			paddle: self.paddle,
			pos: self.pos
		};
	};
	
	this.init = function(player, paddle){
		this.player = player;
		this.paddle = paddle;
		this.fromLeft = paddle === 'left' ? gameConf.paddle.fromLeft : gameConf.canvas.width - gameConf.paddle.fromLeft;
		this.defineStart();
		return this;
	};
}

module.exports = Paddle;