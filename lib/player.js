var Pong = require('./pong.js'),
	Promise = require('pacta');

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
	this.io = null;

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
	this.setScores = function(){
		this.io.sockets.in(this.gameRoom).emit('updateScoresInfos', this.myGame.getGameInfos(this.gameRoom));
		return this;
	};

	this.joinRoom = function(room){
		var inRoom = this.io.sockets.clients(room);
		if(inRoom.length === 0){
			this.socket.join(room);
			this.setRoom(room).setPaddle('left').announceMe().setXValue(1).createGame().joinGame();
		} else if(inRoom.length === 1){
			this.socket.join(room);
			this.setRoom(room).setPaddle('right').announceMe().setXValue(-1).joinGame().setScores().askReady();
		} else{
			this.socket.emit('full_room');
		}
	};
	this.announceMe = function(){
		var ret = {
			pseudo: 'Server',
			message: self.pseudo + ' has joined the room'
		};
		this.io.sockets.socket(self.socketID).join(self.gameRoom + '-chat');
		this.io.sockets.in(self.gameRoom + '-chat').emit('chat_message', ret);
		return this;
	};
	this.createGame = function(){
		this.myGame = Pong.createGame(this.gameRoom);
		return this;
	};
	this.joinGame = function(){
		this.myGame = Pong.joinGame(this.gameRoom, this.paddle, this);
		return this;
	};
	this.askReady = function(){
		var promise = new Promise();
		setTimeout(function(){
			self.io.sockets.in(self.gameRoom).emit('readyToPlay', self.myGame.getClientGameInfos(self.gameRoom));
			promise.resolve();
		}, 500);
		return promise;
	};
	this.readyToPlay = function(){
		this.ready = true;
		var opponent = this.myGame.getOpponent(this.gameRoom, this.paddle);
		if(opponent.ready){
			this.myGame.startGame(this.gameRoom);
		}
	};
	this.endGame = function(){
		if(!this.myGame.getGameInfos(this.gameRoom).endedAt){
			this.myGame.getGameInfos(this.gameRoom).endedAt = new Date().getTime();
			this.io.sockets.in(this.gameRoom).emit('end', this.pseudo);
			this.myGame.increaseScore(this.gameRoom, this.myGame.resolveOpponentPaddle(this.paddle));
		}
	};
	this.doPlayAgain = function(again){
		var ret = this.myGame.setPlayAgain(this.gameRoom, this.paddle, again).checkPlayAgain(this.gameRoom);
		if(ret){
			this.myGame.resetPlayers(this.gameRoom);
			this.askReady();
		}
	};

	this.init = function(conf){
		this.socketID = conf.socketID;
		this.io = conf.io;
		this.socket = conf.socket;
		return this;
	};
}

module.exports = Player;