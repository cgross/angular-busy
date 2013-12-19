angular.module('cgBusy',['ajoslin.promise-tracker']);

angular.module('cgBusy').value('cgBusyTemplateName','angular-busy.html');

angular.module('cgBusy').directive('cgBusy',['promiseTracker','$compile','$templateCache','cgBusyTemplateName','$http','$animate',
	function(promiseTracker,$compile,$templateCache,cgBusyTemplateName,$http,$animate){
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

				if (!scope.$cgBusyTracker){
					scope.$cgBusyTracker = {};
				}

				angular.forEach(options.tracker, function (tracker) {
					scope.$cgBusyTracker[tracker] = promiseTracker(tracker);
				});

				scope.isActive = function() {
					var active = false;
					angular.forEach(scope.$cgBusyTracker, function (tracker) {
						if (tracker.active()) {
							active = true;
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

					var template = '<div class="cg-busy cg-busy-animation ng-hide" ng-show="isActive()">'+ backdrop + indicatorTemplate+'</div>';
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

