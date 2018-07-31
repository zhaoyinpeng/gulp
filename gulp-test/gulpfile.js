/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2018-04-24 09:09:40
 * @version $Id$
 */
//导入工具包 require('node_modules里对应模块')
var gulp = require('gulp'), //本地安装gulp所用到的地方
    less = require('gulp-less'),
    browserSync = require('browser-sync'),
    babel = require('gulp-babel'),
    browserify = require('browserify');
//定义一个testLess任务（自定义任务名称）
gulp.task('testLess', function() {
    gulp.src('src/less/**/*.less') //该任务针对的文件
        .pipe(less()) //该任务调用的模块
        .pipe(gulp.dest('src/css'))
        .pipe(browserSync.reload({
        	stream:true
        })); //将会在src/css下生成index.css
});
//定义一个Es6Js任务（自定义任务名称）
gulp.task('Es6Js', function() {
    gulp.src('src/js/index.js') //该任务针对的文件
        .pipe(babel({
            presets:['es2015']
        })) //该任务调用的模块
        .pipe(gulp.dest('src/js/es5'));
});
// browserify
gulp.task("browserify", function () {
    var b = browserify({
        entries: "src/js/es5/index.js"          //
    });

    return b.bundle()
        .pipe(source("index.js"))
        .pipe(gulp.dest("dist/js"));
});
gulp.task('default', ['watch']); //定义默认任务 elseTask为其他任务，该示例没有定义elseTask任务
//gulp.task(name[, deps], fn) 定义任务  name：任务名称 deps：依赖任务名称 fn：回调函数
//gulp.src(globs[, options]) 执行任务处理的文件  globs：处理的文件路径(字符串或者字符串数组) 
//gulp.dest(path[, options]) 处理完后文件生成路径
//添加watch命令，每当less发生变化就自动刷新编译成css
gulp.task('watch',['browserSync','testLess','Es6Js'], function() {
    gulp.watch('src/less/**/*.less', ['testLess']);
    //..继续添加
    gulp.watch('src/js/**/*.js', ['Es6Js']);
    gulp.watch('src/css/**/*.css', browserSync.reload);
    gulp.watch('src/*.html', browserSync.reload);
});
//自动刷新浏览器
gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: 'src'
        },
    })
});
gulp.task('watch2',['browserSync','testLess'], function() {
    gulp.watch('src/less/**/*.less', ['testLess']);
    //..继续添加
    gulp.watch('src/js/**/*.js', browserSync.reload);
    gulp.watch('src/css/**/*.css', browserSync.reload);
    gulp.watch('src/*.html', browserSync.reload);
});