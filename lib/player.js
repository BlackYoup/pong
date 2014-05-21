var Pong = require('./pong.js');

function Player(){
	this.pseudo = null;
	this.ready = false;
	this.socketID = null;
	this.gameRoom = null;
	this.paddle = null;
	this.playAgain = null;
	this.socket = null;
	this.xValue = null;
	this.myGame = null;

	var self = this;

	////////////////////// SETTERS /////////////////////////

	this.setPseudo = function(pseudo){
		this.pseudo = pseudo.toString().trim();
		return this;
	};
	this.setRoom = function(room){
		this.gameRoom = room;
		return this;
	};	
	this.setPaddle = function(side){
		this.paddle = side;
		return this;
	};
	this.setXValue = function(val){
		this.xValue = val;
		this.socket.emit('xValue', self.xValue);
		return this;
	};

	this.joinRoom = function(room){
		Pong.joinGame(room, this);
	};
	this.readyToPlay = function(){
		this.ready = true;
		this.myGame.ready(this.paddle);
	};
	this.endGame = function(){
		this.myGame.end(this.paddle);
	};
	this.doPlayAgain = function(again){
		this.myGame.playAgain(this.paddle, again);
	};
	this.init = function(conf){
		this.socketID = conf.socketID;
		this.socket = conf.socket;
		return this;
	};
}

module.exports = Player;