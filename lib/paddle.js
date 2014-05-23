var gameConf = require('../conf/conf.js'),
	_ = require('underscore');

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
		var oldPos = _.clone(this.pos);
		if(status === 'up'){
			if((this.pos.start - 20) < 0){
				this.pos.start = 0;
				this.pos.stop = this.lineHeight;
			} else{
				this.pos.start -= 20;
				this.pos.stop -= 20;
			}
		} else if(status === 'down'){
			if((this.pos.stop + 20) > gameConf.canvas.height){
				this.pos.start = gameConf.canvas.height - this.lineHeight;
				this.pos.stop = gameConf.canvas.height;
			} else{
				this.pos.start += 20;
				this.pos.stop += 20;
			}
		}
		
		if(!_.isEqual(oldPos, this.pos)){
			this.sendUpate();
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