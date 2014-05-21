var uuid = require('node-uuid'),
	Game = require('./game.js');

function Pong(){
	this.players = {};
	this.gameRooms = {};
	this.io = null;
	var self = this;

	this.createGame = function(room){
		this.gameRooms[room] = new Game().init({
			room: room,
			io: self.io
		});
		return this.gameRooms[room];
	};
	this.joinGame = function(room, user){
		if(!this.gameRooms[room]){
			this.createGame(room);
		}
		this.gameRooms[room].joinGame(user);
		return this;
	};
	this.init = function(io){
		this.io = io;
		return this;
	};
}

module.exports = new Pong();