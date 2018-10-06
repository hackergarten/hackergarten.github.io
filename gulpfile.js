var gulp = require('gulp');

var jsonlint = require("gulp-jsonlint");
var transform = require('gulp-transform');
var rename = require('gulp-rename');

var hashCode = function (str) {
	var hash = 0;
	if (str.length === 0) return hash;
	for (var i = 0; i < str.length; i++) {
		var char = str.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return Math.abs(hash);
};

var entityMap = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': '&quot;',
	"'": '&#39;',
	"/": '&#x2F;'
};

function escapeHTML(string) {
	return String(string).replace(/[&<>"'\/]/g, function (s) {
		return entityMap[s];
	});
}

gulp.task('default', function() {

	gulp.src("./events.json")
	    .pipe(jsonlint())
		.pipe(jsonlint.failOnError())
	    .pipe(jsonlint.reporter())
		.pipe(transform(function(contents) {
			var today = new Date();
			today = new Date(today.setHours(0, 0, 0));
			var events = JSON.parse(contents);
			var xml = [];
			xml.push("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
			xml.push("<rss version=\"2.0\">");
			xml.push("<channel>");
			xml.push("<title>Hackergarten Events</title>");
			xml.push("<link>http://hackergarten.net</link>");
			xml.push("<language>en-en</language>");
			for (var i = 0; i < events.length; i++) {
				var event = events[i];
				var hash = hashCode(event.date + event.location);
				if (new Date(event.date) >= today) {
					// This code is duplicated in eventlist.js
					if (event.title && event.location) { // old JSON format without venue and address
						event.title = "on " + event.date + " at " + event.title + " in " + event.location;
					} else if (event.venue && event.address) { // new JSON format with venue and address
						event.title = "on " + event.date + " at " + event.venue + ", " + event.address;
					} else { // fallback with title and date
						event.title += " on " + event.date;
					}
					xml.push("<item>");
					xml.push("<title>" + escapeHTML("Hackergarten " + event.title) + "</title>");
					xml.push("<link>http://hackergarten.net/#event-" + hash + "</link>");
					xml.push("<guid>" + hash + "</guid>");
					xml.push("</item>\n");
				}
			}
			xml.push("</channel>");
			xml.push("</rss>");
			return xml.join('');
		}))
		.pipe(rename("feed.xml"))
		.pipe(gulp.dest('.'));
});
