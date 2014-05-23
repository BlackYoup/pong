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
				pong.spawnBall();
				self.socket.emit('readyToPlay');
			});
			this.socket.on('play', function(){
				pong.ball.init();
			});
			this.socket.on('end', function(looserPseudo){
				pong.endGame(looserPseudo);
			});
			this.socket.on('updateLine', function(pos){
				pong.updateEnnemyLine(pos);
			});
			this.socket.on('ballCoords', function(pos){
				pong.ball.update(pos);
			});
			this.socket.on('ballInfos', function(ballInfos){
				pong.ball.setInfos(ballInfos);
			});
			this.socket.on('updateScoresInfos', function(infos){
				pong.updateScores(infos);
				pong.initCanvas();
			});
			this.socket.on('initPaddlePos', function(data){
				pong.setPaddlePos(data);
			});
			return this;
		};

		this.joinGame = function(infos){
			this.socket.emit('joinGame', infos);
		};

		this.updateLine = function(status){
			this.socket.emit('updateLine', status);
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
