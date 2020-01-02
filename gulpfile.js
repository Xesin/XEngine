var gulp        = require("gulp"),
    webpack     = require('webpack-stream');


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
            mode: "production"
        }))
        .pipe(gulp.dest("dist"));
});

gulp.task("webpack-watch", function() {
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
            devtool: 'source-map',
            mode: "development",
            watch: true
        }))
        .pipe(gulp.dest("dist"));
});