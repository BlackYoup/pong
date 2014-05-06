module.exports = function(app){
	app
	.get('/', index)
	.get('/index', index);
};

function index(req, res){
	res.render('index.ejs');
}