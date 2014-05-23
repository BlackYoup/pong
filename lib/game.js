var _ = require('underscore'),
	Ball = require('./ball.js');

function Game(){
	this.room = null;
	this.scores = {
		left: 0,
		right: 0
	};
	this.infos = {
		startedAt: null,
		endedAt: null
	};
	this.players = {
		left: null,
		right: null
	};
	this.io = null;
	this.ball = null;
	this.blockedState = false;
	var gameConf = require('../conf/conf.js');
	var self = this;

	this.setPlayers = function(paddle, user){
		this.players[paddle] = user;
		return this;
	};
	this.getPlayer = function(paddle){
		if(!paddle){
			return this.players;
		} else{
			return this.players[paddle];
		}
	};
	this.increaseScore = function(looser){
		++this.scores[this.resolveOpponentPaddle(looser)];
		return this;
	};
	this.getOpponent = function(myPaddle){
		return this.players[this.resolveOpponentPaddle(myPaddle)];
	};
	this.resolveOpponentPaddle = function(myPaddle){
		return myPaddle === 'left' ? 'right' : 'left';
	};
	this.resetPlayers = function(){
		_.each(this.players, function(player){
			player.ready = false;
			player.playAgain = null;
		});
	};
	this.resetGame = function(){
		this.infos.startedAt = null;
		this.infos.endedAt = null;
		this.blockedState = false;
	};
	this.startGame = function(){
		this.initPaddles();
		this.ball = new Ball().init(this);
		this.io.sockets.in(this.room).emit('play');
		this.infos.startedAt = new Date().getTime();
		return this;
	};
	this.initPaddles = function(){
		var paddlePos = {
			start: (gameConf.canvas.height / 2) - (gameConf.paddle.lineHeight / 2),
			stop: (gameConf.canvas.height / 2) - (gameConf.paddle.lineHeight / 2) + gameConf.paddle.lineHeight,
			fromLeft: gameConf.paddle.fromLeft
		};
		_.each(self.getPlayer(), function(player){
			player.myPaddlePos = paddlePos;
		});
	};
	this.getGameInfos = function(){
		return this.infos;
	};
	this.end = function(looserPaddle){
		if(!this.infos.endedAt){
			var looser = this.getPlayer(looserPaddle);
			this.infos.endedAt = new Date().getTime();
			this.increaseScore(looserPaddle);
			this.io.sockets.in(this.room).emit('end', looser.pseudo);
		}
		return this;
	};
	this.playAgain = function(paddle, again){
		this.players[paddle].playAgain = again;
		var ret = this.checkPlayAgain();
		if(ret){
			this.resetPlayers();
			this.resetGame();
			this.askReady();
		}
		return this;
	};
	this.checkPlayAgain = function(){
		var players = this.players;
		if(players.left.playAgain !== null && players.right.playAgain !== null){
			if(players.left.playAgain && players.right.playAgain){
				return true;
			} else{
				return false;
			}
		} else{
			return null;
		}
	};
	this.getClientGameInfos = function(){
		return {
			left:{
				pseudo: self.players.left.pseudo
			},
			right: {
				pseudo: self.players.right.pseudo
			},
			gameInfos: {
				scores:{
					left: self.scores.left,
					right: self.scores.right
				}
			}
		};
	};
	this.sendScores = function(){
		this.io.sockets.in(this.room).emit('updateScoresInfos', this.getClientGameInfos());
		return this;
	};
	this.joinGame = function(user){
		var inRoom = this.io.sockets.clients(this.room),
			paddle = null;
		if(inRoom.length === 0){
			paddle = 'left';
			user.setRoom(this.room).setPaddle(paddle).setXValue(1);
		} else if(inRoom.length === 1){
			paddle = 'right';
			user.setRoom(this.room).setPaddle(paddle).setXValue(-1);
		} else{
			user.socket.emit('full_room');
			return this;
		}
		this.io.sockets.socket(user.socketID).join(this.room);
		this.players[paddle] = user;
		user.myGame = this;
		this.annoucePlayer(user).sendPaddlesPos(user).checkRoomComplete();
		return this;
	};
	
	this.sendPaddlesPos = function(to){
		var paddles = _.map(this.players, function(player){
			return player !== null ? player.paddle.getInfos() : null
		});
		this.io.sockets.in(this.room).emit('initPaddlePos', paddles);
		return this;
	};
	this.annoucePlayer = function(user){
		var ret = {
			pseudo: 'Server',
			message: user.pseudo + ' has joined the room'
		};
		this.io.sockets.socket(user.socketID).join(self.room + '-chat');
		this.io.sockets.in(self.room + '-chat').emit('chat_message', ret);
		return this;
	};
	this.checkRoomComplete = function(){
		if(this.players.left && this.players.right){
			this.askReady();
		}
		return this;
	};
	this.askReady = function(){
		this.io.sockets.in(this.room).emit('readyToPlay', this.getClientGameInfos());
		return this;
	};
	this.ready = function(paddle){
		var opponent = this.getPlayer(this.resolveOpponentPaddle(paddle));
		if(opponent.ready && !this.blockedState){
			this.blockedState = true;
			setTimeout(function(){
				self.startGame();
				self.blockedState = false;
			}, 500);
		}
	};
	this.send = function(e, data){
		this.io.sockets.in(this.room).emit(e, data);
	};
	this.sendToPlayer = function(paddle, e, data){
		this.getPlayer(paddle).socket.emit(e, data);
	};
	this.updateMyPaddle = function(paddle, pos){
		var user = this.getPlayer(this.resolveOpponentPaddle(paddle));
		if(user){
			this.io.sockets.socket(user.socketID).emit('updateLine', pos);
		}
	};
	this.init = function(conf){
		this.room = conf.room;
		this.io = conf.io;
		return this;
	};
}

module.exports = Game;