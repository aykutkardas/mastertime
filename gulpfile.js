var gulp = require("gulp");
var minify = require("gulp-minify");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

gulp.task("default", function() {
  return tsProject
    .src()
    .pipe(tsProject())
    .pipe(minify({
      ignoreFiles: ['-min.js']
    }))
    .pipe(gulp.dest("dist"));
});


gulp.watch('./src/*.ts', ['default']);