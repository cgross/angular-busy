# angular-busy [![Build Status](https://travis-ci.org/cgross/angular-busy.png?branch=master)](https://travis-ci.org/cgross/angular-busy)

> Show busy/loading indicators on any $http or $resource request, or on any promise.

## Demo

[Live Demo](http://cgross.github.io/angular-busy/demo)

## Getting Started

Install with Bower or download the the files directly from the dist folder in the repo.

```bash
bower install angular-busy --save
```

Add `dist/angular-busy.js` and `dist/angular-busy.css` to your index.html.

Add `cgBusy` as a module dependency for your module.

```js
angular.module('your_app', ['cgBusy']);
```

Add your promise to $scope and reference that in the `cg-busy` directive:

```js
function MyCtrl($scope,$http,User) {

  //using $http
  $scope.myPromise = $http.get('...');

  //if you have a User class based on $resource
  $scope.myPromise = User.$save();

}
```

```html
<!-- Use the simple syntax -->
<div cg-busy="myPromise"></div>

<!-- Use the advanced syntax -->
<div cg-busy="{promise:myPromise,message:'Loading Your Data',templateUrl:'mycustomtemplate.html'}"></div>
```

## Options

The `cg-busy` directive expects either a promise or a configuration object.

In other words.  You may do this:

```html
<div cg-busy="myPromise"></div>
```

or this:

```html
<div cg-busy="{promise:myPromise,message:'Loading',backdrop:false,templateUrl:'myAwesomeTemplate.html',delay:300,minDuration:700}"></div>
```

* `promise` - Required. The promise (or array of promises) that will cause the busy indicator to show.
* `message` - Optional.  Defaults to 'Please Wait...'.  The message to show in the indicator.  This value may be updated while the promise is active.  The indicator will reflect the updated values as they're changed.
* `backdrop` - Optional. Boolean, default is true. If true a faded backdrop will be shown behind the progress indicator.
* `templateUrl` - Optional.  If provided, the given template will be shown in place of the default progress indicatory template.
* `delay` - Optional.  The amount of time to wait until showing the indicator.  Defaults to 0.  Specified in milliseconds.
* `minDuration` - Optional.  The amount of time to keep the indicator showing even if the promise was resolved quicker.  Defaults to 0.  Specified in milliseconds.

## Providing Custom Templates

The angular-busy indicator is a regular Angular template.  The templates have access to the scope where `cg-busy` was declared so you may reference your local scope variables in your custom templates.  Additionally, the scope is augmented with a `$message` field containing the indicator message text.

## Overriding Defaults

The defaut values for `message`, `backdrop`, `templateUrl`, `delay`, and `minDuration` may all be overriden by overriding the `$injector` value for `cgBusyDefaults`, like so:

```js
angular.module('your_app').value('cgBusyDefaults',{
	message:'Loading Stuff',
	backdrop: false,
	templateUrl: 'my_custom_template.html',
	delay: 300,
	minDuration: 700
});
```

Only the values you'd like overriden need to be specified.


## Release History
 * v4.0.2 - Fix for min duration only being used when delay also being set.
 * v4.0.0 - Big update
  * Dependency on angular-promise-tracker has been removed.  We now track promises directly.
  * Message is now configurable.
  * The template options is now templateUrl.
  * The delay option has been added.
  * The minDuration option has been added.
  * Changing default template has been modified to be part of the new `cgBusyDefaults` value.
 * v3.0.2 - Reverting back to promise-tracker v1.5 due to changes in the api.
 * v3.0.1 - Fix for using cg-busy when a tracker has already been registered.
 * v3.0.0 - Support for new promise-tracker api.  Fix for multiple cg-busy's on the same scope.
 * v2.2.0 - Support for multiple trackers per indicator.
 * v2.1.0 - Removed work-around for issues in Angular 1.2-rc's.
 * v2.0.0 - Moved to Angular 1.2.0-rc1.
 * v1.0.0 - Added Bower support.
 * v0.1.1 - Updated to Angular 1.1.5 animation syntax.
 * v0.1.0 - Initial release.
