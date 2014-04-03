angular.module('cgBusy',['ajoslin.promise-tracker']);

angular.module('cgBusy').value('cgBusyTemplateName','angular-busy.html');

// angular.module('cgBusy').value('cgBusyTrackers', {});
angular.module('cgBusy').factory('cgBusyTrackers', [

    function() {
        var trackersObject = {};

        // To add promise-tracker 
        var addTracker = function(tracker, promiseTracker) {
            trackersObject[tracker] = promiseTracker;
        }

        var getPromiseTracker = function(tracker) {
            // if (angular.isUndefined(trackersObject[tracker])) {
            //     console.log('Tracker: ' + tracker + 'not initialized.');
            // }
            return trackersObject[tracker];
        }

        return {
            _trackersObject: trackersObject,
            addTracker: addTracker,
            getPromiseTracker: getPromiseTracker
        }
    }
]);

angular.module('cgBusy').directive('cgBusy',['promiseTracker','$compile','$templateCache','cgBusyTemplateName','$http','$animate','cgBusyTrackers',
	function(promiseTracker,$compile,$templateCache,cgBusyTemplateName,$http,$animate,cgBusyTrackers){
		return {
			restrict: 'A',
			link: function(scope, element, attrs, fn) {

				var options = scope.$eval(attrs.cgBusy);

				if (angular.isString(options) || angular.isArray(options)) {
					options = {tracker:options};
				}

				if (angular.isUndefined(options) || angular.isUndefined(options.tracker)){
					throw new Error('Options for cgBusy directive must be provided (tracker option is required).');
				}

				options.tracker = angular.isArray(options.tracker) ? options.tracker : [options.tracker];

				angular.forEach(options.tracker, function (tracker) {
					if (cgBusyTrackers.getPromiseTracker(tracker) === undefined) {
                        // Create promiseTracker for tracker 
                        cgBusyTrackers.addTracker(
                            tracker,
                            promiseTracker({
                                // TODO: following parameters should be configurable
                                activationDelay: 0,
                                minDuration: 0
                            })
                        );
                    }
				});

				//multiple cg-busy's can be active in the same scope so we have to be careful not to overwrite the
				//same isActive function.  So lets name it uniquely by the trackers its watching.
				var isActiveFnName = 'isActive_' + options.tracker.join('_');

				scope[isActiveFnName] = function() {
					var active = false;
					angular.forEach(options.tracker, function (tracker) {
						if (!angular.isUndefined(cgBusyTrackers.getPromiseTracker(tracker))) {
                            // If tracker is not available then no need to check active status
                            if (cgBusyTrackers.getPromiseTracker(tracker).active()) {
                                active = true;
                            }
                        }
					});
					return active;
				};

				var position = element.css('position');
				if (position === 'static' || position === '' || typeof position === 'undefined'){
					element.css('position','relative');
				}

				var indicatorTemplateName = options.template ? options.template : cgBusyTemplateName;

				$http.get(indicatorTemplateName,{cache: $templateCache}).success(function(indicatorTemplate){

					options.backdrop = typeof options.backdrop === 'undefined' ? true : options.backdrop;
					var backdrop = options.backdrop ? '<div class="cg-busy cg-busy-backdrop"></div>' : '';

					var template = '<div class="cg-busy cg-busy-animation ng-hide" ng-show="'+isActiveFnName+'()">'+ backdrop + indicatorTemplate+'</div>';
					var templateElement = $compile(template)(scope);

					angular.element(templateElement.children()[options.backdrop?1:0])
						.css('position','absolute')
						.css('top',0)
						.css('left',0)
						.css('right',0)
						.css('bottom',0);
					element.append(templateElement);

				}).error(function(data){
					throw new Error('Template specified for cgBusy ('+options.template+') could not be loaded. ' + data);
				});
			}
		};
	}
	]);

