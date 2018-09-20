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
	let iconUrl;
	if(status === 'unreviewed'){
		console.log(status)
		iconUrl = chrome.extension.getURL("src/icons/icon16.png"); // AMOS REPLACE THIS WITH SVG I DONT KNOW HOW SVGS WORK
	}
	else if(status === 'pending'){
		console.log(status)
		iconUrl = chrome.extension.getURL("src/icons/icon16.png"); // AMOS REPLACE THIS WITH SVG I DONT KNOW HOW SVGS WORK
	}
	else if(status === 'rejected'){
		console.log(status)
		iconUrl = chrome.extension.getURL("src/icons/icon16.png"); // AMOS REPLACE THIS WITH SVG I DONT KNOW HOW SVGS WORK
	}
	else if(status === "voted"){
		console.log(status)
		iconUrl = chrome.extension.getURL("src/icons/icon16.png"); // AMOS REPLACE THIS WITH SVG I DONT KNOW HOW SVGS WORK
	}

	$('.TagList__horizontal').append(`<img src=${iconUrl}></img>`) 
	console.log(status)
}