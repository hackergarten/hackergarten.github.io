var gulp = require('gulp');
var jsonlint = require("gulp-jsonlint");
var transform = require('gulp-transform');
var rename = require('gulp-rename');
var jsonSchema = require("gulp-json-schema");

var hashCode = function (str) {
    var hash = 0;
    if (str.length === 0) return hash;
    for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
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

/**
 * Escape a HTML string.
 * @param string
 * @returns {string}
 */
function escapeHTML(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
    });
}

/**
 * Validate the events.json file against a schema.
 *
 * This task will emit the errors and WILL NOT fail if there is any not defined structure. But it will emit emit a warning
 * if a structure ist not defined.
 */
gulp.task('validate-events', function () {

    return gulp.src("./events.json")
        .pipe(jsonlint())
        .pipe(jsonlint.failOnError())
        .pipe(jsonSchema({
            schema: "./events.schema.json",
            missing: "warn",
            emitError: true,
        }));
});

/**
 * Generate the xml file based on the events.
 */
gulp.task('generate-xml', gulp.series('validate-events', function () {

    return gulp.src("./events.json")
        .pipe(jsonlint())
        .pipe(jsonlint.failOnError())
        .pipe(jsonlint.reporter())
        .pipe(transform(function (contents) {
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
}));

/**
 * Generate the HTML file containing the top contributed projects.
 */
gulp.task('generate-projects', gulp.series('validate-events', function () {

    let projects = new Map();

    function addProject(project, url) {
        let value = projects.get(project) || {url: url, count: 0};
        value.count++;
        projects.set(project, value);
    }

    return gulp.src("./events.json")
        .pipe(jsonlint())
        .pipe(jsonlint.failOnError())
        .pipe(jsonlint.reporter())
        .pipe(transform(function(contents) {
            let events = JSON.parse(contents);
            let html = [];
            html.push('<!DOCTYPE html>');
            html.push('<html lang="en">');
            html.push('<head>');
            html.push('<meta charset="utf-8"/>');
            html.push('<title>Top Contributed Projects</title>');
            html.push('<link href="https://cdn.jsdelivr.net/bootstrap/3.3.0/css/bootstrap.min.css" rel="stylesheet"/>');
            html.push('<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>');
            html.push('<script src="https://cdn.jsdelivr.net/bootstrap/3.3.0/js/bootstrap.min.js"></script>');
            html.push('</head>');
            html.push('<body>');
            html.push('<table class="table table-striped"><tr><th>#</th><th>Project</th><th>Count</th></tr>');
            for (let i = 0; i < events.length; i++) {
                let event = events[i];
                if (event.achievements) {
                    for (let j = 0; j < event.achievements.length; j++) {
                        let achievement = event.achievements[j];
                        if (achievement.url) {
                            if (achievement.url.startsWith("https://github.com/")) {
                                let urlParts = achievement.url.split("/");
                                let project = urlParts[4];
                                let url = 'https://github.com/' + urlParts[3] + '/' + urlParts[4];
                                if (project !== undefined) addProject(project, url);
                            }
                        }
                    }
                }
            }
            let sortedProjects = new Map([...projects].sort((a, b) =>
                a[1].count === b[1].count ? 0 : a[1].count < b[1].count ? 1 : -1));
            let i = 1;
            sortedProjects.forEach((value, project) => {
                html.push('<tr>');
                html.push('<td>' + i++ + '</td>');
                html.push('<td><a href="' + value.url + '" target="_top">' + project + '</a></td>');
                html.push('<td>' + value.count + '</td>');
                html.push('</tr>');
            });
            html.push('</table>');
            html.push('</body>');
            html.push('</html>');
            return html.join('');
        }))
        .pipe(rename("projects.html"))
        .pipe(gulp.dest('.'));
}));

gulp.task('default', gulp.series('generate-xml', 'generate-projects'));
