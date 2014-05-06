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
		// events
	});
}

module.exports = PongServer;