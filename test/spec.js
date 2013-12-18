describe('cgBusy', function() {

  beforeEach(module('app'));

  var scope,compile,q,_promiseTracker,httpBackend;

  beforeEach(inject(function($rootScope,$compile,$q,promiseTracker,$httpBackend,$templateCache) {
    scope = $rootScope.$new();
    compile = $compile;
    q = $q;
    _promiseTracker = promiseTracker;
    httpBackend = $httpBackend;
    httpBackend.whenGET('test-custom-template.html').respond(function(method, url, data, headers){

        return [[200],'<div id="custom">test-custom-template-contents</div>'];
    });
  }));

  it('should show the overlay during promise', function() {

    this.element = compile('<div cg-busy="\'my_tracker\'"></div>')(scope);
    angular.element('body').append(this.element);

    this.testPromise = q.defer();
    _promiseTracker('my_tracker').addPromise(this.testPromise.promise);

    //httpBackend.flush(); 

    scope.$apply(); 

    expect(this.element.children().length).toBe(1); //ensure element is added 

    expect(this.element.children().css('display')).toBe('block');//ensure its visible (promise is ongoing)
    
    this.testPromise.resolve();
    scope.$apply();

    expect(this.element.children().css('display')).toBe('none'); //ensure its now invisible as the promise is resolved
  });

  it('should show the overlay during multiple promises', function() {

    this.element = compile('<div cg-busy="\'my_tracker,my_tracker2\'"></div>')(scope);
    angular.element('body').append(this.element);

    this.testPromise = q.defer();
    _promiseTracker('my_tracker').addPromise(this.testPromise.promise);

    this.testPromise2 = q.defer();
    _promiseTracker('my_tracker2').addPromise(this.testPromise2.promise);

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

    this.element = compile('<div cg-busy="{tracker:\'my_tracker\',template:\'test-custom-template.html\'}"></div>')(scope);
    angular.element('body').append(this.element);

    httpBackend.flush(); 

    scope.$apply(); 

    expect(angular.element('#custom').html()).toBe('test-custom-template-contents');

  })
});