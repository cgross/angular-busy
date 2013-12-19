# angular-busy [![Build Status](https://travis-ci.org/cgross/angular-busy.png?branch=master)](https://travis-ci.org/cgross/angular-busy)

> Show busy/loading indicators on any element during $http requests (or any promise).

This library depends on [Andy Joslin's angular-promise-tracker](https://github.com/ajoslin/angular-promise-tracker).  

Annotate an `$http` request using `angular-promise-tracker` and add `cg-busy` on an element to display a busy 
indication on a specific element during the `$http` request.

This library builds on Angular 1.2 and the new Angular animate module in `animate.js`.

Supports IE 10, and recent versions of FF and Chrome.

## Demo

[Live Demo](http://cgross.github.io/angular-busy/demo)

## Getting Started

Add `dist/angular-busy.js` and `dist/angular-busy.css` to your index.html.  Also add the `angular-promise-tracker` files as necessary.

Add `cgBusy` as a module dependency for your module (in addition to `ajoslin.promise-tracker` and the Angular 1.2 `ngAnimate` module):

```js
angular.module('your_app', ['ngAnimate','ajoslin.promise-tracker','cgBusy']);
```

Add the promise trackers as you normally would using `angular-promise-tracker`:

```js
function MyCtrl($scope) {

  $scope.pizzaFlavor = $http.get('/pizzaFlavor', { tracker: 'pizza' });
  
}
```

Add `cg-busy` to the elements you wish to be _busy_ during those requests:

```html
<div cg-busy="'pizza'"></div>
```

## Options

The `cg-busy` directive expects a value that is interpreted as an expression.  The value may be specified as an object literal 
 or simply as a string if only the `tracker` value is provided.

In other words.  You may do this:

```html
<div cg-busy="'my_tracker'"></div> <!-- Notice the extra single quotes because its an expression -->
```

or this:

```html
<div cg-busy="{tracker:'my_tracker',backdrop:false,template:'myAwesomeTemplate.html'}"></div>
```

* `tracker` - Required. The name(s) of the promise tracker.  May either be a string or an array of strings if you wish to use the same indicator for multiple promises/trackers.
* `backdrop` - Optional. Boolean, default is true. If true a faded backdrop will be shown behind the progress indicator.
* `template` - Optional.  If provided, the given template will be shown in place of the default progress 
indicatory template. Use this to override the default UI and provide your own.

## Providing Custom Templates

The default progress template shows a spinner and a 'Please Wait...' message.  But you can define custom templates per instance 
(as shown above) or change the global default template.  To change the global default template just provide a new 
`$injector` value for `cgBusyTemplateName`.  Ex:

 ```js
angular.module('yourapp').value('cgBusyTemplateName','your_custom_template_here.html');
```

Templates are full, normal Angular partials with access to the scope of where the `cg-busy` was used.

## Release History
 * v2.2.0 - Support for multiple trackers per indicator.
 * v2.1.0 - Removed work-around for issues in Angular 1.2-rc's.
 * v2.0.0 - Moved to Angular 1.2.0-rc1.
 * v1.0.0 - Added Bower support.
 * v0.1.1 - Updated to Angular 1.1.5 animation syntax.
 * v0.1.0 - Initial release.
