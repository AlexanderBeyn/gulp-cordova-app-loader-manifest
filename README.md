gulp-cordova-app-loader-manifest
================================

Gulp plugin to create cordova-app-loader manifests

## Usage

```javascript
var calManifest = require('gulp-cordova-app-loader-manifest');

gulp.task('manifest', function() {
  return gulp.src('./www/**')
    .pipe(calManifest(options))
    .pipe(gulp.dest('./'));
});
```

## Options

#### load
```javascript
options.load = ['**'];
```
A glob pattern, or array of glob patterns, against which files will be tested before being added to manifest.load.
`minimatch` is used for testing.

#### root
```javascript
options.root = './';
```
Specifies the manifest.root option.
