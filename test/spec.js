describe('cgBusy', function() {

	beforeEach(module('app'));

	var scope,compile,q,httpBackend,timeout;

	beforeEach(inject(function($rootScope,$compile,$q,$httpBackend,$templateCache,$timeout) {
		scope = $rootScope.$new();
		compile = $compile;
		q = $q;
		httpBackend = $httpBackend;
		timeout = $timeout;
		httpBackend.whenGET('test-custom-template.html').respond(function(method, url, data, headers){

			return [[200],'<div id="custom">test-custom-template-contents</div>'];
		});
	}));

	it('should show the overlay during promise', function() {

		this.element = compile('<div cg-busy="my_promise"></div>')(scope);
		angular.element('body').append(this.element);

		this.testPromise = q.defer();
		scope.my_promise = this.testPromise.promise;

		//httpBackend.flush();

		scope.$apply();

		expect(this.element.children().length).toBe(1); //ensure element is added

		expect(this.element.children().css('display')).toBe('block');//ensure its visible (promise is ongoing)

		this.testPromise.resolve();
		scope.$apply();

		expect(this.element.children().css('display')).toBe('none'); //ensure its now invisible as the promise is resolved
	});

	it('should show the overlay during multiple promises', function() {

		this.element = compile('<div cg-busy="[my_promise,my_promise2]"></div>')(scope);
		angular.element('body').append(this.element);

		this.testPromise = q.defer();
		scope.my_promise = this.testPromise.promise;

		this.testPromise2 = q.defer();
		scope.my_promise2 = this.testPromise2.promise;

		//httpBackend.flush();

		scope.$apply();

		expect(this.element.children().length).toBe(1); //ensure element is added

		expect(this.element.children().css('display')).toBe('block');//ensure its visible (promise is ongoing)

		this.testPromise.resolve();
		scope.$apply();

		expect(this.element.children().css('display')).toBe('block'); //ensure its still visible (promise is ongoing)

		this.testPromise2.resolve();
		scope.$apply();
		expect(this.element.children().css('display')).toBe('none'); //ensure its now invisible as the promise is resolved
	});

	it('should load custom templates', function(){

		this.element = compile('<div cg-busy="{promise:my_promise,templateUrl:\'test-custom-template.html\'}"></div>')(scope);
		angular.element('body').append(this.element);

		httpBackend.flush();

		scope.$apply();

		expect(angular.element('#custom').html()).toBe('test-custom-template-contents');

	});

	it('should delay when delay provided.', function() {

		this.element = compile('<div cg-busy="{promise:my_promise,delay:300}"></div>')(scope);
		angular.element('body').append(this.element);

		this.testPromise = q.defer();
		scope.my_promise = this.testPromise.promise;

		scope.$apply();

		expect(this.element.children().length).toBe(1); //ensure element is added

		expect(this.element.children().css('display')).toBe('none');

		timeout.flush(200);
		expect(this.element.children().css('display')).toBe('none');

		timeout.flush(301);
		expect(this.element.children().css('display')).toBe('block');
		this.testPromise.resolve();
		scope.$apply();			
		expect(this.element.children().css('display')).toBe('none');

	});

	it('should use minDuration correctly.', function() {

		this.element = compile('<div cg-busy="{promise:my_promise,minDuration:1000}"></div>')(scope);
		angular.element('body').append(this.element);

		this.testPromise = q.defer();
		scope.my_promise = this.testPromise.promise;

		scope.$apply();

		expect(this.element.children().length).toBe(1); //ensure element is added

		expect(this.element.children().css('display')).toBe('block');

		timeout.flush(200);
		expect(this.element.children().css('display')).toBe('block');

		this.testPromise.resolve();
		timeout.flush(400);
		expect(this.element.children().css('display')).toBe('block');

		timeout.flush(300); //900ms total
		expect(this.element.children().css('display')).toBe('block');	

		timeout.flush(101); //1001ms total
		expect(this.element.children().css('display')).toBe('none');

	});	

});