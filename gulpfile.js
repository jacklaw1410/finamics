var gulp = require('gulp');
// var sass = require('gulp-sass');
var watch = require('gulp-watch');
var cleancss = require('gulp-clean-css');
var rename = require('gulp-rename');
// var gzip = require('gulp-gzip');
var cache = require('gulp-cache');
var changed = require('gulp-changed');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jsonmin = require('gulp-jsonmin');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var requireDir = require('require-dir');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var postcss = require('gulp-postcss');
var babel = require('gulp-babel');

requireDir('./gulp');

var src_js = ['*/js/**/*.js', '!*/js/**/*.min.js', '!static/{js,js/**}'];
var src_css = ['*/css/**/*.css', '!*/css/**/*.min.css', '!static/{css,css/**}'];
var src_img = ['*/img/**/*.+(png|PNG|jpg|JPG|jpeg|gif|svg|ico)', '!static/{img,img/**}', '!*/img/**/*.nonsync.+(png|PNG|jpg|JPG|jpeg|gif|svg|ico)'];
var src_json = ['*/json/**/*.json', '!static/{json,json/**}'];
var src_font = ['*/font/**/*.!(txt)', '!static/{font,font/**}'];
var src_html = ['*/templates/**/*.html', '!*/templates.dist/**/*.html'];
var src_watch = [src_html, ['**/*.mo']].reduce((x1,x2) => x1.concat(x2))

/* Transpile, uglify and minify js */
gulp.task('js', function() {
    return gulp.src(src_js)
        .pipe(rename(function (path) {
            dirname = path.dirname.replace(/\\/g,'/')
            path.dirname = dirname.split('/')[0] + '/js';
        }))
        .pipe(gulp.dest('static'))
        .pipe(rename({suffix: '.min'}))
		.pipe(sourcemaps.init({ identityMap: true }))
            .pipe(babel().on('error', gutil.log))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('static'))
});

/* Transpile and minify css */
var postcss_processors = [
	require('precss')(),
	require('postcss-cssnext')({browsers: ['last 1 version']}),
];
gulp.task('css', function() {
    return gulp.src(src_css)
        .pipe(rename(function (path) {
            dirname = path.dirname.replace(/\\/g,'/')
            path.dirname = dirname.split('/')[0] + '/css';
        }))
		.pipe(postcss(postcss_processors).on('error', gutil.log))
        .pipe(gulp.dest('static'))
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.init({ identityMap: true }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('static'));
});

/* Move images to static folder */
gulp.task('img', function() {
    return gulp.src(src_img)
        .pipe(rename(function (path) {
            path.dirname = path.dirname.split('\\')[0] + '\\img';
        }))
        .pipe(gulp.dest('static'));
});
/* Move json to static folder */
gulp.task('json', function() {
    return gulp.src(src_json)
        .pipe(rename(function (path) {
            path.dirname = path.dirname.split('\\')[0] + '\\json';
        }))
        .pipe(jsonmin())
        .pipe(gulp.dest('static'));
});
/* Move font to static folder */
gulp.task('font', function() {
    return gulp.src(src_font)
        .pipe(rename(function (path) {
            path.dirname = path.dirname.split('\\')[0] + '\\font';
        }))
        .pipe(gulp.dest('static'));
});

/* Create watch tasks */
watch_stream = glob => function() { browserSync.reload(glob) }
watch_tasks = {
	js: watch_stream('*.js'),
	css: watch_stream('*.css'),
	img: watch_stream('*.+(png|PNG|jpg|JPG|jpeg|gif|svg|ico)'),
	json: watch_stream('*.json'),
	font: watch_stream('*.toff')
}
for (let task in watch_tasks) gulp.task(`${task}-watch`, [task], watch_tasks[task]);


gulp.task('build-dev', [
    'js',
    'css',
    'img',
    'font',
    'json'
]);

gulp.task('build', [
    'js-dist',
    'css-dist',
    'img',
    'font',
    'json',
    'useref'
]);

/* Watch Files For Changes */
gulp.task('watch', function() {
    browserSync.init({
        open: false,
        notify: true,
        scrollProportionally: true,
        proxy: '127.0.0.1:8080'
    });

    gulp.watch(src_js, ['js-watch']);
    gulp.watch(src_css, ['css-watch']);
    gulp.watch(src_img, ['img-watch']);
    gulp.watch(src_font, ['font-watch']);
    gulp.watch(src_json, ['json-watch']);

    gulp.watch(src_watch, { debounceDelay: 1000 }, reload);

    gulp.watch(['*/**/*.py']).on('change', (file) => {
        setTimeout(() => reload(file.path), 5000);
    });
});

gulp.task('default', ['build-dev', 'watch']);

gulp.task('production', ['js', 'css'])
