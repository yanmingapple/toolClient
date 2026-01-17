
const gulp = require('gulp');
const uglify = require('gulp-uglify');
const autoprefix = require('gulp-autoprefixer');
const minifyCSS = require('gulp-minify-css');
const htmlmin = require('gulp-html-minifier-terser'); // es6:

// const htmlmin = require('gulp-htmlmin'); // es5:
// const rev = require('gulp-rev');//对文件名加MD5后缀
// const concat = require('gulp-concat');
// const htmlmin = require('gulp-htmlmin');
// const babel = require('gulp-babel');//把es6语法解析成es5
// const revCollector = require('gulp-rev-collector');//替换路径
// const del = require('del');//删除文件

const targetDir = '../tk_preview/'

gulp.task('relyon-js', function () {
  return gulp.src('js/*.js') // 指明源文件路径、并进行文件匹配
    .pipe(uglify({
      mangle: true, // 混淆变量名
      compress: true, // 压缩代码
      // mangleProperties: true, //该选项可以设置为一个布尔值或一个对象。如果设置为 `true`，则会对对象的属性名进行混淆；
      output: {
        comments: false, // 删除所有注释
        // beautify: true //删除空格
      }
    }))
    .pipe(gulp.dest(targetDir+'js'));
});

gulp.task('minify-html', function () {
  return gulp.src('*.html') // 指明源文件路径、并进行文件匹配
    .pipe(htmlmin({
      collapseWhitespace: true,//去空格
      removeComments: true, //去注释
      minifyJS: true,	//压缩页面中的JS
      minifyCSS: true	//压缩页面中的CSS
    }))
    .pipe(gulp.dest(targetDir));
});

// 建立处理css任务
gulp.task('style', async function () {
  return gulp.src('./css/*.css')
    .pipe(autoprefix({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(minifyCSS())
    // .pipe(rev())
    .pipe(gulp.dest(targetDir+'css'))
});

gulp.task('static', async function(){
  return gulp.src(['./static/**/*'],{allowEmpty: true})
  .pipe(gulp.dest(targetDir+'static'));
});

gulp.task('fonts', async function(){
  return gulp.src(['./fonts/*'],{allowEmpty: true})
  .pipe(gulp.dest(targetDir+'fonts'));
});

gulp.task('default', gulp.parallel('relyon-js', 'minify-html', 'style', 'static', 'fonts'));