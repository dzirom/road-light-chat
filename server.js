var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
var chat = require('chat');

var REQUEST_BODY_MAX_SIZE = 1000;

function sendFile(filePath, res) {
	var fileStream = fs.createReadStream(filePath);
	fileStream.pipe(res);
	fileStream.on('error', function() {
		res.statusCode = 500;
		res.end("Server error");
	})
	res.on('close', function() {
		fileStream.destroy();
	});
}

function handlePostRequest(req, res, handler) {
	var body = '';
	req.on('readable', function() {
		body += req.read();
		if (body.length > REQUEST_BODY_MAX_SIZE) {
			res.statusCode = 413;
			res.end('Your message is too big for my little chat');
		}
	}).on('end', function() {
		try {
			body = JSON.parse(body);
		} catch (e) {
			res.statusCode = 400;
			res.end("Bad request");
			return;
		}
		handler(body);
	});
	
}

http.createServer(function (req, res) {
	console.log('url: ' + req.url);
	switch(req.url) {
		case '/':
			sendFile('./client/index.html', res);
			break;
		case '/bg.jpg':
		case '/client.js':
			var filename = url.parse(req.url).pathname;
			sendFile('./client/' + filename, res);
			break;
		case '/subscribe':
			chat.subscribe(req, res);
			break;
		case '/chatinit':
			var result = null;
			try {
				result = JSON.stringify({ messages: chat.getMessages() });
			} catch (e) {
				console.log('error on chat initialization:' + e.name);
			}
			res.end(result);
			break;
		case '/enter':
			var now = new Date();
			handlePostRequest(req, res, function(body) {
				var result = null;
				if (body === Object(body) && body.hasOwnProperty('name')) {
					chat.enter(now.getTime(), body.name);
					result = '' + now.getTime();
				}
				res.end(result);
			});
			break;
		case '/publish':
			handlePostRequest(req, res, function(body) {
				chat.process(body.message, chat.senderType.user, body.sid, body.sname);
				res.end('ok');
			});
			break;
		default:
			res.statusCode = 404;
			res.end("Not found");
	}
}).listen(3000);

