$(document).ready(function(){
	function SocketIO(){
		var self = this;
		this.socket = null;
		this.onChatMessage = null;
		this.user = {
			pseudo: null
		};

		this.emit = function(message){
			if(typeof message === 'string'){
				message = message.trim();
			}
			this.socket.emit('chat_message', message);
		};

		this.joinChat = function(){
			this.socket.emit('join_chat', {
				pseudo: self.user.pseudo
			});
			return this;
		};

		this.connect = function(){
			this.socket = io.connect('http://127.0.0.1:3000');
			return this;
		};

		this.socketEvents = function(){
			this.socket.on('chat_message', function(content){
				self.onChatMessage(content);
			});
			return this;
		};

		this.init = function(){
			this.connect().socketEvents().joinChat();
			return this;
		};


	}

	window.socket = new SocketIO();
});
