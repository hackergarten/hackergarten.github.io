var gulp = require('gulp');

var jsonlint = require("gulp-jsonlint");
 
var gulp = require('gulp');

gulp.task('default', function() {

	gulp.src("./events.json")
	    .pipe(jsonlint())
		.pipe(jsonlint.failOnError())
	    .pipe(jsonlint.reporter());
 
});
 