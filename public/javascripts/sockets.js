$(document).ready(function(){
	function SocketIO(){
		var self = this;
		this.socket = null;
		this.onChatMessage = null;

		this.emit = function(message){
			if(typeof message === 'string'){
				message = message.trim();
			}
			this.socket.emit('chat_message', message);
		};

		this.connect = function(){
			this.socket = io.connect(window.location);
			return this;
		};

		this.socketEvents = function(){
			this.socket.on('chat_message', function(content){
				self.onChatMessage(content);
			});
			this.socket.on('chat_joined', function(message){
				self.onChatMessage(message);
			});
			this.socket.on('chat_leave', function(message){
				self.onChatMessage(message);
			});
			this.socket.on('xValue', function(xValue){
				pong.xValue = xValue;
			});
			this.socket.on('readyToPlay', function(gameInfos){
				pong.updateScores(gameInfos);
				self.socket.emit('readyToPlay');
			});
			this.socket.on('play', function(){
				pong.initBall();
			});
			this.socket.on('end', function(looserPseudo){
				pong.announceLooser(looserPseudo);
				pong.endGame();
			});
			this.socket.on('updateLine', function(pos){
				pong.updateEnnemyLine(pos);
			});
			this.socket.on('updateScoresInfos', function(infos){
				pong.updateScores(infos);
				pong.initCanvas();
			});
			return this;
		};

		this.joinGame = function(infos){
			this.socket.emit('joinGame', infos);
		};

		this.updateLine = function(pos){
			this.socket.emit('updateLine', {
				start: pos.start,
				stop: pos.stop
			});
		};

		this.endGame = function(){
			this.socket.emit('endGame');
		};

		this.playAgain = function(again){
			this.socket.emit('playAgain', again);
		};

		this.init = function(){
			this.connect().socketEvents();
			return this;
		};
	}

	window.socket = new SocketIO().init();
});
