/** @jsx React.DOM */

function initChat(){
	var Chat = new chatUI().init(),
		inputMessage = $('#messageText');

	inputMessage.asEventStream('keyup').filter(function(e){
		return e.keyCode === 13;
	}).merge($('#sendMessage').asEventStream('click')).map(function(){
		return inputMessage.val().trim();
	}).filter(function(message){
		return message.length > 0;
	}).onValue(function(message){
		socket.emit(message);
		inputMessage.val('');
	});

	socket.onChatMessage = function(message){
		Chat.newMessage(message.pseudo, message.message);
	};
}

function chatUI(){
	var self = this;
	this.Chat = null;
	this.ChatMessage = null;

	this.createReactClasses = function(){
		this.Chat = React.createClass({
			getInitialState: function(){
				return { messages: [] };
			},
			componentDidMount: function(){
				var component = this;
				self.newMessage = function(pseudo, message){
					var allMessages = component.state.messages.concat({
						content: message,
						pseudo: pseudo
					});
					component.setState({
						messages: allMessages
					});
				};
			},
			render: function(){
				var ChatMessage = self.ChatMessage;
				return (
					<div>
						<ChatMessage messages={this.state.messages} />
						<div id="chatWrite">
							<input type="text" id="messageText" /><input type="button" value="Send" id="sendMessage"/>
						</div>
					</div>
				)
			}
		});
		this.ChatMessage = React.createClass({
			displayMessages: function(message){
				return(
					<div className="chatItem">
						<div className="messagePseudo">
						<span className="messagePseudo__pseudo">
							{message.pseudo}
						</span> {":"}
						</div>
						<div className="messageContent">
							{message.content}
						</div>
					</div>
				);
			},
			render: function(){
				return (
					<div className="messageContainer">
						{ this.props.messages.map(this.displayMessages) }
					</div>
				);
			}
		});
		return this;
	};

	this.initReact = function(){
		var Chat = this.Chat;
		React.renderComponent(<Chat />, document.getElementById('chat'));
		return this;
	};

	this.init = function(){
		return this.createReactClasses().initReact();
	};
}
