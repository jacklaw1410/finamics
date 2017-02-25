/* ======================================== Tasks to be done only before deployment ======================================== */
var gulp = require('gulp');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var clean = require('gulp-clean');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var lazypipe = require('lazypipe');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var replace = require('gulp-replace');
var del = require('del');
var postcss = require('gulp-postcss');
var babel = require('gulp-babel');


var src_js = ['*/js/**/*.js', '!*/js/**/*.min.js', '!static/{js,js/**}'];
var src_css = ['*/css/**/*.css', '!*/css/**/*.min.css', '!static/{css,css/**}'];
var src_img = ['*/img/**/*.+(png|PNG|jpg|JPG|jpeg|gif|svg|ico)', '!static/{img,img/**}', '!*/img/**/*.nonsync.+(png|PNG|jpg|JPG|jpeg|gif|svg|ico)'];

// Copy images to static folder after minification
gulp.task('minify-img', function(){
    return gulp.src(src_img)
        .pipe(rename(function (path) {
            path.dirname = path.dirname.split('\\')[0] + '\\img';
        }))
        // Caching images that ran through imagemin
        .pipe(cache(imagemin({
            optimizationLevel: 5,
            progressive: true,
            // interlaced: true
        })))
        .pipe(gulp.dest('static'));
});

// Copy uglified javascript to static folder without producing source map
gulp.task('js-dist', function() {
    return gulp.src(src_js)
        .pipe(rename(function(path) {
            path.dirname = path.dirname.split('\\')[0] + '\\js';
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(babel().on('error', gutil.log))
        .pipe(uglify().on('error', gutil.log))
		.pipe(gulp.dest('static'));
});

var postcss_processors = [
	require('precss')(),
	require('postcss-cssnext')({browsers: ['last 1 version']}),
	require('cssnano')(),
];
gulp.task('css-dist', function() {
    return gulp.src(src_css)
        .pipe(rename(function (path) {
            path.dirname = path.dirname.split('\\')[0] + '\\css';
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(postcss(postcss_processors).on('error', gutil.log))
        .pipe(gulp.dest('static'));
});

// A sub process used by useRef to minify javascript and css files
var compressTasks = lazypipe()
    .pipe(function() { return gulpif('*.js', babel().on('error', gutil.log)); })
    .pipe(function() { return gulpif('*.js', uglify().on('error', gutil.log)); })
    .pipe(function() { return gulpif('*.css', postcss(postcss_processors).on('error', gutil.log)); });
// useRef looks at markers in HTML files and bundles all of the files into one
gulp.task('useref', [],function() {
    del(['*/templates.dist/**/*.html']);
    var timestamp = Date.now();
    return gulp.src('*/templates/**/*.html')
        .pipe(replace(/<!-- build(:css|:js) ([\w-_\.\/\\]*?)(\.css|\.js)( .*)-->/g, `<!-- build$1 $2.t${timestamp}$3$4-->`))
        .pipe(replace(/href=["|']\{% static ["|']([\w-_\.\/\\]*?).css["|'] %\}["|']/g, 'href="$1.css"'))
        .pipe(replace(/src=["|']\{% static ["|']([\w-_\.\/\\]*?).js["|'] %\}["|']/g, 'src="$1.js"'))
        .pipe(useref({
                searchPath: './',
                transformPath: function(file) { return file.replace('.min', ''); },
            },
            lazypipe()
                .pipe(compressTasks)
        ))
        // Add back static filter
        .pipe(replace(/href="(?!\/\/|http)([\w-_\.\/\\]*?)\.css"/g, 'href="{% static \'$1.css\' %}"'))
        .pipe(replace(/src="(?!\/\/|http)([\w-_\.\/\\]*?)\.js"/g, 'src="{% static \'$1.js\' %}"'))
        .pipe(gulp.dest(function (file) {
            if (file.extname && file.extname.match(/^(.js|.css)$/)) {
                return file.cwd + '\\static';
            } else if (file.relative && file.relative.match('.html')) {
                file.path = file.path.replace('templates', 'templates.dist');
                return file.base;
            }
        }));
});
