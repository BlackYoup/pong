function PongServer(webServer){
	var io = require('socket.io').listen(webServer, {log: true}),
		_ = require('underscore'),
		uuid = require('node-uuid'),
		allUsers = {},
		allRooms = {},
		Pong = require('./pong.js'),
		Player = require('./player.js');

	Pong.init(io);

	io.configure(function(){
		io.set('transports', [ 'websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling', 'flashsocket' ]);
		io.enable('browser client minification');
		io.enable('browser client gzip');
		io.enable('match origin protocol');
		io.enable('browser client etag');
	});

	io.sockets.on('connection', function(socket){
		var me = new Player().init({
			socketID: socket.id,
			socket: socket
		});

		socket.on('chat_message', function(message){
			var content = {
				message: message,
				pseudo: me.pseudo
			};
			io.sockets.in(me.gameRoom + '-chat').emit('chat_message', content);
		});
		socket.on('chat_leave', function(){
			socket.broadcast.to(me.gameRoom + '-chat').emit('chat_leave', me.pseudo);
		});
		socket.on('joinGame', function(args){
			me.setPseudo(args.pseudo).joinRoom(args.room);
		});
		socket.on('readyToPlay', function(){
			me.readyToPlay();
		});
		socket.on('updateLine', function(status){
			me.updateLine(status);
		});
		socket.on('endGame', function(){
			me.endGame();
		});
		socket.on('playAgain', function(again){
			me.doPlayAgain(again);
		});
		socket.on('disconnect', function(){
			var ret = {
				pseudo: 'Server',
				message: me.pseudo + ' left the room'
			};
			socket.broadcast.to('chat').emit('chat_leave', ret);
		});
	});
}

module.exports = PongServer;
