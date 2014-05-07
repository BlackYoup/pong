var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(app.router);
app.use(lessMiddleware({
    src: __dirname + '/public/css/less',
    dest: __dirname + '/public/css/',
    prefix: '/css',
    compress: false,
    debug: true
}));
app.use(express.static(path.join(__dirname, 'public')));

require('./routes/router.js')(app);
require('./lib/debug.js');

app.set('port', process.env.PORT || 3000);

var webServer = app.listen(app.get('port'), function() {
    __debug('Express server listening on port ' + webServer.address().port);
});

require('./lib/socket.io.js')(webServer);
