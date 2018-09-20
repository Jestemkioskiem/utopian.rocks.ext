$.get('https://utopian.rocks/api/posts?status=pending', function(data, status){
	let top5 = data.slice(0,5)

	for(let item of top5){
		$('.contributions').append("<p>" + item.author + "</p>")
	}
})