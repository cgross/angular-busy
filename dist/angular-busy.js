angular.module('cgBusy',['ajoslin.promise-tracker']);

angular.module('cgBusy').value('cgBusyTemplateName','angular-busy.html');

angular.module('cgBusy').directive('cgBusy',['promiseTracker','$compile','$templateCache','cgBusyTemplateName','$http',
	function(promiseTracker,$compile,$templateCache,cgBusyTemplateName,$http){
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

					var template = '<div class="cg-busy" ng-show="$cgBusyTracker[\''+options.tracker+'\'].active()" ng-animate="\'cg-busy\'" style="display:none">'+ backdrop + indicatorTemplate+'</div>';
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


angular.module("cgBusy").run(["$templateCache", function($templateCache) {

  $templateCache.put("angular-busy.html",
    "<div class=\"cg-busy-default-wrapper\">" +
    "" +
    "   <div class=\"cg-busy-default-sign\">" +
    "" +
    "      <div class=\"cg-busy-default-spinner\">" +
    "         <div class=\"bar1\"></div>" +
    "         <div class=\"bar2\"></div>" +
    "         <div class=\"bar3\"></div>" +
    "         <div class=\"bar4\"></div>" +
    "         <div class=\"bar5\"></div>" +
    "         <div class=\"bar6\"></div>" +
    "         <div class=\"bar7\"></div>" +
    "         <div class=\"bar8\"></div>" +
    "         <div class=\"bar9\"></div>" +
    "         <div class=\"bar10\"></div>" +
    "         <div class=\"bar11\"></div>" +
    "         <div class=\"bar12\"></div>" +
    "      </div>" +
    "" +
    "      <div class=\"cg-busy-default-text\">Please Wait...</div>" +
    "" +
    "   </div>" +
    "" +
    "</div>"
  );

}]);
