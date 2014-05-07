module.exports = function(app){
	app
	.get('/', index)
	.get('/index', index);

	/// catch 404 and forwarding to error handler
	app.use(function(req, res, next) {
	    var err = new Error('Not Found');
	    err.status = 404;
	    next(err);
	});

	/// error handlers

	// development error handler
	// will print stacktrace
	if (app.get('env') === 'development') {
	    app.use(function(err, req, res, next) {
	        res.render('error', {
	            message: err.message,
	            error: err
	        });
	    });
	}

	// production error handler
	// no stacktraces leaked to user
	app.use(function(err, req, res, next) {
	    res.render('error', {
	        message: err.message,
	        error: {}
	    });
	});
};

function index(req, res){
	res.render('index.ejs');
}