function PongServer(webServer){
	var io = require('socket.io').listen(webServer, {log: true}),
		_ = require('underscore'),
		uuid = require('node-uuid'),
		allUsers = {},
		allRooms = {};

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
			id: uuid.v1(),
			socketID: socket.id,
			gameRoom: null,
			paddle: null
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
				me.gameRoom = args.room;
				me.paddle = 'right';
				announceMe(me);
				joinRoom(args.room, me);
				socket.emit('xValue', -1);
				setTimeout(function(){
					io.sockets.in(me.gameRoom).emit('readyToPlay');
				}, 500);
			} else if(inRoom.length === 0){
				socket.join(args.room);
				me.gameRoom = args.room;
				me.paddle = 'left';
				announceMe(me);
				registerInRoom(args.room, me);
				socket.emit('xValue', 1);
			} else{
				socket.emit('full_room');
			}
		});
		socket.on('readyToPlay', function(){
			me.readyToPlay = true;
			if(allRooms[me.gameRoom][definePaddle(me.paddle)].user.readyToPlay){
				io.sockets.in(me.gameRoom).emit('play');
			}
		});
		socket.on('updateLine', function(pos){
			socket.broadcast.to(me.gameRoom).emit('updateLine', pos);
		});
		socket.on('endGame', function(){
			if(!allRooms[me.gameRoom].gameInfos.ended){
				allRooms[me.gameRoom].gameInfos.ended;
				io.sockets.in(me.gameRoom).emit('end', me.pseudo);
			}
		});
		socket.on('playAgain', function(again){
			me.playAgain = again;
			var opponent = allRooms[me.gameRoom][definePaddle(me.paddle)].user;
			if(opponent.playAgain !== null && again){
				if(opponent.playAgain){
					io.sockets.in(me.gameRoom).emit('playAgain', {
						playAgain: true,
						gameInfos: allRooms[me.gameRoom].gameInfos
					});
				} else{
					io.sockets.in(me.gameRoom).emit('playAgain', {
						playAgain: false
					});
				}
				io.sockets.socket(opponent.socketID).leave(opponent.gameRoom);
				io.sockets.socket(me.socketID).leave(me.gameRoom);
				resetMe(opponent);
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
		Me.paddle = null;
	}
	function announceMe(Me){
		var ret = {
			pseudo: 'Server',
			message: Me.pseudo + ' has joined the room'
		};
		io.sockets.socket(Me.socketID).join(Me.gameRoom + '-chat');
		io.sockets.in(Me.gameRoom + '-chat').emit('chat_message', ret);
	}
	function registerInRoom(name, user){
		if(allRooms[name]){
			joinRoom(name, user);
			return;
		}
		allRooms[name] = {
			left: {
				score: 0,
				user: user
			},
			right:{
				score: 0,
				user: null
			},
			gameInfos: {
				started: false,
				ended: false,
				startedAt: null
			}
		};
	}
	function joinRoom(name, user){
		if(!allRooms[name]){
			registerInRoom(name, user);
			return;
		}
		allRooms[name].right.user = user;
	}
	function definePaddle(myPaddle){
		return myPaddle === 'right' ? 'left' : 'right';
	}
}

module.exports = PongServer;
