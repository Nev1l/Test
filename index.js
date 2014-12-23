var express = require('express')
var bodyParser = require('body-parser')
var fs = require('fs')
var app = express()
var postsPath = "json/news.json";
var imagesPath = "json/images.json";
 
app.use(express.static(__dirname + '/'))

app.use(bodyParser.json())

var Post = function(id, author, subject, text, date, category) {
	this.id = id;
	this.author = author;
	this.subject = subject;
	this.text = text;
	this.date = date;
	this.category = category;
};

var Image = function(title, alt, link) {
	this.title = title;
	this.alt = alt;
	this.link = link;
};

var getDate = function() {
	var text = fs.readFileSync(postsPath);
	var data = JSON.parse(text);
	var posts = [];
	//data.news.length
	for (var i = 0; i < data.length; i++) {
		//posts[i] = new Post(i,data.news[i].author, data.news[i].subject, data.news[i].text, data.news[i].date, data.news[i].category);
		posts[i] = new Post(data[i].id, data[i].author, data[i].subject, data[i].text, data[i].date, data[i].category);
	}
	return posts;
}
var getImages = function() {
	var links = fs.readFileSync(imagesPath);
	var data = JSON.parse(links);
	var images = [];
	for (var i = 0; i < data.images.length; i++) {
		images[i] = new Image(data.images[i].title, data.images[i].alt, data.images[i].link);
	}
	return images;
}
var getUniqueId = function(arr) {
	if (arr.length < 1) {
		return 0;
	}
	var max = arr[0].id;
	for (var i = 0; i < arr.length; i++) {
		if (max < arr[i].id) {
			max = arr[i].id;
		}
	}
	return max + 1;
}
var deletePost = function(posts, id) {
	var temp = [];
	for (var i = 0; i < posts.length; i++) {
		if (posts[i].id !== id) {
			temp.push(posts[i]);
		}
	}
	return temp;
}

app.route('/postDelete').delete(function(req, res) {
	var id = req.body.id;
	var posts = deletePost(getDate(), id);
	rewriteData(postsPath, posts);
	res.send(posts);
})
var rewriteData = function(postsPath, posts) {
	var status = "Operation compleate.";
	fs.writeFile(postsPath, JSON.stringify(posts), function(err) {
		if (err) {
			console.log(err);
			status = "Server error.";
		} else {
			console.log("The file was saved!");
		}
	});
	return status;
}

app.route('/posts').post(function(req, res) {
	res.send(getDate());
})

app.route('/images').post(function(req, res) {
	res.send(getImages());
})

app.route('/postAdd').post(function(req, res) {
	var posts = getDate();
	console.log(req.body);
	var id = getUniqueId(posts);
	console.log(id);
	var author = req.body.author;
	var subject = req.body.subject;
	var text = req.body.text;
	var date = req.body.date;
	var category = "Dota2";
	var post = new Post(id, author, subject, text, date, category);
	console.log(post);
	posts[posts.length] = post;
	rewriteData(postsPath, posts);
	res.send(posts);
})
var server = app.listen(3000, function() {
	console.log('Listening...')
})