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
	let iconUrl = chrome.extension.getURL("src/icons/icon16.png"); // Need SVG for this to work.

	if(status === 'unreviewed'){
		$("#status-icon").css("color: grey")
	}
	else if(status === 'pending'){
		$("#status-icon").css("color: orange")
	}
	else if(status === 'rejected'){
		$("#status-icon").css("color: red")
	}
	else if(status === "voted"){
		$("#status-icon").css("color: green")
	}

	$('.TagList__horizontal').prepend(`<img id="status-icon" src="${iconUrl}></img>"`) 
	console.log(status)
}