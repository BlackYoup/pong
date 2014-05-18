var uuid = require('node-uuid');

function Pong(){
	this.players = {};
	this.gameRooms = {};
	this.io = null;
	var self = this;

	this.createGame = function(room){
		this.gameRooms[room] = {
			players: {},
			gameInfos: {
				startedAt: null,
				endedAt: null,
				scores: {
					left: 0,
					right: 0
				}
			}
		};
		return this;
	};
	this.joinGame = function(room, paddle, user){
		if(!this.gameRooms[room]){
			this.createGame(room);
		}
		return this.setGameUser(room, paddle, user);
	};
	this.setGameUser = function(room, paddle, user){
		this.gameRooms[room].players[paddle] = user;
		return this;
	};
	this.getGameInfos = function(room){
		var g = this.gameRooms[room],
			gameInfos = {
				players:{
					left: {
						pseudo: g.players.left.pseudo
					},
					right: {
						pseudo: g.players.right.pseudo
					}
				},
				gameInfos: g.gameInfos
			};
		return gameInfos;
	};
	this.getOpponent = function(room, myPaddle){
		return this.gameRooms[room].players[self.resolveOpponentPaddle(myPaddle)];
	};
	this.resolveOpponentPaddle = function(paddle){
		return paddle === 'left' ? 'right' : 'left';
	};
	this.startGame = function(room){
		this.io.sockets.in(room).emit('play');
		this.gameRooms[room].gameInfos.startedAt = new Date().getTime();
		return this;
	};
	this.increaseScore = function(room, paddle){
		++this.gameRooms[room].gameInfos.scores[paddle];
	};
	this.setPlayAgain = function(room, paddle, again){
		this.gameRooms[room].players[paddle].playAgain = again;
		return this;
	};
	this.checkPlayAgain = function(room){
		var players = this.gameRooms[room].players;
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
	this.getClientGameInfos = function(room){
		var roomInfos = this.gameRooms[room],
			players = roomInfos.players,
			scores = roomInfos.gameInfos.scores;
		return {
			left:{
				pseudo: players.left.pseudo
			},
			right: {
				pseudo: players.right.pseudo
			},
			gameInfos: {
				scores:{
					left: scores.left,
					right: scores.right
				}
			}
		};
	};
	this.resetPlayers = function(room){
		var left = this.gameRooms[room].players.left,
			right = this.gameRooms[room].players.right;
		left.ready = false;
		left.playAgain = null;
		right.ready = false;
		right.playAgain = null;
	}
	this.init = function(io){
		this.io = io;
		return this;
	};
}

module.exports = new Pong();