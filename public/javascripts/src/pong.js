/** @jsx React.DOM */

function initUI(){

	var LoginForm = React.createClass({
		render: function(){
			return (
				<div id="login">
					<input type="text" id="username" />
					<input type="submit" id="submitAuth" />
	        	</div>
	        )
		}
	});

	var GlobalContainer = React.createClass({
		render: function(){
			return (
				<LoginForm />
			);
		}
	});

	React.renderComponent(<GlobalContainer />, document.body);
}

function initEvents(){
	$('#submitAuth').asEventStream('click').map(function(e){
		return $('#username').val();
	}).onValue(function(val){
		registerUser(val);
	});
}

function registerUser(val){
	console.log(val);
}

$(document).ready(function(){
	initUI();
	initEvents();
});