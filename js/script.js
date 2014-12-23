var postsList = [];
var activeBlockId = "home";
var sortAscending = false;
var filterValue = "";
var filterIndex = 0;
var postsOnPage = 3;
var pageTextPrefix = "home";
var curPage = 1;
var imageList = [];

var deletePost = function(n) {
	var body = {
		id : +n
	};
	$.ajax('/postDelete', {
		contentType : 'application/json',
		type : 'delete',
		data : JSON.stringify(body)
	}).always(function(data) {
		alert("Operation is compleated");
		postsList = data;
		sortPosts(postsList, sortAscending);
		showPosts(sortAscending);
	})
}
var buttonSendForm = function() {
	var body = {
		author : $('#author').val(),
		subject : $('#subject').val(),
		text : $('#text').val(),
		date : currentDate()
	};
	$('#author').val('');
	$('#subject').val('');
	$('#text').val('');

	$.ajax('/postAdd', {
		contentType : 'application/json',
		type : 'POST',
		data : JSON.stringify(body)
	}).always(function(data) {
		alert("Operation is compleated");
		postsList = data;
		sortPosts(postsList, sortAscending);
		showPosts(sortAscending);
	})
}
$(function() {
	$.ajax('/posts', {
		type : 'post'
	}).always(function(data) {
		postsList = data;
		sortPosts(postsList, sortAscending);
		showPosts(sortAscending);
	})
	$.ajax('/images', {
		type : 'post'
	}).always(function(data) {
		imageList = data;
		loadImages();
	})
});

var loadPosts = function(posts) {
	$('#light-pagination').pagination({
		items : posts.length, // Total number of items that will be used to calculate the pages.
		itemsOnPage : postsOnPage, // Number of items displayed on each page.
		displayedPages : 3, // How many page numbers should be visible while navigating. Minimum allowed: 3 (previous, current & next)
		edges : 2, // How many page numbers are visible at the beginning/ending of the pagination.
		currentPage : curPage, // Which page will be selected immediately after init.
		hrefTextPrefix : '#' + pageTextPrefix, // A string used to build the href attribute, added before the page number.
		//hrefTextSuffix : '', // Another string used to build the href attribute, added after the page number.
		prevText : "Prev", // Text to be display on the previous button.
		nextText : "Next", // Text to be display on the next button.
		cssStyle : "light-theme", // The class of the CSS theme.
		selectOnClick : true, // Set to false if you don't want to select the page immediately after click.
		onPageClick : function(pageNumber, event) {
			curPage = pageNumber;
			loadPageBlock(posts);
		}
	});
	loadPageBlock(posts);
};

var loadImages = function() {
	var element = document.getElementById("links");
	var template = $('#images-template').html();
	$(element).html(Mustache.render(template, imageList));
};

var getBlock = function(posts, page) {
	var start = (page - 1) * postsOnPage;
	var end = Math.min((start + postsOnPage), posts.length);
	return posts.slice(start, end);
};

var loadPageBlock = function(posts) {
	var element = document.getElementById("main_container");
	var template = $('#template').html();
	$(element).html(Mustache.render(template, getBlock(posts, curPage)));
};

//public
var showPosts = function(f) {
	loadPosts(filterPosts(sorting(postsList, f)));
};

var sorting = function(posts, f) {
	if (f !== sortAscending) {
		sortAscending = f;
		postsList.reverse();
	}
	return posts;
};

var searchPosts = function() {
	if (document.getElementById("search_field").type == "text") {
		filterValue = document.getElementById("search_field").value;
	} else {
		filterValue = document.getElementById("search_date").value;
	}
	filterIndex = document.getElementById("select").selectedIndex;
	openBlock('home');
	showPosts(sortAscending);
};

var filterPosts = function(postsList) {
	var k = 0;
	var postsListCoppy = [];
	if (filterValue == "") {
		postsListCoppy = postsList.slice();
	} else {
		for (var i = 0; i < postsList.length; i++) {
			if (hasMatch(postsList[i])) {
				postsListCoppy[k++] = postsList.slice(i)[0];
			}
		}
		if (postsListCoppy.length == 0) {
			var search = {"author":"Search system", "subject":"Searh", "text":"No results", "date":currentDate()}
			postsListCoppy.push(search);
		}
	}
	return postsListCoppy;
};

var hasMatch = function(post) {
	if (filterIndex == 0) {
		return post.author.toLowerCase().search(filterValue.toLowerCase()) != -1;
	} else if (filterIndex == 1) {
		return post.subject.toLowerCase().search(filterValue.toLowerCase()) != -1;
	} else {
		var temp = filterValue.split(' - ');
		if (temp.length < 2)
			return false;
		var min = new Date(temp[0]+" 00:00");
		var max = new Date(temp[1]+" 23:59");	
		var param = new Date(post.date);
		console.log(min);
		console.log(max);
		console.log();
		return param >= min && param <= max;
	}
};

var currentDate = function() {
	var d = new Date();
	var curr_date = check(d.getDate());
	var curr_month = check(d.getMonth() + 1);
	var curr_year = d.getFullYear();
	var cur_hour = check(d.getHours());
	var cur_min = check(d.getMinutes());
	var cur_ms = check(d.getMilliseconds());
	return curr_year + "-" + curr_month + "-" + curr_date + " " + cur_hour + ":" + cur_min;
	//+":"+cur_ms
};

var check = function(n) {
	return ((n + "").length < 2) ? "0" + n : n;
};

var Post = function(id, author, subject, text, date, category) {
	this.id = id;
	this.author = author;
	this.subject = subject;
	this.text = text;
	this.date = date;
	this.category = category;
};

var sortPosts = function(list, f) {
	sortAscending = f;
	list.sort(function(a, b) {
		var first = new Date(a.date);
		var second = new Date(b.date);
		var result = 0;
		if (first < second)
			result = -1;
		if (first > second)
			result = 1;
		return sortAscending ? result : result * -1;
	});
	return list;
};

var openBlock = function(id) {
	document.getElementById(activeBlockId).style.display = "none";
	document.getElementById(id).style.display = "block";
	activeBlockId = id;
};

var Image = function(title, alt, link) {
	this.title = title;
	this.alt = alt;
	this.link = link;
};

//'YYYY-MM-DD'
$(function() {
	$('#search_date').daterangepicker({
		format : 'YYYY-MM-DD',
	});
});

$("#select").change(function() {
	var field1 = document.getElementById('search_field');
	var field2 = document.getElementById('search_date');
	field1.type = "text";
	field2.type = "hidden";
	if (isDateSearch()) {
		field1.type = "hidden";
		field2.type = "text";
	}
	//field1.value = "";
	field2.value = "";
});

var isDateSearch = function() {
	var index = document.getElementById("select").selectedIndex;
	var options = document.getElementById("select").options;
	return options[index].text == "Date";
};

$(function() {
	$('#rotate180').rotate(180);
	if ($('.nav>ul>li').hasClass('selected')) {
		$('.selected').addClass('active');
		var currentleft = $('.selected').position().left + "px";
		var currentwidth = $('.selected').css('width');
		$('.lamp').css({
			"left" : currentleft,
			"width" : currentwidth
		});
	} else {
		$('.nav>ul>li').first().addClass('active');
		var currentleft = $('.active').position().left + "px";
		var currentwidth = $('.active').css('width');
		$('.lamp').css({
			"left" : currentleft,
			"width" : currentwidth
		});
	}
	$('.nav>ul>li').hover(function() {
		$('.nav ul li').removeClass('active');
		$(this).addClass('active');
		var currentleft = $('.active').position().left + "px";
		var currentwidth = $('.active').css('width');
		$('.lamp').css({
			"left" : currentleft,
			"width" : currentwidth
		});
	}, function() {
		if ($('.nav>ul>li').hasClass('selected')) {
			$('.selected').addClass('active');
			var currentleft = $('.selected').position().left + "px";
			var currentwidth = $('.selected').css('width');
			$('.lamp').css({
				"left" : currentleft,
				"width" : currentwidth
			});
		} else {
			$('.nav>ul>li').first().addClass('active');
			var currentleft = $('.active').position().left + "px";
			var currentwidth = $('.active').css('width');
			$('.lamp').css({
				"left" : currentleft,
				"width" : currentwidth
			});
		}
	});
});

