chrome.runtime.onMessage.addListener(msgReceived); // Message listener
function msgReceived(message, sender, sendResponse){
	if(message.request === "status"){
		let msg = {
			request: "status",
			status: linkStatus(sender.url),
			position: linkPosition(sender.url),
			moderator: linkModerator(sender.url),
			url: sender.url
		}
		chrome.tabs.sendMessage(sender.tab.id, msg)
	}
	else{
		console.log('Unknown request');
	}
}


function linkStatus(url){ // Check the status of the contribution and return it.
	let result;
	$.ajax({
		url: `https://utopian.rocks/api/posts?url=${url}`,
		type: 'GET',
		async: false,
		success: function(data){
			data = data[0];
			if(data.voted_on === true){
				result = "voted";
			}
			else if(data.status === "reviewed" && data.voted_on === false){
				result = "rejected";
			}
			else if(data.status === "unreviewed" && data.moderator){
				result = "underreview";
			}
			else{
				result = data.status;
			}
		}
	})
	return result;
}

function linkPosition(url){
	let result;
	$.ajax({
		url: `https://utopian.rocks/api/posts?status=pending`,
		type: 'GET',
		async: false,
		success: function(data){
			let counter = 0
			for(let i of data){
				counter++;
				if(i.url === url){
					result = counter; 
					break;
				}
			}
		}
	})
	return result;
}

function linkModerator(url){
	let result;
	$.ajax({
		url: `https://utopian.rocks/api/posts?url=${url}`,
		type: 'GET',
		async: false,
		success: function(data){
			result = data[0].moderator
		}
	})
	return result;
}