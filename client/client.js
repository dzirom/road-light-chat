/**
 * Chat uses long-polling algorithm
 */
var senderId = null;
var senderName = null;

var publish = document.getElementById("publish");

publish.onsubmit = function() {
	if (senderId) {
		var messageValue = this.elements.message.value;
		var json = JSON.stringify({ sid: senderId, sname: senderName, message: messageValue });
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "/publish", true);
		xhr.send(json);		
		this.elements.message.value = "";
	}
	return false;
};

var enter = document.getElementById("enter");

enter.onsubmit = function() {
	var username = this.elements.username.value;
	if (username && username.length) {
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "/enter", true);
		var json = JSON.stringify({ name: username });
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		xhr.onreadystatechange = function() {
		    if(xhr.readyState == 4 && xhr.status == 200) {
		    	var sid = parseInt(xhr.responseText);
		        if (sid) {
		        	senderName = username;
		        	senderId = sid;		
		        	enter.elements.username.disabled = true;
		        	publish.elements.message.disabled = false;
		        	publish.elements.submit.disabled = false;
		        	publish.elements.message.focus();
		    	}
		    }
		}
		xhr.send(json);		
	}
	return false;
};

function addMessageToChat(sender, text) {
	var tr = document.createElement("tr");
	var td1 = document.createElement("td");
	var span1 = document.createElement("span");
	span1.textContent = sender + ':';
	td1.appendChild(span1);
	tr.appendChild(td1);
	var td2 = document.createElement("td");
	var span2 = document.createElement("span");
	span2.textContent = text;
	td2.appendChild(span2);
	tr.appendChild(td2);
	messages.insertBefore(tr, messages.firstChild);
}

function subscribe() {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "/subscribe", true);
	xhr.onload = function() {
		var result = JSON.parse(xhr.responseText);
		addMessageToChat(result.sender, result.text);
		subscribe();
	};
	xhr.onerror = xhr.onabort = function() {
		setTimeout(subscribe, 500);
	};
	xhr.send(null);
}

function chatinit() {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "/chatinit", true);
	xhr.onreadystatechange = function() {
	    if(xhr.readyState == 4 && xhr.status == 200) {
			var result = JSON.parse(xhr.responseText);
			var msgs = result.messages; 
			for (var i = 0; i < msgs.length; i++) {
				addMessageToChat(msgs[i].sender, msgs[i].text);
			}
	    }
	}
	xhr.send(null);
}

subscribe();
chatinit();

var username = document.getElementById("username");
username.focus();