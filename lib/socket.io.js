function PongServer(webServer){
	var io = require('socket.io').listen(webServer, {log: true}),
		_ = require('underscore'),
		uuid = require('node-uuid'),
		allUsers = {};

	io.configure(function(){
		io.set('transports', [ 'websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling', 'flashsocket' ]);
		io.enable('browser client minification');
		io.enable('browser client gzip');
		io.enable('match origin protocol');
		io.enable('browser client etag');
	});

	io.sockets.on('connection', function(socket){
		var me = {
			pseudo: null,
			readyToPlay: false,
			ennemy: null,
			id: uuid.v1(),
			socketID: socket.id,
			gameRoom: null,
			gameEnded: false,
			playAgain: null
		};
		allUsers[me.id] = me;
		socket.on('chat_message', function(message){
			var content = {
				message: message,
				pseudo: me.pseudo
			};
			io.sockets.in(me.gameRoom + '-chat').emit('chat_message', content);
		});
		socket.on('chat_leave', function(){
			socket.broadcast.to('chat').emit('chat_leave', me.pseudo);
		});
		socket.on('joinGame', function(args){
			me.pseudo = args.pseudo;
			var opponent = null;
			var inRoom = io.sockets.clients(args.room);
			if(inRoom.length === 1){
				socket.join(args.room);
				socket.broadcast.to(args.room).emit('gameJoined', me.id);
				me.gameRoom = args.room;
				announceMe(me);
				socket.emit('xValue', -1);
			} else if(inRoom.length === 0){
				socket.join(args.room);
				me.gameRoom = args.room;
				announceMe(me);
				socket.emit('xValue', 1);
			} else{
				socket.emit('full_room');
			}
		});
		socket.on('meetOther', function(id){
			me.ennemy = allUsers[id];
			allUsers[id].ennemy = me;
			io.sockets.in(me.gameRoom).emit('readyToPlay');
		});
		socket.on('readyToPlay', function(){
			me.readyToPlay = true;
			if(me.ennemy.readyToPlay){
				io.sockets.in(me.gameRoom).emit('play');
			}
		});
		socket.on('updateLine', function(pos){
			socket.broadcast.to(me.gameRoom).emit('updateLine', pos);
		});
		socket.on('endGame', function(looserID){
			me.gameEnded = true;
			if(!me.ennemy.gameEnded){
				io.sockets.in(me.gameRoom).emit('looseris', allUsers[looserID || me.id].pseudo);
			}
		});
		socket.on('playAgain', function(again){
			me.playAgain = again;
			if(me.ennemy.playAgain !== null && again){
				if(me.ennemy.playAgain){
					io.sockets.in(me.gameRoom).emit('playAgain', true);
				} else{
					io.sockets.in(me.gameRoom).emit('playAgain', false);
				}
				io.sockets.socket(me.ennemy.socketID).leave(me.ennemy.gameRoom);
				io.sockets.socket(me.socketID).leave(me.gameRoom);
				resetMe(me.ennemy);
				resetMe(me);
			}

		});
		socket.on('disconnect', function(){
			var ret = {
				pseudo: 'Server',
				message: me.pseudo + ' left the room'
			};
			socket.broadcast.to('chat').emit('chat_leave', ret);
		});
	});
	function resetMe(Me){
		Me.readyToPlay = false;
		Me.gameRoom = null;
		Me.gameEnded = false;
		Me.playAgain = null;
	}
	function announceMe(Me){
		var ret = {
			pseudo: 'Server',
			message: Me.pseudo + ' has joined the room'
		};
		io.sockets.socket(Me.socketID).join(Me.gameRoom + '-chat');
		io.sockets.in(Me.gameRoom + '-chat').emit('chat_message', ret);
	}
}

module.exports = PongServer;
