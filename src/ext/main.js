var sc2_api = sc2.Initialize({ // Initialize SteemConnect
	app: 'utopian-ext.app',
	callbackURL: 'https://join.utopian.io/',
	scope: ['comment','comment_options','custom_json','vote']
});
window.auth_link = sc2_api.getLoginURL()

$(document).ready(function(){

    let interval = setInterval(function(){ // Ensures the extension always loads.
	  	if(window.location.href === "https://steemit.com/submit.html"){
	  		displayUtopianAids();
	  		clearInterval(interval);
	  	}
    }, 2000); // 2000 ms = start after 2sec 

	chrome.runtime.onMessage.addListener(msgReceived); // Message listener
		function msgReceived(message, sender, sendResponse){
			if(message.request === "status"){ // Information about the status of the post
				displayStatus(message)
			}
			else if(message.request === "broadcast"){ // Request to broadcast a post

				chrome.storage.local.get(function(result){
					submitPost(result.content, result.sc2_token)
				})
			}
			else{
				console.log("Unknown request")
			}
		}
	// Loads in additional CSS & HTML into the steemit DOM.
	$('head').append(`<link rel="stylesheet" type="text/css" href="${chrome.extension.getURL('src/ext/style.css')}">`)
	$('body').append(`<script type="text/javascript" src="${chrome.extension.getURL('src/third_party/jquery.js')}"></script>\
					  <script src="https://cdn.jsdelivr.net/npm/steemconnect@latest"></script>`)

	if(window.location.href.includes('?access_token=')){
		chrome.runtime.sendMessage({ // Sends the request to load the token to cache to the background script (security).
			request: "token"
		})
	}
	else{
		chrome.runtime.sendMessage({ // Send a request for the status of the contribution.
			request: "status"
		})
	}
})

function displayUtopianAids(){ // Adds all the HTML &.click() event listeners.

	$('.ReplyEditor__title').after('<p id="utopian-tags">\
	<strong>Select an Utopian-io category:<br></strong>\
	<butt id="analysis">analysis</butt>, <butt id="blog">blog</butt>, <butt id="bug-hunting">bug-hunting</butt>,\
	<butt id="copywriting">copywriting</butt>, <butt id="development">development</butt>,\
	<butt id="documentation">documentation</butt>, <butt id="graphics">graphics</butt>, <butt id="ideas">ideas</butt>,\
	<butt id="social">social</butt>, <butt id="translations">translations</butt>, <butt id="tutorials">tutorials</butt>,\
	<butt id="video-tutorials">video-tutorials</butt>, <butt id="task-requests">task-requests</butt>;</p>')
	
	$('#utopian-tags').after('<a href="https://utopian.io/guidelines/" id="utopian-guidelines">Utopian Guidelines</a>')

	$('body').append('<div id="templateOverwriteModal" class="modal"><div class="modal-content">\
		<p>You\'re about to overwrite your changes with an Utopian Template.<br> Are you sure you want to continue?</p>\
		<butt id="templateOverwriteYes">Yes</butt> <butt id="templateOverwriteNo">No</butt>')

	$('body').append('<div id="steemConnectModal" class="modal"><div class="modal-content">\
		<p>You\'re about to leave this page to sing in with SteemConnect.<br>\
		Your draft will be saved by steemit.com and your post will be published by Utopian.<br><br>Are you sure you want to continue?</p>\
		<butt id="scModalYes">Yes</butt> <butt id="scModalNo">No</butt>')

	$('#analysis, #blog, #bug-hunting, #copywriting, #development, #documentation, #graphics, #ideas, #social, #translations, \
   	   #tutorials, #video-tutorials, #task-requests').click(function(){
	   	loadTemplateModal(this.textContent);
   	})
    
    $('button[tabindex="4"]').after('<butt class="utopian-button" id="utopian-submit"><span title="Post with Utopian">\
       <strong>Post with Utopian</strong></span></butt>')

    $('#utopian-submit').click(function(){
    	loadScModal();
    })
}

function loadTemplateModal(category){ // Loads in a template override pop-up modal
	if($('.dropzone textarea')[0].value === ""){
		forceTemplateHTML();
	}
	else{
		let modal = $('#templateOverwriteModal');
		modal.show()

		// Actions based on which button is pressed (Yes/No)
		$('#templateOverwriteNo').click(function(){
			modal.hide();
		})
		$('#templateOverwriteYes').click(function(){ 
			modal.hide();
			forceTemplateHTML();
		})

	}

	function forceTemplateHTML(){ // Replaces the tags & body with template's
		$.get(chrome.extension.getURL(`src/third_party/templates/${category}`), function(data){
			$('.dropzone textarea')[0].value = data;
			$('input[name=category]')[0].value = `utopian-io ${category}`
		})
	}
}

function loadScModal(){ // Loads in a SC warning pop-up modal
	let modal = $('#steemConnectModal');
	modal.show()

	// Actions based on which button is pressed (Yes/No)
	$('#scModalNo').click(function(){
		modal.hide();
	})

	$('#scModalYes').click(function(){
		if(gatherPostContent()){
			window.location.href = window.auth_link
		}
		else(
			alert("Your Title, Body or Tags are empty!")
		)

		chrome.storage.local.set({content : gatherPostContent()}) // Stores the post content in browser cache
	})
}

function gatherPostContent(){ // Returns contents of the post necessary for broadcast
	let post = {
		title: $('.ReplyEditor__title')[0].value,
		body: $('.dropzone textarea')[0].value,
		tags: $('input[name=category]')[0].value
		//tip: 

	}

	if(post.body === "" || !post.tags === "" || post.title === ""){
		return false; // Returns false if the post can't be broadcasted due to missing values
	}
	else{
		return post;
	}
}

function displayStatus(message){ // Displays the status of the post using steemrocks' API
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

function submitPost(content, token){
	sc2_api.setAccessToken(token)
	chrome.storage.local.clear() // Remove post content & token from storage (safety purposes)

	sc2_api.me(function (err, user) { // Set up & broadcast the comment
  		let permlink = content.title.toLowerCase()
		.replace(/ /g,'-')
    	.replace(/[^\w-]+/g,'');
	    let tags = content.tags.split(' ')
	    let title = content.title;
	    let body = content.body;
	    let sbd_percent = 10000;
	    let maximumAcceptedPayout = '100000.000 SBD';
	   
	    let beneficiaries = []
	    if(tags[1] === 'translations'){ // Checks if the category is Translations
	    	beneficiaries.push({
	    		account:'utopian.pay',
	    		weight: 100*5
			})
	    	beneficiaries.push({
	    		account:'davinci.pay',
	    		weight: 100*10
			})
	    }
	    else{
	    	beneficiaries.push({
	    		account:'utopian.pay',
	    		weight: 100*5
			})
	    }


		let operations = [ // Set up the comment
			['comment',
	      	{
		        parent_author: '',  
		        parent_permlink: tags[0],
		        author: user.name,
		        permlink: permlink,
		        title: title,
		        body: body,
		        json_metadata : JSON.stringify({
		          tags: tags,
		          app: 'utopian-ext.app'
		        })
	      	}
	      	],
		    ['comment_options', {
		        author: user.name,
		        permlink: permlink,
		        max_accepted_payout: maximumAcceptedPayout,
		        percent_steem_dollars: parseInt(sbd_percent),
		        allow_votes: true,
		        allow_curation_rewards: true,
		        extensions: [[0, {beneficiaries: beneficiaries}]]
		    }]
		];

		sc2_api.broadcast(operations, function(err, res){ // Broadcast the transaction
			console.log(err, res)
			if(err){
				alert("There was issue with submitting your contribution:\n\
					  Your post needs an unique title you haven't used before.")
			}
			window.location = "https://steemit.com/@"+user.name+"/"+permlink // Redirect user to his post
		})

	});
}
