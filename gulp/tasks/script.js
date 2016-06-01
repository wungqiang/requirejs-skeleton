var gulp = require('gulp'),
    fs = require('fs'),
    path = require('path'),
    concat = require('gulp-concat'),
    optimize = require('amd-optimize'),
    uglify = require('gulp-uglify'),
    foreach = require('gulp-foreach'),
    header = require('gulp-header'),
    common = require('./common'),
    config = require('../config/gulpconfig.json');

module.exports.coreJs = function () {

    var corePath = path.join(config.paths.srcScripts,
        config.paths.coreJsModuleName);

    return gulp.src(corePath)
        .pipe(optimize(path.basename(config.paths.coreJsModuleName, '.js'), {
            configFile: config.paths.requireConfigFile
        }))
        .pipe(concat('core.js'))
        .pipe(uglify())
        .pipe(header(config.header))
        .pipe(gulp.dest(config.paths.srcScripts));

};

module.exports.libs = function () {

    config.paths.srcOtherLibs.forEach(function (item) {

        var stat = fs.statSync(item),
            src = stat.isDirectory() ? common.allFile(item) : item,
            dest = stat.isDirectory() ?
                path.join(config.paths.distLibs, path.basename(item)) :
                config.paths.distLibs;

        gulp.src(src).pipe(gulp.dest(dest));

    });

};

module.exports.js = function () {

    var coreModulePath = path.join(config.paths.srcScripts,
        config.paths.coreJsModuleName),
        corePath = path.join(config.paths.srcScripts,
        config.paths.coreJsName);

    gulp.src(corePath).pipe(gulp.dest(config.paths.distScripts));

    gulp.src([common.childFile(config.paths.srcScripts, 'js')]
            .concat(common.excludeFile(coreModulePath)))
        .pipe(foreach(function (stream, file) {
            return stream.pipe(optimize(file.relative.replace(/\.js/, ''), {
                        baseUrl: config.paths.srcScripts
                    }))
                    .pipe(concat(path.basename(file.relative)))
                    .pipe(uglify())
                    .pipe(header(config.header))
                    .pipe(gulp.dest(config.paths.distScripts));
        }));

};