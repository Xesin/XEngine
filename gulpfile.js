var gulp        = require("gulp"),
    tsc         = require("gulp-typescript"),
    sourcemaps  = require("gulp-sourcemaps"),
    webpack     = require('webpack-stream');


var tsProject = tsc.createProject("tsconfig.json");

gulp.task("build-app", function() {
    return tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(sourcemaps.write("../dist"))
        .pipe(gulp.dest("dist"))
});

gulp.task("webpack", function() {
    return gulp.src("source")
        .pipe(webpack({
            entry: "./source/XEngine.ts",
            optimization: {
                minimize: true
            },
            output:
            {
                library: "XEngine",
                filename: "XEngine_min.js"
            },
            resolve: {
                extensions: [ '.tsx', '.ts', '.js' ],
              },
            module:
            {
                rules:[
                    { test: /\.tsx?$/, loader: "ts-loader" }
                ]
            },
            devtool: 'source-map'
        }))
        .pipe(gulp.dest("dist"));
});

gulp.task('build-pack', gulp.series(['build-app', 'webpack']), function()
{
    
});