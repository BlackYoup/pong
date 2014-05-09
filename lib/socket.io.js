function PongServer(webServer){
	var io = require('socket.io').listen(webServer, {log: true});

	io.configure(function(){
		io.set('transports', [ 'websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling', 'flashsocket' ]);
		io.enable('browser client minification');
		io.enable('browser client gzip');
		io.enable('match origin protocol');
		io.enable('browser client etag');
	});

	io.sockets.on('connection', function(socket){
		var me = {
			pseudo: null
		};
		socket.on('join_chat', function(pseudo){
			me.pseudo = pseudo.pseudo;
			socket.join('chat');
			var ret = {
				pseudo: 'Server',
				message: me.pseudo + ' has joined the room'
			};
			io.sockets.in('chat').emit('chat_joined', ret);
		});
		socket.on('chat_message', function(message){
			var content = {
				message: message,
				pseudo: me.pseudo
			};
			io.sockets.in('chat').emit('chat_message', content);
		});
		socket.on('chat_leave', function(){
			socket.broadcast.to('chat').emit('chat_leave', me.pseudo);
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
