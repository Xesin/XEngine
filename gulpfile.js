var gulp        = require("gulp"),
    tsc         = require("gulp-typescript"),
    sourcemaps  = require("gulp-sourcemaps");


var tsProject = tsc.createProject("tsconfig.json");

gulp.task("build-app", function() {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"));
});