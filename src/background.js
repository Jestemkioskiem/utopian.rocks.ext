chrome.runtime.onMessage.addListener(msgReceived); // Message listener
function msgReceived(message, sender, sendResponse){
	if(message.request === "status"){
		let msg = {
			request: "status",
			status: linkStatus(sender.url)
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
			else{
				result = data.status;
			}
		}
	})
	console.log(result)
	return result;
}
