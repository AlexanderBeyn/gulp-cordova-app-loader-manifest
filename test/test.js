'use strict';

var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;
var expect = Code.expect;

var _ = require('lodash');
var gulp = require('gulp');
var calManifest = require('../');

var testFixtures = './test-fixtures';

describe('cordova-app-loader manifest creation in buffer mode', function () {
    var versions = [];
    var files = [];
    before(function (done) {
        gulp.src(testFixtures + '/**')
            .on('data', function (file) {
                if (file.isNull() || !file.stat.isFile()) {
                    return;
                }

                var hasher = require('crypto').createHash('sha256');
                versions.push({
                    filename: file.relative,
                    version: hasher.update(file.contents).digest('hex')
                });

                files.push(file.relative);
            })
            .on('end', function () {
                done();
            });
    });

    it('creates manifest.json from fixtures', function (done) {
        var outFiles = 0;
        gulp.src(testFixtures + '/**')
            .pipe(calManifest())
            .on('data', function (file) {
                expect(file.path, 'Manifest filename')
                    .to.equal('manifest.json');

                expect(file.contents, 'Manifest contents')
                    .to.be.a.buffer();

                var manifest = JSON.parse(file.contents.toString());

                _.each(versions, function (version) {
                    var key = _.findKey(manifest.files, {filename: version.filename});
                    expect(key, 'Key for ' + version.filename)
                        .to.exist()
                        .and.to.be.a.string();

                    expect(manifest.files[key].version, 'Version for ' + version.filename)
                        .to.exist()
                        .and.to.equal(version.version);
                });

                expect(manifest.load.sort())
                    .to.deep.equal(files.sort());

                outFiles++;
            })
            .on('end', function () {
                expect(outFiles, 'Files output')
                    .to.equal(1);
                done();
            });
    });

    it('should only add files to manifest.load that match object.load by string', function (done) {
        gulp.src(testFixtures + '/**')
            .pipe(calManifest({load: '**/*.css'}))
            .on('data', function (file) {
                var manifest = JSON.parse(file.contents.toString());
                expect(manifest.load, 'Manifest.load')
                    .to.deep.equal(['css/file.css']);
            })
            .on('end', function () {
                done();
            });
    });

    it('should only add files to manifest.load that match object.load by array', function (done) {
        gulp.src(testFixtures + '/**')
            .pipe(calManifest({load: ['**/*.css']}))
            .on('data', function (file) {
                var manifest = JSON.parse(file.contents.toString());
                expect(manifest.load, 'Manifest.load')
                    .to.deep.equal(['css/file.css']);
            })
            .on('end', function () {
                done();
            });
    });

    it('should properly deal with !items in options.load', function (done) {
        gulp.src(testFixtures + '/**')
            .pipe(calManifest({load: ['**/*.js', '!**/file2.js']}))
            .on('data', function (file) {
                var manifest = JSON.parse(file.contents.toString());
                expect(manifest.load, 'Manifest.load')
                    .to.deep.equal(['js/file.js']);
            })
            .on('end', function () {
                done();
            });
    });


    it('should set manifest.root from options.root', function (done) {
        gulp.src(testFixtures + '/**')
            .pipe(calManifest({root: './root/'}))
            .on('data', function (file) {
                var manifest = JSON.parse(file.contents.toString());
                expect(manifest.root, 'Manifest.root')
                    .to.equal('./root/');
            })
            .on('end', function () {
                done();
            });
    });

    it('should emit error when used with Streams', function (done) {
        var outFiles = 0;
        gulp.src(testFixtures + '/**', {buffer: false})
            .pipe(calManifest())
            .on('data', function (file) {
                outFiles++;
            })
            .on('error', function (err) {
                expect(err, 'Error')
                    .to.be.instanceof(Error);
                expect(err.plugin, 'Error.plugin')
                    .to.be.equal('gulp-cordova-app-loader-manifest');
                done();
            })
            .on('end', function () {
                expect(outFiles, 'Files output')
                    .to.be.equal(1);
                done();
            });
    });

});
