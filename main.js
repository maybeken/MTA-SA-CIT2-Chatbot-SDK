'use strict';
/* Dependencies import */
const fs = require('fs');
const readLastLines = require('read-last-lines');

const robot = require("robotjs");

/* Configurations */
const filePath = 'C:/Program Files (x86)/MTA San Andreas 1.5/MTA/logs/'; // Log file folder
const fileName = 'console.log'; // Log file name
const filter = ['(TEAM)', '(LOC)', '(SMS)']; // Chat filter, enter the keywords you want to see

/* No need to configure */
const options = { persistent: true, interval: 1 };
const chatPrefix = ['(TEAM)', '(GROUP)', '(ALLIANCE)', '(LOC)', '(FMSG)', ' > Me: '];

/* Read chat from log file */
fs.watchFile(filePath+fileName, options, (curr, prev) => {
	readLastLines.read(filePath+fileName, 2)
	.then(
		(lines) => {
			let content = format(lines.replace(/(\r\n|\n|\r)/gm,""));
			
			/*	Do whatever you want with the content.
			
				content = {
					timestamp: The timestamp of the message in unix ms,
					channel: The channel of the message,
					player: The player who sent the message,
					message: The message of course
				}
			*/
			logChat(content);
		}
	);
});

/* Formate the chat to a json object */
function format(line){
	let channel = chatFilter(line, chatPrefix);
	let msg;
	let player;
			
	if(channel){
		if(channel == '(SMS)'){
			msg = line.substring(33).replace(/( > Me)/gm, "");
			player = msg.substring(0, msg.indexOf(': '));
			msg = msg.substring(player.length+2);
		}else{
			msg = line.substring(line.indexOf(': ', 33)+2);
			player = line.substring(33+channel.length+1);
			player = player.substring(0, player.length-msg.length-2);
			
			if(channel == '(LOC)'){
				player = player.substring(player.indexOf("]")+1);
			}
		}
	}else if(line.indexOf(' logged in') != -1 && line.indexOf('You successfully') == -1){
		channel = '(LOGIN)';
		player = line.substring(33, line.indexOf(' logged in'));
	}
	
	let content = {
		timestamp: Date.parse(line.substring(1, 20)),
		channel: channel,
		player: player,
		message: msg
	};
	
	return content;
}

/* Chat filter function */
function chatFilter(content, filter){
	var found = '';
	
	if(content){
		filter.forEach(function(e){
			if(content.indexOf(e) != -1 && found == ''){
				found = e;
			}
		});
	}
	
	if(found == ' > Me: ')
		found = '(SMS)';
	
	return found;
}

/* For display chat in CLI */
function logChat(content){
	if(content){
		if(chatFilter(content.channel, filter)){
			console.log(unixTime(content.timestamp) + ' ' + content.channel + ' ' + content.player + ': ' + content.message);
		}else if(content.channel){
			console.log(unixTime(content.timestamp) + ' ' + content.channel + ' ' + content.player);
		}
	}
}

/* Standard Unix Time conversion */
function unixTime(unixtime) {
	var u = new Date(unixtime);

	return u.getUTCFullYear() +
	'-' + ('0' + u.getUTCMonth()).slice(-2) +
	'-' + ('0' + u.getUTCDate()).slice(-2) + 
	' ' + ('0' + u.getUTCHours()).slice(-2) +
	':' + ('0' + u.getUTCMinutes()).slice(-2) +
	':' + ('0' + u.getUTCSeconds()).slice(-2)
};

/* Tell you that it's started */
console.log(unixTime(Date.now())+" Script started, waiting for chat log.");