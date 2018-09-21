chrome.runtime.onMessage.addListener(msgReceived); // Message listener
function msgReceived(message, sender, sendResponse){
	if(message.request === "status"){ // Check what the purpose of the message is.
		displayStatus(message) // placeholder function
	}
	if(message.url === "https://steemit.com/submit.html"){
		displayUtopianTags(message.url)
	}
	else{
		console.log("Unknown request")
	}
}

$(document).ready(function(){ 
	$('head').append(`<link rel="stylesheet" type="text/css" href="${chrome.extension.getURL('src/style.css')}">`)
	$('body').append(`<script type="text/javascript" src="${chrome.extension.getURL('src/third_party/jquery.js')}"></script>`)
	chrome.runtime.sendMessage({ // Send a request for the status of the contribution.
		request: "status"
	})
})

function displayUtopianTags(url){
	$('.ReplyEditor__body').after('<p id="utopian-tags">\
	<strong>Select an Utopian-io category:</strong>\
	<button id="analysis">analysis</button>, <button id="blog">blog</button>, <button id="bug-hunting">bug-hunting</button>,\
	<button id="copywriting">copywriting</button>, <button id="development">development</button>,\
	<button id="documentation">documentation</button>, <button id="graphics">graphics</button>, <button id="ideas">ideas</button>,\
	<button id="social">social</button>, <button id="translations">translations</button>, <button id="tutorials">tutorials</button>,\
	<button id="video-tutorials">video-tutorials</button>, <button id="task-requests">task-requests</button>;</p>')
	
	$('#utopian-tags').after('<a href="https://utopian.io/guidelines/">Utopian Guidelines</a>')

	$('body').append('<div id="templateOverwriteModal" class="modal"><div class="modal-content">\
		<p>You\'re about to overwrite your changes with an Utopian Template.<br> Are you sure you want to continue?</p>\
		<button id="templateOverwriteYes">Yes</button> <button id="templateOverwriteNo">No</button>')

	$('#analysis, #blog, #bug-hunting, #copywriting, #development, #documentation, #graphics, #ideas, #social, #translations, \
   	   #tutorials, #video-tutorials, #task-requests').click(function(){
   	   	console.log(this.textContent);
	   	loadSelectedCategory(this.textContent);
   })
}

function loadSelectedCategory(category){
	if($('.dropzone textarea')[0].value === ""){
		forceHTML();
	}
	else{
		let modal = $('#templateOverwriteModal');
		modal.show()

		$('#templateOverwriteNo').click(function(){
			modal.hide();
		})
		$('#templateOverwriteYes').click(function(){
			modal.hide();
			forceHTML();
		})

	}

	function forceHTML(){
		$.get(chrome.extension.getURL(`src/third_party/templates/${category}`), function(data){
			$('.dropzone textarea')[0].value = data;
			$('input[name=category]')[0].value = `utopian-io ${category}`
		})
	}
}

function displayStatus(message){ //placeholder function
	console.log(message)
	if(message.status !== undefined){

		$('.PostFull__footer').prepend('<div class="utopian-rocks"></div>')
		$('.utopian-rocks').append('<a target="_blank" href="https://utopian.rocks/queue" id="utopian-rocks-btn"></a>')

		let iconUrl = chrome.extension.getURL(`src/icons/${message.status}-icon.png`); // Need SVG for this to work.
		$('#utopian-rocks-btn').prepend(`<img src="${iconUrl}" title="Status: ${message.status}" id="status-icon"></img>`)

		if(message.status === "pending"){
			$('#utopian-rocks-btn').after(`<p id="status-message">Position in the Voting Queue: <strong>${message.position}</strong>.</p>`)
		}
		else if(message.status === "voted"){
			$('#utopian-rocks-btn').after(`<p id="status-message">This post has been Upvoted!</p>`)
		}
		else if(message.status === "unreviewed"){
				$('#utopian-rocks-btn').after(`<p id="position">This post is awaiting a review.</p>`)
		}
		else if(message.status === "rejected"){
			$('#utopian-rocks-btn').after(`<p id="position">This post has received a score of 0.</p>`)
		}
		else if(message.status === "underreview"){
			$('#utopian-rocks-btn').after(`<p id="position">This post is under a review by <strong>${message.moderator}</strong>.</p>`)
		}
	}	
}