var gulp        = require("gulp"),
    tsc         = require("gulp-typescript"),
    sourcemaps  = require("gulp-sourcemaps");


var tsProject = tsc.createProject("tsconfig.json");

gulp.task("build-app", function() {
    return tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(sourcemaps.write("../dist"))
        .pipe(gulp.dest("dist"));
});