angular.module('cgBusy',['ajoslin.promise-tracker']);

angular.module('cgBusy').value('cgBusyTemplateName','angular-busy.html');

angular.module('cgBusy').directive('cgBusy',['promiseTracker','$compile','$templateCache','cgBusyTemplateName','$http','$animate',
	function(promiseTracker,$compile,$templateCache,cgBusyTemplateName,$http,$animate){
		return {
			restrict: 'A',
			link: function(scope, element, attrs, fn) {

				var options = scope.$eval(attrs.cgBusy);

				if (typeof options === 'string'){
					options = {tracker:options};
				}

				if (typeof options === 'undefined' || typeof options.tracker === 'undefined'){
					throw new Error('Options for cgBusy directive must be provided (tracker option is required).');
				}			

				if (!scope.$cgBusyTracker){
					scope.$cgBusyTracker = {};
				}

				scope.$cgBusyTracker[options.tracker] = promiseTracker(options.tracker);

				var position = element.css('position');
				if (position === 'static' || position === '' || typeof position === 'undefined'){
					element.css('position','relative');
				}

				var indicatorTemplateName = options.template ? options.template : cgBusyTemplateName;

				$http.get(indicatorTemplateName,{cache: $templateCache}).success(function(indicatorTemplate){

					options.backdrop = typeof options.backdrop === 'undefined' ? true : options.backdrop;
					var backdrop = options.backdrop ? '<div class="cg-busy cg-busy-backdrop"></div>' : '';



					var template = '<div class="cg-busy cg-busy-animation ng-hide">'+ backdrop + indicatorTemplate+'</div>';
					var templateElement = $compile(template)(scope);

					angular.element(templateElement.children()[options.backdrop?1:0])
						.css('position','absolute')
						.css('top',0)
						.css('left',0)
						.css('right',0)
						.css('bottom',0);

					element.append(templateElement);


                    /****************************************************************
                    In 1.1.5 I had cg-show="$cgBusyTracker[\''+options.tracker+'\'].active()" in the template
                    with 1.2.0-rc1 that works but it shows the busy animation when the element is loaded
                    I dont understand why but the ng-show is triggering an extra watch call than what seems to 
                    happen with elements that arent compiled and appended like this.  Not sure if this is something 
                    I'm doing or a bug in angular.

                    To resolve this problem, I basically created my own ng-show that ignores the first auto-triggered
                    watch expression.  All code below is that
                    *****************************************************************/

                    /*jslint eqeq: true */

                    function toBoolean(value) {
                      if (value && value.length !== 0) {
                        var v = angular.lowercase("" + value);
                        value = !(v == 'f' || v == '0' || v == 'false' || v == 'no' || v == 'n' || v == '[]');
                      } else {
                        value = false;
                      }
                      return value;
                    }

                    var first = true;
                    scope.$watch('$cgBusyTracker.' + options.tracker + '.active()',function(value){
                        if (first){
                            first = false;
                            return; //ignore first
                        }
                        $animate[toBoolean(value) ? 'removeClass' : 'addClass'](templateElement, 'ng-hide');
                    });

                    /***** end internal ng-show functionality *********************/

				}).error(function(data){
					throw new Error('Template specified for cgBusy ('+options.template+') could not be loaded. ' + data);
				});
			}
		};
	}
]);

