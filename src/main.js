chrome.runtime.onMessage.addListener(msgReceived); // Message listener
function msgReceived(message, sender, sendResponse){
	if(message.request === "status"){ // Check what the purpose of the message is.
		displayButton(message.status) // placeholder function
	}
	else{
		console.log("Unknown request")
	}
}

$(document).ready(function(){ 
	chrome.runtime.sendMessage({ // Send a request for the status of the contribution.
		request: "status"
	}) 
})

function displayButton(status){ //placeholder function
	//$('body').html(`<button>${status}</button>`)
	console.log(status)
}