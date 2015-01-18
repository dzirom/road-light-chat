var ElizaBot = require('elizabot');
var Ector = require('ector');

var MESSEGES_NUMBER = 10;
var clients = [];

var isWaitingMessage = false; 
var lastMessage = null;
var lastSenderId = null;
var messages = [];
var senderType = {
	user: 0,
	bot: 1
};
var bots = [];
bots.push({
	id: new Date().getTime(),
	name: 'emma',
	inital: null,
	eliza: new ElizaBot(),
	init: function() {
		this.eliza = new ElizaBot();
		this.eliza.memSize = 10000;
		this.initial = this.eliza.getInitial();
	},
	reply: function(text) {
		return this.eliza.transform(text);
	}
});
bots.push({
	id: new Date().getTime(),
	name: 'roy',
	ector: new Ector(),
	init: function() {},
	reply: function(text) {
		this.ector.addEntry(text);
		return this.ector.generateResponse().sentence;
	}
});
bots[0].init();
bots[1].init();

processMessage(bots[0].initial, senderType.bot, bots[0].id, bots[0].name);

function processMessage(message, stype, sid, sname) {
	lastMessage = message;
	initAutoMessage(sid, message);
	publishMessage(sname, message);
};

function getBotIndex(sid) {
	var bindex = 0;
	if (sid == bots[0].id) {
		bindex = 1;
	} else if (sid == bots[1].id) {
		bindex = 0;
	} else {
		bindex = Math.floor((Math.random() * 2) + 1) - 1;
	}
	return bindex;
}

function isBotIndex(sid) {
	return bots[0].id == sid || bots[0].id == sid;
}

function initAutoMessage(sid, message) {
	setTimeout(function() {
		if (lastMessage == message) {
			var bindex = getBotIndex(sid);
			processMessage(
				bots[bindex].reply(message), 
				senderType.bot, 
				bots[bindex].id, 
				bots[bindex].name
			);
		} else {
			console.log('auto messages was canceled: ' + message);
		}
	}, 10000);
};

function publishMessage(sender, text) {
	console.log('publish \'%s\'', text);
	var item = { sender: sender, text: text }
	var responseText = JSON.stringify(item);
	if (messages.length > MESSEGES_NUMBER) {
		messages.shift();
	}
	messages.push(item);	
	clients.forEach(function(res) {
		res.end(responseText);
	});	
	clients = [];
};
	


exports.subscribe = function(req, res) {
	console.log('subscribe');
	clients.push(res);
	res.on('close', function() {
		clients.splice(clients.indexOf(res), 1);
	});
};

exports.enter = function(senderId, senderName) {
	console.log('enter: ' + senderId + ' ' + senderName);	
}

exports.publish = publishMessage; 

exports.process = processMessage;

exports.getMessages = function() { return messages };

exports.senderType = senderType;