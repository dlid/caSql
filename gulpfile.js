
var gulp = require("gulp");
var gutil = require("gulp-util");
var concat = require("gulp-concat");
var clean = require('gulp-clean');
var inject = require('gulp-inject-string');
var uglify = require('gulp-uglify');
var wrap = require('gulp-wrap');
var path = require('path');
var pump = require('pump');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var less = require('gulp-less');
var rename = require('gulp-rename');
var cssmin = require('gulp-cssmin');
var copy = require('gulp-copy');
var indent = require("gulp-indent");
var reload      = browserSync.reload;
var replace = require('gulp-string-replace');
var moment = require('moment');
var jasmine = require('gulp-jasmine');
var reporters = require('jasmine-reporters');
var fs = require('fs');

var jshint = require('gulp-jshint');
//var jslint = require('gulp-jslint'); 

var ftp = require('gulp-ftp');

var package = JSON.parse(fs.readFileSync('./package.json'));
var ftpConfig;


// Quickly ftp latest build to an ftp server if a ftp.json exists
try {ftpConfig = JSON.parse(fs.readFileSync('./ftp.json'));} catch(e) { ftpConfig = null;}

var script_header = function (isRelease)  {    var headerComment = "/*! camlsqj-js v" + package.version + " | (c) dlid.se | camlsqljs.dlid.se/license */",         
    containerStart = "",
    containerEnd = "";
    return [headerComment + containerStart, containerEnd];
}
 
gulp.task('build-clean', function () {
    return gulp.src('./dist/**/*.*')
        .pipe(clean());
});

 
gulp.task('serve-watch', function() {  
    gulp.watch('src/**/*.js' , ['build-js', 'build-app-js']);
    gulp.watch('src/**/*.html' , ['copy-html']);
    gulp.watch('src/less/*.less' , ['build-less']);
});

gulp.task('ftp-latest', function (cb) {

    var operations = [
        gulp.src('dist/js/camlsql.*')
    ];
    if (ftpConfig != null) operations.push(ftp(ftpConfig));
    operations.push(gutil.noop());
    pump(operations, cb);
});

gulp.task('run-tests', () =>
    gulp.src('spec/*.spec.js')
        .pipe(jasmine({
            consolidateAll : true,
            includeStackTrace : true
        }))
);

gulp.task('serve-serve', function () {
 
    // Serve files from the root of this project
    browserSync.init({
        server: {
            baseDir: "./dist/"
        },
        reloadDelay : 2000
    }); 
     gulp.watch("./dist/css/*.css").on('change', reload);
     gulp.watch("./dist/*.html").on('change', reload);
     gulp.watch("./dist/**/*.js").on('change', reload);
});

function getCamlsqlFiles(isRelease) {
    var files = [
        'src/camlsql-js/core/header.js',
        'src/camlsql-js/util/*.js',
        'src/camlsql-js/parsers/*.js',
        'src/camlsql-js/index.js',
        'src/camlsql-js/core/footer.js',
    ];
    if (!isRelease)
        files.splice(files.length - 1, 0, 'src/camlsql-js/tests/*.js');

    return files;
}

gulp.task('build-js',  function (cb) {

    var files = getCamlsqlFiles(false);

    pump([
       gulp.src(files),
        wrap("\n// BEGIN <%= file.path %>*/\n<%= contents %>\n// END <%= file.path %>"),
        concat('camlsql.js'),
        inject.wrap(script_header()[0], script_header()[1]),
        gulp.dest('dist/js'),
        jshint(),
        jshint.reporter('default'),
        uglify().on('error', function(uglify) {
            console.error("\n\nJS Minification error\n  ");
                console.error( "> " + uglify.cause.filename + ":" + uglify.cause.line + ":" + uglify.cause.col + " - " +  uglify.cause.message + "\n");
            this.emit('end');
        }),
        rename({ suffix: '.min' }),
        gulp.dest('dist/js')
    ], cb);

});

gulp.task('build-release-js',  function (cb) {

    var files = getCamlsqlFiles(true);

    pump([
       gulp.src(files),
        concat('camlsql.js'),
        inject.wrap(script_header()[0], script_header()[1]),
        gulp.dest('releases/' + package.version),
        jshint(),
        jshint.reporter('default'),
        uglify().on('error', function(uglify) {
            console.error("\n\nJS Minification error\n  ");
                console.error( "> " + uglify.cause.filename + ":" + uglify.cause.line + ":" + uglify.cause.col + " - " +  uglify.cause.message + "\n");
            this.emit('end');
        }),
        rename({ suffix: '.min' }),
        gulp.dest('releases/' + package.version)
    ], cb);

});

gulp.task('build-app-js',  function (cb) { 

    var files = [
        'src/app/js/vendor/q-1.5.1/q.js',
        'node_modules/clipboard/dist/clipboard.min.js',
        'src/app/js/vendor/vkbeautify/vkbeautify.0.99.00.beta.js',
        'src/app/js/vendor/lz-string/lz-string.min.js',
        'src/app/js/vendor/vue/vue.min.js',
        'src/app/js/vendor/vue-router/vue-router.js',
        'src/app/js/managers/*.js',
        'src/app/js/vue/directives/*.js',
        'src/app/js/vue/components/*.js',
        'src/app/js/start.js'
    ];

     pump([
       gulp.src(files),
        wrap("\n// BEGIN <%= file.path %>*/\n<%= contents %>\n// END <%= file.path %>"),
        concat('app.js'),
        inject.wrap(script_header()[0], script_header()[1]),
        indent({
            tabs: false,
            amount: 2
        }),
        gulp.dest('dist/js'),
        uglify().on('error', function(uglify) {
            console.error("\n\nJS Minification error\n  ");
                console.error( "> " + uglify.cause.filename + ":" + uglify.cause.line + ":" + uglify.cause.col + " - " +  uglify.cause.message + "\n");
            this.emit('end');
        }),
        rename({ suffix: '.min' }),
        gulp.dest('dist/js')
    ], cb);
});
gulp.task('copy-html', function () {
    return gulp.src(['src/app/*.html'])
    .pipe(replace(/<%package.version%>/, package.version))
    .pipe(gulp.dest('./dist/'));
});
gulp.task('copy-img', function () {
    return gulp.src(['src/app/img/*.*'])
    .pipe(replace(/<%package.version%>/, package.version))
    .pipe(gulp.dest('./dist/img'));
});


/* Task to compile less */
gulp.task('build-less', function() {  
  gulp.src('./src/app/app.less')
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/css/'))
     .pipe(cssmin().on('error', function(err) {
        console.log(err);
    }))
     .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./dist/css/'));
}); 


gulp.task('default', function(cb) {
  runSequence('build-clean', ['build-app-js', 'build-js', 'build-less', 'copy-html', 'copy-img'], 'ftp-latest', cb);
});

gulp.task("serve", ['serve-watch', 'serve-serve']);


/*

UTILITY script to inject when testing.... this script will not be there forever though!!

var x = document.querySelectorAll("script[src*=camlsql"); for (var i=0; i < x.length; i++) { x[i].parentNode.removeChild(x[i]); }var s = document.createElement('script'); s.setAttribute('src', "https://dlid.se/camlsql.js?" + (new Date().getTime())); s.setAttribute("type", "text/javascript"); document.querySelector('head').appendChild(s);s.onload = function() {

 console.log("Sending query", camlsql.prepare("SELECT * FROM TestList WHERE Date_x0020_only_x0020_field = ?", 
  [ camlsql.today() ])
 .exec(function(err, rows) {
   console.log(err,rows);
 }).getXml());


}

 */