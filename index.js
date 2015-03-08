var CLC = CLC || {};

var http = require('http');
var cheerio = require('cheerio');

CLC.HttpRequest = {
	
	url: "http://washingtondc.craigslist.org/search/vga",
	statusCode: '',
	
	perform: function() {
		http
			.get(this.url, this.handleHttpResponse)
			.on('error', this.handleHttpError);
	},

	handleHttpResponse: function(response) {
		this.statusCode = response.statusCode;
		response.setEncoding('utf8');
		var rawMarkup;
		response.on('data', function(chunk) {
			rawMarkup += chunk;
		});
		response.on('end', function() {
			var posts = [];
			$ = cheerio.load(rawMarkup);
			var postingsContainer = $('body div.middle form#searchform div.rightpane div.content p.row');
			postingsContainer.each(function(i, elem) {
				posts.push(new CLC.Post({
					'title': $('span.txt span.pl a', this).text(),
					'time': $('span.txt span.pl time', this).attr('datetime'),
					'uri': $('span.txt span.pl a', this).attr('href'),
					'id': Number($('span.txt span.pl a', this).attr('data-id')) || false,
					'repostOf': Number($('span.txt span.pl a', this).attr('data-repost-of')) || false,
					'price': $('span.txt span.l2 span.price', this).text(),
					'location': $('span.txt span.l2 span.pnr small', this).text()
				}));
			});
			console.log(posts);
		});
	},

	handleHttpError: function(error) {
		console.log('Got error: ' + error.message);
	}

}

CLC.Post = function(postData) {

	// map submitted object to class vars
	for (var key in postData) {
		this[key] = postData[key];
	}

}

CLC.HttpRequest.perform();
