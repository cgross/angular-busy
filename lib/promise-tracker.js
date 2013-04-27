/*
 * promise-tracker - v1.2.0 - 2013-04-24
 * http://github.com/ajoslin/angular-promise-tracker
 * Created by Andy Joslin; Licensed under Public Domain
 */
angular.module('ajoslin.promise-tracker', [])

.config(function($httpProvider) {
  if ($httpProvider.interceptors) {
    //Support angularJS 1.1.4: interceptors
    $httpProvider.interceptors.push('trackerHttpInterceptor');
  } else {
    //Support angularJS pre 1.1.4: responseInterceptors
    $httpProvider.responseInterceptors.push('trackerResponseInterceptor');
  }
})
;


angular.module('ajoslin.promise-tracker')

/*
 * Intercept all http requests that have a `tracker` option in their config,
 * and add that http promise to the specified `tracker`
 */

//angular versions before 1.1.4 use responseInterceptor format
.factory('trackerResponseInterceptor', function($q, promiseTracker, $injector) {
  //We use $injector get around circular dependency problem for $http
  var $http;
  return function spinnerResponseInterceptor(promise) {
    if (!$http) $http = $injector.get('$http'); //lazy-load http
    //We know the latest request is always going to be last in the list
    var config = $http.pendingRequests[$http.pendingRequests.length-1];
    if (config.tracker) {
      promiseTracker(config.tracker).addPromise(promise, config);
    }
    return promise;
  };
})

.factory('trackerHttpInterceptor', function($q, promiseTracker, $injector) {
  return {
    request: function(config) {
      if (config.tracker) {
        var deferred = promiseTracker(config.tracker).createPromise(config);
        config.$promiseTrackerDeferred = deferred;
      }
      return $q.when(config);
    },
    response: function(response) {
      if (response.config.$promiseTrackerDeferred) {
        response.config.$promiseTrackerDeferred.resolve(response);
      }
      return $q.when(response);
    },
    responseError: function(response) {
      if (response.config.$promiseTrackerDeferred) {
        response.config.$promiseTrackerDeferred.reject(response);
      }
      return $q.reject(response);
    }
  };
})

;


angular.module('ajoslin.promise-tracker')

.provider('promiseTracker', function() {
  var trackers = {};

  this.$get = ['$q', '$timeout', function($q, $timeout) {
    var self = this;

    function Tracker(options) {
      options = options || {};
      var self = this,
        //Define our callback types.  The user can catch when a promise starts,
        //has an error, is successful, or just is done with error or success.
        callbacks = {
          start: [], //Start is called when a new promise is added
          done: [], //Called when a promise is resolved (error or success)
          error: [], //Called on error.
          success: [] //Called on success.
        },
        trackedPromises = [];

      //Allow an optional "minimum duration" that the tracker has to stay
      //active for. For example, if minimum duration is 1000ms and the user 
      //adds three promises that all resolve after 650ms, the tracker will 
      //still count itself as active until 1000ms have passed.
      self.setMinDuration = function(minimum) {
        self._minDuration = minimum;
      };
      self.setMinDuration(options.minDuration);

      //Allow an option "maximum duration" that the tracker can stay active.
      //Ideally, the user would resolve his promises after a certain time to 
      //achieve this 'maximum duration' option, but there are a few cases
      //where it is necessary anyway.
      self.setMaxDuration = function(maximum) {
        self._maxDuration = maximum;
      };
      self.setMaxDuration(options.maxDuration);

      //## active()
      //Returns whether the promiseTracker is active - detect if we're 
      //currently tracking any promises.
      self.active = function() {
        return trackedPromises.length > 0;
      };

      //## cancel()
      //Resolves all the current promises, immediately ending the tracker.
      self.cancel = function() {
        angular.forEach(trackedPromises, function(deferred) {
          deferred.resolve();
        });
      };

      function fireEvent(event, param) {
        angular.forEach(callbacks[event], function(cb) {
          cb.call(self, param);
        });
      }

      //Create a promise that will make our tracker active until it is resolved.
      //@param startArg: params to pass to 'start' event
      //@return deferred - our deferred object that is being tracked
      function createPromise(startArg) {
        //We create our own promise to track. This usually piggybacks on a given
        //promise, or we give it back and someone else can resolve it (like 
        //with the httpResponseInterceptor).
        //Using our own promise also lets us do things like cancel early or add 
        //a minimum duration.
        var deferred = $q.defer();

        trackedPromises.push(deferred);
        fireEvent('start', startArg);

        //If the tracker was just inactive and this the first in the list of
        //promises, we reset our 'minimum duration' and 'maximum duration'
        //again.
        if (trackedPromises.length === 1) {
          if (self._minDuration) {
            self.minPromise = $timeout(angular.noop, self._minDuration);
          } else {
            //No minDuration means we just instantly resolve for our 'wait'
            //promise.
            self.minPromise = $q.when(true);
          }
          if (self._maxDuration) {
            self.maxPromise = $timeout(deferred.resolve, self._maxDuration);
          }
        }

        //Create a callback for when this promise is done. It will remove our
        //tracked promise from the array and call the appropriate event 
        //callbacks depending on whether there was an error or not.
        function onDone(isError) {
          return function(value) {
            //Before resolving our promise, make sure the minDuration timeout
            //has finished.
            self.minPromise.then(function() {
              fireEvent('done', value);
              fireEvent(isError ? 'error' : 'success', value);
              var index = trackedPromises.indexOf(deferred);
              trackedPromises.splice(index, 1);

              //If this is the last promise, cleanup the timeout
              //for maxDuration so it doesn't stick around.
              if (trackedPromises.length === 0 && self.maxPromise) {
                $timeout.cancel(self.maxPromise);
              }
            });
          };
        }

        deferred.promise.then(onDone(false), onDone(true));

        return deferred;
      }

      //## addPromise()
      //Adds a given promise to our tracking
      self.addPromise = function(promise, startArg) {
        var deferred = createPromise(startArg);

        //When given promise is done, resolve our created promise
        promise.then(function success(value) {
          deferred.resolve(value);
          return value;
        }, function error(value) {
          deferred.reject(value);
          return $q.reject(value);
        });

        return deferred;
      };

      //## createPromise()
      //Create a new promise and return it, and let the user resolve it how
      //they see fit.
      self.createPromise = function(startArg) {
        return createPromise(startArg);
      };

      //## on(), bind()
      self.on = self.bind = function(event, cb) {
        if (!callbacks[event]) {
          throw "Cannot create callback for event '" + event + 
          "'. Allowed types: 'start', 'done', 'error', 'success'";
        }
        callbacks[event].push(cb);
        return self;
      };
      self.off = self.unbind = function(event, cb) {
        if (!callbacks[event]) {
          throw "Cannot create callback for event '" + event + 
          "'. Allowed types: 'start', 'done', 'error', 'success'";
        }
        if (cb) {
          var index = callbacks[event].indexOf(cb);
          callbacks[event].splice(index, 1);
        } else {
          //Erase all events of this type if no cb specified to remvoe
          callbacks[event].length = 0;
        }
        return self;
      };
    }
    return function promiseTracker(trackerName, options) {
      if (!trackers[trackerName])  {
        trackers[trackerName] = new Tracker(options);
      }
      return trackers[trackerName];
    };
  }];
})
;
