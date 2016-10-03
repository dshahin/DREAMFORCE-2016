webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _angular = __webpack_require__(1);

	var _angular2 = _interopRequireDefault(_angular);

	var _angularUiRouter = __webpack_require__(4);

	var _angularUiRouter2 = _interopRequireDefault(_angularUiRouter);

	var _jsrMocks = __webpack_require__(5);

	var _jsrMocks2 = _interopRequireDefault(_jsrMocks);

	var _app = __webpack_require__(6);

	var _app2 = _interopRequireDefault(_app);

	var _header = __webpack_require__(7);

	var _header2 = _interopRequireDefault(_header);

	var _card = __webpack_require__(9);

	var _card2 = _interopRequireDefault(_card);

	var _home = __webpack_require__(11);

	var _home2 = _interopRequireDefault(_home);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	__webpack_require__(18);

	//import toastr from 'toastr';


	_angular2.default.element(document).ready(function () {
	  _angular2.default.module('app', [_angularUiRouter2.default, _jsrMocks2.default, _header2.default, _home2.default, _card2.default])
	  //.constant('toastr',toastr)
	  .config(_app2.default);

	  _angular2.default.bootstrap(document, ['app']);
	});

/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */
/***/ function(module, exports) {

	/**
	 * State-based routing for AngularJS
	 * @version v0.3.1
	 * @link http://angular-ui.github.com/
	 * @license MIT License, http://www.opensource.org/licenses/MIT
	 */

	/* commonjs package manager support (eg componentjs) */
	if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
	  module.exports = 'ui.router';
	}

	(function (window, angular, undefined) {
	/*jshint globalstrict:true*/
	/*global angular:false*/
	'use strict';

	var isDefined = angular.isDefined,
	    isFunction = angular.isFunction,
	    isString = angular.isString,
	    isObject = angular.isObject,
	    isArray = angular.isArray,
	    forEach = angular.forEach,
	    extend = angular.extend,
	    copy = angular.copy,
	    toJson = angular.toJson;

	function inherit(parent, extra) {
	  return extend(new (extend(function() {}, { prototype: parent }))(), extra);
	}

	function merge(dst) {
	  forEach(arguments, function(obj) {
	    if (obj !== dst) {
	      forEach(obj, function(value, key) {
	        if (!dst.hasOwnProperty(key)) dst[key] = value;
	      });
	    }
	  });
	  return dst;
	}

	/**
	 * Finds the common ancestor path between two states.
	 *
	 * @param {Object} first The first state.
	 * @param {Object} second The second state.
	 * @return {Array} Returns an array of state names in descending order, not including the root.
	 */
	function ancestors(first, second) {
	  var path = [];

	  for (var n in first.path) {
	    if (first.path[n] !== second.path[n]) break;
	    path.push(first.path[n]);
	  }
	  return path;
	}

	/**
	 * IE8-safe wrapper for `Object.keys()`.
	 *
	 * @param {Object} object A JavaScript object.
	 * @return {Array} Returns the keys of the object as an array.
	 */
	function objectKeys(object) {
	  if (Object.keys) {
	    return Object.keys(object);
	  }
	  var result = [];

	  forEach(object, function(val, key) {
	    result.push(key);
	  });
	  return result;
	}

	/**
	 * IE8-safe wrapper for `Array.prototype.indexOf()`.
	 *
	 * @param {Array} array A JavaScript array.
	 * @param {*} value A value to search the array for.
	 * @return {Number} Returns the array index value of `value`, or `-1` if not present.
	 */
	function indexOf(array, value) {
	  if (Array.prototype.indexOf) {
	    return array.indexOf(value, Number(arguments[2]) || 0);
	  }
	  var len = array.length >>> 0, from = Number(arguments[2]) || 0;
	  from = (from < 0) ? Math.ceil(from) : Math.floor(from);

	  if (from < 0) from += len;

	  for (; from < len; from++) {
	    if (from in array && array[from] === value) return from;
	  }
	  return -1;
	}

	/**
	 * Merges a set of parameters with all parameters inherited between the common parents of the
	 * current state and a given destination state.
	 *
	 * @param {Object} currentParams The value of the current state parameters ($stateParams).
	 * @param {Object} newParams The set of parameters which will be composited with inherited params.
	 * @param {Object} $current Internal definition of object representing the current state.
	 * @param {Object} $to Internal definition of object representing state to transition to.
	 */
	function inheritParams(currentParams, newParams, $current, $to) {
	  var parents = ancestors($current, $to), parentParams, inherited = {}, inheritList = [];

	  for (var i in parents) {
	    if (!parents[i] || !parents[i].params) continue;
	    parentParams = objectKeys(parents[i].params);
	    if (!parentParams.length) continue;

	    for (var j in parentParams) {
	      if (indexOf(inheritList, parentParams[j]) >= 0) continue;
	      inheritList.push(parentParams[j]);
	      inherited[parentParams[j]] = currentParams[parentParams[j]];
	    }
	  }
	  return extend({}, inherited, newParams);
	}

	/**
	 * Performs a non-strict comparison of the subset of two objects, defined by a list of keys.
	 *
	 * @param {Object} a The first object.
	 * @param {Object} b The second object.
	 * @param {Array} keys The list of keys within each object to compare. If the list is empty or not specified,
	 *                     it defaults to the list of keys in `a`.
	 * @return {Boolean} Returns `true` if the keys match, otherwise `false`.
	 */
	function equalForKeys(a, b, keys) {
	  if (!keys) {
	    keys = [];
	    for (var n in a) keys.push(n); // Used instead of Object.keys() for IE8 compatibility
	  }

	  for (var i=0; i<keys.length; i++) {
	    var k = keys[i];
	    if (a[k] != b[k]) return false; // Not '===', values aren't necessarily normalized
	  }
	  return true;
	}

	/**
	 * Returns the subset of an object, based on a list of keys.
	 *
	 * @param {Array} keys
	 * @param {Object} values
	 * @return {Boolean} Returns a subset of `values`.
	 */
	function filterByKeys(keys, values) {
	  var filtered = {};

	  forEach(keys, function (name) {
	    filtered[name] = values[name];
	  });
	  return filtered;
	}

	// like _.indexBy
	// when you know that your index values will be unique, or you want last-one-in to win
	function indexBy(array, propName) {
	  var result = {};
	  forEach(array, function(item) {
	    result[item[propName]] = item;
	  });
	  return result;
	}

	// extracted from underscore.js
	// Return a copy of the object only containing the whitelisted properties.
	function pick(obj) {
	  var copy = {};
	  var keys = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
	  forEach(keys, function(key) {
	    if (key in obj) copy[key] = obj[key];
	  });
	  return copy;
	}

	// extracted from underscore.js
	// Return a copy of the object omitting the blacklisted properties.
	function omit(obj) {
	  var copy = {};
	  var keys = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
	  for (var key in obj) {
	    if (indexOf(keys, key) == -1) copy[key] = obj[key];
	  }
	  return copy;
	}

	function pluck(collection, key) {
	  var result = isArray(collection) ? [] : {};

	  forEach(collection, function(val, i) {
	    result[i] = isFunction(key) ? key(val) : val[key];
	  });
	  return result;
	}

	function filter(collection, callback) {
	  var array = isArray(collection);
	  var result = array ? [] : {};
	  forEach(collection, function(val, i) {
	    if (callback(val, i)) {
	      result[array ? result.length : i] = val;
	    }
	  });
	  return result;
	}

	function map(collection, callback) {
	  var result = isArray(collection) ? [] : {};

	  forEach(collection, function(val, i) {
	    result[i] = callback(val, i);
	  });
	  return result;
	}

	/**
	 * @ngdoc overview
	 * @name ui.router.util
	 *
	 * @description
	 * # ui.router.util sub-module
	 *
	 * This module is a dependency of other sub-modules. Do not include this module as a dependency
	 * in your angular app (use {@link ui.router} module instead).
	 *
	 */
	angular.module('ui.router.util', ['ng']);

	/**
	 * @ngdoc overview
	 * @name ui.router.router
	 * 
	 * @requires ui.router.util
	 *
	 * @description
	 * # ui.router.router sub-module
	 *
	 * This module is a dependency of other sub-modules. Do not include this module as a dependency
	 * in your angular app (use {@link ui.router} module instead).
	 */
	angular.module('ui.router.router', ['ui.router.util']);

	/**
	 * @ngdoc overview
	 * @name ui.router.state
	 * 
	 * @requires ui.router.router
	 * @requires ui.router.util
	 *
	 * @description
	 * # ui.router.state sub-module
	 *
	 * This module is a dependency of the main ui.router module. Do not include this module as a dependency
	 * in your angular app (use {@link ui.router} module instead).
	 * 
	 */
	angular.module('ui.router.state', ['ui.router.router', 'ui.router.util']);

	/**
	 * @ngdoc overview
	 * @name ui.router
	 *
	 * @requires ui.router.state
	 *
	 * @description
	 * # ui.router
	 * 
	 * ## The main module for ui.router 
	 * There are several sub-modules included with the ui.router module, however only this module is needed
	 * as a dependency within your angular app. The other modules are for organization purposes. 
	 *
	 * The modules are:
	 * * ui.router - the main "umbrella" module
	 * * ui.router.router - 
	 * 
	 * *You'll need to include **only** this module as the dependency within your angular app.*
	 * 
	 * <pre>
	 * <!doctype html>
	 * <html ng-app="myApp">
	 * <head>
	 *   <script src="js/angular.js"></script>
	 *   <!-- Include the ui-router script -->
	 *   <script src="js/angular-ui-router.min.js"></script>
	 *   <script>
	 *     // ...and add 'ui.router' as a dependency
	 *     var myApp = angular.module('myApp', ['ui.router']);
	 *   </script>
	 * </head>
	 * <body>
	 * </body>
	 * </html>
	 * </pre>
	 */
	angular.module('ui.router', ['ui.router.state']);

	angular.module('ui.router.compat', ['ui.router']);

	/**
	 * @ngdoc object
	 * @name ui.router.util.$resolve
	 *
	 * @requires $q
	 * @requires $injector
	 *
	 * @description
	 * Manages resolution of (acyclic) graphs of promises.
	 */
	$Resolve.$inject = ['$q', '$injector'];
	function $Resolve(  $q,    $injector) {
	  
	  var VISIT_IN_PROGRESS = 1,
	      VISIT_DONE = 2,
	      NOTHING = {},
	      NO_DEPENDENCIES = [],
	      NO_LOCALS = NOTHING,
	      NO_PARENT = extend($q.when(NOTHING), { $$promises: NOTHING, $$values: NOTHING });
	  

	  /**
	   * @ngdoc function
	   * @name ui.router.util.$resolve#study
	   * @methodOf ui.router.util.$resolve
	   *
	   * @description
	   * Studies a set of invocables that are likely to be used multiple times.
	   * <pre>
	   * $resolve.study(invocables)(locals, parent, self)
	   * </pre>
	   * is equivalent to
	   * <pre>
	   * $resolve.resolve(invocables, locals, parent, self)
	   * </pre>
	   * but the former is more efficient (in fact `resolve` just calls `study` 
	   * internally).
	   *
	   * @param {object} invocables Invocable objects
	   * @return {function} a function to pass in locals, parent and self
	   */
	  this.study = function (invocables) {
	    if (!isObject(invocables)) throw new Error("'invocables' must be an object");
	    var invocableKeys = objectKeys(invocables || {});
	    
	    // Perform a topological sort of invocables to build an ordered plan
	    var plan = [], cycle = [], visited = {};
	    function visit(value, key) {
	      if (visited[key] === VISIT_DONE) return;
	      
	      cycle.push(key);
	      if (visited[key] === VISIT_IN_PROGRESS) {
	        cycle.splice(0, indexOf(cycle, key));
	        throw new Error("Cyclic dependency: " + cycle.join(" -> "));
	      }
	      visited[key] = VISIT_IN_PROGRESS;
	      
	      if (isString(value)) {
	        plan.push(key, [ function() { return $injector.get(value); }], NO_DEPENDENCIES);
	      } else {
	        var params = $injector.annotate(value);
	        forEach(params, function (param) {
	          if (param !== key && invocables.hasOwnProperty(param)) visit(invocables[param], param);
	        });
	        plan.push(key, value, params);
	      }
	      
	      cycle.pop();
	      visited[key] = VISIT_DONE;
	    }
	    forEach(invocables, visit);
	    invocables = cycle = visited = null; // plan is all that's required
	    
	    function isResolve(value) {
	      return isObject(value) && value.then && value.$$promises;
	    }
	    
	    return function (locals, parent, self) {
	      if (isResolve(locals) && self === undefined) {
	        self = parent; parent = locals; locals = null;
	      }
	      if (!locals) locals = NO_LOCALS;
	      else if (!isObject(locals)) {
	        throw new Error("'locals' must be an object");
	      }       
	      if (!parent) parent = NO_PARENT;
	      else if (!isResolve(parent)) {
	        throw new Error("'parent' must be a promise returned by $resolve.resolve()");
	      }
	      
	      // To complete the overall resolution, we have to wait for the parent
	      // promise and for the promise for each invokable in our plan.
	      var resolution = $q.defer(),
	          result = resolution.promise,
	          promises = result.$$promises = {},
	          values = extend({}, locals),
	          wait = 1 + plan.length/3,
	          merged = false;
	          
	      function done() {
	        // Merge parent values we haven't got yet and publish our own $$values
	        if (!--wait) {
	          if (!merged) merge(values, parent.$$values); 
	          result.$$values = values;
	          result.$$promises = result.$$promises || true; // keep for isResolve()
	          delete result.$$inheritedValues;
	          resolution.resolve(values);
	        }
	      }
	      
	      function fail(reason) {
	        result.$$failure = reason;
	        resolution.reject(reason);
	      }

	      // Short-circuit if parent has already failed
	      if (isDefined(parent.$$failure)) {
	        fail(parent.$$failure);
	        return result;
	      }
	      
	      if (parent.$$inheritedValues) {
	        merge(values, omit(parent.$$inheritedValues, invocableKeys));
	      }

	      // Merge parent values if the parent has already resolved, or merge
	      // parent promises and wait if the parent resolve is still in progress.
	      extend(promises, parent.$$promises);
	      if (parent.$$values) {
	        merged = merge(values, omit(parent.$$values, invocableKeys));
	        result.$$inheritedValues = omit(parent.$$values, invocableKeys);
	        done();
	      } else {
	        if (parent.$$inheritedValues) {
	          result.$$inheritedValues = omit(parent.$$inheritedValues, invocableKeys);
	        }        
	        parent.then(done, fail);
	      }
	      
	      // Process each invocable in the plan, but ignore any where a local of the same name exists.
	      for (var i=0, ii=plan.length; i<ii; i+=3) {
	        if (locals.hasOwnProperty(plan[i])) done();
	        else invoke(plan[i], plan[i+1], plan[i+2]);
	      }
	      
	      function invoke(key, invocable, params) {
	        // Create a deferred for this invocation. Failures will propagate to the resolution as well.
	        var invocation = $q.defer(), waitParams = 0;
	        function onfailure(reason) {
	          invocation.reject(reason);
	          fail(reason);
	        }
	        // Wait for any parameter that we have a promise for (either from parent or from this
	        // resolve; in that case study() will have made sure it's ordered before us in the plan).
	        forEach(params, function (dep) {
	          if (promises.hasOwnProperty(dep) && !locals.hasOwnProperty(dep)) {
	            waitParams++;
	            promises[dep].then(function (result) {
	              values[dep] = result;
	              if (!(--waitParams)) proceed();
	            }, onfailure);
	          }
	        });
	        if (!waitParams) proceed();
	        function proceed() {
	          if (isDefined(result.$$failure)) return;
	          try {
	            invocation.resolve($injector.invoke(invocable, self, values));
	            invocation.promise.then(function (result) {
	              values[key] = result;
	              done();
	            }, onfailure);
	          } catch (e) {
	            onfailure(e);
	          }
	        }
	        // Publish promise synchronously; invocations further down in the plan may depend on it.
	        promises[key] = invocation.promise;
	      }
	      
	      return result;
	    };
	  };
	  
	  /**
	   * @ngdoc function
	   * @name ui.router.util.$resolve#resolve
	   * @methodOf ui.router.util.$resolve
	   *
	   * @description
	   * Resolves a set of invocables. An invocable is a function to be invoked via 
	   * `$injector.invoke()`, and can have an arbitrary number of dependencies. 
	   * An invocable can either return a value directly,
	   * or a `$q` promise. If a promise is returned it will be resolved and the 
	   * resulting value will be used instead. Dependencies of invocables are resolved 
	   * (in this order of precedence)
	   *
	   * - from the specified `locals`
	   * - from another invocable that is part of this `$resolve` call
	   * - from an invocable that is inherited from a `parent` call to `$resolve` 
	   *   (or recursively
	   * - from any ancestor `$resolve` of that parent).
	   *
	   * The return value of `$resolve` is a promise for an object that contains 
	   * (in this order of precedence)
	   *
	   * - any `locals` (if specified)
	   * - the resolved return values of all injectables
	   * - any values inherited from a `parent` call to `$resolve` (if specified)
	   *
	   * The promise will resolve after the `parent` promise (if any) and all promises 
	   * returned by injectables have been resolved. If any invocable 
	   * (or `$injector.invoke`) throws an exception, or if a promise returned by an 
	   * invocable is rejected, the `$resolve` promise is immediately rejected with the 
	   * same error. A rejection of a `parent` promise (if specified) will likewise be 
	   * propagated immediately. Once the `$resolve` promise has been rejected, no 
	   * further invocables will be called.
	   * 
	   * Cyclic dependencies between invocables are not permitted and will cause `$resolve`
	   * to throw an error. As a special case, an injectable can depend on a parameter 
	   * with the same name as the injectable, which will be fulfilled from the `parent` 
	   * injectable of the same name. This allows inherited values to be decorated. 
	   * Note that in this case any other injectable in the same `$resolve` with the same
	   * dependency would see the decorated value, not the inherited value.
	   *
	   * Note that missing dependencies -- unlike cyclic dependencies -- will cause an 
	   * (asynchronous) rejection of the `$resolve` promise rather than a (synchronous) 
	   * exception.
	   *
	   * Invocables are invoked eagerly as soon as all dependencies are available. 
	   * This is true even for dependencies inherited from a `parent` call to `$resolve`.
	   *
	   * As a special case, an invocable can be a string, in which case it is taken to 
	   * be a service name to be passed to `$injector.get()`. This is supported primarily 
	   * for backwards-compatibility with the `resolve` property of `$routeProvider` 
	   * routes.
	   *
	   * @param {object} invocables functions to invoke or 
	   * `$injector` services to fetch.
	   * @param {object} locals  values to make available to the injectables
	   * @param {object} parent  a promise returned by another call to `$resolve`.
	   * @param {object} self  the `this` for the invoked methods
	   * @return {object} Promise for an object that contains the resolved return value
	   * of all invocables, as well as any inherited and local values.
	   */
	  this.resolve = function (invocables, locals, parent, self) {
	    return this.study(invocables)(locals, parent, self);
	  };
	}

	angular.module('ui.router.util').service('$resolve', $Resolve);


	/**
	 * @ngdoc object
	 * @name ui.router.util.$templateFactory
	 *
	 * @requires $http
	 * @requires $templateCache
	 * @requires $injector
	 *
	 * @description
	 * Service. Manages loading of templates.
	 */
	$TemplateFactory.$inject = ['$http', '$templateCache', '$injector'];
	function $TemplateFactory(  $http,   $templateCache,   $injector) {

	  /**
	   * @ngdoc function
	   * @name ui.router.util.$templateFactory#fromConfig
	   * @methodOf ui.router.util.$templateFactory
	   *
	   * @description
	   * Creates a template from a configuration object. 
	   *
	   * @param {object} config Configuration object for which to load a template. 
	   * The following properties are search in the specified order, and the first one 
	   * that is defined is used to create the template:
	   *
	   * @param {string|object} config.template html string template or function to 
	   * load via {@link ui.router.util.$templateFactory#fromString fromString}.
	   * @param {string|object} config.templateUrl url to load or a function returning 
	   * the url to load via {@link ui.router.util.$templateFactory#fromUrl fromUrl}.
	   * @param {Function} config.templateProvider function to invoke via 
	   * {@link ui.router.util.$templateFactory#fromProvider fromProvider}.
	   * @param {object} params  Parameters to pass to the template function.
	   * @param {object} locals Locals to pass to `invoke` if the template is loaded 
	   * via a `templateProvider`. Defaults to `{ params: params }`.
	   *
	   * @return {string|object}  The template html as a string, or a promise for 
	   * that string,or `null` if no template is configured.
	   */
	  this.fromConfig = function (config, params, locals) {
	    return (
	      isDefined(config.template) ? this.fromString(config.template, params) :
	      isDefined(config.templateUrl) ? this.fromUrl(config.templateUrl, params) :
	      isDefined(config.templateProvider) ? this.fromProvider(config.templateProvider, params, locals) :
	      null
	    );
	  };

	  /**
	   * @ngdoc function
	   * @name ui.router.util.$templateFactory#fromString
	   * @methodOf ui.router.util.$templateFactory
	   *
	   * @description
	   * Creates a template from a string or a function returning a string.
	   *
	   * @param {string|object} template html template as a string or function that 
	   * returns an html template as a string.
	   * @param {object} params Parameters to pass to the template function.
	   *
	   * @return {string|object} The template html as a string, or a promise for that 
	   * string.
	   */
	  this.fromString = function (template, params) {
	    return isFunction(template) ? template(params) : template;
	  };

	  /**
	   * @ngdoc function
	   * @name ui.router.util.$templateFactory#fromUrl
	   * @methodOf ui.router.util.$templateFactory
	   * 
	   * @description
	   * Loads a template from the a URL via `$http` and `$templateCache`.
	   *
	   * @param {string|Function} url url of the template to load, or a function 
	   * that returns a url.
	   * @param {Object} params Parameters to pass to the url function.
	   * @return {string|Promise.<string>} The template html as a string, or a promise 
	   * for that string.
	   */
	  this.fromUrl = function (url, params) {
	    if (isFunction(url)) url = url(params);
	    if (url == null) return null;
	    else return $http
	        .get(url, { cache: $templateCache, headers: { Accept: 'text/html' }})
	        .then(function(response) { return response.data; });
	  };

	  /**
	   * @ngdoc function
	   * @name ui.router.util.$templateFactory#fromProvider
	   * @methodOf ui.router.util.$templateFactory
	   *
	   * @description
	   * Creates a template by invoking an injectable provider function.
	   *
	   * @param {Function} provider Function to invoke via `$injector.invoke`
	   * @param {Object} params Parameters for the template.
	   * @param {Object} locals Locals to pass to `invoke`. Defaults to 
	   * `{ params: params }`.
	   * @return {string|Promise.<string>} The template html as a string, or a promise 
	   * for that string.
	   */
	  this.fromProvider = function (provider, params, locals) {
	    return $injector.invoke(provider, null, locals || { params: params });
	  };
	}

	angular.module('ui.router.util').service('$templateFactory', $TemplateFactory);

	var $$UMFP; // reference to $UrlMatcherFactoryProvider

	/**
	 * @ngdoc object
	 * @name ui.router.util.type:UrlMatcher
	 *
	 * @description
	 * Matches URLs against patterns and extracts named parameters from the path or the search
	 * part of the URL. A URL pattern consists of a path pattern, optionally followed by '?' and a list
	 * of search parameters. Multiple search parameter names are separated by '&'. Search parameters
	 * do not influence whether or not a URL is matched, but their values are passed through into
	 * the matched parameters returned by {@link ui.router.util.type:UrlMatcher#methods_exec exec}.
	 *
	 * Path parameter placeholders can be specified using simple colon/catch-all syntax or curly brace
	 * syntax, which optionally allows a regular expression for the parameter to be specified:
	 *
	 * * `':'` name - colon placeholder
	 * * `'*'` name - catch-all placeholder
	 * * `'{' name '}'` - curly placeholder
	 * * `'{' name ':' regexp|type '}'` - curly placeholder with regexp or type name. Should the
	 *   regexp itself contain curly braces, they must be in matched pairs or escaped with a backslash.
	 *
	 * Parameter names may contain only word characters (latin letters, digits, and underscore) and
	 * must be unique within the pattern (across both path and search parameters). For colon
	 * placeholders or curly placeholders without an explicit regexp, a path parameter matches any
	 * number of characters other than '/'. For catch-all placeholders the path parameter matches
	 * any number of characters.
	 *
	 * Examples:
	 *
	 * * `'/hello/'` - Matches only if the path is exactly '/hello/'. There is no special treatment for
	 *   trailing slashes, and patterns have to match the entire path, not just a prefix.
	 * * `'/user/:id'` - Matches '/user/bob' or '/user/1234!!!' or even '/user/' but not '/user' or
	 *   '/user/bob/details'. The second path segment will be captured as the parameter 'id'.
	 * * `'/user/{id}'` - Same as the previous example, but using curly brace syntax.
	 * * `'/user/{id:[^/]*}'` - Same as the previous example.
	 * * `'/user/{id:[0-9a-fA-F]{1,8}}'` - Similar to the previous example, but only matches if the id
	 *   parameter consists of 1 to 8 hex digits.
	 * * `'/files/{path:.*}'` - Matches any URL starting with '/files/' and captures the rest of the
	 *   path into the parameter 'path'.
	 * * `'/files/*path'` - ditto.
	 * * `'/calendar/{start:date}'` - Matches "/calendar/2014-11-12" (because the pattern defined
	 *   in the built-in  `date` Type matches `2014-11-12`) and provides a Date object in $stateParams.start
	 *
	 * @param {string} pattern  The pattern to compile into a matcher.
	 * @param {Object} config  A configuration object hash:
	 * @param {Object=} parentMatcher Used to concatenate the pattern/config onto
	 *   an existing UrlMatcher
	 *
	 * * `caseInsensitive` - `true` if URL matching should be case insensitive, otherwise `false`, the default value (for backward compatibility) is `false`.
	 * * `strict` - `false` if matching against a URL with a trailing slash should be treated as equivalent to a URL without a trailing slash, the default value is `true`.
	 *
	 * @property {string} prefix  A static prefix of this pattern. The matcher guarantees that any
	 *   URL matching this matcher (i.e. any string for which {@link ui.router.util.type:UrlMatcher#methods_exec exec()} returns
	 *   non-null) will start with this prefix.
	 *
	 * @property {string} source  The pattern that was passed into the constructor
	 *
	 * @property {string} sourcePath  The path portion of the source property
	 *
	 * @property {string} sourceSearch  The search portion of the source property
	 *
	 * @property {string} regex  The constructed regex that will be used to match against the url when
	 *   it is time to determine which url will match.
	 *
	 * @returns {Object}  New `UrlMatcher` object
	 */
	function UrlMatcher(pattern, config, parentMatcher) {
	  config = extend({ params: {} }, isObject(config) ? config : {});

	  // Find all placeholders and create a compiled pattern, using either classic or curly syntax:
	  //   '*' name
	  //   ':' name
	  //   '{' name '}'
	  //   '{' name ':' regexp '}'
	  // The regular expression is somewhat complicated due to the need to allow curly braces
	  // inside the regular expression. The placeholder regexp breaks down as follows:
	  //    ([:*])([\w\[\]]+)              - classic placeholder ($1 / $2) (search version has - for snake-case)
	  //    \{([\w\[\]]+)(?:\:\s*( ... ))?\}  - curly brace placeholder ($3) with optional regexp/type ... ($4) (search version has - for snake-case
	  //    (?: ... | ... | ... )+         - the regexp consists of any number of atoms, an atom being either
	  //    [^{}\\]+                       - anything other than curly braces or backslash
	  //    \\.                            - a backslash escape
	  //    \{(?:[^{}\\]+|\\.)*\}          - a matched set of curly braces containing other atoms
	  var placeholder       = /([:*])([\w\[\]]+)|\{([\w\[\]]+)(?:\:\s*((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g,
	      searchPlaceholder = /([:]?)([\w\[\].-]+)|\{([\w\[\].-]+)(?:\:\s*((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g,
	      compiled = '^', last = 0, m,
	      segments = this.segments = [],
	      parentParams = parentMatcher ? parentMatcher.params : {},
	      params = this.params = parentMatcher ? parentMatcher.params.$$new() : new $$UMFP.ParamSet(),
	      paramNames = [];

	  function addParameter(id, type, config, location) {
	    paramNames.push(id);
	    if (parentParams[id]) return parentParams[id];
	    if (!/^\w+([-.]+\w+)*(?:\[\])?$/.test(id)) throw new Error("Invalid parameter name '" + id + "' in pattern '" + pattern + "'");
	    if (params[id]) throw new Error("Duplicate parameter name '" + id + "' in pattern '" + pattern + "'");
	    params[id] = new $$UMFP.Param(id, type, config, location);
	    return params[id];
	  }

	  function quoteRegExp(string, pattern, squash, optional) {
	    var surroundPattern = ['',''], result = string.replace(/[\\\[\]\^$*+?.()|{}]/g, "\\$&");
	    if (!pattern) return result;
	    switch(squash) {
	      case false: surroundPattern = ['(', ')' + (optional ? "?" : "")]; break;
	      case true:
	        result = result.replace(/\/$/, '');
	        surroundPattern = ['(?:\/(', ')|\/)?'];
	      break;
	      default:    surroundPattern = ['(' + squash + "|", ')?']; break;
	    }
	    return result + surroundPattern[0] + pattern + surroundPattern[1];
	  }

	  this.source = pattern;

	  // Split into static segments separated by path parameter placeholders.
	  // The number of segments is always 1 more than the number of parameters.
	  function matchDetails(m, isSearch) {
	    var id, regexp, segment, type, cfg, arrayMode;
	    id          = m[2] || m[3]; // IE[78] returns '' for unmatched groups instead of null
	    cfg         = config.params[id];
	    segment     = pattern.substring(last, m.index);
	    regexp      = isSearch ? m[4] : m[4] || (m[1] == '*' ? '.*' : null);

	    if (regexp) {
	      type      = $$UMFP.type(regexp) || inherit($$UMFP.type("string"), { pattern: new RegExp(regexp, config.caseInsensitive ? 'i' : undefined) });
	    }

	    return {
	      id: id, regexp: regexp, segment: segment, type: type, cfg: cfg
	    };
	  }

	  var p, param, segment;
	  while ((m = placeholder.exec(pattern))) {
	    p = matchDetails(m, false);
	    if (p.segment.indexOf('?') >= 0) break; // we're into the search part

	    param = addParameter(p.id, p.type, p.cfg, "path");
	    compiled += quoteRegExp(p.segment, param.type.pattern.source, param.squash, param.isOptional);
	    segments.push(p.segment);
	    last = placeholder.lastIndex;
	  }
	  segment = pattern.substring(last);

	  // Find any search parameter names and remove them from the last segment
	  var i = segment.indexOf('?');

	  if (i >= 0) {
	    var search = this.sourceSearch = segment.substring(i);
	    segment = segment.substring(0, i);
	    this.sourcePath = pattern.substring(0, last + i);

	    if (search.length > 0) {
	      last = 0;
	      while ((m = searchPlaceholder.exec(search))) {
	        p = matchDetails(m, true);
	        param = addParameter(p.id, p.type, p.cfg, "search");
	        last = placeholder.lastIndex;
	        // check if ?&
	      }
	    }
	  } else {
	    this.sourcePath = pattern;
	    this.sourceSearch = '';
	  }

	  compiled += quoteRegExp(segment) + (config.strict === false ? '\/?' : '') + '$';
	  segments.push(segment);

	  this.regexp = new RegExp(compiled, config.caseInsensitive ? 'i' : undefined);
	  this.prefix = segments[0];
	  this.$$paramNames = paramNames;
	}

	/**
	 * @ngdoc function
	 * @name ui.router.util.type:UrlMatcher#concat
	 * @methodOf ui.router.util.type:UrlMatcher
	 *
	 * @description
	 * Returns a new matcher for a pattern constructed by appending the path part and adding the
	 * search parameters of the specified pattern to this pattern. The current pattern is not
	 * modified. This can be understood as creating a pattern for URLs that are relative to (or
	 * suffixes of) the current pattern.
	 *
	 * @example
	 * The following two matchers are equivalent:
	 * <pre>
	 * new UrlMatcher('/user/{id}?q').concat('/details?date');
	 * new UrlMatcher('/user/{id}/details?q&date');
	 * </pre>
	 *
	 * @param {string} pattern  The pattern to append.
	 * @param {Object} config  An object hash of the configuration for the matcher.
	 * @returns {UrlMatcher}  A matcher for the concatenated pattern.
	 */
	UrlMatcher.prototype.concat = function (pattern, config) {
	  // Because order of search parameters is irrelevant, we can add our own search
	  // parameters to the end of the new pattern. Parse the new pattern by itself
	  // and then join the bits together, but it's much easier to do this on a string level.
	  var defaultConfig = {
	    caseInsensitive: $$UMFP.caseInsensitive(),
	    strict: $$UMFP.strictMode(),
	    squash: $$UMFP.defaultSquashPolicy()
	  };
	  return new UrlMatcher(this.sourcePath + pattern + this.sourceSearch, extend(defaultConfig, config), this);
	};

	UrlMatcher.prototype.toString = function () {
	  return this.source;
	};

	/**
	 * @ngdoc function
	 * @name ui.router.util.type:UrlMatcher#exec
	 * @methodOf ui.router.util.type:UrlMatcher
	 *
	 * @description
	 * Tests the specified path against this matcher, and returns an object containing the captured
	 * parameter values, or null if the path does not match. The returned object contains the values
	 * of any search parameters that are mentioned in the pattern, but their value may be null if
	 * they are not present in `searchParams`. This means that search parameters are always treated
	 * as optional.
	 *
	 * @example
	 * <pre>
	 * new UrlMatcher('/user/{id}?q&r').exec('/user/bob', {
	 *   x: '1', q: 'hello'
	 * });
	 * // returns { id: 'bob', q: 'hello', r: null }
	 * </pre>
	 *
	 * @param {string} path  The URL path to match, e.g. `$location.path()`.
	 * @param {Object} searchParams  URL search parameters, e.g. `$location.search()`.
	 * @returns {Object}  The captured parameter values.
	 */
	UrlMatcher.prototype.exec = function (path, searchParams) {
	  var m = this.regexp.exec(path);
	  if (!m) return null;
	  searchParams = searchParams || {};

	  var paramNames = this.parameters(), nTotal = paramNames.length,
	    nPath = this.segments.length - 1,
	    values = {}, i, j, cfg, paramName;

	  if (nPath !== m.length - 1) throw new Error("Unbalanced capture group in route '" + this.source + "'");

	  function decodePathArray(string) {
	    function reverseString(str) { return str.split("").reverse().join(""); }
	    function unquoteDashes(str) { return str.replace(/\\-/g, "-"); }

	    var split = reverseString(string).split(/-(?!\\)/);
	    var allReversed = map(split, reverseString);
	    return map(allReversed, unquoteDashes).reverse();
	  }

	  var param, paramVal;
	  for (i = 0; i < nPath; i++) {
	    paramName = paramNames[i];
	    param = this.params[paramName];
	    paramVal = m[i+1];
	    // if the param value matches a pre-replace pair, replace the value before decoding.
	    for (j = 0; j < param.replace.length; j++) {
	      if (param.replace[j].from === paramVal) paramVal = param.replace[j].to;
	    }
	    if (paramVal && param.array === true) paramVal = decodePathArray(paramVal);
	    if (isDefined(paramVal)) paramVal = param.type.decode(paramVal);
	    values[paramName] = param.value(paramVal);
	  }
	  for (/**/; i < nTotal; i++) {
	    paramName = paramNames[i];
	    values[paramName] = this.params[paramName].value(searchParams[paramName]);
	    param = this.params[paramName];
	    paramVal = searchParams[paramName];
	    for (j = 0; j < param.replace.length; j++) {
	      if (param.replace[j].from === paramVal) paramVal = param.replace[j].to;
	    }
	    if (isDefined(paramVal)) paramVal = param.type.decode(paramVal);
	    values[paramName] = param.value(paramVal);
	  }

	  return values;
	};

	/**
	 * @ngdoc function
	 * @name ui.router.util.type:UrlMatcher#parameters
	 * @methodOf ui.router.util.type:UrlMatcher
	 *
	 * @description
	 * Returns the names of all path and search parameters of this pattern in an unspecified order.
	 *
	 * @returns {Array.<string>}  An array of parameter names. Must be treated as read-only. If the
	 *    pattern has no parameters, an empty array is returned.
	 */
	UrlMatcher.prototype.parameters = function (param) {
	  if (!isDefined(param)) return this.$$paramNames;
	  return this.params[param] || null;
	};

	/**
	 * @ngdoc function
	 * @name ui.router.util.type:UrlMatcher#validates
	 * @methodOf ui.router.util.type:UrlMatcher
	 *
	 * @description
	 * Checks an object hash of parameters to validate their correctness according to the parameter
	 * types of this `UrlMatcher`.
	 *
	 * @param {Object} params The object hash of parameters to validate.
	 * @returns {boolean} Returns `true` if `params` validates, otherwise `false`.
	 */
	UrlMatcher.prototype.validates = function (params) {
	  return this.params.$$validates(params);
	};

	/**
	 * @ngdoc function
	 * @name ui.router.util.type:UrlMatcher#format
	 * @methodOf ui.router.util.type:UrlMatcher
	 *
	 * @description
	 * Creates a URL that matches this pattern by substituting the specified values
	 * for the path and search parameters. Null values for path parameters are
	 * treated as empty strings.
	 *
	 * @example
	 * <pre>
	 * new UrlMatcher('/user/{id}?q').format({ id:'bob', q:'yes' });
	 * // returns '/user/bob?q=yes'
	 * </pre>
	 *
	 * @param {Object} values  the values to substitute for the parameters in this pattern.
	 * @returns {string}  the formatted URL (path and optionally search part).
	 */
	UrlMatcher.prototype.format = function (values) {
	  values = values || {};
	  var segments = this.segments, params = this.parameters(), paramset = this.params;
	  if (!this.validates(values)) return null;

	  var i, search = false, nPath = segments.length - 1, nTotal = params.length, result = segments[0];

	  function encodeDashes(str) { // Replace dashes with encoded "\-"
	    return encodeURIComponent(str).replace(/-/g, function(c) { return '%5C%' + c.charCodeAt(0).toString(16).toUpperCase(); });
	  }

	  for (i = 0; i < nTotal; i++) {
	    var isPathParam = i < nPath;
	    var name = params[i], param = paramset[name], value = param.value(values[name]);
	    var isDefaultValue = param.isOptional && param.type.equals(param.value(), value);
	    var squash = isDefaultValue ? param.squash : false;
	    var encoded = param.type.encode(value);

	    if (isPathParam) {
	      var nextSegment = segments[i + 1];
	      var isFinalPathParam = i + 1 === nPath;

	      if (squash === false) {
	        if (encoded != null) {
	          if (isArray(encoded)) {
	            result += map(encoded, encodeDashes).join("-");
	          } else {
	            result += encodeURIComponent(encoded);
	          }
	        }
	        result += nextSegment;
	      } else if (squash === true) {
	        var capture = result.match(/\/$/) ? /\/?(.*)/ : /(.*)/;
	        result += nextSegment.match(capture)[1];
	      } else if (isString(squash)) {
	        result += squash + nextSegment;
	      }

	      if (isFinalPathParam && param.squash === true && result.slice(-1) === '/') result = result.slice(0, -1);
	    } else {
	      if (encoded == null || (isDefaultValue && squash !== false)) continue;
	      if (!isArray(encoded)) encoded = [ encoded ];
	      if (encoded.length === 0) continue;
	      encoded = map(encoded, encodeURIComponent).join('&' + name + '=');
	      result += (search ? '&' : '?') + (name + '=' + encoded);
	      search = true;
	    }
	  }

	  return result;
	};

	/**
	 * @ngdoc object
	 * @name ui.router.util.type:Type
	 *
	 * @description
	 * Implements an interface to define custom parameter types that can be decoded from and encoded to
	 * string parameters matched in a URL. Used by {@link ui.router.util.type:UrlMatcher `UrlMatcher`}
	 * objects when matching or formatting URLs, or comparing or validating parameter values.
	 *
	 * See {@link ui.router.util.$urlMatcherFactory#methods_type `$urlMatcherFactory#type()`} for more
	 * information on registering custom types.
	 *
	 * @param {Object} config  A configuration object which contains the custom type definition.  The object's
	 *        properties will override the default methods and/or pattern in `Type`'s public interface.
	 * @example
	 * <pre>
	 * {
	 *   decode: function(val) { return parseInt(val, 10); },
	 *   encode: function(val) { return val && val.toString(); },
	 *   equals: function(a, b) { return this.is(a) && a === b; },
	 *   is: function(val) { return angular.isNumber(val) isFinite(val) && val % 1 === 0; },
	 *   pattern: /\d+/
	 * }
	 * </pre>
	 *
	 * @property {RegExp} pattern The regular expression pattern used to match values of this type when
	 *           coming from a substring of a URL.
	 *
	 * @returns {Object}  Returns a new `Type` object.
	 */
	function Type(config) {
	  extend(this, config);
	}

	/**
	 * @ngdoc function
	 * @name ui.router.util.type:Type#is
	 * @methodOf ui.router.util.type:Type
	 *
	 * @description
	 * Detects whether a value is of a particular type. Accepts a native (decoded) value
	 * and determines whether it matches the current `Type` object.
	 *
	 * @param {*} val  The value to check.
	 * @param {string} key  Optional. If the type check is happening in the context of a specific
	 *        {@link ui.router.util.type:UrlMatcher `UrlMatcher`} object, this is the name of the
	 *        parameter in which `val` is stored. Can be used for meta-programming of `Type` objects.
	 * @returns {Boolean}  Returns `true` if the value matches the type, otherwise `false`.
	 */
	Type.prototype.is = function(val, key) {
	  return true;
	};

	/**
	 * @ngdoc function
	 * @name ui.router.util.type:Type#encode
	 * @methodOf ui.router.util.type:Type
	 *
	 * @description
	 * Encodes a custom/native type value to a string that can be embedded in a URL. Note that the
	 * return value does *not* need to be URL-safe (i.e. passed through `encodeURIComponent()`), it
	 * only needs to be a representation of `val` that has been coerced to a string.
	 *
	 * @param {*} val  The value to encode.
	 * @param {string} key  The name of the parameter in which `val` is stored. Can be used for
	 *        meta-programming of `Type` objects.
	 * @returns {string}  Returns a string representation of `val` that can be encoded in a URL.
	 */
	Type.prototype.encode = function(val, key) {
	  return val;
	};

	/**
	 * @ngdoc function
	 * @name ui.router.util.type:Type#decode
	 * @methodOf ui.router.util.type:Type
	 *
	 * @description
	 * Converts a parameter value (from URL string or transition param) to a custom/native value.
	 *
	 * @param {string} val  The URL parameter value to decode.
	 * @param {string} key  The name of the parameter in which `val` is stored. Can be used for
	 *        meta-programming of `Type` objects.
	 * @returns {*}  Returns a custom representation of the URL parameter value.
	 */
	Type.prototype.decode = function(val, key) {
	  return val;
	};

	/**
	 * @ngdoc function
	 * @name ui.router.util.type:Type#equals
	 * @methodOf ui.router.util.type:Type
	 *
	 * @description
	 * Determines whether two decoded values are equivalent.
	 *
	 * @param {*} a  A value to compare against.
	 * @param {*} b  A value to compare against.
	 * @returns {Boolean}  Returns `true` if the values are equivalent/equal, otherwise `false`.
	 */
	Type.prototype.equals = function(a, b) {
	  return a == b;
	};

	Type.prototype.$subPattern = function() {
	  var sub = this.pattern.toString();
	  return sub.substr(1, sub.length - 2);
	};

	Type.prototype.pattern = /.*/;

	Type.prototype.toString = function() { return "{Type:" + this.name + "}"; };

	/** Given an encoded string, or a decoded object, returns a decoded object */
	Type.prototype.$normalize = function(val) {
	  return this.is(val) ? val : this.decode(val);
	};

	/*
	 * Wraps an existing custom Type as an array of Type, depending on 'mode'.
	 * e.g.:
	 * - urlmatcher pattern "/path?{queryParam[]:int}"
	 * - url: "/path?queryParam=1&queryParam=2
	 * - $stateParams.queryParam will be [1, 2]
	 * if `mode` is "auto", then
	 * - url: "/path?queryParam=1 will create $stateParams.queryParam: 1
	 * - url: "/path?queryParam=1&queryParam=2 will create $stateParams.queryParam: [1, 2]
	 */
	Type.prototype.$asArray = function(mode, isSearch) {
	  if (!mode) return this;
	  if (mode === "auto" && !isSearch) throw new Error("'auto' array mode is for query parameters only");

	  function ArrayType(type, mode) {
	    function bindTo(type, callbackName) {
	      return function() {
	        return type[callbackName].apply(type, arguments);
	      };
	    }

	    // Wrap non-array value as array
	    function arrayWrap(val) { return isArray(val) ? val : (isDefined(val) ? [ val ] : []); }
	    // Unwrap array value for "auto" mode. Return undefined for empty array.
	    function arrayUnwrap(val) {
	      switch(val.length) {
	        case 0: return undefined;
	        case 1: return mode === "auto" ? val[0] : val;
	        default: return val;
	      }
	    }
	    function falsey(val) { return !val; }

	    // Wraps type (.is/.encode/.decode) functions to operate on each value of an array
	    function arrayHandler(callback, allTruthyMode) {
	      return function handleArray(val) {
	        if (isArray(val) && val.length === 0) return val;
	        val = arrayWrap(val);
	        var result = map(val, callback);
	        if (allTruthyMode === true)
	          return filter(result, falsey).length === 0;
	        return arrayUnwrap(result);
	      };
	    }

	    // Wraps type (.equals) functions to operate on each value of an array
	    function arrayEqualsHandler(callback) {
	      return function handleArray(val1, val2) {
	        var left = arrayWrap(val1), right = arrayWrap(val2);
	        if (left.length !== right.length) return false;
	        for (var i = 0; i < left.length; i++) {
	          if (!callback(left[i], right[i])) return false;
	        }
	        return true;
	      };
	    }

	    this.encode = arrayHandler(bindTo(type, 'encode'));
	    this.decode = arrayHandler(bindTo(type, 'decode'));
	    this.is     = arrayHandler(bindTo(type, 'is'), true);
	    this.equals = arrayEqualsHandler(bindTo(type, 'equals'));
	    this.pattern = type.pattern;
	    this.$normalize = arrayHandler(bindTo(type, '$normalize'));
	    this.name = type.name;
	    this.$arrayMode = mode;
	  }

	  return new ArrayType(this, mode);
	};



	/**
	 * @ngdoc object
	 * @name ui.router.util.$urlMatcherFactory
	 *
	 * @description
	 * Factory for {@link ui.router.util.type:UrlMatcher `UrlMatcher`} instances. The factory
	 * is also available to providers under the name `$urlMatcherFactoryProvider`.
	 */
	function $UrlMatcherFactory() {
	  $$UMFP = this;

	  var isCaseInsensitive = false, isStrictMode = true, defaultSquashPolicy = false;

	  // Use tildes to pre-encode slashes.
	  // If the slashes are simply URLEncoded, the browser can choose to pre-decode them,
	  // and bidirectional encoding/decoding fails.
	  // Tilde was chosen because it's not a RFC 3986 section 2.2 Reserved Character
	  function valToString(val) { return val != null ? val.toString().replace(/~/g, "~~").replace(/\//g, "~2F") : val; }
	  function valFromString(val) { return val != null ? val.toString().replace(/~2F/g, "/").replace(/~~/g, "~") : val; }

	  var $types = {}, enqueue = true, typeQueue = [], injector, defaultTypes = {
	    "string": {
	      encode: valToString,
	      decode: valFromString,
	      // TODO: in 1.0, make string .is() return false if value is undefined/null by default.
	      // In 0.2.x, string params are optional by default for backwards compat
	      is: function(val) { return val == null || !isDefined(val) || typeof val === "string"; },
	      pattern: /[^/]*/
	    },
	    "int": {
	      encode: valToString,
	      decode: function(val) { return parseInt(val, 10); },
	      is: function(val) { return isDefined(val) && this.decode(val.toString()) === val; },
	      pattern: /\d+/
	    },
	    "bool": {
	      encode: function(val) { return val ? 1 : 0; },
	      decode: function(val) { return parseInt(val, 10) !== 0; },
	      is: function(val) { return val === true || val === false; },
	      pattern: /0|1/
	    },
	    "date": {
	      encode: function (val) {
	        if (!this.is(val))
	          return undefined;
	        return [ val.getFullYear(),
	          ('0' + (val.getMonth() + 1)).slice(-2),
	          ('0' + val.getDate()).slice(-2)
	        ].join("-");
	      },
	      decode: function (val) {
	        if (this.is(val)) return val;
	        var match = this.capture.exec(val);
	        return match ? new Date(match[1], match[2] - 1, match[3]) : undefined;
	      },
	      is: function(val) { return val instanceof Date && !isNaN(val.valueOf()); },
	      equals: function (a, b) { return this.is(a) && this.is(b) && a.toISOString() === b.toISOString(); },
	      pattern: /[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2][0-9]|3[0-1])/,
	      capture: /([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/
	    },
	    "json": {
	      encode: angular.toJson,
	      decode: angular.fromJson,
	      is: angular.isObject,
	      equals: angular.equals,
	      pattern: /[^/]*/
	    },
	    "any": { // does not encode/decode
	      encode: angular.identity,
	      decode: angular.identity,
	      equals: angular.equals,
	      pattern: /.*/
	    }
	  };

	  function getDefaultConfig() {
	    return {
	      strict: isStrictMode,
	      caseInsensitive: isCaseInsensitive
	    };
	  }

	  function isInjectable(value) {
	    return (isFunction(value) || (isArray(value) && isFunction(value[value.length - 1])));
	  }

	  /**
	   * [Internal] Get the default value of a parameter, which may be an injectable function.
	   */
	  $UrlMatcherFactory.$$getDefaultValue = function(config) {
	    if (!isInjectable(config.value)) return config.value;
	    if (!injector) throw new Error("Injectable functions cannot be called at configuration time");
	    return injector.invoke(config.value);
	  };

	  /**
	   * @ngdoc function
	   * @name ui.router.util.$urlMatcherFactory#caseInsensitive
	   * @methodOf ui.router.util.$urlMatcherFactory
	   *
	   * @description
	   * Defines whether URL matching should be case sensitive (the default behavior), or not.
	   *
	   * @param {boolean} value `false` to match URL in a case sensitive manner; otherwise `true`;
	   * @returns {boolean} the current value of caseInsensitive
	   */
	  this.caseInsensitive = function(value) {
	    if (isDefined(value))
	      isCaseInsensitive = value;
	    return isCaseInsensitive;
	  };

	  /**
	   * @ngdoc function
	   * @name ui.router.util.$urlMatcherFactory#strictMode
	   * @methodOf ui.router.util.$urlMatcherFactory
	   *
	   * @description
	   * Defines whether URLs should match trailing slashes, or not (the default behavior).
	   *
	   * @param {boolean=} value `false` to match trailing slashes in URLs, otherwise `true`.
	   * @returns {boolean} the current value of strictMode
	   */
	  this.strictMode = function(value) {
	    if (isDefined(value))
	      isStrictMode = value;
	    return isStrictMode;
	  };

	  /**
	   * @ngdoc function
	   * @name ui.router.util.$urlMatcherFactory#defaultSquashPolicy
	   * @methodOf ui.router.util.$urlMatcherFactory
	   *
	   * @description
	   * Sets the default behavior when generating or matching URLs with default parameter values.
	   *
	   * @param {string} value A string that defines the default parameter URL squashing behavior.
	   *    `nosquash`: When generating an href with a default parameter value, do not squash the parameter value from the URL
	   *    `slash`: When generating an href with a default parameter value, squash (remove) the parameter value, and, if the
	   *             parameter is surrounded by slashes, squash (remove) one slash from the URL
	   *    any other string, e.g. "~": When generating an href with a default parameter value, squash (remove)
	   *             the parameter value from the URL and replace it with this string.
	   */
	  this.defaultSquashPolicy = function(value) {
	    if (!isDefined(value)) return defaultSquashPolicy;
	    if (value !== true && value !== false && !isString(value))
	      throw new Error("Invalid squash policy: " + value + ". Valid policies: false, true, arbitrary-string");
	    defaultSquashPolicy = value;
	    return value;
	  };

	  /**
	   * @ngdoc function
	   * @name ui.router.util.$urlMatcherFactory#compile
	   * @methodOf ui.router.util.$urlMatcherFactory
	   *
	   * @description
	   * Creates a {@link ui.router.util.type:UrlMatcher `UrlMatcher`} for the specified pattern.
	   *
	   * @param {string} pattern  The URL pattern.
	   * @param {Object} config  The config object hash.
	   * @returns {UrlMatcher}  The UrlMatcher.
	   */
	  this.compile = function (pattern, config) {
	    return new UrlMatcher(pattern, extend(getDefaultConfig(), config));
	  };

	  /**
	   * @ngdoc function
	   * @name ui.router.util.$urlMatcherFactory#isMatcher
	   * @methodOf ui.router.util.$urlMatcherFactory
	   *
	   * @description
	   * Returns true if the specified object is a `UrlMatcher`, or false otherwise.
	   *
	   * @param {Object} object  The object to perform the type check against.
	   * @returns {Boolean}  Returns `true` if the object matches the `UrlMatcher` interface, by
	   *          implementing all the same methods.
	   */
	  this.isMatcher = function (o) {
	    if (!isObject(o)) return false;
	    var result = true;

	    forEach(UrlMatcher.prototype, function(val, name) {
	      if (isFunction(val)) {
	        result = result && (isDefined(o[name]) && isFunction(o[name]));
	      }
	    });
	    return result;
	  };

	  /**
	   * @ngdoc function
	   * @name ui.router.util.$urlMatcherFactory#type
	   * @methodOf ui.router.util.$urlMatcherFactory
	   *
	   * @description
	   * Registers a custom {@link ui.router.util.type:Type `Type`} object that can be used to
	   * generate URLs with typed parameters.
	   *
	   * @param {string} name  The type name.
	   * @param {Object|Function} definition   The type definition. See
	   *        {@link ui.router.util.type:Type `Type`} for information on the values accepted.
	   * @param {Object|Function} definitionFn (optional) A function that is injected before the app
	   *        runtime starts.  The result of this function is merged into the existing `definition`.
	   *        See {@link ui.router.util.type:Type `Type`} for information on the values accepted.
	   *
	   * @returns {Object}  Returns `$urlMatcherFactoryProvider`.
	   *
	   * @example
	   * This is a simple example of a custom type that encodes and decodes items from an
	   * array, using the array index as the URL-encoded value:
	   *
	   * <pre>
	   * var list = ['John', 'Paul', 'George', 'Ringo'];
	   *
	   * $urlMatcherFactoryProvider.type('listItem', {
	   *   encode: function(item) {
	   *     // Represent the list item in the URL using its corresponding index
	   *     return list.indexOf(item);
	   *   },
	   *   decode: function(item) {
	   *     // Look up the list item by index
	   *     return list[parseInt(item, 10)];
	   *   },
	   *   is: function(item) {
	   *     // Ensure the item is valid by checking to see that it appears
	   *     // in the list
	   *     return list.indexOf(item) > -1;
	   *   }
	   * });
	   *
	   * $stateProvider.state('list', {
	   *   url: "/list/{item:listItem}",
	   *   controller: function($scope, $stateParams) {
	   *     console.log($stateParams.item);
	   *   }
	   * });
	   *
	   * // ...
	   *
	   * // Changes URL to '/list/3', logs "Ringo" to the console
	   * $state.go('list', { item: "Ringo" });
	   * </pre>
	   *
	   * This is a more complex example of a type that relies on dependency injection to
	   * interact with services, and uses the parameter name from the URL to infer how to
	   * handle encoding and decoding parameter values:
	   *
	   * <pre>
	   * // Defines a custom type that gets a value from a service,
	   * // where each service gets different types of values from
	   * // a backend API:
	   * $urlMatcherFactoryProvider.type('dbObject', {}, function(Users, Posts) {
	   *
	   *   // Matches up services to URL parameter names
	   *   var services = {
	   *     user: Users,
	   *     post: Posts
	   *   };
	   *
	   *   return {
	   *     encode: function(object) {
	   *       // Represent the object in the URL using its unique ID
	   *       return object.id;
	   *     },
	   *     decode: function(value, key) {
	   *       // Look up the object by ID, using the parameter
	   *       // name (key) to call the correct service
	   *       return services[key].findById(value);
	   *     },
	   *     is: function(object, key) {
	   *       // Check that object is a valid dbObject
	   *       return angular.isObject(object) && object.id && services[key];
	   *     }
	   *     equals: function(a, b) {
	   *       // Check the equality of decoded objects by comparing
	   *       // their unique IDs
	   *       return a.id === b.id;
	   *     }
	   *   };
	   * });
	   *
	   * // In a config() block, you can then attach URLs with
	   * // type-annotated parameters:
	   * $stateProvider.state('users', {
	   *   url: "/users",
	   *   // ...
	   * }).state('users.item', {
	   *   url: "/{user:dbObject}",
	   *   controller: function($scope, $stateParams) {
	   *     // $stateParams.user will now be an object returned from
	   *     // the Users service
	   *   },
	   *   // ...
	   * });
	   * </pre>
	   */
	  this.type = function (name, definition, definitionFn) {
	    if (!isDefined(definition)) return $types[name];
	    if ($types.hasOwnProperty(name)) throw new Error("A type named '" + name + "' has already been defined.");

	    $types[name] = new Type(extend({ name: name }, definition));
	    if (definitionFn) {
	      typeQueue.push({ name: name, def: definitionFn });
	      if (!enqueue) flushTypeQueue();
	    }
	    return this;
	  };

	  // `flushTypeQueue()` waits until `$urlMatcherFactory` is injected before invoking the queued `definitionFn`s
	  function flushTypeQueue() {
	    while(typeQueue.length) {
	      var type = typeQueue.shift();
	      if (type.pattern) throw new Error("You cannot override a type's .pattern at runtime.");
	      angular.extend($types[type.name], injector.invoke(type.def));
	    }
	  }

	  // Register default types. Store them in the prototype of $types.
	  forEach(defaultTypes, function(type, name) { $types[name] = new Type(extend({name: name}, type)); });
	  $types = inherit($types, {});

	  /* No need to document $get, since it returns this */
	  this.$get = ['$injector', function ($injector) {
	    injector = $injector;
	    enqueue = false;
	    flushTypeQueue();

	    forEach(defaultTypes, function(type, name) {
	      if (!$types[name]) $types[name] = new Type(type);
	    });
	    return this;
	  }];

	  this.Param = function Param(id, type, config, location) {
	    var self = this;
	    config = unwrapShorthand(config);
	    type = getType(config, type, location);
	    var arrayMode = getArrayMode();
	    type = arrayMode ? type.$asArray(arrayMode, location === "search") : type;
	    if (type.name === "string" && !arrayMode && location === "path" && config.value === undefined)
	      config.value = ""; // for 0.2.x; in 0.3.0+ do not automatically default to ""
	    var isOptional = config.value !== undefined;
	    var squash = getSquashPolicy(config, isOptional);
	    var replace = getReplace(config, arrayMode, isOptional, squash);

	    function unwrapShorthand(config) {
	      var keys = isObject(config) ? objectKeys(config) : [];
	      var isShorthand = indexOf(keys, "value") === -1 && indexOf(keys, "type") === -1 &&
	                        indexOf(keys, "squash") === -1 && indexOf(keys, "array") === -1;
	      if (isShorthand) config = { value: config };
	      config.$$fn = isInjectable(config.value) ? config.value : function () { return config.value; };
	      return config;
	    }

	    function getType(config, urlType, location) {
	      if (config.type && urlType) throw new Error("Param '"+id+"' has two type configurations.");
	      if (urlType) return urlType;
	      if (!config.type) return (location === "config" ? $types.any : $types.string);

	      if (angular.isString(config.type))
	        return $types[config.type];
	      if (config.type instanceof Type)
	        return config.type;
	      return new Type(config.type);
	    }

	    // array config: param name (param[]) overrides default settings.  explicit config overrides param name.
	    function getArrayMode() {
	      var arrayDefaults = { array: (location === "search" ? "auto" : false) };
	      var arrayParamNomenclature = id.match(/\[\]$/) ? { array: true } : {};
	      return extend(arrayDefaults, arrayParamNomenclature, config).array;
	    }

	    /**
	     * returns false, true, or the squash value to indicate the "default parameter url squash policy".
	     */
	    function getSquashPolicy(config, isOptional) {
	      var squash = config.squash;
	      if (!isOptional || squash === false) return false;
	      if (!isDefined(squash) || squash == null) return defaultSquashPolicy;
	      if (squash === true || isString(squash)) return squash;
	      throw new Error("Invalid squash policy: '" + squash + "'. Valid policies: false, true, or arbitrary string");
	    }

	    function getReplace(config, arrayMode, isOptional, squash) {
	      var replace, configuredKeys, defaultPolicy = [
	        { from: "",   to: (isOptional || arrayMode ? undefined : "") },
	        { from: null, to: (isOptional || arrayMode ? undefined : "") }
	      ];
	      replace = isArray(config.replace) ? config.replace : [];
	      if (isString(squash))
	        replace.push({ from: squash, to: undefined });
	      configuredKeys = map(replace, function(item) { return item.from; } );
	      return filter(defaultPolicy, function(item) { return indexOf(configuredKeys, item.from) === -1; }).concat(replace);
	    }

	    /**
	     * [Internal] Get the default value of a parameter, which may be an injectable function.
	     */
	    function $$getDefaultValue() {
	      if (!injector) throw new Error("Injectable functions cannot be called at configuration time");
	      var defaultValue = injector.invoke(config.$$fn);
	      if (defaultValue !== null && defaultValue !== undefined && !self.type.is(defaultValue))
	        throw new Error("Default value (" + defaultValue + ") for parameter '" + self.id + "' is not an instance of Type (" + self.type.name + ")");
	      return defaultValue;
	    }

	    /**
	     * [Internal] Gets the decoded representation of a value if the value is defined, otherwise, returns the
	     * default value, which may be the result of an injectable function.
	     */
	    function $value(value) {
	      function hasReplaceVal(val) { return function(obj) { return obj.from === val; }; }
	      function $replace(value) {
	        var replacement = map(filter(self.replace, hasReplaceVal(value)), function(obj) { return obj.to; });
	        return replacement.length ? replacement[0] : value;
	      }
	      value = $replace(value);
	      return !isDefined(value) ? $$getDefaultValue() : self.type.$normalize(value);
	    }

	    function toString() { return "{Param:" + id + " " + type + " squash: '" + squash + "' optional: " + isOptional + "}"; }

	    extend(this, {
	      id: id,
	      type: type,
	      location: location,
	      array: arrayMode,
	      squash: squash,
	      replace: replace,
	      isOptional: isOptional,
	      value: $value,
	      dynamic: undefined,
	      config: config,
	      toString: toString
	    });
	  };

	  function ParamSet(params) {
	    extend(this, params || {});
	  }

	  ParamSet.prototype = {
	    $$new: function() {
	      return inherit(this, extend(new ParamSet(), { $$parent: this}));
	    },
	    $$keys: function () {
	      var keys = [], chain = [], parent = this,
	        ignore = objectKeys(ParamSet.prototype);
	      while (parent) { chain.push(parent); parent = parent.$$parent; }
	      chain.reverse();
	      forEach(chain, function(paramset) {
	        forEach(objectKeys(paramset), function(key) {
	            if (indexOf(keys, key) === -1 && indexOf(ignore, key) === -1) keys.push(key);
	        });
	      });
	      return keys;
	    },
	    $$values: function(paramValues) {
	      var values = {}, self = this;
	      forEach(self.$$keys(), function(key) {
	        values[key] = self[key].value(paramValues && paramValues[key]);
	      });
	      return values;
	    },
	    $$equals: function(paramValues1, paramValues2) {
	      var equal = true, self = this;
	      forEach(self.$$keys(), function(key) {
	        var left = paramValues1 && paramValues1[key], right = paramValues2 && paramValues2[key];
	        if (!self[key].type.equals(left, right)) equal = false;
	      });
	      return equal;
	    },
	    $$validates: function $$validate(paramValues) {
	      var keys = this.$$keys(), i, param, rawVal, normalized, encoded;
	      for (i = 0; i < keys.length; i++) {
	        param = this[keys[i]];
	        rawVal = paramValues[keys[i]];
	        if ((rawVal === undefined || rawVal === null) && param.isOptional)
	          break; // There was no parameter value, but the param is optional
	        normalized = param.type.$normalize(rawVal);
	        if (!param.type.is(normalized))
	          return false; // The value was not of the correct Type, and could not be decoded to the correct Type
	        encoded = param.type.encode(normalized);
	        if (angular.isString(encoded) && !param.type.pattern.exec(encoded))
	          return false; // The value was of the correct type, but when encoded, did not match the Type's regexp
	      }
	      return true;
	    },
	    $$parent: undefined
	  };

	  this.ParamSet = ParamSet;
	}

	// Register as a provider so it's available to other providers
	angular.module('ui.router.util').provider('$urlMatcherFactory', $UrlMatcherFactory);
	angular.module('ui.router.util').run(['$urlMatcherFactory', function($urlMatcherFactory) { }]);

	/**
	 * @ngdoc object
	 * @name ui.router.router.$urlRouterProvider
	 *
	 * @requires ui.router.util.$urlMatcherFactoryProvider
	 * @requires $locationProvider
	 *
	 * @description
	 * `$urlRouterProvider` has the responsibility of watching `$location`. 
	 * When `$location` changes it runs through a list of rules one by one until a 
	 * match is found. `$urlRouterProvider` is used behind the scenes anytime you specify 
	 * a url in a state configuration. All urls are compiled into a UrlMatcher object.
	 *
	 * There are several methods on `$urlRouterProvider` that make it useful to use directly
	 * in your module config.
	 */
	$UrlRouterProvider.$inject = ['$locationProvider', '$urlMatcherFactoryProvider'];
	function $UrlRouterProvider(   $locationProvider,   $urlMatcherFactory) {
	  var rules = [], otherwise = null, interceptDeferred = false, listener;

	  // Returns a string that is a prefix of all strings matching the RegExp
	  function regExpPrefix(re) {
	    var prefix = /^\^((?:\\[^a-zA-Z0-9]|[^\\\[\]\^$*+?.()|{}]+)*)/.exec(re.source);
	    return (prefix != null) ? prefix[1].replace(/\\(.)/g, "$1") : '';
	  }

	  // Interpolates matched values into a String.replace()-style pattern
	  function interpolate(pattern, match) {
	    return pattern.replace(/\$(\$|\d{1,2})/, function (m, what) {
	      return match[what === '$' ? 0 : Number(what)];
	    });
	  }

	  /**
	   * @ngdoc function
	   * @name ui.router.router.$urlRouterProvider#rule
	   * @methodOf ui.router.router.$urlRouterProvider
	   *
	   * @description
	   * Defines rules that are used by `$urlRouterProvider` to find matches for
	   * specific URLs.
	   *
	   * @example
	   * <pre>
	   * var app = angular.module('app', ['ui.router.router']);
	   *
	   * app.config(function ($urlRouterProvider) {
	   *   // Here's an example of how you might allow case insensitive urls
	   *   $urlRouterProvider.rule(function ($injector, $location) {
	   *     var path = $location.path(),
	   *         normalized = path.toLowerCase();
	   *
	   *     if (path !== normalized) {
	   *       return normalized;
	   *     }
	   *   });
	   * });
	   * </pre>
	   *
	   * @param {function} rule Handler function that takes `$injector` and `$location`
	   * services as arguments. You can use them to return a valid path as a string.
	   *
	   * @return {object} `$urlRouterProvider` - `$urlRouterProvider` instance
	   */
	  this.rule = function (rule) {
	    if (!isFunction(rule)) throw new Error("'rule' must be a function");
	    rules.push(rule);
	    return this;
	  };

	  /**
	   * @ngdoc object
	   * @name ui.router.router.$urlRouterProvider#otherwise
	   * @methodOf ui.router.router.$urlRouterProvider
	   *
	   * @description
	   * Defines a path that is used when an invalid route is requested.
	   *
	   * @example
	   * <pre>
	   * var app = angular.module('app', ['ui.router.router']);
	   *
	   * app.config(function ($urlRouterProvider) {
	   *   // if the path doesn't match any of the urls you configured
	   *   // otherwise will take care of routing the user to the
	   *   // specified url
	   *   $urlRouterProvider.otherwise('/index');
	   *
	   *   // Example of using function rule as param
	   *   $urlRouterProvider.otherwise(function ($injector, $location) {
	   *     return '/a/valid/url';
	   *   });
	   * });
	   * </pre>
	   *
	   * @param {string|function} rule The url path you want to redirect to or a function 
	   * rule that returns the url path. The function version is passed two params: 
	   * `$injector` and `$location` services, and must return a url string.
	   *
	   * @return {object} `$urlRouterProvider` - `$urlRouterProvider` instance
	   */
	  this.otherwise = function (rule) {
	    if (isString(rule)) {
	      var redirect = rule;
	      rule = function () { return redirect; };
	    }
	    else if (!isFunction(rule)) throw new Error("'rule' must be a function");
	    otherwise = rule;
	    return this;
	  };


	  function handleIfMatch($injector, handler, match) {
	    if (!match) return false;
	    var result = $injector.invoke(handler, handler, { $match: match });
	    return isDefined(result) ? result : true;
	  }

	  /**
	   * @ngdoc function
	   * @name ui.router.router.$urlRouterProvider#when
	   * @methodOf ui.router.router.$urlRouterProvider
	   *
	   * @description
	   * Registers a handler for a given url matching. 
	   * 
	   * If the handler is a string, it is
	   * treated as a redirect, and is interpolated according to the syntax of match
	   * (i.e. like `String.replace()` for `RegExp`, or like a `UrlMatcher` pattern otherwise).
	   *
	   * If the handler is a function, it is injectable. It gets invoked if `$location`
	   * matches. You have the option of inject the match object as `$match`.
	   *
	   * The handler can return
	   *
	   * - **falsy** to indicate that the rule didn't match after all, then `$urlRouter`
	   *   will continue trying to find another one that matches.
	   * - **string** which is treated as a redirect and passed to `$location.url()`
	   * - **void** or any **truthy** value tells `$urlRouter` that the url was handled.
	   *
	   * @example
	   * <pre>
	   * var app = angular.module('app', ['ui.router.router']);
	   *
	   * app.config(function ($urlRouterProvider) {
	   *   $urlRouterProvider.when($state.url, function ($match, $stateParams) {
	   *     if ($state.$current.navigable !== state ||
	   *         !equalForKeys($match, $stateParams) {
	   *      $state.transitionTo(state, $match, false);
	   *     }
	   *   });
	   * });
	   * </pre>
	   *
	   * @param {string|object} what The incoming path that you want to redirect.
	   * @param {string|function} handler The path you want to redirect your user to.
	   */
	  this.when = function (what, handler) {
	    var redirect, handlerIsString = isString(handler);
	    if (isString(what)) what = $urlMatcherFactory.compile(what);

	    if (!handlerIsString && !isFunction(handler) && !isArray(handler))
	      throw new Error("invalid 'handler' in when()");

	    var strategies = {
	      matcher: function (what, handler) {
	        if (handlerIsString) {
	          redirect = $urlMatcherFactory.compile(handler);
	          handler = ['$match', function ($match) { return redirect.format($match); }];
	        }
	        return extend(function ($injector, $location) {
	          return handleIfMatch($injector, handler, what.exec($location.path(), $location.search()));
	        }, {
	          prefix: isString(what.prefix) ? what.prefix : ''
	        });
	      },
	      regex: function (what, handler) {
	        if (what.global || what.sticky) throw new Error("when() RegExp must not be global or sticky");

	        if (handlerIsString) {
	          redirect = handler;
	          handler = ['$match', function ($match) { return interpolate(redirect, $match); }];
	        }
	        return extend(function ($injector, $location) {
	          return handleIfMatch($injector, handler, what.exec($location.path()));
	        }, {
	          prefix: regExpPrefix(what)
	        });
	      }
	    };

	    var check = { matcher: $urlMatcherFactory.isMatcher(what), regex: what instanceof RegExp };

	    for (var n in check) {
	      if (check[n]) return this.rule(strategies[n](what, handler));
	    }

	    throw new Error("invalid 'what' in when()");
	  };

	  /**
	   * @ngdoc function
	   * @name ui.router.router.$urlRouterProvider#deferIntercept
	   * @methodOf ui.router.router.$urlRouterProvider
	   *
	   * @description
	   * Disables (or enables) deferring location change interception.
	   *
	   * If you wish to customize the behavior of syncing the URL (for example, if you wish to
	   * defer a transition but maintain the current URL), call this method at configuration time.
	   * Then, at run time, call `$urlRouter.listen()` after you have configured your own
	   * `$locationChangeSuccess` event handler.
	   *
	   * @example
	   * <pre>
	   * var app = angular.module('app', ['ui.router.router']);
	   *
	   * app.config(function ($urlRouterProvider) {
	   *
	   *   // Prevent $urlRouter from automatically intercepting URL changes;
	   *   // this allows you to configure custom behavior in between
	   *   // location changes and route synchronization:
	   *   $urlRouterProvider.deferIntercept();
	   *
	   * }).run(function ($rootScope, $urlRouter, UserService) {
	   *
	   *   $rootScope.$on('$locationChangeSuccess', function(e) {
	   *     // UserService is an example service for managing user state
	   *     if (UserService.isLoggedIn()) return;
	   *
	   *     // Prevent $urlRouter's default handler from firing
	   *     e.preventDefault();
	   *
	   *     UserService.handleLogin().then(function() {
	   *       // Once the user has logged in, sync the current URL
	   *       // to the router:
	   *       $urlRouter.sync();
	   *     });
	   *   });
	   *
	   *   // Configures $urlRouter's listener *after* your custom listener
	   *   $urlRouter.listen();
	   * });
	   * </pre>
	   *
	   * @param {boolean} defer Indicates whether to defer location change interception. Passing
	            no parameter is equivalent to `true`.
	   */
	  this.deferIntercept = function (defer) {
	    if (defer === undefined) defer = true;
	    interceptDeferred = defer;
	  };

	  /**
	   * @ngdoc object
	   * @name ui.router.router.$urlRouter
	   *
	   * @requires $location
	   * @requires $rootScope
	   * @requires $injector
	   * @requires $browser
	   *
	   * @description
	   *
	   */
	  this.$get = $get;
	  $get.$inject = ['$location', '$rootScope', '$injector', '$browser', '$sniffer'];
	  function $get(   $location,   $rootScope,   $injector,   $browser,   $sniffer) {

	    var baseHref = $browser.baseHref(), location = $location.url(), lastPushedUrl;

	    function appendBasePath(url, isHtml5, absolute) {
	      if (baseHref === '/') return url;
	      if (isHtml5) return baseHref.slice(0, -1) + url;
	      if (absolute) return baseHref.slice(1) + url;
	      return url;
	    }

	    // TODO: Optimize groups of rules with non-empty prefix into some sort of decision tree
	    function update(evt) {
	      if (evt && evt.defaultPrevented) return;
	      var ignoreUpdate = lastPushedUrl && $location.url() === lastPushedUrl;
	      lastPushedUrl = undefined;
	      // TODO: Re-implement this in 1.0 for https://github.com/angular-ui/ui-router/issues/1573
	      //if (ignoreUpdate) return true;

	      function check(rule) {
	        var handled = rule($injector, $location);

	        if (!handled) return false;
	        if (isString(handled)) $location.replace().url(handled);
	        return true;
	      }
	      var n = rules.length, i;

	      for (i = 0; i < n; i++) {
	        if (check(rules[i])) return;
	      }
	      // always check otherwise last to allow dynamic updates to the set of rules
	      if (otherwise) check(otherwise);
	    }

	    function listen() {
	      listener = listener || $rootScope.$on('$locationChangeSuccess', update);
	      return listener;
	    }

	    if (!interceptDeferred) listen();

	    return {
	      /**
	       * @ngdoc function
	       * @name ui.router.router.$urlRouter#sync
	       * @methodOf ui.router.router.$urlRouter
	       *
	       * @description
	       * Triggers an update; the same update that happens when the address bar url changes, aka `$locationChangeSuccess`.
	       * This method is useful when you need to use `preventDefault()` on the `$locationChangeSuccess` event,
	       * perform some custom logic (route protection, auth, config, redirection, etc) and then finally proceed
	       * with the transition by calling `$urlRouter.sync()`.
	       *
	       * @example
	       * <pre>
	       * angular.module('app', ['ui.router'])
	       *   .run(function($rootScope, $urlRouter) {
	       *     $rootScope.$on('$locationChangeSuccess', function(evt) {
	       *       // Halt state change from even starting
	       *       evt.preventDefault();
	       *       // Perform custom logic
	       *       var meetsRequirement = ...
	       *       // Continue with the update and state transition if logic allows
	       *       if (meetsRequirement) $urlRouter.sync();
	       *     });
	       * });
	       * </pre>
	       */
	      sync: function() {
	        update();
	      },

	      listen: function() {
	        return listen();
	      },

	      update: function(read) {
	        if (read) {
	          location = $location.url();
	          return;
	        }
	        if ($location.url() === location) return;

	        $location.url(location);
	        $location.replace();
	      },

	      push: function(urlMatcher, params, options) {
	         var url = urlMatcher.format(params || {});

	        // Handle the special hash param, if needed
	        if (url !== null && params && params['#']) {
	            url += '#' + params['#'];
	        }

	        $location.url(url);
	        lastPushedUrl = options && options.$$avoidResync ? $location.url() : undefined;
	        if (options && options.replace) $location.replace();
	      },

	      /**
	       * @ngdoc function
	       * @name ui.router.router.$urlRouter#href
	       * @methodOf ui.router.router.$urlRouter
	       *
	       * @description
	       * A URL generation method that returns the compiled URL for a given
	       * {@link ui.router.util.type:UrlMatcher `UrlMatcher`}, populated with the provided parameters.
	       *
	       * @example
	       * <pre>
	       * $bob = $urlRouter.href(new UrlMatcher("/about/:person"), {
	       *   person: "bob"
	       * });
	       * // $bob == "/about/bob";
	       * </pre>
	       *
	       * @param {UrlMatcher} urlMatcher The `UrlMatcher` object which is used as the template of the URL to generate.
	       * @param {object=} params An object of parameter values to fill the matcher's required parameters.
	       * @param {object=} options Options object. The options are:
	       *
	       * - **`absolute`** - {boolean=false},  If true will generate an absolute url, e.g. "http://www.example.com/fullurl".
	       *
	       * @returns {string} Returns the fully compiled URL, or `null` if `params` fail validation against `urlMatcher`
	       */
	      href: function(urlMatcher, params, options) {
	        if (!urlMatcher.validates(params)) return null;

	        var isHtml5 = $locationProvider.html5Mode();
	        if (angular.isObject(isHtml5)) {
	          isHtml5 = isHtml5.enabled;
	        }

	        isHtml5 = isHtml5 && $sniffer.history;
	        
	        var url = urlMatcher.format(params);
	        options = options || {};

	        if (!isHtml5 && url !== null) {
	          url = "#" + $locationProvider.hashPrefix() + url;
	        }

	        // Handle special hash param, if needed
	        if (url !== null && params && params['#']) {
	          url += '#' + params['#'];
	        }

	        url = appendBasePath(url, isHtml5, options.absolute);

	        if (!options.absolute || !url) {
	          return url;
	        }

	        var slash = (!isHtml5 && url ? '/' : ''), port = $location.port();
	        port = (port === 80 || port === 443 ? '' : ':' + port);

	        return [$location.protocol(), '://', $location.host(), port, slash, url].join('');
	      }
	    };
	  }
	}

	angular.module('ui.router.router').provider('$urlRouter', $UrlRouterProvider);

	/**
	 * @ngdoc object
	 * @name ui.router.state.$stateProvider
	 *
	 * @requires ui.router.router.$urlRouterProvider
	 * @requires ui.router.util.$urlMatcherFactoryProvider
	 *
	 * @description
	 * The new `$stateProvider` works similar to Angular's v1 router, but it focuses purely
	 * on state.
	 *
	 * A state corresponds to a "place" in the application in terms of the overall UI and
	 * navigation. A state describes (via the controller / template / view properties) what
	 * the UI looks like and does at that place.
	 *
	 * States often have things in common, and the primary way of factoring out these
	 * commonalities in this model is via the state hierarchy, i.e. parent/child states aka
	 * nested states.
	 *
	 * The `$stateProvider` provides interfaces to declare these states for your app.
	 */
	$StateProvider.$inject = ['$urlRouterProvider', '$urlMatcherFactoryProvider'];
	function $StateProvider(   $urlRouterProvider,   $urlMatcherFactory) {

	  var root, states = {}, $state, queue = {}, abstractKey = 'abstract';

	  // Builds state properties from definition passed to registerState()
	  var stateBuilder = {

	    // Derive parent state from a hierarchical name only if 'parent' is not explicitly defined.
	    // state.children = [];
	    // if (parent) parent.children.push(state);
	    parent: function(state) {
	      if (isDefined(state.parent) && state.parent) return findState(state.parent);
	      // regex matches any valid composite state name
	      // would match "contact.list" but not "contacts"
	      var compositeName = /^(.+)\.[^.]+$/.exec(state.name);
	      return compositeName ? findState(compositeName[1]) : root;
	    },

	    // inherit 'data' from parent and override by own values (if any)
	    data: function(state) {
	      if (state.parent && state.parent.data) {
	        state.data = state.self.data = inherit(state.parent.data, state.data);
	      }
	      return state.data;
	    },

	    // Build a URLMatcher if necessary, either via a relative or absolute URL
	    url: function(state) {
	      var url = state.url, config = { params: state.params || {} };

	      if (isString(url)) {
	        if (url.charAt(0) == '^') return $urlMatcherFactory.compile(url.substring(1), config);
	        return (state.parent.navigable || root).url.concat(url, config);
	      }

	      if (!url || $urlMatcherFactory.isMatcher(url)) return url;
	      throw new Error("Invalid url '" + url + "' in state '" + state + "'");
	    },

	    // Keep track of the closest ancestor state that has a URL (i.e. is navigable)
	    navigable: function(state) {
	      return state.url ? state : (state.parent ? state.parent.navigable : null);
	    },

	    // Own parameters for this state. state.url.params is already built at this point. Create and add non-url params
	    ownParams: function(state) {
	      var params = state.url && state.url.params || new $$UMFP.ParamSet();
	      forEach(state.params || {}, function(config, id) {
	        if (!params[id]) params[id] = new $$UMFP.Param(id, null, config, "config");
	      });
	      return params;
	    },

	    // Derive parameters for this state and ensure they're a super-set of parent's parameters
	    params: function(state) {
	      var ownParams = pick(state.ownParams, state.ownParams.$$keys());
	      return state.parent && state.parent.params ? extend(state.parent.params.$$new(), ownParams) : new $$UMFP.ParamSet();
	    },

	    // If there is no explicit multi-view configuration, make one up so we don't have
	    // to handle both cases in the view directive later. Note that having an explicit
	    // 'views' property will mean the default unnamed view properties are ignored. This
	    // is also a good time to resolve view names to absolute names, so everything is a
	    // straight lookup at link time.
	    views: function(state) {
	      var views = {};

	      forEach(isDefined(state.views) ? state.views : { '': state }, function (view, name) {
	        if (name.indexOf('@') < 0) name += '@' + state.parent.name;
	        view.resolveAs = view.resolveAs || state.resolveAs || '$resolve';
	        views[name] = view;
	      });
	      return views;
	    },

	    // Keep a full path from the root down to this state as this is needed for state activation.
	    path: function(state) {
	      return state.parent ? state.parent.path.concat(state) : []; // exclude root from path
	    },

	    // Speed up $state.contains() as it's used a lot
	    includes: function(state) {
	      var includes = state.parent ? extend({}, state.parent.includes) : {};
	      includes[state.name] = true;
	      return includes;
	    },

	    $delegates: {}
	  };

	  function isRelative(stateName) {
	    return stateName.indexOf(".") === 0 || stateName.indexOf("^") === 0;
	  }

	  function findState(stateOrName, base) {
	    if (!stateOrName) return undefined;

	    var isStr = isString(stateOrName),
	        name  = isStr ? stateOrName : stateOrName.name,
	        path  = isRelative(name);

	    if (path) {
	      if (!base) throw new Error("No reference point given for path '"  + name + "'");
	      base = findState(base);
	      
	      var rel = name.split("."), i = 0, pathLength = rel.length, current = base;

	      for (; i < pathLength; i++) {
	        if (rel[i] === "" && i === 0) {
	          current = base;
	          continue;
	        }
	        if (rel[i] === "^") {
	          if (!current.parent) throw new Error("Path '" + name + "' not valid for state '" + base.name + "'");
	          current = current.parent;
	          continue;
	        }
	        break;
	      }
	      rel = rel.slice(i).join(".");
	      name = current.name + (current.name && rel ? "." : "") + rel;
	    }
	    var state = states[name];

	    if (state && (isStr || (!isStr && (state === stateOrName || state.self === stateOrName)))) {
	      return state;
	    }
	    return undefined;
	  }

	  function queueState(parentName, state) {
	    if (!queue[parentName]) {
	      queue[parentName] = [];
	    }
	    queue[parentName].push(state);
	  }

	  function flushQueuedChildren(parentName) {
	    var queued = queue[parentName] || [];
	    while(queued.length) {
	      registerState(queued.shift());
	    }
	  }

	  function registerState(state) {
	    // Wrap a new object around the state so we can store our private details easily.
	    state = inherit(state, {
	      self: state,
	      resolve: state.resolve || {},
	      toString: function() { return this.name; }
	    });

	    var name = state.name;
	    if (!isString(name) || name.indexOf('@') >= 0) throw new Error("State must have a valid name");
	    if (states.hasOwnProperty(name)) throw new Error("State '" + name + "' is already defined");

	    // Get parent name
	    var parentName = (name.indexOf('.') !== -1) ? name.substring(0, name.lastIndexOf('.'))
	        : (isString(state.parent)) ? state.parent
	        : (isObject(state.parent) && isString(state.parent.name)) ? state.parent.name
	        : '';

	    // If parent is not registered yet, add state to queue and register later
	    if (parentName && !states[parentName]) {
	      return queueState(parentName, state.self);
	    }

	    for (var key in stateBuilder) {
	      if (isFunction(stateBuilder[key])) state[key] = stateBuilder[key](state, stateBuilder.$delegates[key]);
	    }
	    states[name] = state;

	    // Register the state in the global state list and with $urlRouter if necessary.
	    if (!state[abstractKey] && state.url) {
	      $urlRouterProvider.when(state.url, ['$match', '$stateParams', function ($match, $stateParams) {
	        if ($state.$current.navigable != state || !equalForKeys($match, $stateParams)) {
	          $state.transitionTo(state, $match, { inherit: true, location: false });
	        }
	      }]);
	    }

	    // Register any queued children
	    flushQueuedChildren(name);

	    return state;
	  }

	  // Checks text to see if it looks like a glob.
	  function isGlob (text) {
	    return text.indexOf('*') > -1;
	  }

	  // Returns true if glob matches current $state name.
	  function doesStateMatchGlob (glob) {
	    var globSegments = glob.split('.'),
	        segments = $state.$current.name.split('.');

	    //match single stars
	    for (var i = 0, l = globSegments.length; i < l; i++) {
	      if (globSegments[i] === '*') {
	        segments[i] = '*';
	      }
	    }

	    //match greedy starts
	    if (globSegments[0] === '**') {
	       segments = segments.slice(indexOf(segments, globSegments[1]));
	       segments.unshift('**');
	    }
	    //match greedy ends
	    if (globSegments[globSegments.length - 1] === '**') {
	       segments.splice(indexOf(segments, globSegments[globSegments.length - 2]) + 1, Number.MAX_VALUE);
	       segments.push('**');
	    }

	    if (globSegments.length != segments.length) {
	      return false;
	    }

	    return segments.join('') === globSegments.join('');
	  }


	  // Implicit root state that is always active
	  root = registerState({
	    name: '',
	    url: '^',
	    views: null,
	    'abstract': true
	  });
	  root.navigable = null;


	  /**
	   * @ngdoc function
	   * @name ui.router.state.$stateProvider#decorator
	   * @methodOf ui.router.state.$stateProvider
	   *
	   * @description
	   * Allows you to extend (carefully) or override (at your own peril) the 
	   * `stateBuilder` object used internally by `$stateProvider`. This can be used 
	   * to add custom functionality to ui-router, for example inferring templateUrl 
	   * based on the state name.
	   *
	   * When passing only a name, it returns the current (original or decorated) builder
	   * function that matches `name`.
	   *
	   * The builder functions that can be decorated are listed below. Though not all
	   * necessarily have a good use case for decoration, that is up to you to decide.
	   *
	   * In addition, users can attach custom decorators, which will generate new 
	   * properties within the state's internal definition. There is currently no clear 
	   * use-case for this beyond accessing internal states (i.e. $state.$current), 
	   * however, expect this to become increasingly relevant as we introduce additional 
	   * meta-programming features.
	   *
	   * **Warning**: Decorators should not be interdependent because the order of 
	   * execution of the builder functions in non-deterministic. Builder functions 
	   * should only be dependent on the state definition object and super function.
	   *
	   *
	   * Existing builder functions and current return values:
	   *
	   * - **parent** `{object}` - returns the parent state object.
	   * - **data** `{object}` - returns state data, including any inherited data that is not
	   *   overridden by own values (if any).
	   * - **url** `{object}` - returns a {@link ui.router.util.type:UrlMatcher UrlMatcher}
	   *   or `null`.
	   * - **navigable** `{object}` - returns closest ancestor state that has a URL (aka is 
	   *   navigable).
	   * - **params** `{object}` - returns an array of state params that are ensured to 
	   *   be a super-set of parent's params.
	   * - **views** `{object}` - returns a views object where each key is an absolute view 
	   *   name (i.e. "viewName@stateName") and each value is the config object 
	   *   (template, controller) for the view. Even when you don't use the views object 
	   *   explicitly on a state config, one is still created for you internally.
	   *   So by decorating this builder function you have access to decorating template 
	   *   and controller properties.
	   * - **ownParams** `{object}` - returns an array of params that belong to the state, 
	   *   not including any params defined by ancestor states.
	   * - **path** `{string}` - returns the full path from the root down to this state. 
	   *   Needed for state activation.
	   * - **includes** `{object}` - returns an object that includes every state that 
	   *   would pass a `$state.includes()` test.
	   *
	   * @example
	   * <pre>
	   * // Override the internal 'views' builder with a function that takes the state
	   * // definition, and a reference to the internal function being overridden:
	   * $stateProvider.decorator('views', function (state, parent) {
	   *   var result = {},
	   *       views = parent(state);
	   *
	   *   angular.forEach(views, function (config, name) {
	   *     var autoName = (state.name + '.' + name).replace('.', '/');
	   *     config.templateUrl = config.templateUrl || '/partials/' + autoName + '.html';
	   *     result[name] = config;
	   *   });
	   *   return result;
	   * });
	   *
	   * $stateProvider.state('home', {
	   *   views: {
	   *     'contact.list': { controller: 'ListController' },
	   *     'contact.item': { controller: 'ItemController' }
	   *   }
	   * });
	   *
	   * // ...
	   *
	   * $state.go('home');
	   * // Auto-populates list and item views with /partials/home/contact/list.html,
	   * // and /partials/home/contact/item.html, respectively.
	   * </pre>
	   *
	   * @param {string} name The name of the builder function to decorate. 
	   * @param {object} func A function that is responsible for decorating the original 
	   * builder function. The function receives two parameters:
	   *
	   *   - `{object}` - state - The state config object.
	   *   - `{object}` - super - The original builder function.
	   *
	   * @return {object} $stateProvider - $stateProvider instance
	   */
	  this.decorator = decorator;
	  function decorator(name, func) {
	    /*jshint validthis: true */
	    if (isString(name) && !isDefined(func)) {
	      return stateBuilder[name];
	    }
	    if (!isFunction(func) || !isString(name)) {
	      return this;
	    }
	    if (stateBuilder[name] && !stateBuilder.$delegates[name]) {
	      stateBuilder.$delegates[name] = stateBuilder[name];
	    }
	    stateBuilder[name] = func;
	    return this;
	  }

	  /**
	   * @ngdoc function
	   * @name ui.router.state.$stateProvider#state
	   * @methodOf ui.router.state.$stateProvider
	   *
	   * @description
	   * Registers a state configuration under a given state name. The stateConfig object
	   * has the following acceptable properties.
	   *
	   * @param {string} name A unique state name, e.g. "home", "about", "contacts".
	   * To create a parent/child state use a dot, e.g. "about.sales", "home.newest".
	   * @param {object} stateConfig State configuration object.
	   * @param {string|function=} stateConfig.template
	   * <a id='template'></a>
	   *   html template as a string or a function that returns
	   *   an html template as a string which should be used by the uiView directives. This property 
	   *   takes precedence over templateUrl.
	   *   
	   *   If `template` is a function, it will be called with the following parameters:
	   *
	   *   - {array.&lt;object&gt;} - state parameters extracted from the current $location.path() by
	   *     applying the current state
	   *
	   * <pre>template:
	   *   "<h1>inline template definition</h1>" +
	   *   "<div ui-view></div>"</pre>
	   * <pre>template: function(params) {
	   *       return "<h1>generated template</h1>"; }</pre>
	   * </div>
	   *
	   * @param {string|function=} stateConfig.templateUrl
	   * <a id='templateUrl'></a>
	   *
	   *   path or function that returns a path to an html
	   *   template that should be used by uiView.
	   *   
	   *   If `templateUrl` is a function, it will be called with the following parameters:
	   *
	   *   - {array.&lt;object&gt;} - state parameters extracted from the current $location.path() by 
	   *     applying the current state
	   *
	   * <pre>templateUrl: "home.html"</pre>
	   * <pre>templateUrl: function(params) {
	   *     return myTemplates[params.pageId]; }</pre>
	   *
	   * @param {function=} stateConfig.templateProvider
	   * <a id='templateProvider'></a>
	   *    Provider function that returns HTML content string.
	   * <pre> templateProvider:
	   *       function(MyTemplateService, params) {
	   *         return MyTemplateService.getTemplate(params.pageId);
	   *       }</pre>
	   *
	   * @param {string|function=} stateConfig.controller
	   * <a id='controller'></a>
	   *
	   *  Controller fn that should be associated with newly
	   *   related scope or the name of a registered controller if passed as a string.
	   *   Optionally, the ControllerAs may be declared here.
	   * <pre>controller: "MyRegisteredController"</pre>
	   * <pre>controller:
	   *     "MyRegisteredController as fooCtrl"}</pre>
	   * <pre>controller: function($scope, MyService) {
	   *     $scope.data = MyService.getData(); }</pre>
	   *
	   * @param {function=} stateConfig.controllerProvider
	   * <a id='controllerProvider'></a>
	   *
	   * Injectable provider function that returns the actual controller or string.
	   * <pre>controllerProvider:
	   *   function(MyResolveData) {
	   *     if (MyResolveData.foo)
	   *       return "FooCtrl"
	   *     else if (MyResolveData.bar)
	   *       return "BarCtrl";
	   *     else return function($scope) {
	   *       $scope.baz = "Qux";
	   *     }
	   *   }</pre>
	   *
	   * @param {string=} stateConfig.controllerAs
	   * <a id='controllerAs'></a>
	   * 
	   * A controller alias name. If present the controller will be
	   *   published to scope under the controllerAs name.
	   * <pre>controllerAs: "myCtrl"</pre>
	   *
	   * @param {string|object=} stateConfig.parent
	   * <a id='parent'></a>
	   * Optionally specifies the parent state of this state.
	   *
	   * <pre>parent: 'parentState'</pre>
	   * <pre>parent: parentState // JS variable</pre>
	   *
	   * @param {object=} stateConfig.resolve
	   * <a id='resolve'></a>
	   *
	   * An optional map&lt;string, function&gt; of dependencies which
	   *   should be injected into the controller. If any of these dependencies are promises, 
	   *   the router will wait for them all to be resolved before the controller is instantiated.
	   *   If all the promises are resolved successfully, the $stateChangeSuccess event is fired
	   *   and the values of the resolved promises are injected into any controllers that reference them.
	   *   If any  of the promises are rejected the $stateChangeError event is fired.
	   *
	   *   The map object is:
	   *   
	   *   - key - {string}: name of dependency to be injected into controller
	   *   - factory - {string|function}: If string then it is alias for service. Otherwise if function, 
	   *     it is injected and return value it treated as dependency. If result is a promise, it is 
	   *     resolved before its value is injected into controller.
	   *
	   * <pre>resolve: {
	   *     myResolve1:
	   *       function($http, $stateParams) {
	   *         return $http.get("/api/foos/"+stateParams.fooID);
	   *       }
	   *     }</pre>
	   *
	   * @param {string=} stateConfig.url
	   * <a id='url'></a>
	   *
	   *   A url fragment with optional parameters. When a state is navigated or
	   *   transitioned to, the `$stateParams` service will be populated with any 
	   *   parameters that were passed.
	   *
	   *   (See {@link ui.router.util.type:UrlMatcher UrlMatcher} `UrlMatcher`} for
	   *   more details on acceptable patterns )
	   *
	   * examples:
	   * <pre>url: "/home"
	   * url: "/users/:userid"
	   * url: "/books/{bookid:[a-zA-Z_-]}"
	   * url: "/books/{categoryid:int}"
	   * url: "/books/{publishername:string}/{categoryid:int}"
	   * url: "/messages?before&after"
	   * url: "/messages?{before:date}&{after:date}"
	   * url: "/messages/:mailboxid?{before:date}&{after:date}"
	   * </pre>
	   *
	   * @param {object=} stateConfig.views
	   * <a id='views'></a>
	   * an optional map&lt;string, object&gt; which defined multiple views, or targets views
	   * manually/explicitly.
	   *
	   * Examples:
	   *
	   * Targets three named `ui-view`s in the parent state's template
	   * <pre>views: {
	   *     header: {
	   *       controller: "headerCtrl",
	   *       templateUrl: "header.html"
	   *     }, body: {
	   *       controller: "bodyCtrl",
	   *       templateUrl: "body.html"
	   *     }, footer: {
	   *       controller: "footCtrl",
	   *       templateUrl: "footer.html"
	   *     }
	   *   }</pre>
	   *
	   * Targets named `ui-view="header"` from grandparent state 'top''s template, and named `ui-view="body" from parent state's template.
	   * <pre>views: {
	   *     'header@top': {
	   *       controller: "msgHeaderCtrl",
	   *       templateUrl: "msgHeader.html"
	   *     }, 'body': {
	   *       controller: "messagesCtrl",
	   *       templateUrl: "messages.html"
	   *     }
	   *   }</pre>
	   *
	   * @param {boolean=} [stateConfig.abstract=false]
	   * <a id='abstract'></a>
	   * An abstract state will never be directly activated,
	   *   but can provide inherited properties to its common children states.
	   * <pre>abstract: true</pre>
	   *
	   * @param {function=} stateConfig.onEnter
	   * <a id='onEnter'></a>
	   *
	   * Callback function for when a state is entered. Good way
	   *   to trigger an action or dispatch an event, such as opening a dialog.
	   * If minifying your scripts, make sure to explicitly annotate this function,
	   * because it won't be automatically annotated by your build tools.
	   *
	   * <pre>onEnter: function(MyService, $stateParams) {
	   *     MyService.foo($stateParams.myParam);
	   * }</pre>
	   *
	   * @param {function=} stateConfig.onExit
	   * <a id='onExit'></a>
	   *
	   * Callback function for when a state is exited. Good way to
	   *   trigger an action or dispatch an event, such as opening a dialog.
	   * If minifying your scripts, make sure to explicitly annotate this function,
	   * because it won't be automatically annotated by your build tools.
	   *
	   * <pre>onExit: function(MyService, $stateParams) {
	   *     MyService.cleanup($stateParams.myParam);
	   * }</pre>
	   *
	   * @param {boolean=} [stateConfig.reloadOnSearch=true]
	   * <a id='reloadOnSearch'></a>
	   *
	   * If `false`, will not retrigger the same state
	   *   just because a search/query parameter has changed (via $location.search() or $location.hash()). 
	   *   Useful for when you'd like to modify $location.search() without triggering a reload.
	   * <pre>reloadOnSearch: false</pre>
	   *
	   * @param {object=} stateConfig.data
	   * <a id='data'></a>
	   *
	   * Arbitrary data object, useful for custom configuration.  The parent state's `data` is
	   *   prototypally inherited.  In other words, adding a data property to a state adds it to
	   *   the entire subtree via prototypal inheritance.
	   *
	   * <pre>data: {
	   *     requiredRole: 'foo'
	   * } </pre>
	   *
	   * @param {object=} stateConfig.params
	   * <a id='params'></a>
	   *
	   * A map which optionally configures parameters declared in the `url`, or
	   *   defines additional non-url parameters.  For each parameter being
	   *   configured, add a configuration object keyed to the name of the parameter.
	   *
	   *   Each parameter configuration object may contain the following properties:
	   *
	   *   - ** value ** - {object|function=}: specifies the default value for this
	   *     parameter.  This implicitly sets this parameter as optional.
	   *
	   *     When UI-Router routes to a state and no value is
	   *     specified for this parameter in the URL or transition, the
	   *     default value will be used instead.  If `value` is a function,
	   *     it will be injected and invoked, and the return value used.
	   *
	   *     *Note*: `undefined` is treated as "no default value" while `null`
	   *     is treated as "the default value is `null`".
	   *
	   *     *Shorthand*: If you only need to configure the default value of the
	   *     parameter, you may use a shorthand syntax.   In the **`params`**
	   *     map, instead mapping the param name to a full parameter configuration
	   *     object, simply set map it to the default parameter value, e.g.:
	   *
	   * <pre>// define a parameter's default value
	   * params: {
	   *     param1: { value: "defaultValue" }
	   * }
	   * // shorthand default values
	   * params: {
	   *     param1: "defaultValue",
	   *     param2: "param2Default"
	   * }</pre>
	   *
	   *   - ** array ** - {boolean=}: *(default: false)* If true, the param value will be
	   *     treated as an array of values.  If you specified a Type, the value will be
	   *     treated as an array of the specified Type.  Note: query parameter values
	   *     default to a special `"auto"` mode.
	   *
	   *     For query parameters in `"auto"` mode, if multiple  values for a single parameter
	   *     are present in the URL (e.g.: `/foo?bar=1&bar=2&bar=3`) then the values
	   *     are mapped to an array (e.g.: `{ foo: [ '1', '2', '3' ] }`).  However, if
	   *     only one value is present (e.g.: `/foo?bar=1`) then the value is treated as single
	   *     value (e.g.: `{ foo: '1' }`).
	   *
	   * <pre>params: {
	   *     param1: { array: true }
	   * }</pre>
	   *
	   *   - ** squash ** - {bool|string=}: `squash` configures how a default parameter value is represented in the URL when
	   *     the current parameter value is the same as the default value. If `squash` is not set, it uses the
	   *     configured default squash policy.
	   *     (See {@link ui.router.util.$urlMatcherFactory#methods_defaultSquashPolicy `defaultSquashPolicy()`})
	   *
	   *   There are three squash settings:
	   *
	   *     - false: The parameter's default value is not squashed.  It is encoded and included in the URL
	   *     - true: The parameter's default value is omitted from the URL.  If the parameter is preceeded and followed
	   *       by slashes in the state's `url` declaration, then one of those slashes are omitted.
	   *       This can allow for cleaner looking URLs.
	   *     - `"<arbitrary string>"`: The parameter's default value is replaced with an arbitrary placeholder of  your choice.
	   *
	   * <pre>params: {
	   *     param1: {
	   *       value: "defaultId",
	   *       squash: true
	   * } }
	   * // squash "defaultValue" to "~"
	   * params: {
	   *     param1: {
	   *       value: "defaultValue",
	   *       squash: "~"
	   * } }
	   * </pre>
	   *
	   *
	   * @example
	   * <pre>
	   * // Some state name examples
	   *
	   * // stateName can be a single top-level name (must be unique).
	   * $stateProvider.state("home", {});
	   *
	   * // Or it can be a nested state name. This state is a child of the
	   * // above "home" state.
	   * $stateProvider.state("home.newest", {});
	   *
	   * // Nest states as deeply as needed.
	   * $stateProvider.state("home.newest.abc.xyz.inception", {});
	   *
	   * // state() returns $stateProvider, so you can chain state declarations.
	   * $stateProvider
	   *   .state("home", {})
	   *   .state("about", {})
	   *   .state("contacts", {});
	   * </pre>
	   *
	   */
	  this.state = state;
	  function state(name, definition) {
	    /*jshint validthis: true */
	    if (isObject(name)) definition = name;
	    else definition.name = name;
	    registerState(definition);
	    return this;
	  }

	  /**
	   * @ngdoc object
	   * @name ui.router.state.$state
	   *
	   * @requires $rootScope
	   * @requires $q
	   * @requires ui.router.state.$view
	   * @requires $injector
	   * @requires ui.router.util.$resolve
	   * @requires ui.router.state.$stateParams
	   * @requires ui.router.router.$urlRouter
	   *
	   * @property {object} params A param object, e.g. {sectionId: section.id)}, that 
	   * you'd like to test against the current active state.
	   * @property {object} current A reference to the state's config object. However 
	   * you passed it in. Useful for accessing custom data.
	   * @property {object} transition Currently pending transition. A promise that'll 
	   * resolve or reject.
	   *
	   * @description
	   * `$state` service is responsible for representing states as well as transitioning
	   * between them. It also provides interfaces to ask for current state or even states
	   * you're coming from.
	   */
	  this.$get = $get;
	  $get.$inject = ['$rootScope', '$q', '$view', '$injector', '$resolve', '$stateParams', '$urlRouter', '$location', '$urlMatcherFactory'];
	  function $get(   $rootScope,   $q,   $view,   $injector,   $resolve,   $stateParams,   $urlRouter,   $location,   $urlMatcherFactory) {

	    var TransitionSuperseded = $q.reject(new Error('transition superseded'));
	    var TransitionPrevented = $q.reject(new Error('transition prevented'));
	    var TransitionAborted = $q.reject(new Error('transition aborted'));
	    var TransitionFailed = $q.reject(new Error('transition failed'));

	    // Handles the case where a state which is the target of a transition is not found, and the user
	    // can optionally retry or defer the transition
	    function handleRedirect(redirect, state, params, options) {
	      /**
	       * @ngdoc event
	       * @name ui.router.state.$state#$stateNotFound
	       * @eventOf ui.router.state.$state
	       * @eventType broadcast on root scope
	       * @description
	       * Fired when a requested state **cannot be found** using the provided state name during transition.
	       * The event is broadcast allowing any handlers a single chance to deal with the error (usually by
	       * lazy-loading the unfound state). A special `unfoundState` object is passed to the listener handler,
	       * you can see its three properties in the example. You can use `event.preventDefault()` to abort the
	       * transition and the promise returned from `go` will be rejected with a `'transition aborted'` value.
	       *
	       * @param {Object} event Event object.
	       * @param {Object} unfoundState Unfound State information. Contains: `to, toParams, options` properties.
	       * @param {State} fromState Current state object.
	       * @param {Object} fromParams Current state params.
	       *
	       * @example
	       *
	       * <pre>
	       * // somewhere, assume lazy.state has not been defined
	       * $state.go("lazy.state", {a:1, b:2}, {inherit:false});
	       *
	       * // somewhere else
	       * $scope.$on('$stateNotFound',
	       * function(event, unfoundState, fromState, fromParams){
	       *     console.log(unfoundState.to); // "lazy.state"
	       *     console.log(unfoundState.toParams); // {a:1, b:2}
	       *     console.log(unfoundState.options); // {inherit:false} + default options
	       * })
	       * </pre>
	       */
	      var evt = $rootScope.$broadcast('$stateNotFound', redirect, state, params);

	      if (evt.defaultPrevented) {
	        $urlRouter.update();
	        return TransitionAborted;
	      }

	      if (!evt.retry) {
	        return null;
	      }

	      // Allow the handler to return a promise to defer state lookup retry
	      if (options.$retry) {
	        $urlRouter.update();
	        return TransitionFailed;
	      }
	      var retryTransition = $state.transition = $q.when(evt.retry);

	      retryTransition.then(function() {
	        if (retryTransition !== $state.transition) return TransitionSuperseded;
	        redirect.options.$retry = true;
	        return $state.transitionTo(redirect.to, redirect.toParams, redirect.options);
	      }, function() {
	        return TransitionAborted;
	      });
	      $urlRouter.update();

	      return retryTransition;
	    }

	    root.locals = { resolve: null, globals: { $stateParams: {} } };

	    $state = {
	      params: {},
	      current: root.self,
	      $current: root,
	      transition: null
	    };

	    /**
	     * @ngdoc function
	     * @name ui.router.state.$state#reload
	     * @methodOf ui.router.state.$state
	     *
	     * @description
	     * A method that force reloads the current state. All resolves are re-resolved,
	     * controllers reinstantiated, and events re-fired.
	     *
	     * @example
	     * <pre>
	     * var app angular.module('app', ['ui.router']);
	     *
	     * app.controller('ctrl', function ($scope, $state) {
	     *   $scope.reload = function(){
	     *     $state.reload();
	     *   }
	     * });
	     * </pre>
	     *
	     * `reload()` is just an alias for:
	     * <pre>
	     * $state.transitionTo($state.current, $stateParams, { 
	     *   reload: true, inherit: false, notify: true
	     * });
	     * </pre>
	     *
	     * @param {string=|object=} state - A state name or a state object, which is the root of the resolves to be re-resolved.
	     * @example
	     * <pre>
	     * //assuming app application consists of 3 states: 'contacts', 'contacts.detail', 'contacts.detail.item' 
	     * //and current state is 'contacts.detail.item'
	     * var app angular.module('app', ['ui.router']);
	     *
	     * app.controller('ctrl', function ($scope, $state) {
	     *   $scope.reload = function(){
	     *     //will reload 'contact.detail' and 'contact.detail.item' states
	     *     $state.reload('contact.detail');
	     *   }
	     * });
	     * </pre>
	     *
	     * `reload()` is just an alias for:
	     * <pre>
	     * $state.transitionTo($state.current, $stateParams, { 
	     *   reload: true, inherit: false, notify: true
	     * });
	     * </pre>

	     * @returns {promise} A promise representing the state of the new transition. See
	     * {@link ui.router.state.$state#methods_go $state.go}.
	     */
	    $state.reload = function reload(state) {
	      return $state.transitionTo($state.current, $stateParams, { reload: state || true, inherit: false, notify: true});
	    };

	    /**
	     * @ngdoc function
	     * @name ui.router.state.$state#go
	     * @methodOf ui.router.state.$state
	     *
	     * @description
	     * Convenience method for transitioning to a new state. `$state.go` calls 
	     * `$state.transitionTo` internally but automatically sets options to 
	     * `{ location: true, inherit: true, relative: $state.$current, notify: true }`. 
	     * This allows you to easily use an absolute or relative to path and specify 
	     * only the parameters you'd like to update (while letting unspecified parameters 
	     * inherit from the currently active ancestor states).
	     *
	     * @example
	     * <pre>
	     * var app = angular.module('app', ['ui.router']);
	     *
	     * app.controller('ctrl', function ($scope, $state) {
	     *   $scope.changeState = function () {
	     *     $state.go('contact.detail');
	     *   };
	     * });
	     * </pre>
	     * <img src='../ngdoc_assets/StateGoExamples.png'/>
	     *
	     * @param {string} to Absolute state name or relative state path. Some examples:
	     *
	     * - `$state.go('contact.detail')` - will go to the `contact.detail` state
	     * - `$state.go('^')` - will go to a parent state
	     * - `$state.go('^.sibling')` - will go to a sibling state
	     * - `$state.go('.child.grandchild')` - will go to grandchild state
	     *
	     * @param {object=} params A map of the parameters that will be sent to the state, 
	     * will populate $stateParams. Any parameters that are not specified will be inherited from currently 
	     * defined parameters. Only parameters specified in the state definition can be overridden, new 
	     * parameters will be ignored. This allows, for example, going to a sibling state that shares parameters
	     * specified in a parent state. Parameter inheritance only works between common ancestor states, I.e.
	     * transitioning to a sibling will get you the parameters for all parents, transitioning to a child
	     * will get you all current parameters, etc.
	     * @param {object=} options Options object. The options are:
	     *
	     * - **`location`** - {boolean=true|string=} - If `true` will update the url in the location bar, if `false`
	     *    will not. If string, must be `"replace"`, which will update url and also replace last history record.
	     * - **`inherit`** - {boolean=true}, If `true` will inherit url parameters from current url.
	     * - **`relative`** - {object=$state.$current}, When transitioning with relative path (e.g '^'), 
	     *    defines which state to be relative from.
	     * - **`notify`** - {boolean=true}, If `true` will broadcast $stateChangeStart and $stateChangeSuccess events.
	     * - **`reload`** (v0.2.5) - {boolean=false|string|object}, If `true` will force transition even if no state or params
	     *    have changed.  It will reload the resolves and views of the current state and parent states.
	     *    If `reload` is a string (or state object), the state object is fetched (by name, or object reference); and \
	     *    the transition reloads the resolves and views for that matched state, and all its children states.
	     *
	     * @returns {promise} A promise representing the state of the new transition.
	     *
	     * Possible success values:
	     *
	     * - $state.current
	     *
	     * <br/>Possible rejection values:
	     *
	     * - 'transition superseded' - when a newer transition has been started after this one
	     * - 'transition prevented' - when `event.preventDefault()` has been called in a `$stateChangeStart` listener
	     * - 'transition aborted' - when `event.preventDefault()` has been called in a `$stateNotFound` listener or
	     *   when a `$stateNotFound` `event.retry` promise errors.
	     * - 'transition failed' - when a state has been unsuccessfully found after 2 tries.
	     * - *resolve error* - when an error has occurred with a `resolve`
	     *
	     */
	    $state.go = function go(to, params, options) {
	      return $state.transitionTo(to, params, extend({ inherit: true, relative: $state.$current }, options));
	    };

	    /**
	     * @ngdoc function
	     * @name ui.router.state.$state#transitionTo
	     * @methodOf ui.router.state.$state
	     *
	     * @description
	     * Low-level method for transitioning to a new state. {@link ui.router.state.$state#methods_go $state.go}
	     * uses `transitionTo` internally. `$state.go` is recommended in most situations.
	     *
	     * @example
	     * <pre>
	     * var app = angular.module('app', ['ui.router']);
	     *
	     * app.controller('ctrl', function ($scope, $state) {
	     *   $scope.changeState = function () {
	     *     $state.transitionTo('contact.detail');
	     *   };
	     * });
	     * </pre>
	     *
	     * @param {string} to State name.
	     * @param {object=} toParams A map of the parameters that will be sent to the state,
	     * will populate $stateParams.
	     * @param {object=} options Options object. The options are:
	     *
	     * - **`location`** - {boolean=true|string=} - If `true` will update the url in the location bar, if `false`
	     *    will not. If string, must be `"replace"`, which will update url and also replace last history record.
	     * - **`inherit`** - {boolean=false}, If `true` will inherit url parameters from current url.
	     * - **`relative`** - {object=}, When transitioning with relative path (e.g '^'), 
	     *    defines which state to be relative from.
	     * - **`notify`** - {boolean=true}, If `true` will broadcast $stateChangeStart and $stateChangeSuccess events.
	     * - **`reload`** (v0.2.5) - {boolean=false|string=|object=}, If `true` will force transition even if the state or params 
	     *    have not changed, aka a reload of the same state. It differs from reloadOnSearch because you'd
	     *    use this when you want to force a reload when *everything* is the same, including search params.
	     *    if String, then will reload the state with the name given in reload, and any children.
	     *    if Object, then a stateObj is expected, will reload the state found in stateObj, and any children.
	     *
	     * @returns {promise} A promise representing the state of the new transition. See
	     * {@link ui.router.state.$state#methods_go $state.go}.
	     */
	    $state.transitionTo = function transitionTo(to, toParams, options) {
	      toParams = toParams || {};
	      options = extend({
	        location: true, inherit: false, relative: null, notify: true, reload: false, $retry: false
	      }, options || {});

	      var from = $state.$current, fromParams = $state.params, fromPath = from.path;
	      var evt, toState = findState(to, options.relative);

	      // Store the hash param for later (since it will be stripped out by various methods)
	      var hash = toParams['#'];

	      if (!isDefined(toState)) {
	        var redirect = { to: to, toParams: toParams, options: options };
	        var redirectResult = handleRedirect(redirect, from.self, fromParams, options);

	        if (redirectResult) {
	          return redirectResult;
	        }

	        // Always retry once if the $stateNotFound was not prevented
	        // (handles either redirect changed or state lazy-definition)
	        to = redirect.to;
	        toParams = redirect.toParams;
	        options = redirect.options;
	        toState = findState(to, options.relative);

	        if (!isDefined(toState)) {
	          if (!options.relative) throw new Error("No such state '" + to + "'");
	          throw new Error("Could not resolve '" + to + "' from state '" + options.relative + "'");
	        }
	      }
	      if (toState[abstractKey]) throw new Error("Cannot transition to abstract state '" + to + "'");
	      if (options.inherit) toParams = inheritParams($stateParams, toParams || {}, $state.$current, toState);
	      if (!toState.params.$$validates(toParams)) return TransitionFailed;

	      toParams = toState.params.$$values(toParams);
	      to = toState;

	      var toPath = to.path;

	      // Starting from the root of the path, keep all levels that haven't changed
	      var keep = 0, state = toPath[keep], locals = root.locals, toLocals = [];

	      if (!options.reload) {
	        while (state && state === fromPath[keep] && state.ownParams.$$equals(toParams, fromParams)) {
	          locals = toLocals[keep] = state.locals;
	          keep++;
	          state = toPath[keep];
	        }
	      } else if (isString(options.reload) || isObject(options.reload)) {
	        if (isObject(options.reload) && !options.reload.name) {
	          throw new Error('Invalid reload state object');
	        }
	        
	        var reloadState = options.reload === true ? fromPath[0] : findState(options.reload);
	        if (options.reload && !reloadState) {
	          throw new Error("No such reload state '" + (isString(options.reload) ? options.reload : options.reload.name) + "'");
	        }

	        while (state && state === fromPath[keep] && state !== reloadState) {
	          locals = toLocals[keep] = state.locals;
	          keep++;
	          state = toPath[keep];
	        }
	      }

	      // If we're going to the same state and all locals are kept, we've got nothing to do.
	      // But clear 'transition', as we still want to cancel any other pending transitions.
	      // TODO: We may not want to bump 'transition' if we're called from a location change
	      // that we've initiated ourselves, because we might accidentally abort a legitimate
	      // transition initiated from code?
	      if (shouldSkipReload(to, toParams, from, fromParams, locals, options)) {
	        if (hash) toParams['#'] = hash;
	        $state.params = toParams;
	        copy($state.params, $stateParams);
	        copy(filterByKeys(to.params.$$keys(), $stateParams), to.locals.globals.$stateParams);
	        if (options.location && to.navigable && to.navigable.url) {
	          $urlRouter.push(to.navigable.url, toParams, {
	            $$avoidResync: true, replace: options.location === 'replace'
	          });
	          $urlRouter.update(true);
	        }
	        $state.transition = null;
	        return $q.when($state.current);
	      }

	      // Filter parameters before we pass them to event handlers etc.
	      toParams = filterByKeys(to.params.$$keys(), toParams || {});
	      
	      // Re-add the saved hash before we start returning things or broadcasting $stateChangeStart
	      if (hash) toParams['#'] = hash;
	      
	      // Broadcast start event and cancel the transition if requested
	      if (options.notify) {
	        /**
	         * @ngdoc event
	         * @name ui.router.state.$state#$stateChangeStart
	         * @eventOf ui.router.state.$state
	         * @eventType broadcast on root scope
	         * @description
	         * Fired when the state transition **begins**. You can use `event.preventDefault()`
	         * to prevent the transition from happening and then the transition promise will be
	         * rejected with a `'transition prevented'` value.
	         *
	         * @param {Object} event Event object.
	         * @param {State} toState The state being transitioned to.
	         * @param {Object} toParams The params supplied to the `toState`.
	         * @param {State} fromState The current state, pre-transition.
	         * @param {Object} fromParams The params supplied to the `fromState`.
	         *
	         * @example
	         *
	         * <pre>
	         * $rootScope.$on('$stateChangeStart',
	         * function(event, toState, toParams, fromState, fromParams){
	         *     event.preventDefault();
	         *     // transitionTo() promise will be rejected with
	         *     // a 'transition prevented' error
	         * })
	         * </pre>
	         */
	        if ($rootScope.$broadcast('$stateChangeStart', to.self, toParams, from.self, fromParams, options).defaultPrevented) {
	          $rootScope.$broadcast('$stateChangeCancel', to.self, toParams, from.self, fromParams);
	          //Don't update and resync url if there's been a new transition started. see issue #2238, #600
	          if ($state.transition == null) $urlRouter.update();
	          return TransitionPrevented;
	        }
	      }

	      // Resolve locals for the remaining states, but don't update any global state just
	      // yet -- if anything fails to resolve the current state needs to remain untouched.
	      // We also set up an inheritance chain for the locals here. This allows the view directive
	      // to quickly look up the correct definition for each view in the current state. Even
	      // though we create the locals object itself outside resolveState(), it is initially
	      // empty and gets filled asynchronously. We need to keep track of the promise for the
	      // (fully resolved) current locals, and pass this down the chain.
	      var resolved = $q.when(locals);

	      for (var l = keep; l < toPath.length; l++, state = toPath[l]) {
	        locals = toLocals[l] = inherit(locals);
	        resolved = resolveState(state, toParams, state === to, resolved, locals, options);
	      }

	      // Once everything is resolved, we are ready to perform the actual transition
	      // and return a promise for the new state. We also keep track of what the
	      // current promise is, so that we can detect overlapping transitions and
	      // keep only the outcome of the last transition.
	      var transition = $state.transition = resolved.then(function () {
	        var l, entering, exiting;

	        if ($state.transition !== transition) return TransitionSuperseded;

	        // Exit 'from' states not kept
	        for (l = fromPath.length - 1; l >= keep; l--) {
	          exiting = fromPath[l];
	          if (exiting.self.onExit) {
	            $injector.invoke(exiting.self.onExit, exiting.self, exiting.locals.globals);
	          }
	          exiting.locals = null;
	        }

	        // Enter 'to' states not kept
	        for (l = keep; l < toPath.length; l++) {
	          entering = toPath[l];
	          entering.locals = toLocals[l];
	          if (entering.self.onEnter) {
	            $injector.invoke(entering.self.onEnter, entering.self, entering.locals.globals);
	          }
	        }

	        // Run it again, to catch any transitions in callbacks
	        if ($state.transition !== transition) return TransitionSuperseded;

	        // Update globals in $state
	        $state.$current = to;
	        $state.current = to.self;
	        $state.params = toParams;
	        copy($state.params, $stateParams);
	        $state.transition = null;

	        if (options.location && to.navigable) {
	          $urlRouter.push(to.navigable.url, to.navigable.locals.globals.$stateParams, {
	            $$avoidResync: true, replace: options.location === 'replace'
	          });
	        }

	        if (options.notify) {
	        /**
	         * @ngdoc event
	         * @name ui.router.state.$state#$stateChangeSuccess
	         * @eventOf ui.router.state.$state
	         * @eventType broadcast on root scope
	         * @description
	         * Fired once the state transition is **complete**.
	         *
	         * @param {Object} event Event object.
	         * @param {State} toState The state being transitioned to.
	         * @param {Object} toParams The params supplied to the `toState`.
	         * @param {State} fromState The current state, pre-transition.
	         * @param {Object} fromParams The params supplied to the `fromState`.
	         */
	          $rootScope.$broadcast('$stateChangeSuccess', to.self, toParams, from.self, fromParams);
	        }
	        $urlRouter.update(true);

	        return $state.current;
	      }).then(null, function (error) {
	        if ($state.transition !== transition) return TransitionSuperseded;

	        $state.transition = null;
	        /**
	         * @ngdoc event
	         * @name ui.router.state.$state#$stateChangeError
	         * @eventOf ui.router.state.$state
	         * @eventType broadcast on root scope
	         * @description
	         * Fired when an **error occurs** during transition. It's important to note that if you
	         * have any errors in your resolve functions (javascript errors, non-existent services, etc)
	         * they will not throw traditionally. You must listen for this $stateChangeError event to
	         * catch **ALL** errors.
	         *
	         * @param {Object} event Event object.
	         * @param {State} toState The state being transitioned to.
	         * @param {Object} toParams The params supplied to the `toState`.
	         * @param {State} fromState The current state, pre-transition.
	         * @param {Object} fromParams The params supplied to the `fromState`.
	         * @param {Error} error The resolve error object.
	         */
	        evt = $rootScope.$broadcast('$stateChangeError', to.self, toParams, from.self, fromParams, error);

	        if (!evt.defaultPrevented) {
	            $urlRouter.update();
	        }

	        return $q.reject(error);
	      });

	      return transition;
	    };

	    /**
	     * @ngdoc function
	     * @name ui.router.state.$state#is
	     * @methodOf ui.router.state.$state
	     *
	     * @description
	     * Similar to {@link ui.router.state.$state#methods_includes $state.includes},
	     * but only checks for the full state name. If params is supplied then it will be
	     * tested for strict equality against the current active params object, so all params
	     * must match with none missing and no extras.
	     *
	     * @example
	     * <pre>
	     * $state.$current.name = 'contacts.details.item';
	     *
	     * // absolute name
	     * $state.is('contact.details.item'); // returns true
	     * $state.is(contactDetailItemStateObject); // returns true
	     *
	     * // relative name (. and ^), typically from a template
	     * // E.g. from the 'contacts.details' template
	     * <div ng-class="{highlighted: $state.is('.item')}">Item</div>
	     * </pre>
	     *
	     * @param {string|object} stateOrName The state name (absolute or relative) or state object you'd like to check.
	     * @param {object=} params A param object, e.g. `{sectionId: section.id}`, that you'd like
	     * to test against the current active state.
	     * @param {object=} options An options object.  The options are:
	     *
	     * - **`relative`** - {string|object} -  If `stateOrName` is a relative state name and `options.relative` is set, .is will
	     * test relative to `options.relative` state (or name).
	     *
	     * @returns {boolean} Returns true if it is the state.
	     */
	    $state.is = function is(stateOrName, params, options) {
	      options = extend({ relative: $state.$current }, options || {});
	      var state = findState(stateOrName, options.relative);

	      if (!isDefined(state)) { return undefined; }
	      if ($state.$current !== state) { return false; }
	      return params ? equalForKeys(state.params.$$values(params), $stateParams) : true;
	    };

	    /**
	     * @ngdoc function
	     * @name ui.router.state.$state#includes
	     * @methodOf ui.router.state.$state
	     *
	     * @description
	     * A method to determine if the current active state is equal to or is the child of the
	     * state stateName. If any params are passed then they will be tested for a match as well.
	     * Not all the parameters need to be passed, just the ones you'd like to test for equality.
	     *
	     * @example
	     * Partial and relative names
	     * <pre>
	     * $state.$current.name = 'contacts.details.item';
	     *
	     * // Using partial names
	     * $state.includes("contacts"); // returns true
	     * $state.includes("contacts.details"); // returns true
	     * $state.includes("contacts.details.item"); // returns true
	     * $state.includes("contacts.list"); // returns false
	     * $state.includes("about"); // returns false
	     *
	     * // Using relative names (. and ^), typically from a template
	     * // E.g. from the 'contacts.details' template
	     * <div ng-class="{highlighted: $state.includes('.item')}">Item</div>
	     * </pre>
	     *
	     * Basic globbing patterns
	     * <pre>
	     * $state.$current.name = 'contacts.details.item.url';
	     *
	     * $state.includes("*.details.*.*"); // returns true
	     * $state.includes("*.details.**"); // returns true
	     * $state.includes("**.item.**"); // returns true
	     * $state.includes("*.details.item.url"); // returns true
	     * $state.includes("*.details.*.url"); // returns true
	     * $state.includes("*.details.*"); // returns false
	     * $state.includes("item.**"); // returns false
	     * </pre>
	     *
	     * @param {string} stateOrName A partial name, relative name, or glob pattern
	     * to be searched for within the current state name.
	     * @param {object=} params A param object, e.g. `{sectionId: section.id}`,
	     * that you'd like to test against the current active state.
	     * @param {object=} options An options object.  The options are:
	     *
	     * - **`relative`** - {string|object=} -  If `stateOrName` is a relative state reference and `options.relative` is set,
	     * .includes will test relative to `options.relative` state (or name).
	     *
	     * @returns {boolean} Returns true if it does include the state
	     */
	    $state.includes = function includes(stateOrName, params, options) {
	      options = extend({ relative: $state.$current }, options || {});
	      if (isString(stateOrName) && isGlob(stateOrName)) {
	        if (!doesStateMatchGlob(stateOrName)) {
	          return false;
	        }
	        stateOrName = $state.$current.name;
	      }

	      var state = findState(stateOrName, options.relative);
	      if (!isDefined(state)) { return undefined; }
	      if (!isDefined($state.$current.includes[state.name])) { return false; }
	      return params ? equalForKeys(state.params.$$values(params), $stateParams, objectKeys(params)) : true;
	    };


	    /**
	     * @ngdoc function
	     * @name ui.router.state.$state#href
	     * @methodOf ui.router.state.$state
	     *
	     * @description
	     * A url generation method that returns the compiled url for the given state populated with the given params.
	     *
	     * @example
	     * <pre>
	     * expect($state.href("about.person", { person: "bob" })).toEqual("/about/bob");
	     * </pre>
	     *
	     * @param {string|object} stateOrName The state name or state object you'd like to generate a url from.
	     * @param {object=} params An object of parameter values to fill the state's required parameters.
	     * @param {object=} options Options object. The options are:
	     *
	     * - **`lossy`** - {boolean=true} -  If true, and if there is no url associated with the state provided in the
	     *    first parameter, then the constructed href url will be built from the first navigable ancestor (aka
	     *    ancestor with a valid url).
	     * - **`inherit`** - {boolean=true}, If `true` will inherit url parameters from current url.
	     * - **`relative`** - {object=$state.$current}, When transitioning with relative path (e.g '^'), 
	     *    defines which state to be relative from.
	     * - **`absolute`** - {boolean=false},  If true will generate an absolute url, e.g. "http://www.example.com/fullurl".
	     * 
	     * @returns {string} compiled state url
	     */
	    $state.href = function href(stateOrName, params, options) {
	      options = extend({
	        lossy:    true,
	        inherit:  true,
	        absolute: false,
	        relative: $state.$current
	      }, options || {});

	      var state = findState(stateOrName, options.relative);

	      if (!isDefined(state)) return null;
	      if (options.inherit) params = inheritParams($stateParams, params || {}, $state.$current, state);
	      
	      var nav = (state && options.lossy) ? state.navigable : state;

	      if (!nav || nav.url === undefined || nav.url === null) {
	        return null;
	      }
	      return $urlRouter.href(nav.url, filterByKeys(state.params.$$keys().concat('#'), params || {}), {
	        absolute: options.absolute
	      });
	    };

	    /**
	     * @ngdoc function
	     * @name ui.router.state.$state#get
	     * @methodOf ui.router.state.$state
	     *
	     * @description
	     * Returns the state configuration object for any specific state or all states.
	     *
	     * @param {string|object=} stateOrName (absolute or relative) If provided, will only get the config for
	     * the requested state. If not provided, returns an array of ALL state configs.
	     * @param {string|object=} context When stateOrName is a relative state reference, the state will be retrieved relative to context.
	     * @returns {Object|Array} State configuration object or array of all objects.
	     */
	    $state.get = function (stateOrName, context) {
	      if (arguments.length === 0) return map(objectKeys(states), function(name) { return states[name].self; });
	      var state = findState(stateOrName, context || $state.$current);
	      return (state && state.self) ? state.self : null;
	    };

	    function resolveState(state, params, paramsAreFiltered, inherited, dst, options) {
	      // Make a restricted $stateParams with only the parameters that apply to this state if
	      // necessary. In addition to being available to the controller and onEnter/onExit callbacks,
	      // we also need $stateParams to be available for any $injector calls we make during the
	      // dependency resolution process.
	      var $stateParams = (paramsAreFiltered) ? params : filterByKeys(state.params.$$keys(), params);
	      var locals = { $stateParams: $stateParams };

	      // Resolve 'global' dependencies for the state, i.e. those not specific to a view.
	      // We're also including $stateParams in this; that way the parameters are restricted
	      // to the set that should be visible to the state, and are independent of when we update
	      // the global $state and $stateParams values.
	      dst.resolve = $resolve.resolve(state.resolve, locals, dst.resolve, state);
	      var promises = [dst.resolve.then(function (globals) {
	        dst.globals = globals;
	      })];
	      if (inherited) promises.push(inherited);

	      function resolveViews() {
	        var viewsPromises = [];

	        // Resolve template and dependencies for all views.
	        forEach(state.views, function (view, name) {
	          var injectables = (view.resolve && view.resolve !== state.resolve ? view.resolve : {});
	          injectables.$template = [ function () {
	            return $view.load(name, { view: view, locals: dst.globals, params: $stateParams, notify: options.notify }) || '';
	          }];

	          viewsPromises.push($resolve.resolve(injectables, dst.globals, dst.resolve, state).then(function (result) {
	            // References to the controller (only instantiated at link time)
	            if (isFunction(view.controllerProvider) || isArray(view.controllerProvider)) {
	              var injectLocals = angular.extend({}, injectables, dst.globals);
	              result.$$controller = $injector.invoke(view.controllerProvider, null, injectLocals);
	            } else {
	              result.$$controller = view.controller;
	            }
	            // Provide access to the state itself for internal use
	            result.$$state = state;
	            result.$$controllerAs = view.controllerAs;
	            result.$$resolveAs = view.resolveAs;
	            dst[name] = result;
	          }));
	        });

	        return $q.all(viewsPromises).then(function(){
	          return dst.globals;
	        });
	      }

	      // Wait for all the promises and then return the activation object
	      return $q.all(promises).then(resolveViews).then(function (values) {
	        return dst;
	      });
	    }

	    return $state;
	  }

	  function shouldSkipReload(to, toParams, from, fromParams, locals, options) {
	    // Return true if there are no differences in non-search (path/object) params, false if there are differences
	    function nonSearchParamsEqual(fromAndToState, fromParams, toParams) {
	      // Identify whether all the parameters that differ between `fromParams` and `toParams` were search params.
	      function notSearchParam(key) {
	        return fromAndToState.params[key].location != "search";
	      }
	      var nonQueryParamKeys = fromAndToState.params.$$keys().filter(notSearchParam);
	      var nonQueryParams = pick.apply({}, [fromAndToState.params].concat(nonQueryParamKeys));
	      var nonQueryParamSet = new $$UMFP.ParamSet(nonQueryParams);
	      return nonQueryParamSet.$$equals(fromParams, toParams);
	    }

	    // If reload was not explicitly requested
	    // and we're transitioning to the same state we're already in
	    // and    the locals didn't change
	    //     or they changed in a way that doesn't merit reloading
	    //        (reloadOnParams:false, or reloadOnSearch.false and only search params changed)
	    // Then return true.
	    if (!options.reload && to === from &&
	      (locals === from.locals || (to.self.reloadOnSearch === false && nonSearchParamsEqual(from, fromParams, toParams)))) {
	      return true;
	    }
	  }
	}

	angular.module('ui.router.state')
	  .factory('$stateParams', function () { return {}; })
	  .constant("$state.runtime", { autoinject: true })
	  .provider('$state', $StateProvider)
	  // Inject $state to initialize when entering runtime. #2574
	  .run(['$injector', function ($injector) {
	    // Allow tests (stateSpec.js) to turn this off by defining this constant
	    if ($injector.get("$state.runtime").autoinject) {
	      $injector.get('$state');
	    }
	  }]);


	$ViewProvider.$inject = [];
	function $ViewProvider() {

	  this.$get = $get;
	  /**
	   * @ngdoc object
	   * @name ui.router.state.$view
	   *
	   * @requires ui.router.util.$templateFactory
	   * @requires $rootScope
	   *
	   * @description
	   *
	   */
	  $get.$inject = ['$rootScope', '$templateFactory'];
	  function $get(   $rootScope,   $templateFactory) {
	    return {
	      // $view.load('full.viewName', { template: ..., controller: ..., resolve: ..., async: false, params: ... })
	      /**
	       * @ngdoc function
	       * @name ui.router.state.$view#load
	       * @methodOf ui.router.state.$view
	       *
	       * @description
	       *
	       * @param {string} name name
	       * @param {object} options option object.
	       */
	      load: function load(name, options) {
	        var result, defaults = {
	          template: null, controller: null, view: null, locals: null, notify: true, async: true, params: {}
	        };
	        options = extend(defaults, options);

	        if (options.view) {
	          result = $templateFactory.fromConfig(options.view, options.params, options.locals);
	        }
	        return result;
	      }
	    };
	  }
	}

	angular.module('ui.router.state').provider('$view', $ViewProvider);

	/**
	 * @ngdoc object
	 * @name ui.router.state.$uiViewScrollProvider
	 *
	 * @description
	 * Provider that returns the {@link ui.router.state.$uiViewScroll} service function.
	 */
	function $ViewScrollProvider() {

	  var useAnchorScroll = false;

	  /**
	   * @ngdoc function
	   * @name ui.router.state.$uiViewScrollProvider#useAnchorScroll
	   * @methodOf ui.router.state.$uiViewScrollProvider
	   *
	   * @description
	   * Reverts back to using the core [`$anchorScroll`](http://docs.angularjs.org/api/ng.$anchorScroll) service for
	   * scrolling based on the url anchor.
	   */
	  this.useAnchorScroll = function () {
	    useAnchorScroll = true;
	  };

	  /**
	   * @ngdoc object
	   * @name ui.router.state.$uiViewScroll
	   *
	   * @requires $anchorScroll
	   * @requires $timeout
	   *
	   * @description
	   * When called with a jqLite element, it scrolls the element into view (after a
	   * `$timeout` so the DOM has time to refresh).
	   *
	   * If you prefer to rely on `$anchorScroll` to scroll the view to the anchor,
	   * this can be enabled by calling {@link ui.router.state.$uiViewScrollProvider#methods_useAnchorScroll `$uiViewScrollProvider.useAnchorScroll()`}.
	   */
	  this.$get = ['$anchorScroll', '$timeout', function ($anchorScroll, $timeout) {
	    if (useAnchorScroll) {
	      return $anchorScroll;
	    }

	    return function ($element) {
	      return $timeout(function () {
	        $element[0].scrollIntoView();
	      }, 0, false);
	    };
	  }];
	}

	angular.module('ui.router.state').provider('$uiViewScroll', $ViewScrollProvider);

	/**
	 * @ngdoc directive
	 * @name ui.router.state.directive:ui-view
	 *
	 * @requires ui.router.state.$state
	 * @requires $compile
	 * @requires $controller
	 * @requires $injector
	 * @requires ui.router.state.$uiViewScroll
	 * @requires $document
	 *
	 * @restrict ECA
	 *
	 * @description
	 * The ui-view directive tells $state where to place your templates.
	 *
	 * @param {string=} name A view name. The name should be unique amongst the other views in the
	 * same state. You can have views of the same name that live in different states.
	 *
	 * @param {string=} autoscroll It allows you to set the scroll behavior of the browser window
	 * when a view is populated. By default, $anchorScroll is overridden by ui-router's custom scroll
	 * service, {@link ui.router.state.$uiViewScroll}. This custom service let's you
	 * scroll ui-view elements into view when they are populated during a state activation.
	 *
	 * *Note: To revert back to old [`$anchorScroll`](http://docs.angularjs.org/api/ng.$anchorScroll)
	 * functionality, call `$uiViewScrollProvider.useAnchorScroll()`.*
	 *
	 * @param {string=} onload Expression to evaluate whenever the view updates.
	 *
	 * @example
	 * A view can be unnamed or named.
	 * <pre>
	 * <!-- Unnamed -->
	 * <div ui-view></div>
	 *
	 * <!-- Named -->
	 * <div ui-view="viewName"></div>
	 * </pre>
	 *
	 * You can only have one unnamed view within any template (or root html). If you are only using a
	 * single view and it is unnamed then you can populate it like so:
	 * <pre>
	 * <div ui-view></div>
	 * $stateProvider.state("home", {
	 *   template: "<h1>HELLO!</h1>"
	 * })
	 * </pre>
	 *
	 * The above is a convenient shortcut equivalent to specifying your view explicitly with the {@link ui.router.state.$stateProvider#methods_state `views`}
	 * config property, by name, in this case an empty name:
	 * <pre>
	 * $stateProvider.state("home", {
	 *   views: {
	 *     "": {
	 *       template: "<h1>HELLO!</h1>"
	 *     }
	 *   }    
	 * })
	 * </pre>
	 *
	 * But typically you'll only use the views property if you name your view or have more than one view
	 * in the same template. There's not really a compelling reason to name a view if its the only one,
	 * but you could if you wanted, like so:
	 * <pre>
	 * <div ui-view="main"></div>
	 * </pre>
	 * <pre>
	 * $stateProvider.state("home", {
	 *   views: {
	 *     "main": {
	 *       template: "<h1>HELLO!</h1>"
	 *     }
	 *   }    
	 * })
	 * </pre>
	 *
	 * Really though, you'll use views to set up multiple views:
	 * <pre>
	 * <div ui-view></div>
	 * <div ui-view="chart"></div>
	 * <div ui-view="data"></div>
	 * </pre>
	 *
	 * <pre>
	 * $stateProvider.state("home", {
	 *   views: {
	 *     "": {
	 *       template: "<h1>HELLO!</h1>"
	 *     },
	 *     "chart": {
	 *       template: "<chart_thing/>"
	 *     },
	 *     "data": {
	 *       template: "<data_thing/>"
	 *     }
	 *   }    
	 * })
	 * </pre>
	 *
	 * Examples for `autoscroll`:
	 *
	 * <pre>
	 * <!-- If autoscroll present with no expression,
	 *      then scroll ui-view into view -->
	 * <ui-view autoscroll/>
	 *
	 * <!-- If autoscroll present with valid expression,
	 *      then scroll ui-view into view if expression evaluates to true -->
	 * <ui-view autoscroll='true'/>
	 * <ui-view autoscroll='false'/>
	 * <ui-view autoscroll='scopeVariable'/>
	 * </pre>
	 *
	 * Resolve data:
	 *
	 * The resolved data from the state's `resolve` block is placed on the scope as `$resolve` (this
	 * can be customized using [[ViewDeclaration.resolveAs]]).  This can be then accessed from the template.
	 *
	 * Note that when `controllerAs` is being used, `$resolve` is set on the controller instance *after* the
	 * controller is instantiated.  The `$onInit()` hook can be used to perform initialization code which
	 * depends on `$resolve` data.
	 *
	 * Example usage of $resolve in a view template
	 * <pre>
	 * $stateProvider.state('home', {
	 *   template: '<my-component user="$resolve.user"></my-component>',
	 *   resolve: {
	 *     user: function(UserService) { return UserService.fetchUser(); }
	 *   }
	 * });
	 * </pre>
	 */
	$ViewDirective.$inject = ['$state', '$injector', '$uiViewScroll', '$interpolate', '$q'];
	function $ViewDirective(   $state,   $injector,   $uiViewScroll,   $interpolate,   $q) {

	  function getService() {
	    return ($injector.has) ? function(service) {
	      return $injector.has(service) ? $injector.get(service) : null;
	    } : function(service) {
	      try {
	        return $injector.get(service);
	      } catch (e) {
	        return null;
	      }
	    };
	  }

	  var service = getService(),
	      $animator = service('$animator'),
	      $animate = service('$animate');

	  // Returns a set of DOM manipulation functions based on which Angular version
	  // it should use
	  function getRenderer(attrs, scope) {
	    var statics = function() {
	      return {
	        enter: function (element, target, cb) { target.after(element); cb(); },
	        leave: function (element, cb) { element.remove(); cb(); }
	      };
	    };

	    if ($animate) {
	      return {
	        enter: function(element, target, cb) {
	          if (angular.version.minor > 2) {
	            $animate.enter(element, null, target).then(cb);
	          } else {
	            $animate.enter(element, null, target, cb);
	          }
	        },
	        leave: function(element, cb) {
	          if (angular.version.minor > 2) {
	            $animate.leave(element).then(cb);
	          } else {
	            $animate.leave(element, cb);
	          }
	        }
	      };
	    }

	    if ($animator) {
	      var animate = $animator && $animator(scope, attrs);

	      return {
	        enter: function(element, target, cb) {animate.enter(element, null, target); cb(); },
	        leave: function(element, cb) { animate.leave(element); cb(); }
	      };
	    }

	    return statics();
	  }

	  var directive = {
	    restrict: 'ECA',
	    terminal: true,
	    priority: 400,
	    transclude: 'element',
	    compile: function (tElement, tAttrs, $transclude) {
	      return function (scope, $element, attrs) {
	        var previousEl, currentEl, currentScope, latestLocals,
	            onloadExp     = attrs.onload || '',
	            autoScrollExp = attrs.autoscroll,
	            renderer      = getRenderer(attrs, scope),
	            inherited     = $element.inheritedData('$uiView');

	        scope.$on('$stateChangeSuccess', function() {
	          updateView(false);
	        });

	        updateView(true);

	        function cleanupLastView() {
	          if (previousEl) {
	            previousEl.remove();
	            previousEl = null;
	          }

	          if (currentScope) {
	            currentScope.$destroy();
	            currentScope = null;
	          }

	          if (currentEl) {
	            var $uiViewData = currentEl.data('$uiViewAnim');
	            renderer.leave(currentEl, function() {
	              $uiViewData.$$animLeave.resolve();
	              previousEl = null;
	            });

	            previousEl = currentEl;
	            currentEl = null;
	          }
	        }

	        function updateView(firstTime) {
	          var newScope,
	              name            = getUiViewName(scope, attrs, $element, $interpolate),
	              previousLocals  = name && $state.$current && $state.$current.locals[name];

	          if (!firstTime && previousLocals === latestLocals) return; // nothing to do
	          newScope = scope.$new();
	          latestLocals = $state.$current.locals[name];

	          /**
	           * @ngdoc event
	           * @name ui.router.state.directive:ui-view#$viewContentLoading
	           * @eventOf ui.router.state.directive:ui-view
	           * @eventType emits on ui-view directive scope
	           * @description
	           *
	           * Fired once the view **begins loading**, *before* the DOM is rendered.
	           *
	           * @param {Object} event Event object.
	           * @param {string} viewName Name of the view.
	           */
	          newScope.$emit('$viewContentLoading', name);

	          var clone = $transclude(newScope, function(clone) {
	            var animEnter = $q.defer(), animLeave = $q.defer();
	            var viewAnimData = {
	              $animEnter: animEnter.promise,
	              $animLeave: animLeave.promise,
	              $$animLeave: animLeave
	            };

	            clone.data('$uiViewAnim', viewAnimData);
	            renderer.enter(clone, $element, function onUiViewEnter() {
	              animEnter.resolve();
	              if(currentScope) {
	                currentScope.$emit('$viewContentAnimationEnded');
	              }

	              if (angular.isDefined(autoScrollExp) && !autoScrollExp || scope.$eval(autoScrollExp)) {
	                $uiViewScroll(clone);
	              }
	            });
	            cleanupLastView();
	          });

	          currentEl = clone;
	          currentScope = newScope;
	          /**
	           * @ngdoc event
	           * @name ui.router.state.directive:ui-view#$viewContentLoaded
	           * @eventOf ui.router.state.directive:ui-view
	           * @eventType emits on ui-view directive scope
	           * @description
	           * Fired once the view is **loaded**, *after* the DOM is rendered.
	           *
	           * @param {Object} event Event object.
	           * @param {string} viewName Name of the view.
	           */
	          currentScope.$emit('$viewContentLoaded', name);
	          currentScope.$eval(onloadExp);
	        }
	      };
	    }
	  };

	  return directive;
	}

	$ViewDirectiveFill.$inject = ['$compile', '$controller', '$state', '$interpolate'];
	function $ViewDirectiveFill (  $compile,   $controller,   $state,   $interpolate) {
	  return {
	    restrict: 'ECA',
	    priority: -400,
	    compile: function (tElement) {
	      var initial = tElement.html();
	      return function (scope, $element, attrs) {
	        var current = $state.$current,
	            name = getUiViewName(scope, attrs, $element, $interpolate),
	            locals  = current && current.locals[name];

	        if (! locals) {
	          return;
	        }

	        $element.data('$uiView', { name: name, state: locals.$$state });
	        $element.html(locals.$template ? locals.$template : initial);

	        var resolveData = angular.extend({}, locals);
	        scope[locals.$$resolveAs] = resolveData;

	        var link = $compile($element.contents());

	        if (locals.$$controller) {
	          locals.$scope = scope;
	          locals.$element = $element;
	          var controller = $controller(locals.$$controller, locals);
	          if (locals.$$controllerAs) {
	            scope[locals.$$controllerAs] = controller;
	            scope[locals.$$controllerAs][locals.$$resolveAs] = resolveData;
	          }
	          if (isFunction(controller.$onInit)) controller.$onInit();
	          $element.data('$ngControllerController', controller);
	          $element.children().data('$ngControllerController', controller);
	        }

	        link(scope);
	      };
	    }
	  };
	}

	/**
	 * Shared ui-view code for both directives:
	 * Given scope, element, and its attributes, return the view's name
	 */
	function getUiViewName(scope, attrs, element, $interpolate) {
	  var name = $interpolate(attrs.uiView || attrs.name || '')(scope);
	  var uiViewCreatedBy = element.inheritedData('$uiView');
	  return name.indexOf('@') >= 0 ?  name :  (name + '@' + (uiViewCreatedBy ? uiViewCreatedBy.state.name : ''));
	}

	angular.module('ui.router.state').directive('uiView', $ViewDirective);
	angular.module('ui.router.state').directive('uiView', $ViewDirectiveFill);

	function parseStateRef(ref, current) {
	  var preparsed = ref.match(/^\s*({[^}]*})\s*$/), parsed;
	  if (preparsed) ref = current + '(' + preparsed[1] + ')';
	  parsed = ref.replace(/\n/g, " ").match(/^([^(]+?)\s*(\((.*)\))?$/);
	  if (!parsed || parsed.length !== 4) throw new Error("Invalid state ref '" + ref + "'");
	  return { state: parsed[1], paramExpr: parsed[3] || null };
	}

	function stateContext(el) {
	  var stateData = el.parent().inheritedData('$uiView');

	  if (stateData && stateData.state && stateData.state.name) {
	    return stateData.state;
	  }
	}

	function getTypeInfo(el) {
	  // SVGAElement does not use the href attribute, but rather the 'xlinkHref' attribute.
	  var isSvg = Object.prototype.toString.call(el.prop('href')) === '[object SVGAnimatedString]';
	  var isForm = el[0].nodeName === "FORM";

	  return {
	    attr: isForm ? "action" : (isSvg ? 'xlink:href' : 'href'),
	    isAnchor: el.prop("tagName").toUpperCase() === "A",
	    clickable: !isForm
	  };
	}

	function clickHook(el, $state, $timeout, type, current) {
	  return function(e) {
	    var button = e.which || e.button, target = current();

	    if (!(button > 1 || e.ctrlKey || e.metaKey || e.shiftKey || el.attr('target'))) {
	      // HACK: This is to allow ng-clicks to be processed before the transition is initiated:
	      var transition = $timeout(function() {
	        $state.go(target.state, target.params, target.options);
	      });
	      e.preventDefault();

	      // if the state has no URL, ignore one preventDefault from the <a> directive.
	      var ignorePreventDefaultCount = type.isAnchor && !target.href ? 1: 0;

	      e.preventDefault = function() {
	        if (ignorePreventDefaultCount-- <= 0) $timeout.cancel(transition);
	      };
	    }
	  };
	}

	function defaultOpts(el, $state) {
	  return { relative: stateContext(el) || $state.$current, inherit: true };
	}

	/**
	 * @ngdoc directive
	 * @name ui.router.state.directive:ui-sref
	 *
	 * @requires ui.router.state.$state
	 * @requires $timeout
	 *
	 * @restrict A
	 *
	 * @description
	 * A directive that binds a link (`<a>` tag) to a state. If the state has an associated
	 * URL, the directive will automatically generate & update the `href` attribute via
	 * the {@link ui.router.state.$state#methods_href $state.href()} method. Clicking
	 * the link will trigger a state transition with optional parameters.
	 *
	 * Also middle-clicking, right-clicking, and ctrl-clicking on the link will be
	 * handled natively by the browser.
	 *
	 * You can also use relative state paths within ui-sref, just like the relative
	 * paths passed to `$state.go()`. You just need to be aware that the path is relative
	 * to the state that the link lives in, in other words the state that loaded the
	 * template containing the link.
	 *
	 * You can specify options to pass to {@link ui.router.state.$state#methods_go $state.go()}
	 * using the `ui-sref-opts` attribute. Options are restricted to `location`, `inherit`,
	 * and `reload`.
	 *
	 * @example
	 * Here's an example of how you'd use ui-sref and how it would compile. If you have the
	 * following template:
	 * <pre>
	 * <a ui-sref="home">Home</a> | <a ui-sref="about">About</a> | <a ui-sref="{page: 2}">Next page</a>
	 *
	 * <ul>
	 *     <li ng-repeat="contact in contacts">
	 *         <a ui-sref="contacts.detail({ id: contact.id })">{{ contact.name }}</a>
	 *     </li>
	 * </ul>
	 * </pre>
	 *
	 * Then the compiled html would be (assuming Html5Mode is off and current state is contacts):
	 * <pre>
	 * <a href="#/home" ui-sref="home">Home</a> | <a href="#/about" ui-sref="about">About</a> | <a href="#/contacts?page=2" ui-sref="{page: 2}">Next page</a>
	 *
	 * <ul>
	 *     <li ng-repeat="contact in contacts">
	 *         <a href="#/contacts/1" ui-sref="contacts.detail({ id: contact.id })">Joe</a>
	 *     </li>
	 *     <li ng-repeat="contact in contacts">
	 *         <a href="#/contacts/2" ui-sref="contacts.detail({ id: contact.id })">Alice</a>
	 *     </li>
	 *     <li ng-repeat="contact in contacts">
	 *         <a href="#/contacts/3" ui-sref="contacts.detail({ id: contact.id })">Bob</a>
	 *     </li>
	 * </ul>
	 *
	 * <a ui-sref="home" ui-sref-opts="{reload: true}">Home</a>
	 * </pre>
	 *
	 * @param {string} ui-sref 'stateName' can be any valid absolute or relative state
	 * @param {Object} ui-sref-opts options to pass to {@link ui.router.state.$state#methods_go $state.go()}
	 */
	$StateRefDirective.$inject = ['$state', '$timeout'];
	function $StateRefDirective($state, $timeout) {
	  return {
	    restrict: 'A',
	    require: ['?^uiSrefActive', '?^uiSrefActiveEq'],
	    link: function(scope, element, attrs, uiSrefActive) {
	      var ref    = parseStateRef(attrs.uiSref, $state.current.name);
	      var def    = { state: ref.state, href: null, params: null };
	      var type   = getTypeInfo(element);
	      var active = uiSrefActive[1] || uiSrefActive[0];
	      var unlinkInfoFn = null;
	      var hookFn;

	      def.options = extend(defaultOpts(element, $state), attrs.uiSrefOpts ? scope.$eval(attrs.uiSrefOpts) : {});

	      var update = function(val) {
	        if (val) def.params = angular.copy(val);
	        def.href = $state.href(ref.state, def.params, def.options);

	        if (unlinkInfoFn) unlinkInfoFn();
	        if (active) unlinkInfoFn = active.$$addStateInfo(ref.state, def.params);
	        if (def.href !== null) attrs.$set(type.attr, def.href);
	      };

	      if (ref.paramExpr) {
	        scope.$watch(ref.paramExpr, function(val) { if (val !== def.params) update(val); }, true);
	        def.params = angular.copy(scope.$eval(ref.paramExpr));
	      }
	      update();

	      if (!type.clickable) return;
	      hookFn = clickHook(element, $state, $timeout, type, function() { return def; });
	      element.bind("click", hookFn);
	      scope.$on('$destroy', function() {
	        element.unbind("click", hookFn);
	      });
	    }
	  };
	}

	/**
	 * @ngdoc directive
	 * @name ui.router.state.directive:ui-state
	 *
	 * @requires ui.router.state.uiSref
	 *
	 * @restrict A
	 *
	 * @description
	 * Much like ui-sref, but will accept named $scope properties to evaluate for a state definition,
	 * params and override options.
	 *
	 * @param {string} ui-state 'stateName' can be any valid absolute or relative state
	 * @param {Object} ui-state-params params to pass to {@link ui.router.state.$state#methods_href $state.href()}
	 * @param {Object} ui-state-opts options to pass to {@link ui.router.state.$state#methods_go $state.go()}
	 */
	$StateRefDynamicDirective.$inject = ['$state', '$timeout'];
	function $StateRefDynamicDirective($state, $timeout) {
	  return {
	    restrict: 'A',
	    require: ['?^uiSrefActive', '?^uiSrefActiveEq'],
	    link: function(scope, element, attrs, uiSrefActive) {
	      var type   = getTypeInfo(element);
	      var active = uiSrefActive[1] || uiSrefActive[0];
	      var group  = [attrs.uiState, attrs.uiStateParams || null, attrs.uiStateOpts || null];
	      var watch  = '[' + group.map(function(val) { return val || 'null'; }).join(', ') + ']';
	      var def    = { state: null, params: null, options: null, href: null };
	      var unlinkInfoFn = null;
	      var hookFn;

	      function runStateRefLink (group) {
	        def.state = group[0]; def.params = group[1]; def.options = group[2];
	        def.href = $state.href(def.state, def.params, def.options);

	        if (unlinkInfoFn) unlinkInfoFn();
	        if (active) unlinkInfoFn = active.$$addStateInfo(def.state, def.params);
	        if (def.href) attrs.$set(type.attr, def.href);
	      }

	      scope.$watch(watch, runStateRefLink, true);
	      runStateRefLink(scope.$eval(watch));

	      if (!type.clickable) return;
	      hookFn = clickHook(element, $state, $timeout, type, function() { return def; });
	      element.bind("click", hookFn);
	      scope.$on('$destroy', function() {
	        element.unbind("click", hookFn);
	      });
	    }
	  };
	}


	/**
	 * @ngdoc directive
	 * @name ui.router.state.directive:ui-sref-active
	 *
	 * @requires ui.router.state.$state
	 * @requires ui.router.state.$stateParams
	 * @requires $interpolate
	 *
	 * @restrict A
	 *
	 * @description
	 * A directive working alongside ui-sref to add classes to an element when the
	 * related ui-sref directive's state is active, and removing them when it is inactive.
	 * The primary use-case is to simplify the special appearance of navigation menus
	 * relying on `ui-sref`, by having the "active" state's menu button appear different,
	 * distinguishing it from the inactive menu items.
	 *
	 * ui-sref-active can live on the same element as ui-sref or on a parent element. The first
	 * ui-sref-active found at the same level or above the ui-sref will be used.
	 *
	 * Will activate when the ui-sref's target state or any child state is active. If you
	 * need to activate only when the ui-sref target state is active and *not* any of
	 * it's children, then you will use
	 * {@link ui.router.state.directive:ui-sref-active-eq ui-sref-active-eq}
	 *
	 * @example
	 * Given the following template:
	 * <pre>
	 * <ul>
	 *   <li ui-sref-active="active" class="item">
	 *     <a href ui-sref="app.user({user: 'bilbobaggins'})">@bilbobaggins</a>
	 *   </li>
	 * </ul>
	 * </pre>
	 *
	 *
	 * When the app state is "app.user" (or any children states), and contains the state parameter "user" with value "bilbobaggins",
	 * the resulting HTML will appear as (note the 'active' class):
	 * <pre>
	 * <ul>
	 *   <li ui-sref-active="active" class="item active">
	 *     <a ui-sref="app.user({user: 'bilbobaggins'})" href="/users/bilbobaggins">@bilbobaggins</a>
	 *   </li>
	 * </ul>
	 * </pre>
	 *
	 * The class name is interpolated **once** during the directives link time (any further changes to the
	 * interpolated value are ignored).
	 *
	 * Multiple classes may be specified in a space-separated format:
	 * <pre>
	 * <ul>
	 *   <li ui-sref-active='class1 class2 class3'>
	 *     <a ui-sref="app.user">link</a>
	 *   </li>
	 * </ul>
	 * </pre>
	 *
	 * It is also possible to pass ui-sref-active an expression that evaluates
	 * to an object hash, whose keys represent active class names and whose
	 * values represent the respective state names/globs.
	 * ui-sref-active will match if the current active state **includes** any of
	 * the specified state names/globs, even the abstract ones.
	 *
	 * @Example
	 * Given the following template, with "admin" being an abstract state:
	 * <pre>
	 * <div ui-sref-active="{'active': 'admin.*'}">
	 *   <a ui-sref-active="active" ui-sref="admin.roles">Roles</a>
	 * </div>
	 * </pre>
	 *
	 * When the current state is "admin.roles" the "active" class will be applied
	 * to both the <div> and <a> elements. It is important to note that the state
	 * names/globs passed to ui-sref-active shadow the state provided by ui-sref.
	 */

	/**
	 * @ngdoc directive
	 * @name ui.router.state.directive:ui-sref-active-eq
	 *
	 * @requires ui.router.state.$state
	 * @requires ui.router.state.$stateParams
	 * @requires $interpolate
	 *
	 * @restrict A
	 *
	 * @description
	 * The same as {@link ui.router.state.directive:ui-sref-active ui-sref-active} but will only activate
	 * when the exact target state used in the `ui-sref` is active; no child states.
	 *
	 */
	$StateRefActiveDirective.$inject = ['$state', '$stateParams', '$interpolate'];
	function $StateRefActiveDirective($state, $stateParams, $interpolate) {
	  return  {
	    restrict: "A",
	    controller: ['$scope', '$element', '$attrs', '$timeout', function ($scope, $element, $attrs, $timeout) {
	      var states = [], activeClasses = {}, activeEqClass, uiSrefActive;

	      // There probably isn't much point in $observing this
	      // uiSrefActive and uiSrefActiveEq share the same directive object with some
	      // slight difference in logic routing
	      activeEqClass = $interpolate($attrs.uiSrefActiveEq || '', false)($scope);

	      try {
	        uiSrefActive = $scope.$eval($attrs.uiSrefActive);
	      } catch (e) {
	        // Do nothing. uiSrefActive is not a valid expression.
	        // Fall back to using $interpolate below
	      }
	      uiSrefActive = uiSrefActive || $interpolate($attrs.uiSrefActive || '', false)($scope);
	      if (isObject(uiSrefActive)) {
	        forEach(uiSrefActive, function(stateOrName, activeClass) {
	          if (isString(stateOrName)) {
	            var ref = parseStateRef(stateOrName, $state.current.name);
	            addState(ref.state, $scope.$eval(ref.paramExpr), activeClass);
	          }
	        });
	      }

	      // Allow uiSref to communicate with uiSrefActive[Equals]
	      this.$$addStateInfo = function (newState, newParams) {
	        // we already got an explicit state provided by ui-sref-active, so we
	        // shadow the one that comes from ui-sref
	        if (isObject(uiSrefActive) && states.length > 0) {
	          return;
	        }
	        var deregister = addState(newState, newParams, uiSrefActive);
	        update();
	        return deregister;
	      };

	      $scope.$on('$stateChangeSuccess', update);

	      function addState(stateName, stateParams, activeClass) {
	        var state = $state.get(stateName, stateContext($element));
	        var stateHash = createStateHash(stateName, stateParams);

	        var stateInfo = {
	          state: state || { name: stateName },
	          params: stateParams,
	          hash: stateHash
	        };

	        states.push(stateInfo);
	        activeClasses[stateHash] = activeClass;

	        return function removeState() {
	          var idx = states.indexOf(stateInfo);
	          if (idx !== -1) states.splice(idx, 1);
	        };
	      }

	      /**
	       * @param {string} state
	       * @param {Object|string} [params]
	       * @return {string}
	       */
	      function createStateHash(state, params) {
	        if (!isString(state)) {
	          throw new Error('state should be a string');
	        }
	        if (isObject(params)) {
	          return state + toJson(params);
	        }
	        params = $scope.$eval(params);
	        if (isObject(params)) {
	          return state + toJson(params);
	        }
	        return state;
	      }

	      // Update route state
	      function update() {
	        for (var i = 0; i < states.length; i++) {
	          if (anyMatch(states[i].state, states[i].params)) {
	            addClass($element, activeClasses[states[i].hash]);
	          } else {
	            removeClass($element, activeClasses[states[i].hash]);
	          }

	          if (exactMatch(states[i].state, states[i].params)) {
	            addClass($element, activeEqClass);
	          } else {
	            removeClass($element, activeEqClass);
	          }
	        }
	      }

	      function addClass(el, className) { $timeout(function () { el.addClass(className); }); }
	      function removeClass(el, className) { el.removeClass(className); }
	      function anyMatch(state, params) { return $state.includes(state.name, params); }
	      function exactMatch(state, params) { return $state.is(state.name, params); }

	      update();
	    }]
	  };
	}

	angular.module('ui.router.state')
	  .directive('uiSref', $StateRefDirective)
	  .directive('uiSrefActive', $StateRefActiveDirective)
	  .directive('uiSrefActiveEq', $StateRefActiveDirective)
	  .directive('uiState', $StateRefDynamicDirective);

	/**
	 * @ngdoc filter
	 * @name ui.router.state.filter:isState
	 *
	 * @requires ui.router.state.$state
	 *
	 * @description
	 * Translates to {@link ui.router.state.$state#methods_is $state.is("stateName")}.
	 */
	$IsStateFilter.$inject = ['$state'];
	function $IsStateFilter($state) {
	  var isFilter = function (state, params) {
	    return $state.is(state, params);
	  };
	  isFilter.$stateful = true;
	  return isFilter;
	}

	/**
	 * @ngdoc filter
	 * @name ui.router.state.filter:includedByState
	 *
	 * @requires ui.router.state.$state
	 *
	 * @description
	 * Translates to {@link ui.router.state.$state#methods_includes $state.includes('fullOrPartialStateName')}.
	 */
	$IncludedByStateFilter.$inject = ['$state'];
	function $IncludedByStateFilter($state) {
	  var includesFilter = function (state, params, options) {
	    return $state.includes(state, params, options);
	  };
	  includesFilter.$stateful = true;
	  return  includesFilter;
	}

	angular.module('ui.router.state')
	  .filter('isState', $IsStateFilter)
	  .filter('includedByState', $IncludedByStateFilter);
	})(window, window.angular);

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(jsr) {'use strict';

	jsr.$inject = ["jsrMocks", "$q", "$rootScope"];
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /* globals window, Visualforce */


	var _angular = __webpack_require__(1);

	var _angular2 = _interopRequireDefault(_angular);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	//if we can't find a specific jsr mock method
	var genericMock = {
	    method: function method(args) {
	        alert('mock not implemented for ' + args[0]);
	        console.error('mock not implemented for ', args);
	    },
	    timeout: 500 //half second
	};

	function jsrMocks() {
	    "ngInject";

	    var $mocks;
	    var $mockServer;
	    return {
	        setMocks: function setMocks(mocks, mockServer) {
	            $mocks = mocks;
	            $mockServer = mockServer;
	        },

	        $get: ["$timeout", function $get($timeout) {
	            "ngInject";

	            if (!window.Visualforce) {

	                return {
	                    remoting: {
	                        Manager: {
	                            invokeAction: invokeStaticAction
	                        }
	                    }
	                };
	            } else {
	                return Visualforce;
	            }

	            function invokeStaticAction() {

	                var lastArg = arguments[arguments.length - 1],
	                    callback = lastArg,
	                    mock = $mocks[arguments[0]] || genericMock,
	                    result = mock.method(arguments),
	                    event = {
	                    status: true
	                };

	                if (mock.error) {
	                    event.status = false;
	                    event.message = mock.error;
	                }

	                if ((typeof callback === 'undefined' ? 'undefined' : _typeof(callback)) === 'object') {
	                    callback = arguments[arguments.length - 2];
	                }
	                $timeout(function () {
	                    callback(result, event);
	                }, mock.timeout);
	            }
	        }]

	    };
	}

	function jsr(jsrMocks, $q, $rootScope) {
	    "ngInject";

	    var Visualforce = jsrMocks;

	    return function (request) {
	        var deferred = $q.defer();

	        var parameters = [request.method];

	        if (request.args) {

	            for (var i = 0; i < request.args.length; i++) {
	                parameters.push(request.args[i]);
	            }
	        }
	        var callback = function callback(result, event) {
	            $rootScope.$apply(function () {
	                if (event.status) {
	                    deferred.resolve(result);
	                } else {
	                    deferred.reject(event);
	                }
	            });
	        };

	        parameters.push(callback);

	        if (request.options) {
	            parameters.push(request.options);
	        }

	        Visualforce.remoting.Manager.invokeAction.apply(Visualforce.remoting.Manager, parameters);

	        return deferred.promise;
	    };
	}

	exports.default = _angular2.default.module('jsrMocks', []).provider('jsrMocks', jsrMocks).factory('jsr', jsr).name;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = routing;
	routing.$inject = ['$urlRouterProvider', '$locationProvider', 'jsrMocksProvider'];

	function routing($urlRouterProvider, $locationProvider, jsrMocksProvider) {
	  $locationProvider.html5Mode(false);
	  $urlRouterProvider.otherwise('/');
	  jsrMocksProvider.setMocks(window.configSettings.mocks);
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _angular = __webpack_require__(1);

	var _angular2 = _interopRequireDefault(_angular);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function header() {
	  return {
	    restrict: 'E',
	    scope: {
	      name: '=',
	      foo: '='
	    },
	    template: __webpack_require__(8),
	    controller: headerController,
	    controllerAs: 'header'
	  };
	}

	exports.default = _angular2.default.module('directives.header', []).directive('header', header).name;


	function headerController() {
	  this.staticPath = window.configSettings.staticPath;
	}

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = "<div class=\"slds-page-header\" role=\"banner\">\n    <div class=\"slds-grid\">\n        <div class=\"slds-media__figure\">\n            <img ng-src=\"{{header.staticPath}}/assets/images/avatar1.jpg\" style=\"height:100px;\" alt=\"Placeholder\" />\n        </div>\n        <div class=\"slds-col slds-has-flexi-truncate\">\n            <p class=\"slds-text-heading--label\">jsr-mocks demo</p>\n            <div class=\"slds-grid\">\n                <div class=\"slds-grid slds-type-focus slds-no-space\">\n                    <h1 class=\"slds-text-heading--medium slds-truncate\" title=\"My Leads (truncates)\">hey now</h1>\n                </div>\n            </div>\n        </div>\n        <div class=\"slds-col slds-no-flex slds-align-bottom\">\n            <div class=\"slds-grid\">\n                <div class=\"slds-button-group\" role=\"group\">\n                    <button class=\"cmd\" ng-click=\"$emit('get-cards')\">Get More cards</button>\n                    <button class=\"cmd\" ng-click=\"$emit('clear-cards')\">Clear Cards</button>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n"

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	headerController.$inject = ["$scope", "$rootScope", "$log"];
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _angular = __webpack_require__(1);

	var _angular2 = _interopRequireDefault(_angular);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function header() {
	  return {
	    restrict: 'E',
	    scope: {
	      card: '='
	    },
	    template: __webpack_require__(10),
	    controller: headerController,
	    controllerAs: 'card'
	  };
	}

	exports.default = _angular2.default.module('directives.card', []).directive('card', header).name;


	function headerController($scope, $rootScope, $log) {
	  'ngInject';

	  $scope.staticPath = window.configSettings.staticPath;

	  $scope.getCards = function () {
	    $rootScope.$broadcast('get-cards');
	    $log.debug('firing get cards event');
	  };
	}

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = "<div class=\"slds-card\">\n    <div class=\"slds-card__header slds-grid\">\n        <div class=\"slds-media slds-media--center slds-has-flexi-truncate\">\n            <div class=\"slds-media__figure\" ng-click=\"getCards()\">\n                <svg aria-hidden=\"true\" class=\"slds-icon slds-icon-standard-contact slds-icon--medium\">\n                    <use xlink:href=\"\" ng-href=\"{{staticPath}}/assets/icons/standard-sprite/svg/symbols.svg#drafts\"></use>\n                </svg>\n            </div>\n            <div class=\"slds-media__body\">\n                <h2 class=\"slds-text-heading--small slds-truncate\">{{card.motto}}</h2>\n            </div>\n        </div>\n    </div>\n    <div class=\"slds-card__body\">\n        <div class=\"slds-text-body--regular\">\n            <img ng-src=\"{{card.image}}\" width=\"100%\" class=\"img-responsive\" />\n            <div class=\"slds-p-around--medium\">\n                <h2 class=\"slds-text-heading--medium slds-m-bottom--medium\">\n                    <a ng-href=\"/{{card.id}}\">{{ card.title }}</a>\n                </h2>\n                <h4 class=\"slds-text-heading--small slds-m-bottom--medium\"> {{ card.summary }}</h4>\n            </div>\n        </div>\n    </div>\n\n</div>\n"

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	__webpack_require__(12);

	var _angular = __webpack_require__(1);

	var _angular2 = _interopRequireDefault(_angular);

	var _angularUiRouter = __webpack_require__(4);

	var _angularUiRouter2 = _interopRequireDefault(_angularUiRouter);

	var _home = __webpack_require__(14);

	var _home2 = _interopRequireDefault(_home);

	var _home3 = __webpack_require__(16);

	var _home4 = _interopRequireDefault(_home3);

	var _greeting = __webpack_require__(17);

	var _greeting2 = _interopRequireDefault(_greeting);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = _angular2.default.module('app.home', [_angularUiRouter2.default]).config(_home2.default).controller('HomeController', _home4.default).name;
	//import jQuery from 'jquery';

/***/ },
/* 12 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 13 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = routes;
	routes.$inject = ['$stateProvider'];

	function routes($stateProvider) {
	  $stateProvider.state('home', {
	    url: '/',
	    template: __webpack_require__(15),
	    controller: 'HomeController',
	    controllerAs: 'home'
	  });
	}

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = "<header ></header>\n<div class=\"slds-form-element slds-lookup\" data-select=\"single\" >\n    <input type=\"text\" id=\"autocomplete\" ng-keyup=\"home.autocomplete($event)\" class=\"slds-lookup__search-input slds-input\" placeholder=\"Search Contacts...\"/>\n\n    <div class=\"slds-lookup__menu\" id=\"lookup-330\" ng-show=\"home.matches.length\">\n    <div class=\"slds-lookup__item--label slds-text-body--small\" ng-show=\"home.matches.length\">Matched Contacts</div>\n    <ul class=\"slds-lookup__list\" role=\"listbox\">\n      <li role=\"presentation\" class=\"automatch\" ng-repeat=\"con in home.matches\" >\n        <span class=\"slds-lookup__item-action slds-media slds-media--center\" role=\"option\" ng-click=\"home.selectContact(con)\">\n          <svg aria-hidden=\"true\" class=\"slds-icon slds-icon-standard-account slds-icon--large slds-media__figure\">\n            <use xlink:href=\"\" ng-href=\"{{home.staticPath}}/assets/icons/standard-sprite/svg/symbols.svg#people\"></use>\n          </svg>\n          <div class=\"slds-media__body\" >\n            <div class=\"slds-lookup__result-text\">{{con}}</div>\n            <span class=\"slds-lookup__result-meta slds-text-body--small\">Contact • Dreamforce</span>\n          </div>\n        </span>\n      </li>\n\n    </ul>\n  </div>\n</div>\n<div catalog class=\"catalog-container slds-grid slds-wrap\">\n    <div class=\"slds-col--padded slds-m-bottom--medium slds-small-size--1-of-1 slds-medium-size--1-of-2 slds-large-size--1-of-4\"\n        ng-repeat=\"card in home.cards\">\n        <card card=\"card\"/>\n    </div>\n</div>\n<pre ng-show=\"home.cards.length\">{{home.cards | json}}</pre>\n"

/***/ },
/* 16 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var HomeController = function () {
	    HomeController.$inject = ["jsr", "$log", "$scope"];
	    function HomeController(jsr, $log, $scope /*,toastr*/) {
	        'ngInject';

	        var _this = this;

	        _classCallCheck(this, HomeController);

	        this.jsr = jsr;
	        this.$log = $log;
	        this.$scope = $scope;
	        this.$log.debug('received get cards event', event);
	        this.cards = [];
	        this.matches = [];
	        this.staticPath = configSettings.staticPath;
	        // this.toastr = toastr;

	        this.$scope.$on('clear-cards', function () {
	            _this.cards = [];
	        });
	        //setup event handler
	        this.$scope.$on('get-cards', function (event) {
	            _this.$log.debug('received get cards event', event);
	            _this.getCards().then(function (cards) {
	                return $log.log('got ' + cards.length + ' cards', cards);
	            });
	        });

	        this.$scope.$emit('get-cards');
	        // this.toastr.success('hey now');
	    }

	    _createClass(HomeController, [{
	        key: 'getCards',
	        value: function getCards() {
	            var _this2 = this;

	            this.$log.log('getting cards...');
	            return this.jsr({
	                method: window.configSettings.remoteActions.getCards
	            }).then(function (cards) {
	                _this2.cards = cards;
	                return cards;
	            }).catch(function (error) {
	                _this2.$log.error(error.message, error);
	                alert(error.message);
	                //this.toastr.error(error.message);
	                return [];
	            });
	        }
	    }, {
	        key: 'autocomplete',
	        value: function autocomplete(event) {
	            var _this3 = this;

	            //console.debug('event',event);
	            var input = document.getElementById('autocomplete'),
	                query = input.value;

	            if (query.length >= 3) {
	                this.jsr({
	                    method: window.configSettings.remoteActions.autocomplete,
	                    args: [query],
	                    options: {
	                        buffer: false,
	                        escape: true
	                    }
	                }).then(function (results) {
	                    _this3.matches = results;
	                    if (_this3.matches.length === 1) {
	                        input.value = _this3.matches[0];
	                        _this3.matches = [];
	                    }
	                }).catch(function (error) {
	                    return _this3.$log.error(error.message, error);
	                });
	            } else {
	                this.matches = [];
	            }
	        }
	    }, {
	        key: 'selectContact',
	        value: function selectContact(name) {
	            var input = document.getElementById('autocomplete');
	            input.value = name;
	            this.matches = [];
	        }
	    }]);

	    return HomeController;
	}();

	exports.default = HomeController;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _angular = __webpack_require__(1);

	var _angular2 = _interopRequireDefault(_angular);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function greeting() {
	  return {
	    restrict: 'E',
	    scope: {
	      name: '='
	    },
	    template: '<h1>Hello, {{name}}</div>'
	  };
	}

	exports.default = _angular2.default.module('directives.greeting', []).directive('greeting', greeting).name;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(19);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(20)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/css-loader/index.js!./../node_modules/sass-loader/index.js!./main.scss", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!./../node_modules/sass-loader/index.js!./main.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(13)();
	// imports


	// module
	exports.push([module.id, "/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n@font-face {\n  font-family: \"Salesforce Sans\";\n  src: url(\"/assets/fonts/webfonts/SalesforceSans-Light.woff2\") format(\"woff2\"), url(\"/assets/fonts/webfonts/SalesforceSans-Light.woff\") format(\"woff\");\n  font-weight: 300; }\n\n@font-face {\n  font-family: \"Salesforce Sans\";\n  src: url(\"/assets/fonts/webfonts/SalesforceSans-LightItalic.woff2\") format(\"woff2\"), url(\"/assets/fonts/webfonts/SalesforceSans-LightItalic.woff\") format(\"woff\");\n  font-style: italic;\n  font-weight: 300; }\n\n@font-face {\n  font-family: \"Salesforce Sans\";\n  src: url(\"/assets/fonts/webfonts/SalesforceSans-Regular.woff2\") format(\"woff2\"), url(\"/assets/fonts/webfonts/SalesforceSans-Regular.woff\") format(\"woff\");\n  font-weight: 400; }\n\n@font-face {\n  font-family: \"Salesforce Sans\";\n  src: url(\"/assets/fonts/webfonts/SalesforceSans-Italic.woff2\") format(\"woff2\"), url(\"/assets/fonts/webfonts/SalesforceSans-Italic.woff\") format(\"woff\");\n  font-style: italic;\n  font-weight: 400; }\n\n@font-face {\n  font-family: \"Salesforce Sans\";\n  src: url(\"/assets/fonts/webfonts/SalesforceSans-Bold.woff2\") format(\"woff2\"), url(\"/assets/fonts/webfonts/SalesforceSans-Bold.woff\") format(\"woff\");\n  font-weight: 700; }\n\n@font-face {\n  font-family: \"Salesforce Sans\";\n  src: url(\"/assets/fonts/webfonts/SalesforceSans-BoldItalic.woff2\") format(\"woff2\"), url(\"/assets/fonts/webfonts/SalesforceSans-BoldItalic.woff\") format(\"woff\");\n  font-style: italic;\n  font-weight: 700; }\n\nhtml {\n  font-family: sans-serif;\n  -ms-text-size-adjust: 100%;\n  -webkit-text-size-adjust: 100%; }\n\nbody {\n  margin: 0; }\n\narticle,\naside,\ndetails,\nfigcaption,\nfigure,\nfooter,\nheader,\nhgroup,\nmain,\nmenu,\nnav,\nsection,\nsummary {\n  display: block; }\n\naudio,\ncanvas,\nprogress,\nvideo {\n  display: inline-block;\n  vertical-align: baseline; }\n\naudio:not([controls]) {\n  display: none;\n  height: 0; }\n\n[hidden],\ntemplate {\n  display: none; }\n\na {\n  background-color: transparent; }\n\na:active,\na:hover {\n  outline: 0; }\n\nabbr[title] {\n  border-bottom: 1px dotted; }\n\nb,\nstrong {\n  font-weight: bold; }\n\ndfn {\n  font-style: italic; }\n\nh1 {\n  font-size: 2em;\n  margin: 0.67em 0; }\n\nmark {\n  background: #ff0;\n  color: #000; }\n\nsmall {\n  font-size: 80%; }\n\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline; }\n\nsup {\n  top: -0.5em; }\n\nsub {\n  bottom: -0.25em; }\n\nimg {\n  border: 0; }\n\nsvg:not(:root) {\n  overflow: hidden; }\n\nfigure {\n  margin: 1em 40px; }\n\nhr {\n  -moz-box-sizing: content-box;\n  box-sizing: content-box;\n  height: 0; }\n\npre {\n  overflow: auto; }\n\ncode,\nkbd,\npre,\nsamp {\n  font-family: monospace, monospace;\n  font-size: 1em; }\n\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  color: inherit;\n  font: inherit;\n  margin: 0; }\n\nbutton {\n  overflow: visible; }\n\nbutton,\nselect {\n  text-transform: none; }\n\nbutton,\nhtml input[type=\"button\"],\ninput[type=\"reset\"],\ninput[type=\"submit\"] {\n  -webkit-appearance: button;\n  cursor: pointer; }\n\nbutton[disabled],\nhtml input[disabled] {\n  cursor: default; }\n\nbutton::-moz-focus-inner,\ninput::-moz-focus-inner {\n  border: 0;\n  padding: 0; }\n\ninput {\n  line-height: normal; }\n\ninput[type=\"checkbox\"],\ninput[type=\"radio\"] {\n  box-sizing: border-box;\n  padding: 0; }\n\ninput[type=\"number\"]::-webkit-inner-spin-button,\ninput[type=\"number\"]::-webkit-outer-spin-button {\n  height: auto; }\n\ninput[type=\"search\"] {\n  -webkit-appearance: textfield;\n  -moz-box-sizing: content-box;\n  -webkit-box-sizing: content-box;\n  box-sizing: content-box; }\n\ninput[type=\"search\"]::-webkit-search-cancel-button,\ninput[type=\"search\"]::-webkit-search-decoration {\n  -webkit-appearance: none; }\n\nfieldset {\n  border: 1px solid #c0c0c0;\n  margin: 0 2px;\n  padding: 0.35em 0.625em 0.75em; }\n\nlegend {\n  border: 0;\n  padding: 0; }\n\ntextarea {\n  overflow: auto; }\n\noptgroup {\n  font-weight: bold; }\n\ntable {\n  border-collapse: collapse;\n  border-spacing: 0; }\n\ntd,\nth {\n  padding: 0; }\n\n/* Lightning Design System 0.12.1 */\n*, *:before, *:after {\n  box-sizing: border-box; }\n\n*::-webkit-input-placeholder {\n  color: #54698d;\n  font-weight: 400;\n  font-size: 0.875rem; }\n\n*:-moz-placeholder {\n  color: #54698d;\n  font-weight: 400;\n  font-size: 0.875rem; }\n\n*::-moz-placeholder {\n  color: #54698d;\n  font-weight: 400;\n  font-size: 0.875rem; }\n\n*:-ms-input-placeholder {\n  color: #54698d;\n  font-weight: 400;\n  font-size: 0.875rem; }\n\nhtml {\n  font: 100%/1.5 \"Salesforce Sans\", Arial, sans-serif;\n  background: white;\n  color: #16325c;\n  -webkit-tap-highlight-color: transparent; }\n\nbody {\n  font-size: 0.875rem;\n  background: transparent; }\n\n::selection {\n  background: #faffbd;\n  text-shadow: none; }\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\np,\nol,\nul,\ndl,\nfieldset {\n  margin: 0;\n  padding: 0; }\n\ndd,\nfigure {\n  margin: 0; }\n\nabbr[title],\nfieldset,\nhr {\n  border: 0; }\n\nhr {\n  padding: 0; }\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  font-weight: inherit;\n  font-size: 1em; }\n\nol,\nul {\n  list-style: none; }\n\na {\n  color: #0070d2;\n  text-decoration: none;\n  transition: color .1s linear; }\n  a:hover, a:focus {\n    text-decoration: underline;\n    color: #005fb2; }\n  a:focus {\n    outline: thin dotted;\n    outline: 5px auto #1589ee;\n    outline-offset: -2px; }\n  a:active {\n    color: #00396b; }\n\nb,\nstrong,\ndfn {\n  font-weight: 700; }\n\nmark {\n  background-color: #faffbd; }\n\nabbr[title] {\n  cursor: help; }\n\ninput[type=search] {\n  box-sizing: border-box; }\n\ntable {\n  width: 100%; }\n\ncaption,\nth,\ntd {\n  text-align: left; }\n\nhr {\n  display: block;\n  margin: 2rem 0;\n  border-top: 1px solid #d8dde6;\n  height: 1px;\n  clear: both; }\n\naudio,\ncanvas,\niframe,\nimg,\nsvg,\nvideo {\n  vertical-align: middle; }\n\nimg {\n  max-width: 100%;\n  height: auto; }\n\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n.slds-media--timeline {\n  padding-bottom: 2rem;\n  position: relative; }\n  .slds-media--timeline:before {\n    content: '';\n    background: #d8dde6;\n    height: 100%;\n    width: 2px;\n    position: absolute;\n    left: 1.125rem;\n    top: 0;\n    bottom: 0;\n    margin-left: -1px;\n    z-index: -1; }\n  .slds-media--timeline:before {\n    margin-left: -3px; }\n  .slds-media--timeline .slds-timeline__icon {\n    border: 2px solid white; }\n\n.slds-timeline__actions {\n  display: flex;\n  flex-flow: column nowrap;\n  align-items: center; }\n\n.slds-timeline__date {\n  margin-bottom: 0.25rem;\n  font-size: 0.75rem;\n  color: #54698d; }\n\n.slds-timeline__media--call:before {\n  background: #48c3cc; }\n\n.slds-timeline__media--email:before {\n  background: #95aec5; }\n\n.slds-timeline__media--event:before {\n  background: #eb7092; }\n\n.slds-timeline__media--task:before {\n  background: #4bc076; }\n\n.slds-timeline__item {\n  padding-left: 0.75rem;\n  padding-right: 0.75rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-page-header__detail-row {\n  margin: 1.5rem 0 0.75rem 3rem;\n  /* This takes the width of the icon into account for alignment */ }\n\n/* Lightning Design System 0.12.1 */\n.slds-breadcrumb .slds-list__item {\n  position: relative; }\n  .slds-breadcrumb .slds-list__item:before {\n    content: '>';\n    position: absolute;\n    left: -0.25rem; }\n  .slds-breadcrumb .slds-list__item > a {\n    display: block;\n    padding: 0 0.5rem; }\n    .slds-breadcrumb .slds-list__item > a:hover {\n      text-decoration: none; }\n  .slds-breadcrumb .slds-list__item:first-child > a {\n    padding-left: 0; }\n  .slds-breadcrumb .slds-list__item:first-child:before {\n    content: \"\"; }\n\n/* Lightning Design System 0.12.1 */\n.slds-button-group {\n  display: flex; }\n  .slds-button-group .slds-button {\n    border-radius: 0;\n    border-left: 0; }\n    .slds-button-group .slds-button + .slds-button {\n      margin-left: 0; }\n    .slds-button-group .slds-button:first-child {\n      border-radius: 0.25rem 0 0 0.25rem;\n      border-left: 1px solid #d8dde6; }\n    .slds-button-group .slds-button:first-child:not(.slds-button--last .slds-button) {\n      border-left: 1px solid #d8dde6; }\n    .slds-button-group .slds-button:last-child {\n      border-radius: 0 0.25rem 0.25rem 0; }\n    .slds-button-group .slds-button:focus {\n      z-index: 1; }\n    .slds-button-group .slds-button:only-child {\n      border-radius: .25rem; }\n  .slds-button-group .slds-toggle-visibility:last-child[disabled] {\n    display: none; }\n  .slds-button-group + .slds-button-group,\n  .slds-button-group + .slds-button {\n    margin-left: 0.25rem; }\n  .slds-button-group .slds-button--last {\n    /* This class should be placed on the wrapper of a button that's the final in a button-group */ }\n    .slds-button-group .slds-button--last .slds-button {\n      border-radius: 0 0.25rem 0.25rem 0;\n      border-left: 0; }\n  .slds-button-group .slds-button.slds-button--last {\n    border-radius: 0 0.25rem 0.25rem 0; }\n\n/* Lightning Design System 0.12.1 */\n.slds-button-group .slds-button:first-child.slds-button--inverse[disabled] {\n  border-left-color: rgba(255, 255, 255, 0.15); }\n\n.slds-button-group .slds-button--inverse:first-child[disabled] + .slds-button--inverse {\n  border-left: 1px solid #d8dde6; }\n\n/* Lightning Design System 0.12.1 */\n.slds-button-group .slds-button--icon-border.slds-is-selected + .slds-button--icon-border.slds-is-selected {\n  border-left: 1px solid #d8dde6; }\n\n.slds-button-group .slds-button--icon-border.slds-is-selected:first-child {\n  border-left: 1px solid #0070d2; }\n\n.slds-button-group .slds-button--icon-more:hover,\n.slds-button-group .slds-button--icon-more:focus {\n  border-left-width: 0; }\n\n/* Lightning Design System 0.12.1 */\n.slds-button {\n  position: relative;\n  display: inline-block;\n  padding: 0;\n  background: transparent;\n    background-clip: padding-box;\n  border: none;\n    border-radius: 0.25rem;\n  color: #0070d2;\n  font-size: inherit;\n  line-height: 2.125rem;\n  text-decoration: none;\n  -webkit-appearance: none;\n  white-space: normal;\n  user-select: none;\n  transition: color 0.05s linear, background-color 0.05s linear; }\n  .slds-button:hover, .slds-button:focus, .slds-button:active, .slds-button:visited {\n    text-decoration: none; }\n  .slds-button:hover, .slds-button:focus {\n    color: #005fb2; }\n  .slds-button:focus {\n    outline: 0;\n    box-shadow: 0 0 3px #0070D2; }\n  .slds-button:active {\n    color: #00396b; }\n  .slds-button[disabled] {\n    color: #d8dde6; }\n  .slds-button:hover .slds-button__icon, .slds-button:focus .slds-button__icon, .slds-button:active .slds-button__icon, .slds-button[disabled] .slds-button__icon {\n    fill: currentColor; }\n  .slds-button + .slds-button-group {\n    margin-left: 0.25rem; }\n  .slds-button + .slds-button {\n    margin-left: 0.25rem; }\n\n.slds-button-space-left {\n  margin-left: 0.25rem; }\n\na.slds-button {\n  text-align: center; }\n  a.slds-button:focus {\n    outline: 0;\n    box-shadow: 0 0 3px #0070D2; }\n\n.slds-button--small {\n  line-height: 1.875rem;\n  min-height: 2rem;\n  /* Forces icon-only buttons to be the same height as small buttons since they're svg and line-height has no effect on them */ }\n\n/* Lightning Design System 0.12.1 */\n.slds-button--neutral {\n  padding-left: 1rem;\n  padding-right: 1rem;\n  text-align: center;\n  vertical-align: middle;\n  border: 1px solid #d8dde6;\n  background-color: white; }\n  .slds-button--neutral:hover, .slds-button--neutral:focus {\n    background-color: #f4f6f9; }\n  .slds-button--neutral:active {\n    background-color: #eef1f6; }\n  .slds-button--neutral[disabled] {\n    background-color: white;\n    cursor: default; }\n\n.slds-button--hint {\n  color: #9faab5; }\n  .slds-button--hint:hover, .slds-button--hint:focus, .slds-button--hint:active {\n    color: #0070d2; }\n\n/* A parent class must be put on anything that contains a .slds-button--hint so that when the parent is hovered, the child reacts */\n.slds-hint-parent:hover .slds-button--hint, .slds-hint-parent:focus .slds-button--hint {\n  color: #0070d2; }\n\n/* Lightning Design System 0.12.1 */\n.slds-button__icon--left {\n  margin-right: 0.5rem; }\n\n.slds-button__icon--right {\n  margin-left: 0.5rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-button--brand {\n  padding-left: 1rem;\n  padding-right: 1rem;\n  text-align: center;\n  vertical-align: middle;\n  background-color: #0070d2;\n  border: 1px solid #0070d2;\n  color: white; }\n  .slds-button--brand:link, .slds-button--brand:visited, .slds-button--brand:active {\n    color: white; }\n  .slds-button--brand:hover, .slds-button--brand:focus {\n    background-color: #005fb2;\n    color: white; }\n  .slds-button--brand:active {\n    background-color: #00396b; }\n  .slds-button--brand[disabled] {\n    background: #e0e5ee;\n    border-color: transparent;\n    color: white; }\n\n/* Lightning Design System 0.12.1 */\n.slds-button--destructive {\n  padding-left: 1rem;\n  padding-right: 1rem;\n  text-align: center;\n  vertical-align: middle;\n  background-color: #c23934;\n  border: 1px solid #c23934;\n  color: white; }\n  .slds-button--destructive:link, .slds-button--destructive:visited, .slds-button--destructive:active {\n    color: white; }\n  .slds-button--destructive:hover, .slds-button--destructive:focus {\n    background-color: #A61A14;\n    color: white; }\n  .slds-button--destructive:active {\n    background-color: #870500;\n    border-color: #870500; }\n  .slds-button--destructive[disabled] {\n    background: #e0e5ee;\n    border-color: transparent;\n    color: white; }\n\n/* Lightning Design System 0.12.1 */\n/*\nCopyright (c) 2015, salesforce.com, inc. All rights reserved.\n\nRedistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:\nRedistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.\nRedistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.\nNeither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n*/\n.slds-button--inverse {\n  padding-left: 1rem;\n  padding-right: 1rem;\n  text-align: center;\n  vertical-align: middle;\n  border: 1px solid #d8dde6;\n  background-color: transparent; }\n  .slds-button--inverse:hover, .slds-button--inverse:focus {\n    background-color: #f4f6f9; }\n  .slds-button--inverse:active {\n    background-color: #eef1f6; }\n  .slds-button--inverse[disabled] {\n    background-color: transparent;\n    border-color: rgba(255, 255, 255, 0.15);\n    color: rgba(255, 255, 255, 0.15); }\n\n.slds-button--inverse, .slds-button--inverse:link, .slds-button--inverse:visited,\n.slds-button-group .slds-button--icon-inverse,\n.slds-button-group .slds-button--icon-inverse:link,\n.slds-button-group .slds-button--icon-inverse:visited {\n  color: #e0e5ee; }\n\n.slds-button--inverse:hover, .slds-button--inverse:focus, .slds-button--inverse:active,\n.slds-button-group .slds-button--icon-inverse:hover,\n.slds-button-group .slds-button--icon-inverse:focus,\n.slds-button-group .slds-button--icon-inverse:active {\n  color: #0070d2; }\n\n.slds-button--inverse:focus,\n.slds-button-group .slds-button--icon-inverse:focus {\n  outline: none;\n  box-shadow: 0 0 3px #E0E5EE; }\n\na.slds-button--inverse:focus {\n  outline: none;\n  box-shadow: 0 0 3px #E0E5EE; }\n\n/* Lightning Design System 0.12.1 */\n.slds-button--neutral.slds-is-selected {\n  border-color: transparent;\n  background-color: transparent; }\n  .slds-button--neutral.slds-is-selected:hover:not([disabled]), .slds-button--neutral.slds-is-selected:focus:not([disabled]) {\n    border: 1px solid #d8dde6;\n    background-color: #f4f6f9; }\n  .slds-button--neutral.slds-is-selected:active {\n    background-color: #eef1f6; }\n\n.slds-button__icon--stateful {\n  width: 0.75rem;\n  height: 0.75rem;\n  fill: currentColor; }\n\n.slds-text-not-selected,\n.slds-text-selected,\n.slds-text-selected-focus,\n.slds-is-selected[disabled]:hover .slds-text-selected,\n.slds-is-selected[disabled]:focus .slds-text-selected {\n  display: block; }\n\n.slds-not-selected .slds-text-selected,\n.slds-not-selected .slds-text-selected-focus,\n.slds-is-selected .slds-text-not-selected,\n.slds-is-selected:not(:hover):not(:focus) .slds-text-selected-focus,\n.slds-is-selected[disabled]:hover .slds-text-selected-focus,\n.slds-is-selected:hover .slds-text-selected,\n.slds-is-selected:focus .slds-text-selected {\n  display: none; }\n\n/* Lightning Design System 0.12.1 */\n.slds-button--inverse.slds-is-selected {\n  border-color: transparent; }\n\n/* Lightning Design System 0.12.1 */\n.slds-button--icon-container,\n.slds-button--icon-border,\n.slds-button--icon-border-filled,\n.slds-button--icon-bare,\n.slds-button--icon-more {\n  vertical-align: middle;\n  color: #54698d; }\n\n.slds-button--icon-bare {\n  line-height: 1; }\n\n.slds-button--icon-border[disabled]:hover, .slds-button--icon-border[disabled]:focus {\n  background-color: transparent; }\n\n.slds-button--icon-border-filled,\n.slds-button--icon-border {\n  border: 1px solid #d8dde6; }\n  .slds-button--icon-border-filled:hover, .slds-button--icon-border-filled:focus,\n  .slds-button--icon-border:hover,\n  .slds-button--icon-border:focus {\n    background-color: #f4f6f9; }\n  .slds-button--icon-border-filled:active,\n  .slds-button--icon-border:active {\n    background-color: #eef1f6; }\n\n.slds-button--icon-container,\n.slds-button--icon-border,\n.slds-button--icon-border-filled {\n  width: 2.25rem;\n  height: 2.25rem; }\n\n.slds-button--icon-small {\n  width: 2rem;\n  height: 2rem;\n  line-height: 1.875rem; }\n\n.slds-button--icon-x-small {\n  width: 1.25rem;\n  height: 1.25rem;\n  border-radius: 0.125rem;\n  line-height: 1; }\n\n.slds-button--icon-border-filled {\n  background-color: white; }\n  .slds-button--icon-border-filled[disabled] {\n    border: 1px solid #d8dde6;\n    background-color: white; }\n\n.slds-button__icon {\n  width: 1rem;\n  height: 1rem;\n  fill: currentColor; }\n  .slds-button__icon--large {\n    width: 1.5rem;\n    height: 1.5rem; }\n  .slds-button__icon--small {\n    width: 0.75rem;\n    height: 0.75rem; }\n  .slds-button__icon--x-small {\n    width: 0.5rem;\n    height: 0.5rem;\n    margin-left: 0.25rem; }\n\n.slds-icon--small .slds-button__icon {\n  width: 1.5rem;\n  height: 1.5rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-button__icon--hint {\n  fill: #9faab5; }\n\n.slds-hint-parent:hover .slds-button__icon--hint, .slds-hint-parent:focus .slds-button__icon--hint {\n  fill: #54698d; }\n\n/* Lightning Design System 0.12.1 */\n.slds-button--icon-more {\n  padding: 0 0.5rem;\n  vertical-align: middle;\n  border: 1px solid #d8dde6; }\n  .slds-button--icon-more:hover, .slds-button--icon-more:focus {\n    border: 1px solid #d8dde6; }\n    .slds-button--icon-more:hover:hover, .slds-button--icon-more:hover:focus, .slds-button--icon-more:focus:hover, .slds-button--icon-more:focus:focus {\n      background-color: #f4f6f9; }\n    .slds-button--icon-more:hover:active, .slds-button--icon-more:focus:active {\n      background-color: #eef1f6; }\n    .slds-button--icon-more:hover .slds-button__icon, .slds-button--icon-more:focus .slds-button__icon {\n      fill: #0070d2; }\n  .slds-button--icon-more:active .slds-button__icon {\n    fill: #00396b; }\n  .slds-button--icon-more[disabled] {\n    cursor: default; }\n    .slds-button--icon-more[disabled] .slds-button__icon {\n      fill: #d8dde6; }\n\n/* Lightning Design System 0.12.1 */\n.slds-button--icon-border.slds-is-selected {\n  background-color: #0070d2;\n  border: 1px solid #0070d2;\n  color: white; }\n  .slds-button--icon-border.slds-is-selected:link, .slds-button--icon-border.slds-is-selected:visited, .slds-button--icon-border.slds-is-selected:active {\n    color: white; }\n  .slds-button--icon-border.slds-is-selected:hover, .slds-button--icon-border.slds-is-selected:focus {\n    background-color: #005fb2;\n    color: white; }\n  .slds-button--icon-border.slds-is-selected:active {\n    background-color: #00396b; }\n  .slds-button--icon-border.slds-is-selected .slds-button__icon {\n    fill: white; }\n  .slds-button--icon-border.slds-is-selected:hover .slds-button__icon, .slds-button--icon-border.slds-is-selected:focus .slds-button__icon {\n    fill: white; }\n\n/* Lightning Design System 0.12.1 */\n.slds-button--icon-inverse {\n  color: white; }\n  .slds-button--icon-inverse:hover, .slds-button--icon-inverse:focus {\n    color: rgba(255, 255, 255, 0.75); }\n  .slds-button--icon-inverse:active {\n    color: rgba(255, 255, 255, 0.5); }\n  .slds-button--icon-inverse[disabled] {\n    color: rgba(255, 255, 255, 0.15); }\n\n/* Lightning Design System 0.12.1 */\n/*\nCopyright (c) 2015, salesforce.com, inc. All rights reserved.\n\nRedistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:\nRedistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.\nRedistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.\nNeither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n*/\n@media (max-width: 30em) {\n  .slds-max-small-button--stretch,\n  .slds-max-small-buttons--stretch .slds-button {\n    width: 100%; } }\n\n/* Lightning Design System 0.12.1 */\n/*\nCopyright (c) 2015, salesforce.com, inc. All rights reserved.\n\nRedistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:\nRedistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.\nRedistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.\nNeither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n*/\n@media (min-width: 320px) {\n  .slds-x-small-button--stacked + .slds-x-small-button--stacked,\n  .slds-x-small-buttons--stacked .slds-button + .slds-button {\n    display: block;\n    margin-top: 0.5rem;\n    margin-left: 0; }\n  .slds-x-small-button--horizontal + .slds-x-small-button--horizontal,\n  .slds-x-small-buttons--horizontal .slds-button + .slds-button {\n    margin-left: 0.5rem; } }\n\n@media (max-width: 320px) {\n  .slds-max-x-small-button--stacked + .slds-max-x-small-button--stacked,\n  .slds-max-x-small-buttons--stacked .slds-button + .slds-button {\n    display: block;\n    margin-top: 0.5rem;\n    margin-left: 0; }\n  .slds-max-x-small-button--horizontal + .slds-max-x-small-button--horizontal,\n  .slds-max-x-small-buttons--horizontal .slds-button + .slds-button {\n    margin-left: 0.5rem; } }\n\n@media (min-width: 480px) {\n  .slds-small-button--stacked + .slds-small-button--stacked,\n  .slds-small-buttons--stacked .slds-button + .slds-button {\n    display: block;\n    margin-top: 0.5rem;\n    margin-left: 0; }\n  .slds-small-button--horizontal + .slds-small-button--horizontal,\n  .slds-small-buttons--horizontal .slds-button + .slds-button {\n    margin-left: 0.5rem; } }\n\n@media (max-width: 480px) {\n  .slds-max-small-button--stacked + .slds-max-small-button--stacked,\n  .slds-max-small-buttons--stacked .slds-button + .slds-button {\n    display: block;\n    margin-top: 0.5rem;\n    margin-left: 0; }\n  .slds-max-small-button--horizontal + .slds-max-small-button--horizontal,\n  .slds-max-small-buttons--horizontal .slds-button + .slds-button {\n    margin-left: 0.5rem; } }\n\n@media (min-width: 768px) {\n  .slds-medium-button--stacked + .slds-medium-button--stacked,\n  .slds-medium-buttons--stacked .slds-button + .slds-button {\n    display: block;\n    margin-top: 0.5rem;\n    margin-left: 0; }\n  .slds-medium-button--horizontal + .slds-medium-button--horizontal,\n  .slds-medium-buttons--horizontal .slds-button + .slds-button {\n    margin-left: 0.5rem; } }\n\n@media (max-width: 768px) {\n  .slds-max-medium-button--stacked + .slds-max-medium-button--stacked,\n  .slds-max-medium-buttons--stacked .slds-button + .slds-button {\n    display: block;\n    margin-top: 0.5rem;\n    margin-left: 0; }\n  .slds-max-medium-button--horizontal + .slds-max-medium-button--horizontal,\n  .slds-max-medium-buttons--horizontal .slds-button + .slds-button {\n    margin-left: 0.5rem; } }\n\n@media (min-width: 1024px) {\n  .slds-large-button--stacked + .slds-large-button--stacked,\n  .slds-large-buttons--stacked .slds-button + .slds-button {\n    display: block;\n    margin-top: 0.5rem;\n    margin-left: 0; }\n  .slds-large-button--horizontal + .slds-large-button--horizontal,\n  .slds-large-buttons--horizontal .slds-button + .slds-button {\n    margin-left: 0.5rem; } }\n\n@media (max-width: 1024px) {\n  .slds-max-large-button--stacked + .slds-max-large-button--stacked,\n  .slds-max-large-buttons--stacked .slds-button + .slds-button {\n    display: block;\n    margin-top: 0.5rem;\n    margin-left: 0; }\n  .slds-max-large-button--horizontal + .slds-max-large-button--horizontal,\n  .slds-max-large-buttons--horizontal .slds-button + .slds-button {\n    margin-left: 0.5rem; } }\n\n/* Lightning Design System 0.12.1 */\n.slds-icon__container {\n  display: inline-block;\n  border-radius: 0.25rem; }\n  .slds-icon__container--circle {\n    padding: 0.5rem;\n    border-radius: 50%; }\n\n.slds-icon {\n  width: 2rem;\n  height: 2rem;\n  border-radius: 0.25rem;\n  fill: white; }\n\n.slds-icon-action-approval {\n  background-color: #00c6b7; }\n\n.slds-icon-action-canvasapp {\n  background-color: #8199af; }\n\n.slds-icon-action-goal {\n  background-color: #56aadf; }\n\n.slds-icon-action-opportunity-competitor {\n  background-color: #fcb95b; }\n\n.slds-icon-action-opportunity-line-item {\n  background-color: #fcb95b; }\n\n.slds-icon-action-opportunity-team-member {\n  background-color: #fcb95b; }\n\n.slds-icon-action-question-post-action {\n  background-color: #32af5c; }\n\n.slds-icon-action-quote {\n  background-color: #88c651; }\n\n.slds-icon-action-reject {\n  background-color: #00c6b7; }\n\n.slds-icon-action-social-post {\n  background-color: #ea74a2; }\n\n.slds-icon-action-fallback {\n  background-color: #9895ee; }\n\n.slds-icon-action-edit {\n  background-color: #1dccbf; }\n\n.slds-icon-action-delete {\n  background-color: #e6717c; }\n\n.slds-icon-action-clone {\n  background-color: #6ca1e9; }\n\n.slds-icon-action-follow {\n  background-color: #31b9f8; }\n\n.slds-icon-action-following {\n  background-color: #7dcf64; }\n\n.slds-icon-action-join-group {\n  background-color: #779ef2; }\n\n.slds-icon-action-leave-group {\n  background-color: #f39e58; }\n\n.slds-icon-action-edit-group {\n  background-color: #34becd; }\n\n.slds-icon-action-share-post {\n  background-color: #65cae4; }\n\n.slds-icon-action-share-file {\n  background-color: #baac93; }\n\n.slds-icon-action-new-task {\n  background-color: #4bc076; }\n\n.slds-icon-action-new-contact {\n  background-color: #a094ed; }\n\n.slds-icon-action-new-opportunity {\n  background-color: #fcb95b; }\n\n.slds-icon-action-new-case {\n  background-color: #f2cf5b; }\n\n.slds-icon-action-new-lead {\n  background-color: #f88962; }\n\n.slds-icon-action-share-thanks {\n  background-color: #e9696e; }\n\n.slds-icon-action-share-link {\n  background-color: #7a9ae6; }\n\n.slds-icon-action-share-poll {\n  background-color: #699be1; }\n\n.slds-icon-action-new-event {\n  background-color: #eb7092; }\n\n.slds-icon-action-new-child-case {\n  background-color: #fa975c; }\n\n.slds-icon-action-log-a-call {\n  background-color: #48c3cc; }\n\n.slds-icon-action-new-note {\n  background-color: #e6d478; }\n\n.slds-icon-action-new {\n  background-color: #33bce7; }\n\n.slds-icon-action-filter {\n  background-color: #fd90b5; }\n\n.slds-icon-action-sort {\n  background-color: #fab9a5; }\n\n.slds-icon-action-description {\n  background-color: #7dc37d; }\n\n.slds-icon-action-defer {\n  background-color: #ef7ead; }\n\n.slds-icon-action-update {\n  background-color: #81b4d6; }\n\n.slds-icon-action-log-this-event {\n  background-color: #f86268; }\n\n.slds-icon-action-email {\n  background-color: #95aec5; }\n\n.slds-icon-action-dial-in {\n  background-color: #8b9ae3; }\n\n.slds-icon-action-map {\n  background-color: #76c6ee; }\n\n.slds-icon-action-call {\n  background-color: #1fcaa0; }\n\n.slds-icon-action-google-news {\n  background-color: #f5675b; }\n\n.slds-icon-action-web-link {\n  background-color: #56aadf; }\n\n.slds-icon-action-submit-for-approval {\n  background-color: #50cc7a; }\n\n.slds-icon-action-search {\n  background-color: #48adeb; }\n\n.slds-icon-action-close {\n  background-color: #ef6e64; }\n\n.slds-icon-action-back {\n  background-color: #0dc2d9; }\n\n.slds-icon-action-office-365 {\n  background-color: #ff8041; }\n\n.slds-icon-action-concur {\n  background-color: #4cc3c7; }\n\n.slds-icon-action-dropbox {\n  background-color: #52aef9; }\n\n.slds-icon-action-evernote {\n  background-color: #86c86f; }\n\n.slds-icon-action-docusign {\n  background-color: #5080db; }\n\n.slds-icon-action-more {\n  background-color: #62b7ed; }\n\n.slds-icon-action-notebook {\n  background-color: #c871d6; }\n\n.slds-icon-action-preview {\n  background-color: #7f8de1; }\n\n.slds-icon-action-priority {\n  background-color: #fbb439; }\n\n.slds-icon-action-default-custom-object {\n  background-color: #8199af; }\n\n.slds-icon-action-new-custom-object {\n  background-color: #a7d44d; }\n\n.slds-icon-action-lead-convert {\n  background-color: #f88962; }\n\n.slds-icon-action-new-account {\n  background-color: #7f8de1; }\n\n.slds-icon-action-new-campaign {\n  background-color: #f49756; }\n\n.slds-icon-action-new-group {\n  background-color: #83b6ff; }\n\n.slds-icon-action-update-status {\n  background-color: #1ec7be; }\n\n.slds-icon-action-new-custom-1 {\n  background-color: #ff7b84; }\n\n.slds-icon-action-new-custom-2 {\n  background-color: #cfd05c; }\n\n.slds-icon-action-new-custom-3 {\n  background-color: #ecb46c; }\n\n.slds-icon-action-new-custom-4 {\n  background-color: #e1d951; }\n\n.slds-icon-action-new-custom-5 {\n  background-color: #9fdb66; }\n\n.slds-icon-action-new-custom-6 {\n  background-color: #54c473; }\n\n.slds-icon-action-new-custom-7 {\n  background-color: #6a89e5; }\n\n.slds-icon-action-new-custom-8 {\n  background-color: #50ceb9; }\n\n.slds-icon-action-new-custom-9 {\n  background-color: #6b9ee2; }\n\n.slds-icon-action-new-custom-10 {\n  background-color: #6488e3; }\n\n.slds-icon-action-new-custom-11 {\n  background-color: #8784ea; }\n\n.slds-icon-action-new-custom-12 {\n  background-color: #dc71d1; }\n\n.slds-icon-action-new-custom-13 {\n  background-color: #df6184; }\n\n.slds-icon-action-new-custom-14 {\n  background-color: #3cc2b3; }\n\n.slds-icon-action-new-custom-15 {\n  background-color: #f77e75; }\n\n.slds-icon-action-new-custom-16 {\n  background-color: #e9af67; }\n\n.slds-icon-action-new-custom-17 {\n  background-color: #acd360; }\n\n.slds-icon-action-new-custom-18 {\n  background-color: #4dca76; }\n\n.slds-icon-action-new-custom-19 {\n  background-color: #3abeb1; }\n\n.slds-icon-action-new-custom-20 {\n  background-color: #48c7c8; }\n\n.slds-icon-action-new-custom-21 {\n  background-color: #8a7aed; }\n\n.slds-icon-action-new-custom-22 {\n  background-color: #8b85f9; }\n\n.slds-icon-action-new-custom-23 {\n  background-color: #b070e6; }\n\n.slds-icon-action-new-custom-24 {\n  background-color: #e56798; }\n\n.slds-icon-action-new-custom-25 {\n  background-color: #e46fbe; }\n\n.slds-icon-action-new-custom-26 {\n  background-color: #7698f0; }\n\n.slds-icon-action-new-custom-27 {\n  background-color: #5ab0d2; }\n\n.slds-icon-action-new-custom-28 {\n  background-color: #89c059; }\n\n.slds-icon-action-new-custom-29 {\n  background-color: #bdd25f; }\n\n.slds-icon-action-new-custom-30 {\n  background-color: #f59f71; }\n\n.slds-icon-action-new-custom-31 {\n  background-color: #eb687f; }\n\n.slds-icon-action-new-custom-32 {\n  background-color: #38c393; }\n\n.slds-icon-action-new-custom-33 {\n  background-color: #97cf5d; }\n\n.slds-icon-action-new-custom-34 {\n  background-color: #d58a6a; }\n\n.slds-icon-action-new-custom-35 {\n  background-color: #e9637e; }\n\n.slds-icon-action-new-custom-36 {\n  background-color: #d472d4; }\n\n.slds-icon-action-new-custom-37 {\n  background-color: #8c89f2; }\n\n.slds-icon-action-new-custom-38 {\n  background-color: #53b6d7; }\n\n.slds-icon-action-new-custom-39 {\n  background-color: #4fbe75; }\n\n.slds-icon-action-new-custom-40 {\n  background-color: #83c75e; }\n\n.slds-icon-action-new-custom-41 {\n  background-color: #43b5b5; }\n\n.slds-icon-action-new-custom-42 {\n  background-color: #cfd05b; }\n\n.slds-icon-action-new-custom-43 {\n  background-color: #7f93f9; }\n\n.slds-icon-action-new-custom-44 {\n  background-color: #c8ca58; }\n\n.slds-icon-action-new-custom-45 {\n  background-color: #d95879; }\n\n.slds-icon-action-new-custom-46 {\n  background-color: #67a5e7; }\n\n.slds-icon-action-new-custom-47 {\n  background-color: #5fcc64; }\n\n.slds-icon-action-new-custom-48 {\n  background-color: #ef697f; }\n\n.slds-icon-action-new-custom-49 {\n  background-color: #e25c80; }\n\n.slds-icon-action-new-custom-50 {\n  background-color: #49bcd3; }\n\n.slds-icon-action-new-custom-51 {\n  background-color: #d8c760; }\n\n.slds-icon-action-new-custom-52 {\n  background-color: #ee8e6f; }\n\n.slds-icon-action-new-custom-53 {\n  background-color: #f36e83; }\n\n.slds-icon-action-new-custom-54 {\n  background-color: #ea70b1; }\n\n.slds-icon-action-new-custom-55 {\n  background-color: #d66ee0; }\n\n.slds-icon-action-new-custom-56 {\n  background-color: #718deb; }\n\n.slds-icon-action-new-custom-57 {\n  background-color: #5a9cdd; }\n\n.slds-icon-action-new-custom-58 {\n  background-color: #34b59d; }\n\n.slds-icon-action-new-custom-59 {\n  background-color: #e3d067; }\n\n.slds-icon-action-new-custom-60 {\n  background-color: #bf5a88; }\n\n.slds-icon-action-new-custom-61 {\n  background-color: #f57376; }\n\n.slds-icon-action-new-custom-62 {\n  background-color: #6b92dc; }\n\n.slds-icon-action-new-custom-63 {\n  background-color: #7ccf60; }\n\n.slds-icon-action-new-custom-64 {\n  background-color: #618fd8; }\n\n.slds-icon-action-new-custom-65 {\n  background-color: #f279ab; }\n\n.slds-icon-action-new-custom-66 {\n  background-color: #d8be5f; }\n\n.slds-icon-action-new-custom-67 {\n  background-color: #f87d76; }\n\n.slds-icon-action-new-custom-68 {\n  background-color: #f26979; }\n\n.slds-icon-action-new-custom-69 {\n  background-color: #ed6387; }\n\n.slds-icon-action-new-custom-70 {\n  background-color: #e769b4; }\n\n.slds-icon-action-new-custom-71 {\n  background-color: #e36ee3; }\n\n.slds-icon-action-new-custom-72 {\n  background-color: #8d9bfb; }\n\n.slds-icon-action-new-custom-73 {\n  background-color: #679ef0; }\n\n.slds-icon-action-new-custom-74 {\n  background-color: #41c8a0; }\n\n.slds-icon-action-new-custom-75 {\n  background-color: #cd9f65; }\n\n.slds-icon-action-new-custom-76 {\n  background-color: #db6d7a; }\n\n.slds-icon-action-new-custom-77 {\n  background-color: #b55d5b; }\n\n.slds-icon-action-new-custom-78 {\n  background-color: #5a95dd; }\n\n.slds-icon-action-new-custom-79 {\n  background-color: #8ed363; }\n\n.slds-icon-action-new-custom-80 {\n  background-color: #659ad5; }\n\n.slds-icon-action-new-custom-81 {\n  background-color: #da627f; }\n\n.slds-icon-action-new-custom-82 {\n  background-color: #d15b97; }\n\n.slds-icon-action-new-custom-83 {\n  background-color: #e7806f; }\n\n.slds-icon-action-new-custom-84 {\n  background-color: #f6707b; }\n\n.slds-icon-action-new-custom-85 {\n  background-color: #f26891; }\n\n.slds-icon-action-new-custom-86 {\n  background-color: #e260ab; }\n\n.slds-icon-action-new-custom-87 {\n  background-color: #d876e5; }\n\n.slds-icon-action-new-custom-88 {\n  background-color: #996fe6; }\n\n.slds-icon-action-new-custom-89 {\n  background-color: #3e99be; }\n\n.slds-icon-action-new-custom-90 {\n  background-color: #22a48a; }\n\n.slds-icon-action-new-custom-91 {\n  background-color: #bf7b66; }\n\n.slds-icon-action-new-custom-92 {\n  background-color: #517e82; }\n\n.slds-icon-action-new-custom-93 {\n  background-color: #904d4c; }\n\n.slds-icon-action-new-custom-94 {\n  background-color: #439cba; }\n\n.slds-icon-action-new-custom-95 {\n  background-color: #8bcf6a; }\n\n.slds-icon-action-new-custom-96 {\n  background-color: #6d9de3; }\n\n.slds-icon-action-new-custom-97 {\n  background-color: #dd6085; }\n\n.slds-icon-action-new-custom-98 {\n  background-color: #e1be5c; }\n\n.slds-icon-action-new-custom-99 {\n  background-color: #f0856e; }\n\n.slds-icon-action-new-custom-100 {\n  background-color: #e15d76; }\n\n.slds-icon-action-apex {\n  background-color: #696e71; }\n\n.slds-icon-action-flow {\n  background-color: #0079bc; }\n\n.slds-icon-action-announcement {\n  background-color: #fe8f60; }\n\n.slds-icon-action-record {\n  background-color: #7dc37d; }\n\n.slds-icon-custom-1 {\n  background-color: #ff7b84; }\n\n.slds-icon-custom-2 {\n  background-color: #cfd05c; }\n\n.slds-icon-custom-3 {\n  background-color: #ecb46c; }\n\n.slds-icon-custom-4 {\n  background-color: #e1d951; }\n\n.slds-icon-custom-5 {\n  background-color: #9fdb66; }\n\n.slds-icon-custom-6 {\n  background-color: #54c473; }\n\n.slds-icon-custom-7 {\n  background-color: #6a89e5; }\n\n.slds-icon-custom-8 {\n  background-color: #50ceb9; }\n\n.slds-icon-custom-9 {\n  background-color: #6b9ee2; }\n\n.slds-icon-custom-10 {\n  background-color: #6488e3; }\n\n.slds-icon-custom-11 {\n  background-color: #8784ea; }\n\n.slds-icon-custom-12 {\n  background-color: #dc71d1; }\n\n.slds-icon-custom-13 {\n  background-color: #df6184; }\n\n.slds-icon-custom-14 {\n  background-color: #3cc2b3; }\n\n.slds-icon-custom-15 {\n  background-color: #f77e75; }\n\n.slds-icon-custom-16 {\n  background-color: #e9af67; }\n\n.slds-icon-custom-17 {\n  background-color: #acd360; }\n\n.slds-icon-custom-18 {\n  background-color: #4dca76; }\n\n.slds-icon-custom-19 {\n  background-color: #3abeb1; }\n\n.slds-icon-custom-20 {\n  background-color: #48c7c8; }\n\n.slds-icon-custom-21 {\n  background-color: #8a7aed; }\n\n.slds-icon-custom-22 {\n  background-color: #8b85f9; }\n\n.slds-icon-custom-23 {\n  background-color: #b070e6; }\n\n.slds-icon-custom-24 {\n  background-color: #e56798; }\n\n.slds-icon-custom-25 {\n  background-color: #e46fbe; }\n\n.slds-icon-custom-26 {\n  background-color: #7698f0; }\n\n.slds-icon-custom-27 {\n  background-color: #5ab0d2; }\n\n.slds-icon-custom-28 {\n  background-color: #89c059; }\n\n.slds-icon-custom-29 {\n  background-color: #bdd25f; }\n\n.slds-icon-custom-30 {\n  background-color: #f59f71; }\n\n.slds-icon-custom-31 {\n  background-color: #eb687f; }\n\n.slds-icon-custom-32 {\n  background-color: #38c393; }\n\n.slds-icon-custom-33 {\n  background-color: #97cf5d; }\n\n.slds-icon-custom-34 {\n  background-color: #d58a6a; }\n\n.slds-icon-custom-35 {\n  background-color: #e9637e; }\n\n.slds-icon-custom-36 {\n  background-color: #d472d4; }\n\n.slds-icon-custom-37 {\n  background-color: #8c89f2; }\n\n.slds-icon-custom-38 {\n  background-color: #53b6d7; }\n\n.slds-icon-custom-39 {\n  background-color: #4fbe75; }\n\n.slds-icon-custom-40 {\n  background-color: #83c75e; }\n\n.slds-icon-custom-41 {\n  background-color: #43b5b5; }\n\n.slds-icon-custom-42 {\n  background-color: #cfd05b; }\n\n.slds-icon-custom-43 {\n  background-color: #7f93f9; }\n\n.slds-icon-custom-44 {\n  background-color: #c8ca58; }\n\n.slds-icon-custom-45 {\n  background-color: #d95879; }\n\n.slds-icon-custom-46 {\n  background-color: #67a5e7; }\n\n.slds-icon-custom-47 {\n  background-color: #5fcc64; }\n\n.slds-icon-custom-48 {\n  background-color: #ef697f; }\n\n.slds-icon-custom-49 {\n  background-color: #e25c80; }\n\n.slds-icon-custom-50 {\n  background-color: #49bcd3; }\n\n.slds-icon-custom-51 {\n  background-color: #d8c760; }\n\n.slds-icon-custom-52 {\n  background-color: #ee8e6f; }\n\n.slds-icon-custom-53 {\n  background-color: #f36e83; }\n\n.slds-icon-custom-54 {\n  background-color: #ea70b1; }\n\n.slds-icon-custom-55 {\n  background-color: #d66ee0; }\n\n.slds-icon-custom-56 {\n  background-color: #718deb; }\n\n.slds-icon-custom-57 {\n  background-color: #5a9cdd; }\n\n.slds-icon-custom-58 {\n  background-color: #34b59d; }\n\n.slds-icon-custom-59 {\n  background-color: #e3d067; }\n\n.slds-icon-custom-60 {\n  background-color: #bf5a88; }\n\n.slds-icon-custom-61 {\n  background-color: #f57376; }\n\n.slds-icon-custom-62 {\n  background-color: #6b92dc; }\n\n.slds-icon-custom-63 {\n  background-color: #7ccf60; }\n\n.slds-icon-custom-64 {\n  background-color: #618fd8; }\n\n.slds-icon-custom-65 {\n  background-color: #f279ab; }\n\n.slds-icon-custom-66 {\n  background-color: #d8be5f; }\n\n.slds-icon-custom-67 {\n  background-color: #f87d76; }\n\n.slds-icon-custom-68 {\n  background-color: #f26979; }\n\n.slds-icon-custom-69 {\n  background-color: #ed6387; }\n\n.slds-icon-custom-70 {\n  background-color: #e769b4; }\n\n.slds-icon-custom-71 {\n  background-color: #e36ee3; }\n\n.slds-icon-custom-72 {\n  background-color: #8d9bfb; }\n\n.slds-icon-custom-73 {\n  background-color: #679ef0; }\n\n.slds-icon-custom-74 {\n  background-color: #41c8a0; }\n\n.slds-icon-custom-75 {\n  background-color: #cd9f65; }\n\n.slds-icon-custom-76 {\n  background-color: #db6d7a; }\n\n.slds-icon-custom-77 {\n  background-color: #b55d5b; }\n\n.slds-icon-custom-78 {\n  background-color: #5a95dd; }\n\n.slds-icon-custom-79 {\n  background-color: #8ed363; }\n\n.slds-icon-custom-80 {\n  background-color: #659ad5; }\n\n.slds-icon-custom-81 {\n  background-color: #da627f; }\n\n.slds-icon-custom-82 {\n  background-color: #d15b97; }\n\n.slds-icon-custom-83 {\n  background-color: #e7806f; }\n\n.slds-icon-custom-84 {\n  background-color: #f6707b; }\n\n.slds-icon-custom-85 {\n  background-color: #f26891; }\n\n.slds-icon-custom-86 {\n  background-color: #e260ab; }\n\n.slds-icon-custom-87 {\n  background-color: #d876e5; }\n\n.slds-icon-custom-88 {\n  background-color: #996fe6; }\n\n.slds-icon-custom-89 {\n  background-color: #3e99be; }\n\n.slds-icon-custom-90 {\n  background-color: #22a48a; }\n\n.slds-icon-custom-91 {\n  background-color: #bf7b66; }\n\n.slds-icon-custom-92 {\n  background-color: #517e82; }\n\n.slds-icon-custom-93 {\n  background-color: #904d4c; }\n\n.slds-icon-custom-94 {\n  background-color: #439cba; }\n\n.slds-icon-custom-95 {\n  background-color: #8bcf6a; }\n\n.slds-icon-custom-96 {\n  background-color: #6d9de3; }\n\n.slds-icon-custom-97 {\n  background-color: #dd6085; }\n\n.slds-icon-custom-98 {\n  background-color: #e1be5c; }\n\n.slds-icon-custom-99 {\n  background-color: #f0856e; }\n\n.slds-icon-custom-100 {\n  background-color: #e15d76; }\n\n.slds-icon-standard-log-a-call {\n  background-color: #48c3cc; }\n\n.slds-icon-standard-account {\n  background-color: #7f8de1; }\n\n.slds-icon-standard-social-post {\n  background-color: #ea74a2; }\n\n.slds-icon-standard-campaign-members {\n  background-color: #f49756; }\n\n.slds-icon-standard-article {\n  background-color: #f2cf5b; }\n\n.slds-icon-standard-answer-public {\n  background-color: #f2cf5b; }\n\n.slds-icon-standard-answer-private {\n  background-color: #f2cf5b; }\n\n.slds-icon-standard-answer-best {\n  background-color: #f2cf5b; }\n\n.slds-icon-standard-avatar-loading {\n  background-color: #b8c3ce; }\n\n.slds-icon-standard-campaign {\n  background-color: #f49756; }\n\n.slds-icon-standard-calibration {\n  background-color: #47cfd2; }\n\n.slds-icon-standard-avatar {\n  background-color: #62b7ed; }\n\n.slds-icon-standard-approval {\n  background-color: #50cc7a; }\n\n.slds-icon-standard-apps {\n  background-color: #3c97dd; }\n\n.slds-icon-standard-user {\n  background-color: #34becd; }\n\n.slds-icon-standard-evernote {\n  background-color: #86c86f; }\n\n.slds-icon-standard-coaching {\n  background-color: #f67594; }\n\n.slds-icon-standard-connected-apps-admins {\n  background-color: #9895ee; }\n\n.slds-icon-standard-drafts {\n  background-color: #6ca1e9; }\n\n.slds-icon-standard-email {\n  background-color: #95aec5; }\n\n.slds-icon-standard-endorsement {\n  background-color: #8b9ae3; }\n\n.slds-icon-standard-event {\n  background-color: #eb7092; }\n\n.slds-icon-standard-dropbox {\n  background-color: #52aef9; }\n\n.slds-icon-standard-concur {\n  background-color: #4cc3c7; }\n\n.slds-icon-standard-email-chatter {\n  background-color: #f2cf5b; }\n\n.slds-icon-standard-case-transcript {\n  background-color: #f2cf5b; }\n\n.slds-icon-standard-case-comment {\n  background-color: #f2cf5b; }\n\n.slds-icon-standard-case-change-status {\n  background-color: #f2cf5b; }\n\n.slds-icon-standard-client {\n  background-color: #00d2be; }\n\n.slds-icon-standard-contract {\n  background-color: #6ec06e; }\n\n.slds-icon-standard-dashboard {\n  background-color: #ef6e64; }\n\n.slds-icon-standard-case {\n  background-color: #f2cf5b; }\n\n.slds-icon-standard-empty {\n  background-color: #8199af; }\n\n.slds-icon-standard-default {\n  background-color: #8199af; }\n\n.slds-icon-standard-custom {\n  background-color: #8199af; }\n\n.slds-icon-standard-canvas {\n  background-color: #8199af; }\n\n.slds-icon-standard-contact {\n  background-color: #a094ed; }\n\n.slds-icon-standard-portal {\n  background-color: #aec770; }\n\n.slds-icon-standard-product {\n  background-color: #b781d3; }\n\n.slds-icon-standard-feed {\n  background-color: #62b7ed; }\n\n.slds-icon-standard-feedback {\n  background-color: #6da1ea; }\n\n.slds-icon-standard-file {\n  background-color: #baac93; }\n\n.slds-icon-standard-goals {\n  background-color: #56aadf; }\n\n.slds-icon-standard-groups {\n  background-color: #779ef2; }\n\n.slds-icon-standard-household {\n  background-color: #00afa0; }\n\n.slds-icon-standard-insights {\n  background-color: #ec94ed; }\n\n.slds-icon-standard-investment-account {\n  background-color: #4bc076; }\n\n.slds-icon-standard-performance {\n  background-color: #f8b156; }\n\n.slds-icon-standard-link {\n  background-color: #7a9ae6; }\n\n.slds-icon-standard-metrics {\n  background-color: #56aadf; }\n\n.slds-icon-standard-note {\n  background-color: #e6d478; }\n\n.slds-icon-standard-lead {\n  background-color: #f88962; }\n\n.slds-icon-standard-opportunity {\n  background-color: #fcb95b; }\n\n.slds-icon-standard-log-a-call-chatter {\n  background-color: #f2cf5b; }\n\n.slds-icon-standard-orders {\n  background-color: #769ed9; }\n\n.slds-icon-standard-post {\n  background-color: #65cae4; }\n\n.slds-icon-standard-poll {\n  background-color: #699be1; }\n\n.slds-icon-standard-photo {\n  background-color: #d7d1d1; }\n\n.slds-icon-standard-people {\n  background-color: #34becd; }\n\n.slds-icon-standard-generic-loading {\n  background-color: #b8c3ce; }\n\n.slds-icon-standard-group-loading {\n  background-color: #b8c3ce; }\n\n.slds-icon-standard-recent {\n  background-color: #6ca1e9; }\n\n.slds-icon-standard-solution {\n  background-color: #8fc972; }\n\n.slds-icon-standard-record {\n  background-color: #7dc37d; }\n\n.slds-icon-standard-question-best {\n  background-color: #f2cf5b; }\n\n.slds-icon-standard-question-feed {\n  background-color: #f2cf5b; }\n\n.slds-icon-standard-related-list {\n  background-color: #59bcab; }\n\n.slds-icon-standard-skill-entity {\n  background-color: #8b9ae3; }\n\n.slds-icon-standard-scan-card {\n  background-color: #f39e58; }\n\n.slds-icon-standard-report {\n  background-color: #2ecbbe; }\n\n.slds-icon-standard-quotes {\n  background-color: #88c651; }\n\n.slds-icon-standard-task {\n  background-color: #4bc076; }\n\n.slds-icon-standard-team-member {\n  background-color: #f2cf5b; }\n\n.slds-icon-standard-thanks {\n  background-color: #e9696e; }\n\n.slds-icon-standard-thanks-loading {\n  background-color: #b8c3ce; }\n\n.slds-icon-standard-today {\n  background-color: #ef7ead; }\n\n.slds-icon-standard-topic {\n  background-color: #56aadf; }\n\n.slds-icon-standard-unmatched {\n  background-color: #62b7ed; }\n\n.slds-icon-standard-marketing-actions {\n  background-color: #6bbd6e; }\n\n.slds-icon-standard-marketing-resources {\n  background-color: black; }\n\n/* Lightning Design System 0.12.1 */\n.slds-icon-text-default {\n  fill: #54698d; }\n\n.slds-icon-text-warning {\n  fill: #ffb75d; }\n\n.slds-icon-text-error {\n  fill: #c23934; }\n\n/* Lightning Design System 0.12.1 */\n.slds-icon--x-small {\n  line-height: 1;\n  width: 1rem;\n  height: 1rem; }\n\n.slds-icon--small {\n  line-height: 1;\n  width: 1.5rem;\n  height: 1.5rem; }\n\n.slds-icon--large {\n  width: 3rem;\n  height: 3rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-card {\n  padding: 0;\n  border-radius: 0.25rem;\n  background-clip: padding-box;\n  background-color: #f4f6f9;\n  border: 1px solid #d8dde6; }\n  .slds-card + .slds-card {\n    margin-top: 1rem; }\n  .slds-card__header {\n    padding: 0.75rem 0.75rem 0.25rem; }\n  .slds-card__body {\n    padding: 0.5rem 0; }\n  .slds-card__footer {\n    padding: 0.25rem 1rem 0.5rem; }\n  .slds-card .slds-tile {\n    margin: 0.5rem;\n    padding: 0.5rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-card--empty .slds-card__body {\n  text-align: center; }\n\n/* Lightning Design System 0.12.1 */\n.slds-form-element {\n  position: relative; }\n  .slds-form-element__helper {\n    font-size: 0.75rem; }\n\n.slds-form-element__label {\n  display: inline-block;\n  color: #54698d;\n  font-size: 0.75rem;\n  line-height: 1.5;\n  margin-right: 0.75rem;\n  margin-bottom: 0.25rem; }\n  .slds-form-element__label:empty {\n    margin: 0; }\n\n.slds-form-element__help {\n  font-size: 0.75rem;\n  margin-top: 0.5rem;\n  display: block; }\n\n/* Lightning Design System 0.12.1 */\n.slds-input {\n  background-color: white;\n  color: #16325c;\n  border: 1px solid #d8dde6;\n    border-radius: 0.25rem;\n  width: 100%;\n  transition: border 0.1s linear, background-color 0.1s linear;\n  display: inline-block;\n  padding: 0 1rem 0 0.75rem;\n  line-height: 2.125rem;\n  min-height: calc(2.125rem + 2px);\n  /* For IE */ }\n  .slds-input:focus, .slds-input:active {\n    outline: 0;\n    border-color: #1589ee;\n    background-color: white;\n    box-shadow: 0 0 3px #0070D2; }\n  .slds-input[disabled], .slds-input.slds-is-disabled {\n    background-color: #e0e5ee;\n    border-color: #a8b7c7;\n    cursor: not-allowed;\n    user-select: none; }\n    .slds-input[disabled]:focus, .slds-input[disabled]:active, .slds-input.slds-is-disabled:focus, .slds-input.slds-is-disabled:active {\n      box-shadow: none; }\n\n.slds-input--small {\n  line-height: 1.875rem;\n  min-height: calc(1.875rem + 2px);\n  /* For IE */\n  padding-left: 0.5rem;\n  padding-right: 0.5rem; }\n  .slds-input--small::-webkit-input-placeholder {\n    color: #54698d;\n    font-weight: 400;\n    font-size: 0.875rem; }\n  .slds-input--small:-moz-placeholder {\n    color: #54698d;\n    font-weight: 400;\n    font-size: 0.875rem; }\n  .slds-input--small::-moz-placeholder {\n    color: #54698d;\n    font-weight: 400;\n    font-size: 0.875rem; }\n  .slds-input--small:-ms-input-placeholder {\n    color: #54698d;\n    font-weight: 400;\n    font-size: 0.875rem; }\n\n.slds-input--bare {\n  background-color: transparent;\n  border: none;\n  color: #16325c; }\n  .slds-input--bare:focus, .slds-input--bare:active {\n    outline: 0; }\n\n.slds-input-has-icon {\n  position: relative; }\n  .slds-input-has-icon .slds-input__icon {\n    width: 1rem;\n    height: 1rem;\n    position: absolute;\n    top: 50%;\n    margin-top: -0.5rem;\n    fill: #54698d; }\n  .slds-input-has-icon--left .slds-input__icon {\n    left: 0.75rem; }\n  .slds-input-has-icon--left .slds-input,\n  .slds-input-has-icon--left .slds-input--bare {\n    padding-left: 2rem; }\n  .slds-input-has-icon--right .slds-input__icon {\n    right: 0.75rem; }\n  .slds-input-has-icon--right .slds-input,\n  .slds-input-has-icon--right .slds-input--bare {\n    padding-right: 2rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-textarea {\n  background-color: white;\n  color: #16325c;\n  border: 1px solid #d8dde6;\n    border-radius: 0.25rem;\n  width: 100%;\n  transition: border 0.1s linear, background-color 0.1s linear;\n  resize: vertical;\n  padding: 0.5rem 0.75rem; }\n  .slds-textarea:focus, .slds-textarea:active {\n    outline: 0;\n    border-color: #1589ee;\n    background-color: white;\n    box-shadow: 0 0 3px #0070D2; }\n  .slds-textarea[disabled], .slds-textarea.slds-is-disabled {\n    background-color: #e0e5ee;\n    border-color: #a8b7c7;\n    cursor: not-allowed;\n    user-select: none; }\n    .slds-textarea[disabled]:focus, .slds-textarea[disabled]:active, .slds-textarea.slds-is-disabled:focus, .slds-textarea.slds-is-disabled:active {\n      box-shadow: none; }\n\n/* Lightning Design System 0.12.1 */\n.slds-radio {\n  display: inline-block; }\n  .slds-radio .slds-radio--faux {\n    width: 1rem;\n    height: 1rem;\n    display: inline-block;\n    position: relative;\n    vertical-align: middle;\n    border: 1px solid #d8dde6;\n    border-radius: 50%;\n    background: white;\n    transition: border 0.1s linear, background-color 0.1s linear; }\n  .slds-radio .slds-form-element__label {\n    display: inline;\n    vertical-align: middle;\n    font-size: 0.875rem; }\n  .slds-radio [type=\"radio\"] {\n    width: 1px;\n    height: 1px;\n    border: 0;\n    clip: rect(0 0 0 0);\n    margin: -1px;\n    overflow: hidden;\n    padding: 0;\n    position: absolute; }\n    .slds-radio [type=\"radio\"]:checked > .slds-radio--faux,\n    .slds-radio [type=\"radio\"]:checked ~ .slds-radio--faux {\n      background: white; }\n      .slds-radio [type=\"radio\"]:checked > .slds-radio--faux:after,\n      .slds-radio [type=\"radio\"]:checked ~ .slds-radio--faux:after {\n        width: 0.5rem;\n        height: 0.5rem;\n        content: '';\n        position: absolute;\n        top: 50%;\n        left: 50%;\n        transform: translate3d(-50%, -50%, 0);\n        border-radius: 50%;\n        background: #1589ee; }\n    .slds-radio [type=\"radio\"]:focus > .slds-radio--faux,\n    .slds-radio [type=\"radio\"]:focus ~ .slds-radio--faux {\n      border-color: #1589ee;\n      box-shadow: 0 0 3px #0070D2; }\n    .slds-radio [type=\"radio\"][disabled] {\n      cursor: not-allowed;\n      user-select: none; }\n      .slds-radio [type=\"radio\"][disabled] ~ .slds-radio--faux {\n        background-color: #e0e5ee;\n        border-color: #a8b7c7; }\n\n.slds-has-error .slds-radio [type=\"radio\"] > .slds-radio--faux,\n.slds-has-error .slds-radio [type=\"radio\"] ~ .slds-radio--faux {\n  border-color: #c23934;\n  border-width: 2px; }\n\n.slds-has-error .slds-radio [type=\"radio\"]:checked > .slds-radio--faux,\n.slds-has-error .slds-radio [type=\"radio\"]:checked ~ .slds-radio--faux {\n  background: white; }\n\n.slds-has-error .slds-radio [type=\"radio\"]:checked > .slds-radio--faux:after,\n.slds-has-error .slds-radio [type=\"radio\"]:checked ~ .slds-radio--faux:after {\n  background: #d4504c; }\n\n.slds-is-required > .slds-radio [type=\"radio\"] > .slds-form-element__label:before,\n.slds-is-required > .slds-radio [type=\"radio\"] ~ .slds-form-element__label:before {\n  content: '*';\n  color: #c23934;\n  position: absolute;\n  left: -0.5rem; }\n\n.slds-form-element__control .slds-radio {\n  display: block; }\n\n.slds-form-element .slds-radio [type=\"radio\"] > .slds-radio--faux,\n.slds-form-element .slds-radio [type=\"radio\"] ~ .slds-radio--faux {\n  margin-right: 0.5rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-checkbox {\n  display: inline-block; }\n  .slds-checkbox .slds-checkbox--faux {\n    width: 1rem;\n    height: 1rem;\n    display: inline-block;\n    position: relative;\n    vertical-align: middle;\n    border: 1px solid #d8dde6;\n    border-radius: 0.125rem;\n    background: white;\n    transition: border 0.1s linear, background-color 0.1s linear; }\n  .slds-checkbox .slds-form-element__label {\n    display: inline;\n    vertical-align: middle;\n    font-size: 0.875rem; }\n  .slds-checkbox [type=\"checkbox\"] {\n    width: 1px;\n    height: 1px;\n    border: 0;\n    clip: rect(0 0 0 0);\n    margin: -1px;\n    overflow: hidden;\n    padding: 0;\n    position: absolute; }\n    .slds-checkbox [type=\"checkbox\"]:checked > .slds-checkbox--faux:after,\n    .slds-checkbox [type=\"checkbox\"]:checked ~ .slds-checkbox--faux:after {\n      display: block;\n      content: '';\n      height: 0.25rem;\n      width: 0.5rem;\n      position: absolute;\n      top: 50%;\n      left: 50%;\n      transform: translate3d(-50%, -50%, 0) rotate(-45deg);\n      border-bottom: 2px solid #1589ee;\n      border-left: 2px solid #1589ee; }\n    .slds-checkbox [type=\"checkbox\"]:focus > .slds-checkbox--faux,\n    .slds-checkbox [type=\"checkbox\"]:focus ~ .slds-checkbox--faux {\n      content: '';\n      border-color: #1589ee;\n      box-shadow: 0 0 3px #0070D2; }\n    .slds-checkbox [type=\"checkbox\"]:focus:checked > .slds-checkbox--faux,\n    .slds-checkbox [type=\"checkbox\"]:focus:checked ~ .slds-checkbox--faux {\n      border-color: #1589ee;\n      background-color: white; }\n    .slds-checkbox [type=\"checkbox\"][disabled] > .slds-checkbox--faux,\n    .slds-checkbox [type=\"checkbox\"][disabled] ~ .slds-checkbox--faux {\n      background-color: #e0e5ee;\n      border-color: #a8b7c7; }\n    .slds-checkbox [type=\"checkbox\"][disabled] > .slds-checkbox--faux:after,\n    .slds-checkbox [type=\"checkbox\"][disabled] ~ .slds-checkbox--faux:after {\n      border-color: white; }\n\n.slds-has-error .slds-checkbox [type=\"checkbox\"] > .slds-checkbox--faux,\n.slds-has-error .slds-checkbox [type=\"checkbox\"] ~ .slds-checkbox--faux {\n  border-color: #c23934;\n  border-width: 2px; }\n\n.slds-has-error .slds-checkbox [type=\"checkbox\"]:checked > .slds-checkbox--faux,\n.slds-has-error .slds-checkbox [type=\"checkbox\"]:checked ~ .slds-checkbox--faux {\n  border-color: #c23934;\n  background-color: white; }\n\n.slds-has-error .slds-checkbox [type=\"checkbox\"]:checked > .slds-checkbox--faux:after,\n.slds-has-error .slds-checkbox [type=\"checkbox\"]:checked ~ .slds-checkbox--faux:after {\n  border-color: #d4504c; }\n\n.slds-is-required > .slds-checkbox [type=\"checkbox\"] > .slds-form-element__label:before,\n.slds-is-required > .slds-checkbox [type=\"checkbox\"] ~ .slds-form-element__label:before {\n  content: '*';\n  color: #c23934;\n  position: absolute;\n  left: -0.5rem; }\n\n.slds-form-element .slds-checkbox [type=\"checkbox\"] > .slds-checkbox--faux,\n.slds-form-element .slds-checkbox [type=\"checkbox\"] ~ .slds-checkbox--faux {\n  margin-right: 0.5rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-select {\n  background-color: white;\n  color: #16325c;\n  border: 1px solid #d8dde6;\n    border-radius: 0.25rem;\n  width: 100%;\n  transition: border 0.1s linear, background-color 0.1s linear;\n  height: 2.125rem; }\n  .slds-select:focus, .slds-select:active {\n    outline: 0;\n    border-color: #1589ee;\n    background-color: white;\n    box-shadow: 0 0 3px #0070D2; }\n  .slds-select[disabled], .slds-select.slds-is-disabled {\n    background-color: #e0e5ee;\n    border-color: #a8b7c7;\n    cursor: not-allowed;\n    user-select: none; }\n    .slds-select[disabled]:focus, .slds-select[disabled]:active, .slds-select.slds-is-disabled:focus, .slds-select.slds-is-disabled:active {\n      box-shadow: none; }\n  .slds-select[size] {\n    min-height: 2.125rem;\n    height: inherit; }\n    .slds-select[size] option {\n      padding: 0.5rem; }\n  .slds-select_container {\n    position: relative; }\n    .slds-select_container .slds-select {\n      -moz-appearance: none;\n      -webkit-appearance: none;\n      padding-left: 0.5rem;\n      padding-right: 1.5rem; }\n      .slds-select_container .slds-select::-ms-expand {\n        display: none; }\n    .slds-select_container:before, .slds-select_container:after {\n      position: absolute;\n      content: '';\n      display: block;\n      right: 0.5rem;\n      width: 0;\n      height: 0;\n      border-left: 3px solid transparent;\n      border-right: 3px solid transparent; }\n    .slds-select_container:before {\n      border-bottom: 5px solid #061c3f;\n      top: calc((2.125rem / 2) - 6px); }\n    .slds-select_container:after {\n      border-top: 5px solid #061c3f;\n      bottom: calc((2.125rem / 2) - 6px); }\n\n/* Lightning Design System 0.12.1 */\n.slds-picklist--draggable .slds-button {\n  margin: 0.25rem; }\n  .slds-picklist--draggable .slds-button:first-of-type {\n    margin-top: 1.5rem; }\n\n.slds-picklist__options {\n  border: 1px solid #d8dde6;\n    border-radius: 0.25rem;\n  padding: 0.25rem 0;\n  width: 15rem;\n  height: 15rem;\n  background-color: white; }\n  .slds-picklist__options--multi {\n    overflow: auto; }\n\n.slds-picklist__item {\n  position: relative;\n  line-height: 1.5; }\n  .slds-picklist__item > a,\n  .slds-picklist__item > span {\n    display: block;\n    padding: 0.5rem 0.75rem; }\n    .slds-picklist__item > a:hover,\n    .slds-picklist__item > span:hover {\n      background-color: #f4f6f9;\n      cursor: pointer; }\n    .slds-picklist__item > a:active,\n    .slds-picklist__item > span:active {\n      background-color: #eef1f6; }\n  .slds-picklist__item[aria-selected=\"true\"] {\n    background-color: #eef1f6; }\n\n/* Lightning Design System 0.12.1 */\n@media (min-width: 48em) {\n  .slds-form--horizontal {\n    text-align: right; } }\n\n@media (min-width: 48em) {\n  .slds-form--horizontal .slds-form-element > .slds-form-element__label {\n    display: inline-block;\n    max-width: 33%;\n    vertical-align: top;\n    position: relative;\n    top: 0.3125rem;\n    margin-bottom: 0; }\n    .slds-form--horizontal .slds-form-element > .slds-form-element__label--top {\n      top: 0; } }\n\n.slds-form--horizontal .slds-form-element__control {\n  width: 100%; }\n  @media (max-width: 64em) {\n    .slds-form--horizontal .slds-form-element__control {\n      vertical-align: top; } }\n  @media (min-width: 48em) {\n    .slds-form--horizontal .slds-form-element__control {\n      width: calc(66% - (0.75rem * 2));\n      display: inline-block;\n      text-align: left; } }\n  .slds-form--horizontal .slds-form-element__control .slds-checkbox,\n  .slds-form--horizontal .slds-form-element__control .slds-radio {\n    display: block; }\n\n@media (max-width: 30em) {\n  .slds-form--horizontal .slds-form-element {\n    margin-bottom: 1rem; } }\n\n.slds-form--horizontal .slds-form-element + .slds-form-element {\n  margin-top: 1rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-form--stacked .slds-form-element {\n  display: block; }\n  .slds-form--stacked .slds-form-element + .slds-form-element {\n    margin-top: 0.5rem; }\n  .slds-form--stacked .slds-form-element .slds-checkbox,\n  .slds-form--stacked .slds-form-element .slds-radio {\n    display: block; }\n\n/* Lightning Design System 0.12.1 */\n@media (max-width: 30em) {\n  .slds-form--inline .slds-form-element {\n    margin-bottom: 0.75rem; } }\n\n@media (min-width: 30em) {\n  .slds-form--inline .slds-form-element {\n    margin-right: 1rem; }\n  .slds-form--inline .slds-form-element,\n  .slds-form--inline .slds-form-element__control {\n    display: inline-block;\n    vertical-align: middle; } }\n\n/* Lightning Design System 0.12.1 */\n.slds-form--compound .slds-form-element__row {\n  margin-bottom: 0.5rem; }\n  .slds-form--compound .slds-form-element__row + .slds-form-element__row {\n    clear: both; }\n\n.slds-form--compound .slds-form-element__control {\n  display: inline-block;\n  position: relative; }\n  .slds-form--compound .slds-form-element__control + .slds-form-element__control {\n    padding-left: 0.5rem; }\n\n@media (min-width: 48em) {\n  .slds-form--compound .slds-form-element__label {\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis; } }\n\n@media (min-width: 48em) {\n  .slds-form--compound--horizontal .slds-form-element__label {\n    float: left;\n    text-align: right;\n    position: relative;\n    top: 0.5rem;\n    min-width: 5rem;\n    max-width: 33%; } }\n\n/* Lightning Design System 0.12.1 */\n.slds-form-element__static {\n  display: inline-block;\n  line-height: 2.125rem;\n  min-height: calc(2.125rem + 2px);\n  /* For IE */ }\n\n/* Lightning Design System 0.12.1 */\n.slds-is-required > .slds-form-element__label:before {\n  content: '*';\n  color: #c23934;\n  position: absolute;\n  left: -0.5rem; }\n\n.slds-has-error .slds-input {\n  background-color: white;\n  border-color: #c23934;\n  box-shadow: #c23934 0 0 0 1px inset;\n  background-clip: padding-box; }\n  .slds-has-error .slds-input:focus, .slds-has-error .slds-input:active {\n    box-shadow: #c23934 0 0 0 1px inset, 0 0 3px #0070D2; }\n\n.slds-has-error .slds-textarea {\n  background-color: white;\n  border-color: #c23934;\n  box-shadow: #c23934 0 0 0 1px inset;\n  background-clip: padding-box; }\n  .slds-has-error .slds-textarea:focus, .slds-has-error .slds-textarea:active {\n    box-shadow: #c23934 0 0 0 1px inset, 0 0 3px #0070D2; }\n\n.slds-has-error .slds-select {\n  background-color: white;\n  border-color: #c23934;\n  box-shadow: #c23934 0 0 0 1px inset;\n  background-clip: padding-box; }\n  .slds-has-error .slds-select:focus, .slds-has-error .slds-select:active {\n    box-shadow: #c23934 0 0 0 1px inset, 0 0 3px #0070D2; }\n\n.slds-has-error .slds-form-element__help {\n  color: #c23934; }\n\n.slds-has-error .slds-input__icon {\n  fill: #c23934; }\n\n/* Lightning Design System 0.12.1 */\n.slds-modal--form .slds-modal__container,\n.slds-modal--form .slds-modal__header {\n  border-radius: 0; }\n\n.slds-modal--form .slds-modal__container {\n  margin: 0;\n  padding: 0; }\n\n.slds-modal--form .slds-modal__header .slds-button {\n  display: inline-block;\n  width: auto; }\n  .slds-modal--form .slds-modal__header .slds-button:first-child {\n    float: left; }\n    .slds-modal--form .slds-modal__header .slds-button:first-child + .slds-button {\n      float: right;\n      margin-top: 0; }\n\n/* Lightning Design System 0.12.1 */\n.slds-grid {\n  display: flex;\n  position: relative; }\n  .slds-grid--frame {\n    width: 100vw;\n    height: 100vh;\n    overflow: hidden; }\n  .slds-grid--vertical {\n    flex-direction: column; }\n  .slds-text-longform .slds-grid {\n    padding-left: 0; }\n\n.slds-grid,\n.slds-text-longform .slds-grid {\n  margin-left: 0;\n  list-style: none; }\n\n.slds-col,\n.slds-col--padded {\n  flex: 1 1 auto; }\n  .slds-text-longform .slds-col, .slds-text-longform\n  .slds-col--padded {\n    list-style: none; }\n\n.slds-col--padded {\n  padding-right: 0.75rem;\n  padding-left: 0.75rem; }\n\n.slds-col--padded-medium {\n  padding-right: 1rem;\n  padding-left: 1rem; }\n\n.slds-col--padded-large {\n  padding-right: 1.5rem;\n  padding-left: 1.5rem; }\n\n.slds-grid--pull-padded,\n.slds-col--padded > .slds-grid {\n  margin-right: -0.75rem;\n  margin-left: -0.75rem; }\n\n.slds-grid--pull-padded-medium,\n.slds-col--padded-medium > .slds-grid {\n  margin-right: -1rem;\n  margin-left: -1rem; }\n\n.slds-grid--pull-padded-large,\n.slds-col--padded-large > .slds-grid {\n  margin-right: -1.5rem;\n  margin-left: -1.5rem; }\n\n@media (min-width: 64em) {\n  .slds-col-rule--left {\n    border-left: 1px solid #f4f6f9; }\n  .slds-col-rule--right {\n    border-right: 1px solid #f4f6f9; }\n  .slds-col-rule--top {\n    border-top: 1px solid #f4f6f9; }\n  .slds-col-rule--bottom {\n    border-bottom: 1px solid #f4f6f9; } }\n\n.slds-wrap {\n  flex-wrap: wrap;\n  align-items: flex-start; }\n\n.slds-nowrap {\n  flex: 1 1 auto;\n  flex-wrap: nowrap;\n  align-items: stretch; }\n  @media (min-width: 30em) {\n    .slds-nowrap--small {\n      flex: 1 1 auto;\n      flex-wrap: nowrap;\n      align-items: stretch; } }\n  @media (min-width: 48em) {\n    .slds-nowrap--medium {\n      flex: 1 1 auto;\n      flex-wrap: nowrap;\n      align-items: stretch; } }\n  @media (min-width: 64em) {\n    .slds-nowrap--large {\n      flex: 1 1 auto;\n      flex-wrap: nowrap;\n      align-items: stretch; } }\n\n.slds-has-flexi-truncate {\n  flex: 1 1 0%;\n  min-width: 0; }\n\n.slds-no-flex {\n  flex: none; }\n\n.slds-no-space {\n  min-width: 0; }\n\n.slds-grow {\n  flex-grow: 1; }\n\n.slds-grow-none {\n  flex-grow: 0; }\n\n.slds-shrink {\n  flex-shrink: 1; }\n\n.slds-shrink-none {\n  flex-shrink: 0; }\n\n/* Lightning Design System 0.12.1 */\n.slds-container--small {\n  max-width: 36rem; }\n\n.slds-container--medium {\n  max-width: 60rem; }\n\n.slds-container--large {\n  max-width: 80rem; }\n\n.slds-container--fluid {\n  width: 100%; }\n\n.slds-container--center {\n  margin-left: auto;\n  margin-right: auto; }\n\n.slds-container--left {\n  margin-right: auto; }\n\n.slds-container--right {\n  margin-left: auto; }\n\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n.slds-grid--align-center {\n  justify-content: center; }\n  .slds-grid--align-center .slds-col,\n  .slds-grid--align-center .slds-col--padded {\n    flex-grow: 0; }\n\n/* Lightning Design System 0.12.1 */\n.slds-grid--align-space {\n  justify-content: space-around; }\n  .slds-grid--align-space .slds-col,\n  .slds-grid--align-space .slds-col--padded {\n    flex-grow: 0; }\n\n/* Lightning Design System 0.12.1 */\n.slds-grid--align-spread {\n  justify-content: space-between; }\n  .slds-grid--align-spread .slds-col,\n  .slds-grid--align-spread .slds-col--padded {\n    flex-grow: 0; }\n\n/* Lightning Design System 0.12.1 */\n.slds-align-top {\n  vertical-align: top;\n  align-self: flex-start; }\n\n.slds-align-middle {\n  vertical-align: middle;\n  align-self: center; }\n\n.slds-align-bottom {\n  vertical-align: bottom;\n  align-self: flex-end; }\n\n.slds-align-content-center {\n  flex: 1;\n  align-self: center;\n  justify-content: center; }\n\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n.slds-grid--overflow {\n  flex-flow: row nowrap; }\n  .slds-grid--overflow .slds-col {\n    min-width: 11.25em;\n    max-width: 22.5em; }\n\n/* Lightning Design System 0.12.1 */\n.slds-tooltip {\n  position: relative;\n  border-radius: 0.25rem;\n  max-width: 20rem;\n  min-height: 2rem;\n  z-index: 6000;\n  background-color: #061c3f; }\n  .slds-tooltip__body {\n    padding: 0.5rem 0.75rem;\n    font-size: 0.75rem;\n    color: white; }\n\n/* Lightning Design System 0.12.1 */\n.slds-popover {\n  position: relative;\n  border-radius: 0.25rem;\n  max-width: 20rem;\n  min-height: 2rem;\n  z-index: 6000;\n  background-color: white;\n  box-shadow: 0px 2px 3px 0px rgba(0, 0, 0, 0.16);\n  border: 1px solid #d8dde6; }\n  .slds-popover__body {\n    position: relative;\n    padding: 0.5rem 0.75rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-popover--tooltip {\n  background: #061c3f;\n  border: none; }\n  .slds-popover--tooltip .slds-popover__body {\n    font-size: 0.75rem;\n    color: white; }\n\n.slds-rise-from-ground {\n  visibility: visible;\n  opacity: 1;\n  transform: translate(0%, 0%);\n  transition: opacity 0.1s linear, visibility 0.1s linear, transform 0.1s linear;\n  will-change: transform; }\n\n.slds-fall-into-ground {\n  visibility: hidden;\n  opacity: 0;\n  transform: translate(0%, 0%);\n  transition: opacity 0.1s linear, visibility 0.1s linear, transform 0.1s linear;\n  will-change: transform; }\n\n.slds-slide-from-bottom-to-top {\n  transform: translateY(10%);\n  will-change: transform; }\n\n.slds-slide-from-top-to-bottom {\n  transform: translateY(-10%);\n  will-change: transform; }\n\n.slds-slide-from-right-to-left {\n  transform: translateX(5%);\n  will-change: transform; }\n\n.slds-slide-from-left-to-right {\n  transform: translateX(-5%);\n  will-change: transform; }\n\n/* Lightning Design System 0.12.1 */\n.slds-popover--panel .slds-popover__header {\n  background: #f4f6f9;\n  padding: 1rem;\n  border-radius: 0.25rem 0.25rem 0 0; }\n\n.slds-popover--panel .slds-popover__body {\n  padding: 0; }\n\n.slds-popover--panel .slds-popover__body-list {\n  padding: 1rem;\n  border-top: 1px solid #d8dde6; }\n\n.slds-popover--panel.slds-nubbin--left-top:before, .slds-popover--panel.slds-nubbin--left-top:after, .slds-popover--panel.slds-nubbin--right-top:before, .slds-popover--panel.slds-nubbin--right-top:after, .slds-popover--panel.slds-nubbin--top-left:before, .slds-popover--panel.slds-nubbin--top-left:after, .slds-popover--panel.slds-nubbin--top-right:before, .slds-popover--panel.slds-nubbin--top-right:after {\n  background: #f4f6f9; }\n\n/* Lightning Design System 0.12.1 */\n.slds-nubbin--top:before {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  left: 50%;\n  top: -0.5rem;\n  margin-left: -0.5rem; }\n\n.slds-nubbin--top:after {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  left: 50%;\n  top: -0.5rem;\n  margin-left: -0.5rem; }\n\n.slds-nubbin--top:after {\n  box-shadow: -1px -1px 0 0px rgba(0, 0, 0, 0.16);\n  z-index: -1; }\n\n.slds-nubbin--top-left:before {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  left: 50%;\n  top: -0.5rem;\n  margin-left: -0.5rem; }\n\n.slds-nubbin--top-left:after {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  left: 50%;\n  top: -0.5rem;\n  margin-left: -0.5rem; }\n\n.slds-nubbin--top-left:after {\n  box-shadow: -1px -1px 0 0px rgba(0, 0, 0, 0.16);\n  z-index: -1; }\n\n.slds-nubbin--top-left:before, .slds-nubbin--top-left:after {\n  left: 2rem;\n  top: -0.5rem; }\n\n.slds-nubbin--top-right:before {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  left: 50%;\n  top: -0.5rem;\n  margin-left: -0.5rem; }\n\n.slds-nubbin--top-right:after {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  left: 50%;\n  top: -0.5rem;\n  margin-left: -0.5rem; }\n\n.slds-nubbin--top-right:after {\n  box-shadow: -1px -1px 0 0px rgba(0, 0, 0, 0.16);\n  z-index: -1; }\n\n.slds-nubbin--top-right:before, .slds-nubbin--top-right:after {\n  left: auto;\n  right: 2rem;\n  top: -0.5rem;\n  margin-right: -0.5rem; }\n\n.slds-nubbin--bottom:before {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  left: 50%;\n  bottom: -0.5rem;\n  margin-left: -0.5rem; }\n\n.slds-nubbin--bottom:after {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  left: 50%;\n  bottom: -0.5rem;\n  margin-left: -0.5rem; }\n\n.slds-nubbin--bottom:after {\n  box-shadow: 2px 2px 4px 0px rgba(0, 0, 0, 0.16);\n  z-index: -1; }\n\n.slds-nubbin--bottom-left:before {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  left: 50%;\n  bottom: -0.5rem;\n  margin-left: -0.5rem; }\n\n.slds-nubbin--bottom-left:after {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  left: 50%;\n  bottom: -0.5rem;\n  margin-left: -0.5rem; }\n\n.slds-nubbin--bottom-left:after {\n  box-shadow: 2px 2px 4px 0px rgba(0, 0, 0, 0.16);\n  z-index: -1; }\n\n.slds-nubbin--bottom-left:before, .slds-nubbin--bottom-left:after {\n  left: 2rem;\n  top: 100%;\n  margin-top: -0.5rem; }\n\n.slds-nubbin--bottom-right:before {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  left: 50%;\n  bottom: -0.5rem;\n  margin-left: -0.5rem; }\n\n.slds-nubbin--bottom-right:after {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  left: 50%;\n  bottom: -0.5rem;\n  margin-left: -0.5rem; }\n\n.slds-nubbin--bottom-right:after {\n  box-shadow: 2px 2px 4px 0px rgba(0, 0, 0, 0.16);\n  z-index: -1; }\n\n.slds-nubbin--bottom-right:before, .slds-nubbin--bottom-right:after {\n  left: auto;\n  right: 2rem;\n  top: 100%;\n  margin-top: -0.5rem;\n  margin-right: -0.5rem; }\n\n.slds-nubbin--left:before {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  top: 50%;\n  left: -0.5rem;\n  margin-top: -0.5rem; }\n\n.slds-nubbin--left:after {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  top: 50%;\n  left: -0.5rem;\n  margin-top: -0.5rem; }\n\n.slds-nubbin--left:after {\n  box-shadow: -1px 1px 2px 0px rgba(0, 0, 0, 0.16);\n  z-index: -1; }\n\n.slds-nubbin--left-top:before {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  top: 50%;\n  left: -0.5rem;\n  margin-top: -0.5rem; }\n\n.slds-nubbin--left-top:after {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  top: 50%;\n  left: -0.5rem;\n  margin-top: -0.5rem; }\n\n.slds-nubbin--left-top:after {\n  box-shadow: -1px 1px 2px 0px rgba(0, 0, 0, 0.16);\n  z-index: -1; }\n\n.slds-nubbin--left-top:before, .slds-nubbin--left-top:after {\n  top: 2rem; }\n\n.slds-nubbin--left-bottom:before {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  top: 50%;\n  left: -0.5rem;\n  margin-top: -0.5rem; }\n\n.slds-nubbin--left-bottom:after {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  top: 50%;\n  left: -0.5rem;\n  margin-top: -0.5rem; }\n\n.slds-nubbin--left-bottom:before {\n  margin-bottom: -1px; }\n\n.slds-nubbin--left-bottom:after {\n  box-shadow: -1px 2px 3px 0px rgba(0, 0, 0, 0.16);\n  z-index: -1; }\n\n.slds-nubbin--left-bottom:before, .slds-nubbin--left-bottom:after {\n  top: auto;\n  bottom: 2rem; }\n\n.slds-nubbin--right:before {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  top: 50%;\n  right: -0.5rem;\n  margin-top: -0.5rem; }\n\n.slds-nubbin--right:after {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  top: 50%;\n  right: -0.5rem;\n  margin-top: -0.5rem; }\n\n.slds-nubbin--right:after {\n  box-shadow: 1px -1px 2px 0px rgba(0, 0, 0, 0.16);\n  z-index: -1; }\n\n.slds-nubbin--right-top:before {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  top: 50%;\n  right: -0.5rem;\n  margin-top: -0.5rem; }\n\n.slds-nubbin--right-top:after {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  top: 50%;\n  right: -0.5rem;\n  margin-top: -0.5rem; }\n\n.slds-nubbin--right-top:after {\n  box-shadow: 1px -1px 2px 0px rgba(0, 0, 0, 0.16);\n  z-index: -1; }\n\n.slds-nubbin--right-top:before, .slds-nubbin--right-top:after {\n  top: 2rem; }\n\n.slds-nubbin--right-bottom:before {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  top: 50%;\n  right: -0.5rem;\n  margin-top: -0.5rem; }\n\n.slds-nubbin--right-bottom:after {\n  width: 1rem;\n  height: 1rem;\n  position: absolute;\n  transform: rotate(45deg);\n  content: \"\";\n  background-color: inherit;\n  top: 50%;\n  right: -0.5rem;\n  margin-top: -0.5rem; }\n\n.slds-nubbin--right-bottom:before {\n  margin-bottom: -1px; }\n\n.slds-nubbin--right-bottom:after {\n  box-shadow: 2px -1px 3px 0px rgba(0, 0, 0, 0.16);\n  z-index: -1; }\n\n.slds-nubbin--right-bottom:before, .slds-nubbin--right-bottom:after {\n  top: auto;\n  bottom: 2rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-dropdown {\n  position: absolute;\n  z-index: 7000;\n  left: 50%;\n  float: left;\n  min-width: 6rem;\n  max-width: 20rem;\n  margin-top: 0.125rem;\n  border: 1px solid #d8dde6;\n  border-radius: 0.25rem;\n  padding: 0.25rem 0;\n  background: white;\n  box-shadow: 0px 2px 3px 0px rgba(0, 0, 0, 0.16);\n  transform: translateX(-50%); }\n  .slds-dropdown--left {\n    left: 0;\n    transform: translateX(0); }\n  .slds-dropdown--right {\n    left: auto;\n    right: 0;\n    transform: translateX(0); }\n  .slds-dropdown--bottom {\n    bottom: 100%; }\n  .slds-dropdown--small {\n    min-width: 15rem; }\n  .slds-dropdown--medium {\n    min-width: 20rem; }\n  .slds-dropdown--large {\n    min-width: 25rem;\n    max-width: 512px; }\n  .slds-dropdown mark {\n    font-weight: 700;\n    background-color: transparent; }\n  .slds-dropdown[class*=\"slds-nubbin--top\"] {\n    margin-top: 0.5rem; }\n  .slds-dropdown[class*=\"slds-nubbin--bottom\"] {\n    margin-bottom: 0.5rem; }\n  .slds-dropdown--nubbin-top {\n    margin-top: 0.5rem; }\n    .slds-dropdown--nubbin-top:before {\n      width: 1rem;\n      height: 1rem;\n      position: absolute;\n      transform: rotate(45deg);\n      content: \"\";\n      background-color: white;\n      left: 50%;\n      top: -0.5rem;\n      margin-left: -0.5rem; }\n    .slds-dropdown--nubbin-top:after {\n      width: 1rem;\n      height: 1rem;\n      position: absolute;\n      transform: rotate(45deg);\n      content: \"\";\n      background-color: white;\n      left: 50%;\n      top: -0.5rem;\n      margin-left: -0.5rem; }\n    .slds-dropdown--nubbin-top:before {\n      background: white; }\n    .slds-dropdown--nubbin-top:after {\n      background: white;\n      box-shadow: -1px -1px 0 0px rgba(0, 0, 0, 0.16);\n      z-index: -1; }\n    .slds-dropdown--nubbin-top.slds-dropdown--left {\n      left: -1rem; }\n      .slds-dropdown--nubbin-top.slds-dropdown--left:before, .slds-dropdown--nubbin-top.slds-dropdown--left:after {\n        left: 1.5rem;\n        margin-left: 0; }\n    .slds-dropdown--nubbin-top.slds-dropdown--right {\n      right: -1rem; }\n      .slds-dropdown--nubbin-top.slds-dropdown--right:before, .slds-dropdown--nubbin-top.slds-dropdown--right:after {\n        left: auto;\n        right: 1.5rem;\n        margin-left: 0; }\n  .slds-dropdown__header {\n    padding: 0.5rem 0.75rem; }\n  .slds-dropdown__item {\n    line-height: 1.5; }\n    .slds-dropdown__item > a {\n      position: relative;\n      display: flex;\n      justify-content: space-between;\n      padding: 0.5rem 0.75rem;\n      color: #16325c;\n      white-space: nowrap;\n      cursor: pointer; }\n      .slds-dropdown__item > a:hover, .slds-dropdown__item > a:focus {\n        outline: 0;\n        text-decoration: none;\n        background-color: #f4f6f9; }\n      .slds-dropdown__item > a:active {\n        text-decoration: none;\n        background-color: #eef1f6; }\n      .slds-dropdown__item > a[aria-disabled=\"true\"] {\n        color: #d8dde6;\n        cursor: default; }\n        .slds-dropdown__item > a[aria-disabled=\"true\"]:hover {\n          background-color: transparent; }\n    .slds-dropdown__item .slds-icon--selected {\n      opacity: 0;\n      transition: opacity 0.05s ease; }\n    .slds-dropdown__item.slds-is-selected .slds-icon--selected {\n      fill: #0070d2;\n      opacity: 1; }\n  .slds-dropdown .slds-has-icon {\n    position: relative; }\n    .slds-dropdown .slds-has-icon--left > a,\n    .slds-dropdown .slds-has-icon--left > span {\n      padding-left: 2rem; }\n    .slds-dropdown .slds-has-icon--right > a,\n    .slds-dropdown .slds-has-icon--right > span {\n      padding-right: 2rem; }\n    .slds-dropdown .slds-has-icon--left-right > a,\n    .slds-dropdown .slds-has-icon--left-right > span {\n      padding-left: 2rem;\n      padding-right: 2rem; }\n    .slds-dropdown .slds-has-icon .slds-icon {\n      width: 1rem;\n      height: 1rem;\n      position: absolute;\n      top: 50%;\n      margin-top: -0.5rem;\n      fill: #54698d; }\n      .slds-dropdown .slds-has-icon .slds-icon--left {\n        left: 0.75rem; }\n      .slds-dropdown .slds-has-icon .slds-icon--right {\n        right: 0.75rem; }\n\n.slds-dropdown-trigger {\n  position: relative;\n  display: inline-block; }\n  .slds-dropdown-trigger .slds-dropdown {\n    visibility: hidden;\n    opacity: 0;\n    transition: opacity 0.1s linear, visibility 0.1s linear; }\n  .slds-dropdown-trigger:hover, .slds-dropdown-trigger:focus {\n    outline: 0; }\n    .slds-dropdown-trigger:hover .slds-dropdown, .slds-dropdown-trigger:focus .slds-dropdown {\n      visibility: visible;\n      opacity: 1;\n      transition: opacity 0.1s linear, visibility 0.1s linear; }\n  .slds-dropdown-trigger--click .slds-dropdown {\n    display: none; }\n  .slds-dropdown-trigger--click.slds-is-open .slds-dropdown {\n    display: block;\n    visibility: visible;\n    opacity: 1; }\n  .slds-dropdown-trigger > [class*=\"slds-button--icon\"] ~ .slds-dropdown--left[class*=\"slds-nubbin\"] {\n    left: -1rem; }\n  .slds-dropdown-trigger > [class*=\"slds-button--icon\"] ~ .slds-dropdown--right[class*=\"slds-nubbin\"] {\n    right: -1rem; }\n\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n.slds-picklist {\n  position: relative; }\n  .slds-picklist .slds-dropdown {\n    width: 15rem;\n    max-height: calc((((0.875rem * 1.5) + 1rem) * 5) + 0.5rem + 2px);\n    overflow-y: auto;\n    -webkit-overflow-scrolling: touch; }\n  .slds-picklist--fluid .slds-picklist__label,\n  .slds-picklist--fluid .slds-dropdown {\n    width: auto;\n    min-width: 0;\n    max-width: 15rem; }\n\n.slds-picklist__label {\n  padding-right: 2rem;\n  width: 15rem;\n  color: #16325c;\n  text-align: left; }\n  .slds-picklist__label .slds-icon {\n    width: 0.75rem;\n    height: 0.75rem;\n    position: absolute;\n    right: 1rem;\n    top: 50%;\n    margin-top: -0.375rem;\n    fill: #54698d; }\n  .slds-picklist__label[aria-disabled=\"true\"] {\n    border-color: #a8b7c7;\n    background-color: #e0e5ee;\n    cursor: not-allowed;\n    user-select: none; }\n  .slds-picklist__label .slds-truncate {\n    display: block; }\n\n/* Lightning Design System 0.12.1 */\n.slds-dropdown--actions a {\n  color: #0070d2; }\n\n/* Lightning Design System 0.12.1 */\n.slds-action-overflow--touch {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 9001; }\n  .slds-action-overflow--touch__container {\n    position: relative;\n    display: flex;\n    flex-direction: column;\n    justify-content: flex-end;\n    height: 100%; }\n  .slds-action-overflow--touch__content {\n    padding-top: 33.33333333333333%;\n    overflow: hidden;\n      overflow-y: auto; }\n  .slds-action-overflow--touch__body {\n    position: relative;\n    top: 2rem;\n    background: white;\n    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.07); }\n  .slds-action-overflow--touch__footer {\n    position: relative;\n    flex-shrink: 0;\n    border-top: 1px solid #d8dde6;\n    padding: 0.75rem 1rem;\n    background-color: #f4f6f9;\n    box-shadow: 0 -2px 4px #F4F6F9; }\n\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n.slds-datepicker {\n  padding: 0;\n  font-size: 0.75rem; }\n  .slds-datepicker th,\n  .slds-datepicker td {\n    text-align: center; }\n  .slds-datepicker th {\n    padding: 0.5rem;\n    font-weight: 400;\n    color: #54698d; }\n  .slds-datepicker td {\n    padding: 0.25rem;\n    text-align: center;\n    font-size: 0.75rem; }\n    .slds-datepicker td > .slds-day {\n      width: 2rem;\n      height: 2rem;\n      display: block;\n      position: relative;\n      min-width: 2rem;\n      line-height: 2rem;\n      border-radius: 50%; }\n    .slds-datepicker td:hover:not(.slds-disabled-text) > .slds-day,\n    .slds-datepicker td:focus:not(.slds-disabled-text) > .slds-day,\n    .slds-datepicker td.slds-is-today > .slds-day {\n      background: #f4f6f9;\n      cursor: pointer; }\n    .slds-datepicker td.slds-is-selected:not(.slds-disabled-text) > .slds-day {\n      background: #005fb2;\n      color: white; }\n    .slds-datepicker td.slds-is-selected-multi > .slds-day {\n      overflow: visible; }\n    .slds-datepicker td.slds-is-selected-multi + .slds-is-selected-multi > .slds-day:before {\n      content: '';\n      position: absolute;\n      background: #005fb2;\n      top: 0;\n      left: -50%;\n      height: 100%;\n      width: 2.5rem;\n      transform: translateX(-0.5rem);\n      z-index: -1; }\n  .slds-datepicker .slds-has-multi-row-selection .slds-is-selected-multi:first-child > .slds-day:before,\n  .slds-datepicker .slds-has-multi-row-selection .slds-is-selected-multi:last-child > .slds-day:after {\n    content: '';\n    position: absolute;\n    background: #005fb2;\n    top: 0;\n    left: -50%;\n    height: 100%;\n    width: 2.5rem;\n    transform: translateX(-0.5rem);\n    z-index: -1; }\n  .slds-datepicker .slds-has-multi-row-selection .slds-is-selected-multi:first-child > .slds-day:before {\n    left: 0;\n    transform: translateX(-0.25rem); }\n  .slds-datepicker .slds-has-multi-row-selection .slds-is-selected-multi:last-child > .slds-day:after {\n    left: auto;\n    right: 0;\n    transform: translateX(0.25rem); }\n  .slds-datepicker__filter {\n    padding: 0.25rem; }\n  .slds-datepicker__filter--month {\n    padding: 0 0.25rem 0 0; }\n\n.slds-disabled-text {\n  color: #d8dde6; }\n\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n.slds-datepicker--time {\n  max-width: 12rem;\n  max-height: 13.5rem;\n  overflow: hidden;\n    overflow-y: auto; }\n  .slds-datepicker--time__list > li {\n    white-space: nowrap;\n    padding: 0.5rem;\n      padding-left: 2rem;\n      padding-right: 2rem; }\n    .slds-datepicker--time__list > li:hover, .slds-datepicker--time__list > li:focus {\n      background: #f4f6f9;\n      text-decoration: none;\n      cursor: pointer; }\n\n/* Lightning Design System 0.12.1 */\n.slds-publisher.slds-is-active .slds-publisher__toggle-visibility {\n  display: inherit; }\n\n.slds-publisher.slds-is-active .slds-publisher__input {\n  line-height: 1.5;\n  height: auto;\n  max-height: 10rem;\n  resize: vertical;\n  padding-top: 0.75rem;\n  padding-bottom: 0.75rem; }\n\n.slds-publisher__input {\n  line-height: 2.125rem;\n  padding: 0 1rem;\n  resize: none;\n  min-height: calc(2.125rem + 2px);\n  max-height: calc(2.125rem + 2px);\n  width: 100%;\n  transition: min-height 0.4s ease, max-height 0.4s ease; }\n\n.slds-publisher__actions > .slds-button {\n  margin-left: 0.75rem; }\n\n.slds-publisher .slds-publisher__toggle-visibility {\n  display: none; }\n\n.slds-publisher--discussion {\n  display: flex; }\n  .slds-publisher--discussion.slds-is-active {\n    display: block; }\n\n/* Lightning Design System 0.12.1 */\n.slds-publisher--comment {\n  background-color: white;\n  color: #16325c;\n  border: 1px solid #d8dde6;\n    border-radius: 0.25rem;\n  width: 100%;\n  position: relative;\n  min-height: calc(2.125rem + 2px);\n  max-height: calc(2.125rem + 2px);\n  transition: min-height 0.4s ease, max-height 0.4s ease; }\n  .slds-publisher--comment.slds-is-active {\n    min-height: 6rem;\n    max-height: 15rem; }\n    .slds-publisher--comment.slds-is-active .slds-publisher__actions {\n      opacity: 1; }\n  .slds-publisher--comment.slds-has-focus {\n    outline: 0;\n    border-color: #1589ee;\n    background-color: white;\n    box-shadow: 0 0 3px #0070D2; }\n  .slds-publisher--comment .slds-publisher__actions {\n    opacity: 0;\n    padding: 0 0.75rem 0.75rem; }\n  .slds-publisher--comment .slds-attachments {\n    padding: 0.5rem 0.75rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-feed {\n  position: relative; }\n  .slds-feed__list {\n    margin: 0;\n    padding: 0; }\n  .slds-feed__item {\n    padding: 1rem 0; }\n    .slds-feed__item + .slds-feed__item {\n      border-top: 1px solid #d8dde6; }\n\n/* Lightning Design System 0.12.1 */\n.slds-comment__content {\n  padding-top: 0.5rem;\n  padding-bottom: 0.5rem; }\n\n.slds-comment .slds-text-body--small a {\n  color: inherit; }\n\n.slds-comment__content {\n  padding-top: 0.5rem;\n  padding-bottom: 0.5rem; }\n\n.slds-tags {\n  display: flex; }\n  .slds-tags__list {\n    display: flex; }\n  .slds-tags__item {\n    margin-left: 0.25rem; }\n    .slds-tags__item:after {\n      content: ', '; }\n    .slds-tags__item:last-child:after {\n      content: none; }\n\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n.slds-comment__replies {\n  padding-top: 1rem;\n  margin-left: 3.75rem; }\n  .slds-comment__replies > :last-child,\n  .slds-comment__replies > :last-child .slds-comment {\n    padding-bottom: 0; }\n    .slds-comment__replies > :last-child:before,\n    .slds-comment__replies > :last-child .slds-comment:before {\n      content: none; }\n  .slds-comment__replies .slds-comment {\n    position: relative;\n    margin-bottom: 0;\n    padding-bottom: 1rem; }\n    .slds-comment__replies .slds-comment:before {\n      content: '';\n      background: #d8dde6;\n      height: 100%;\n      width: 1px;\n      position: absolute;\n      left: 1.125rem;\n      top: 0;\n      bottom: 0;\n      margin-left: -0.5px;\n      z-index: -1; }\n  .slds-comment__replies .slds-avatar {\n    border: 2px solid white; }\n\n/* Lightning Design System 0.12.1 */\n.slds-comment__overflow {\n  margin-bottom: 1rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-attachments {\n  padding: 0.5rem 0; }\n  .slds-attachments:empty {\n    padding: 0; }\n  .slds-attachments__item + .slds-attachments__item {\n    margin-top: 1rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-modal {\n  opacity: 0;\n  visibility: hidden;\n  transition: transform 0.1s linear, opacity 0.1s linear;\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 9001; }\n  .slds-modal__container {\n    position: relative;\n    transform: translate(0, 0);\n    transition: transform 0.1s linear, opacity 0.1s linear;\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n    margin: 0 2rem;\n    height: 100%;\n    padding: 3rem 0;\n    border-radius: 0.25rem; }\n    @media (min-width: 48em) {\n      .slds-modal__container {\n        margin: 0 auto;\n        width: 50%;\n        max-width: 40rem;\n        min-width: 20rem; } }\n  .slds-modal__header, .slds-modal__content {\n    background: white; }\n  .slds-modal__header, .slds-modal__footer {\n    flex-shrink: 0; }\n  .slds-modal__header {\n    position: relative;\n    border-top-right-radius: 0.25rem;\n    border-top-left-radius: 0.25rem;\n    border-bottom: 2px solid #d8dde6;\n    padding: 1.5rem 1rem;\n    text-align: center; }\n    .slds-modal__header + .slds-modal__menu {\n      border-top-left-radius: 0;\n      border-top-right-radius: 0; }\n  .slds-modal__content {\n    padding: 1rem;\n    overflow: hidden;\n      overflow-y: auto; }\n  .slds-modal__menu {\n    position: relative;\n    border-radius: 0.25rem;\n    padding: 1rem;\n    background-color: #f4f6f9; }\n  .slds-modal__footer {\n    border-top: 2px solid #d8dde6;\n    border-bottom-right-radius: 0.25rem;\n    border-bottom-left-radius: 0.25rem;\n    padding: 0.75rem 1rem;\n    background-color: #f4f6f9;\n    text-align: right;\n    box-shadow: 0px 2px 3px 0px rgba(0, 0, 0, 0.16); }\n  .slds-modal__close {\n    width: 3rem;\n    height: 3rem;\n    position: absolute;\n    top: -3rem;\n    right: -0.5rem; }\n\n.slds-modal-backdrop {\n  transition-duration: 0.4s;\n  width: 100%;\n  height: 100%;\n  opacity: 0;\n  visibility: hidden;\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  background: rgba(126, 140, 153, 0.8);\n  z-index: 9000; }\n  .slds-modal-backdrop--open {\n    visibility: visible;\n    opacity: 1;\n    transition: opacity 0.4s linear; }\n\n.slds-backdrop {\n  transition-duration: 0.4s;\n  width: 100%;\n  height: 100%;\n  opacity: 0;\n  visibility: hidden;\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  background: rgba(126, 140, 153, 0.8);\n  z-index: 9000; }\n  .slds-backdrop--open {\n    visibility: visible;\n    opacity: 1;\n    transition: opacity 0.4s linear; }\n\n.slds-fade-in-open {\n  opacity: 1;\n  visibility: visible;\n  transition: opacity 0.1s linear; }\n  .slds-fade-in-open .slds-modal__container-reset {\n    opacity: 1;\n    visibility: visible;\n    transform: translate(0, 0); }\n\n.slds-slide-up-open {\n  opacity: 1;\n  visibility: visible;\n  transform: translate(0, 0);\n  transition: opacity 0.1s linear, transform 0.2s linear; }\n  .slds-slide-up-open .slds-modal__container-reset {\n    opacity: 0;\n    visibility: hidden;\n    transform: translate(0, 1rem);\n    transition: opacity 0.2s linear, transform 0.2s linear; }\n\n.slds-slide-up-saving {\n  opacity: 1;\n  visibility: visible;\n  transform: translate(0, -1rem); }\n\n.slds-slide-down-cancel {\n  opacity: 1;\n  visibility: visible;\n  transform: translate(0, 1rem); }\n\n/* Lightning Design System 0.12.1 */\n@media (min-width: 48em) {\n  .slds-modal--large .slds-modal__container {\n    width: 90%;\n    max-width: none;\n    min-width: 40rem; } }\n\n/* Lightning Design System 0.12.1 */\n.slds-modal__footer--directional .slds-button:first-child {\n  float: left; }\n\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n.slds-pill {\n  background-color: white;\n  display: inline-block;\n  padding: 0.25rem;\n  border: 1px solid #d8dde6;\n  border-radius: 0.25rem;\n  vertical-align: middle;\n  line-height: 1.5; }\n  .slds-pill + .slds-pill {\n    margin-left: 0.25rem; }\n  .slds-pill:hover {\n    background-color: #f4f6f9; }\n  .slds-pill:focus {\n    outline: 0;\n    box-shadow: 0 0 3px #0070D2; }\n  .slds-pill--bare {\n    background-color: transparent;\n    border: none; }\n    .slds-pill--bare:hover {\n      background-color: transparent; }\n  .slds-pill-container {\n    padding: 1px;\n    border: 1px solid #d8dde6;\n    border-radius: 0.25rem;\n    min-height: calc(2.125rem + 2px); }\n  .slds-pill__container {\n    padding: 1px;\n    border: 1px solid #d8dde6;\n    border-radius: 0.25rem;\n    min-height: calc(2.125rem + 2px); }\n  .slds-pill__label {\n    max-width: 13.5rem;\n    display: inline-block;\n    vertical-align: middle;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis; }\n  .slds-pill__icon {\n    width: 1.25rem;\n    height: 1.25rem;\n    margin-right: 0.5rem;\n    border-radius: 0.125rem; }\n  .slds-pill__remove {\n    margin-left: 0.5rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-pill .slds-avatar {\n  margin-right: 0.5rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-spinner--small {\n  width: 32px;\n  height: 32px; }\n\n/* Lightning Design System 0.12.1 */\n.slds-spinner--medium {\n  width: 56px;\n  height: 56px; }\n\n/* Lightning Design System 0.12.1 */\n.slds-spinner--large {\n  width: 68px;\n  height: 68px; }\n\n/* Lightning Design System 0.12.1 */\n.slds-tile + .slds-tile {\n  margin-top: 0.5rem; }\n\n.slds-tile__title, .slds-tile__detail {\n  position: relative; }\n\n.slds-tile__meta {\n  color: #16325c; }\n\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n.slds-tile--board {\n  position: relative; }\n  .slds-tile--board__icon {\n    width: 1rem;\n    height: 1rem;\n    position: absolute;\n    bottom: 0.25rem;\n    right: 0.25rem; }\n  .slds-tile--board .slds-has-alert {\n    padding-right: 1.5rem; }\n\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n.slds-tile__meta {\n  color: #16325c; }\n\n/* Lightning Design System 0.12.1 */\n.slds-tree-container {\n  min-width: 7.5rem;\n  max-width: 25rem; }\n  .slds-tree-container > .slds-text-heading--label {\n    margin-bottom: 0.5rem; }\n\n.slds-tree__item {\n  display: flex;\n  line-height: 2.125rem;\n  padding-left: 1rem; }\n  .slds-tree__item a {\n    color: #16325c; }\n  .slds-tree__item a:hover,\n  .slds-tree__item a:focus {\n    outline: 0;\n    text-decoration: none; }\n  .slds-tree__item:hover, .slds-tree__item:focus {\n    background: #f4f6f9;\n    cursor: pointer; }\n\n.slds-tree__group > .slds-tree__item > a {\n  display: inline-block;\n  padding-left: 1.5rem; }\n\n.slds-nested .slds-tree__branch > .slds-tree__item {\n  padding-left: 2.5rem; }\n\n.slds-nested .slds-nested .slds-tree__item > a {\n  padding-left: 4rem; }\n\n.slds-tree .slds-is-selected {\n  background: #f0f8fc;\n  box-shadow: #0070d2 4px 0 0 inset; }\n\n.slds-tree .slds-is-hovered,\n.slds-tree .slds-is-focused {\n  background: #f4f6f9;\n  cursor: pointer; }\n\n.slds-tree .slds-is-open .slds-button__icon {\n  transform: rotate(90deg); }\n\n.slds-tree .slds-button {\n  align-self: center; }\n\n.slds-tree .slds-pill {\n  margin-left: 0.75rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-tabs--default {\n  display: block;\n  width: 100%; }\n  .slds-tabs--default__nav {\n    display: flex;\n    align-items: flex-start;\n    border-bottom: 1px solid #d8dde6; }\n  .slds-tabs--default .slds-tabs__item {\n    overflow: hidden; }\n    @media (min-width: 48em) {\n      .slds-tabs--default .slds-tabs__item + .slds-tabs__item {\n        margin-left: 1.5rem; } }\n    .slds-tabs--default .slds-tabs__item > a {\n      max-width: 100%;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n      display: block;\n      text-decoration: none;\n      cursor: pointer;\n      height: 3rem;\n      line-height: 3rem;\n      border-bottom: 2px solid transparent;\n      padding: 0 0.5rem;\n      color: #54698d; }\n      .slds-tabs--default .slds-tabs__item > a:focus {\n        outline: 0; }\n      @media (min-width: 48em) {\n        .slds-tabs--default .slds-tabs__item > a {\n          padding: 0 1rem; } }\n      .slds-tabs--default .slds-tabs__item > a:hover, .slds-tabs--default .slds-tabs__item > a:focus {\n        text-decoration: none;\n        border-color: #0070d2;\n        color: #16325c; }\n      .slds-tabs--default .slds-tabs__item > a:focus {\n        color: #0070d2;\n        box-shadow: #0070d2 0 -1px 0 inset; }\n    .slds-tabs--default .slds-tabs__item.slds-active a {\n      border-color: #0070d2;\n      color: #16325c; }\n      .slds-tabs--default .slds-tabs__item.slds-active a:focus {\n        color: #0070d2; }\n  .slds-tabs--default > .slds-tabs__content {\n    position: relative;\n    padding: 1rem 0; }\n\n.slds-tabs--default__item {\n  overflow: hidden; }\n  @media (min-width: 48em) {\n    .slds-tabs--default__item + .slds-tabs--default__item {\n      margin-left: 1.5rem; } }\n\n.slds-tabs--default__content {\n  position: relative;\n  padding: 1rem 0; }\n\n.slds-tabs--default__link {\n  max-width: 100%;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  display: block;\n  text-decoration: none;\n  cursor: pointer;\n  height: 3rem;\n  line-height: 3rem;\n  border-bottom: 2px solid transparent;\n  padding: 0 0.5rem;\n  color: #54698d; }\n  .slds-tabs--default__link:focus {\n    outline: 0; }\n  @media (min-width: 48em) {\n    .slds-tabs--default__link {\n      padding: 0 1rem; } }\n  .slds-tabs--default__link:hover, .slds-tabs--default__link:focus {\n    text-decoration: none;\n    border-color: #0070d2;\n    color: #16325c; }\n  .slds-tabs--default__link:focus {\n    color: #0070d2;\n    box-shadow: #0070d2 0 -1px 0 inset; }\n\n.slds-active .slds-tabs--default__link {\n  border-color: #0070d2;\n  color: #16325c; }\n  .slds-active .slds-tabs--default__link:focus {\n    color: #0070d2; }\n\n/* Lightning Design System 0.12.1 */\n.slds-tabs--default .slds-tabs__item--overflow {\n  overflow: visible; }\n\n.slds-dropdown--overflow {\n  max-height: calc((2rem + (0.25rem * 2)) * 10);\n  overflow: auto; }\n\n/* Lightning Design System 0.12.1 */\n.slds-tabs--scoped {\n  display: block;\n  width: 100%; }\n  .slds-tabs--scoped__nav {\n    display: flex;\n    align-items: flex-start;\n    background-color: #f4f6f9;\n    border: 1px solid #d8dde6;\n    border-radius: 0.25rem 0.25rem 0 0; }\n  .slds-tabs--scoped .slds-tabs__item {\n    overflow: hidden;\n    position: relative;\n    margin-bottom: -1px; }\n    .slds-tabs--scoped .slds-tabs__item + .slds-tabs__item {\n      margin-left: -1px; }\n    .slds-tabs--scoped .slds-tabs__item:first-child > a {\n      border-left: none;\n      border-radius: 0.25rem 0 0 0; }\n    .slds-tabs--scoped .slds-tabs__item > a {\n      max-width: 100%;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n      display: block;\n      text-decoration: none;\n      cursor: pointer;\n      height: 3rem;\n      line-height: 3rem;\n      padding: 0 1.5rem;\n      color: #54698d;\n      background-clip: padding-box;\n      border-left: 1px solid transparent;\n      border-right: 1px solid transparent; }\n      .slds-tabs--scoped .slds-tabs__item > a:focus {\n        outline: 0; }\n      .slds-tabs--scoped .slds-tabs__item > a:hover, .slds-tabs--scoped .slds-tabs__item > a:focus {\n        text-decoration: none;\n        color: #005fb2;\n        border-color: #d8dde6; }\n    .slds-tabs--scoped .slds-tabs__item .slds-active > a {\n      background-color: white;\n      color: #0070d2;\n      border-color: #d8dde6; }\n      .slds-tabs--scoped .slds-tabs__item .slds-active > a:focus {\n        text-decoration: underline; }\n  .slds-tabs--scoped > .slds-tabs__content {\n    background-color: white;\n    border: 1px solid #d8dde6;\n    border-top: none;\n    border-radius: 0 0 0.25rem 0.25rem;\n    padding: 1rem; }\n\n.slds-tabs--scoped__item {\n  overflow: hidden;\n  position: relative;\n  margin-bottom: -1px; }\n  .slds-tabs--scoped__item + .slds-tabs--scoped__item {\n    margin-left: -1px; }\n  .slds-tabs--scoped__item:first-child .slds-tabs--scoped__link {\n    border-left: none;\n    border-radius: 0.25rem 0 0 0; }\n\n.slds-tabs--scoped__content {\n  background-color: white;\n  border: 1px solid #d8dde6;\n  border-top: none;\n  border-radius: 0 0 0.25rem 0.25rem;\n  padding: 1rem; }\n\n.slds-tabs--scoped__link {\n  max-width: 100%;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  display: block;\n  text-decoration: none;\n  cursor: pointer;\n  height: 3rem;\n  line-height: 3rem;\n  padding: 0 1.5rem;\n  color: #54698d;\n  background-clip: padding-box;\n  border-left: 1px solid transparent;\n  border-right: 1px solid transparent; }\n  .slds-tabs--scoped__link:focus {\n    outline: 0; }\n  .slds-tabs--scoped__link:hover, .slds-tabs--scoped__link:focus {\n    text-decoration: none;\n    color: #005fb2;\n    border-color: #d8dde6; }\n\n.slds-active .slds-tabs--scoped__link {\n  background-color: white;\n  color: #0070d2;\n  border-color: #d8dde6; }\n  .slds-active .slds-tabs--scoped__link:focus {\n    text-decoration: underline; }\n\n/* Lightning Design System 0.12.1 */\n.slds-tabs--path {\n  display: block;\n  width: 100%; }\n  .slds-tabs--path__nav {\n    display: flex;\n    align-items: flex-start; }\n  .slds-tabs--path .slds-is-complete {\n    background-color: #4bca81; }\n    .slds-tabs--path .slds-is-complete .slds-tabs--path__stage {\n      transform: rotateX(0deg); }\n    .slds-tabs--path .slds-is-complete .slds-tabs--path__title {\n      transform: rotateX(180deg); }\n    .slds-tabs--path .slds-is-complete:hover {\n      background-color: #04844b; }\n      .slds-tabs--path .slds-is-complete:hover .slds-tabs--path__stage {\n        transform: rotateX(-180deg); }\n      .slds-tabs--path .slds-is-complete:hover .slds-tabs--path__title {\n        transform: rotateX(0deg); }\n  .slds-tabs--path .slds-is-current {\n    background-color: #0076DE; }\n    .slds-tabs--path .slds-is-current:hover {\n      background-color: #005fb2; }\n    .slds-tabs--path .slds-is-current + .slds-is-incomplete:before {\n      background-color: #0076DE; }\n    .slds-tabs--path .slds-is-current:hover + .slds-is-incomplete:before {\n      background-color: #005fb2; }\n  .slds-tabs--path .slds-is-incomplete {\n    background-color: #e0e5ee; }\n    .slds-tabs--path .slds-is-incomplete .slds-tabs--path__link {\n      color: #16325c; }\n  .slds-tabs--path .slds-is-current .slds-tabs--path__link,\n  .slds-tabs--path .slds-is-complete .slds-tabs--path__link {\n    color: white; }\n  .slds-tabs--path .slds-is-active {\n    background-color: #061c3f; }\n    .slds-tabs--path .slds-is-active .slds-tabs--path__link {\n      color: white; }\n    .slds-tabs--path .slds-is-active .slds-tabs--path__stage {\n      transform: rotateX(-180deg); }\n    .slds-tabs--path .slds-is-active .slds-tabs--path__title {\n      transform: rotateX(0deg); }\n    .slds-tabs--path .slds-is-active:hover {\n      background-color: #16325c; }\n      .slds-tabs--path .slds-is-active:hover + .slds-tabs--path__item:before {\n        background-color: #16325c; }\n    .slds-tabs--path .slds-is-active + .slds-tabs--path__item:before {\n      background-color: #061c3f; }\n    .slds-tabs--path .slds-is-active ~ .slds-is-current {\n      background-color: white; }\n      .slds-tabs--path .slds-is-active ~ .slds-is-current .slds-tabs--path__link {\n        color: #16325c; }\n      .slds-tabs--path .slds-is-active ~ .slds-is-current + .slds-tabs--path__item:before {\n        background-color: white; }\n\n.slds-tabs--path__item {\n  overflow: hidden;\n  position: relative;\n  flex: 1 1 auto;\n  min-width: 5rem;\n  max-height: 2rem;\n  text-align: center;\n  perspective: 500;\n  transition: transform 0.1s ease-in-out, background-color 0.1s linear; }\n  .slds-tabs--path__item:first-child {\n    border-radius: 15rem 0 0 15rem; }\n  .slds-tabs--path__item:last-child {\n    border-radius: 0 15rem 15rem 0;\n    border-right: none; }\n  .slds-tabs--path__item:hover {\n    background-color: #d8dde6; }\n  .slds-tabs--path__item:before {\n    content: \"\";\n    display: block;\n    position: absolute;\n    left: calc(((2rem - 2px) / 2 ) * -1);\n    top: 2px;\n    width: calc(2rem - (2px * 2));\n    height: calc(2rem - (2px * 2));\n    border: 2px solid white;\n    border-left: none;\n    border-bottom: none;\n    background-clip: padding-box;\n    transform: rotate(45deg);\n    transition: transform 0.1s ease-in-out, background-color 0.1s linear; }\n  .slds-tabs--path__item:first-child:before {\n    display: none; }\n  .slds-tabs--path__item + .slds-is-complete:before,\n  .slds-tabs--path__item + .slds-is-current:before {\n    background-color: #4bca81; }\n  .slds-tabs--path__item:hover + .slds-is-complete:before {\n    background-color: #04844b; }\n  .slds-tabs--path__item:hover + .slds-is-current:before {\n    background-color: #04844b; }\n  .slds-tabs--path__item + .slds-is-incomplete:before {\n    background-color: #e0e5ee; }\n  .slds-tabs--path__item:hover + .slds-is-incomplete:before {\n    background-color: #d8dde6; }\n\n.slds-tabs--path__title,\n.slds-tabs--path__stage {\n  display: block;\n  transition: transform 0.2s linear;\n  backface-visibility: hidden; }\n\n.slds-tabs--path__stage {\n  position: absolute;\n  top: 50%;\n  left: 0;\n  width: 100%;\n  margin-top: calc((1rem - 0.25rem) * -1);\n  transform: rotateX(-180deg); }\n\n.slds-tabs--path__title {\n  max-width: 100%;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  display: block;\n  text-decoration: none;\n  cursor: pointer;\n  padding-left: 0.25rem; }\n  .slds-tabs--path__title:focus {\n    outline: 0; }\n\n.slds-tabs--path__link {\n  position: relative;\n  display: block;\n  text-decoration: none;\n  cursor: pointer;\n  padding: 0.25rem 0.5rem 0.25rem 1rem;\n  line-height: calc(3rem / 2); }\n\n/* Lightning Design System 0.12.1 */\n.slds-notify-container {\n  position: fixed;\n  width: 100%;\n  left: 0;\n  top: 0;\n  z-index: 10000;\n  text-align: center; }\n\n.slds-notify {\n  color: white;\n  position: relative;\n  background: #54698d;\n  font-weight: 300; }\n  .slds-notify a:not(.slds-button--neutral) {\n    color: white;\n    text-decoration: underline; }\n    .slds-notify a:not(.slds-button--neutral):link, .slds-notify a:not(.slds-button--neutral):visited {\n      color: white; }\n    .slds-notify a:not(.slds-button--neutral):hover, .slds-notify a:not(.slds-button--neutral):focus {\n      color: rgba(255, 255, 255, 0.75); }\n    .slds-notify a:not(.slds-button--neutral):active {\n      color: rgba(255, 255, 255, 0.5); }\n    .slds-notify a:not(.slds-button--neutral)[disabled] {\n      color: rgba(255, 255, 255, 0.15); }\n  .slds-notify--toast {\n    border-radius: 0.25rem;\n    margin: 0.5rem;\n    padding: 1rem 1.5rem;\n    min-width: 30rem;\n    display: inline-block;\n    text-align: left; }\n    .slds-notify--toast .slds-notify__close {\n      transform: translate3d(0.5rem, 0, 0); }\n  .slds-notify__close {\n    float: right;\n    margin-left: 0.25rem;\n    line-height: 1; }\n  .slds-notify--alert {\n    padding: 0.5rem;\n    text-align: center; }\n\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n.slds-modal--prompt .slds-modal__header {\n  border-bottom: none; }\n\n.slds-modal--prompt .slds-modal__content {\n  padding-left: 2rem;\n  padding-right: 2rem; }\n\n.slds-modal--prompt .slds-modal__footer {\n  border-top: none;\n  text-align: center; }\n\n.slds-modal--prompt .slds-modal__close {\n  display: none; }\n\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n.slds-modal__header .slds-notify-container {\n  position: absolute; }\n\n.slds-modal__header .slds-notify--toast {\n  display: block; }\n\n/* Lightning Design System 0.12.1 */\n.slds-lookup {\n  position: relative; }\n  .slds-lookup__list {\n    max-height: 12.5rem;\n    overflow-y: auto; }\n  .slds-lookup__menu {\n    background: white;\n    border: 1px solid #d8dde6;\n    border-radius: 0.25rem;\n    z-index: 7000;\n    position: absolute;\n    width: 100%;\n    margin-top: 0.25rem;\n    padding: 0.25rem 0; }\n  .slds-lookup__item > a,\n  .slds-lookup__item > span,\n  .slds-lookup__item > button {\n    display: block;\n    padding: 0.5rem;\n    color: #16325c;\n    text-align: left;\n    width: 100%;\n    line-height: 1.5;\n    border-radius: 0; }\n    .slds-lookup__item > a:hover, .slds-lookup__item > a:focus,\n    .slds-lookup__item > span:hover,\n    .slds-lookup__item > span:focus,\n    .slds-lookup__item > button:hover,\n    .slds-lookup__item > button:focus {\n      outline: 0;\n      background-color: #f4f6f9;\n      color: #16325c;\n      text-decoration: none; }\n    .slds-lookup__item > a .slds-icon,\n    .slds-lookup__item > span .slds-icon,\n    .slds-lookup__item > button .slds-icon {\n      margin-right: 0.5rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-lookup[data-select=\"single\"] .slds-pill {\n  display: block;\n  width: 100%; }\n  .slds-lookup[data-select=\"single\"] .slds-pill .slds-button {\n    position: absolute;\n    right: 0.75rem;\n    top: 50%;\n    margin-top: -0.5rem; }\n\n.slds-lookup[data-select=\"single\"].slds-has-selection .slds-input,\n.slds-lookup[data-select=\"single\"].slds-has-selection .slds-input__icon {\n  display: none; }\n\n/* Lightning Design System 0.12.1 */\n.slds-lookup[data-select=\"multi\"] .slds-pill__container {\n  border: transparent;\n    border-bottom: 1px solid #d8dde6;\n    border-radius: 0; }\n\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n.slds-lookup[data-scope=\"multi\"] .slds-form-element__label {\n  align-self: center;\n  margin-left: 0.5rem;\n  margin-right: 0;\n  margin-bottom: 0;\n  font-size: 0.875rem;\n  max-width: 12rem;\n  justify-content: flex-end; }\n\n.slds-lookup[data-scope=\"multi\"] .slds-lookup__menu {\n  max-width: calc(100% - 6rem);\n  right: 0;\n  top: calc(2.125rem + 2px); }\n\n.slds-lookup[data-scope=\"multi\"] .slds-lookup__list {\n  max-height: 17.5rem; }\n\n.slds-lookup[data-scope=\"multi\"] .slds-dropdown-trigger {\n  margin-left: 0.5rem; }\n\n.slds-lookup[data-scope=\"multi\"] .slds-input {\n  padding-left: 12rem; }\n\n.slds-lookup[data-scope=\"multi\"] .slds-form-element__control {\n  background-color: white;\n  color: #16325c;\n  border: 1px solid #d8dde6;\n    border-radius: 0.25rem;\n  width: 100%;\n  transition: border 0.1s linear, background-color 0.1s linear;\n  flex-wrap: wrap;\n  align-items: flex-start;\n  display: flex; }\n  .slds-lookup[data-scope=\"multi\"] .slds-form-element__control:focus, .slds-lookup[data-scope=\"multi\"] .slds-form-element__control:active {\n    outline: 0;\n    border-color: #1589ee;\n    background-color: white;\n    box-shadow: 0 0 3px #0070D2; }\n  .slds-lookup[data-scope=\"multi\"] .slds-form-element__control[disabled], .slds-lookup[data-scope=\"multi\"] .slds-form-element__control.slds-is-disabled {\n    background-color: #e0e5ee;\n    border-color: #a8b7c7;\n    cursor: not-allowed;\n    user-select: none; }\n    .slds-lookup[data-scope=\"multi\"] .slds-form-element__control[disabled]:focus, .slds-lookup[data-scope=\"multi\"] .slds-form-element__control[disabled]:active, .slds-lookup[data-scope=\"multi\"] .slds-form-element__control.slds-is-disabled:focus, .slds-lookup[data-scope=\"multi\"] .slds-form-element__control.slds-is-disabled:active {\n      box-shadow: none; }\n  .slds-lookup[data-scope=\"multi\"] .slds-form-element__control .slds-input--bare {\n    flex: 1;\n    align-self: center;\n    margin-left: 0.5rem;\n    line-height: 2.125rem; }\n\n/* Lightning Design System 0.12.1 */\n/*\nCopyright (c) 2015, salesforce.com, inc. All rights reserved.\n\nRedistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:\nRedistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.\nRedistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.\nNeither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n*/\n.slds-modal .slds-lookup tr:first-child > th {\n  border-top: 2px solid #d8dde6; }\n\n.slds-modal .slds-lookup tr:last-child > th {\n  border-bottom: 2px solid #d8dde6; }\n\n/* Lightning Design System 0.12.1 */\n.slds-media {\n  display: flex;\n  align-items: flex-start; }\n  .slds-media__figure {\n    flex-shrink: 0;\n    margin-right: 0.75rem; }\n  .slds-media__body {\n    flex: 1;\n    min-width: 0; }\n  .slds-media__body,\n  .slds-media__body > :last-child {\n    margin-bottom: 0; }\n\n.slds-media--small .slds-media__figure {\n  margin-right: 0.25rem; }\n\n.slds-media--large .slds-media__figure {\n  margin-right: 1.5rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-media--center {\n  align-items: center; }\n\n/* Lightning Design System 0.12.1 */\n.slds-media__figure--reverse {\n  margin: 0 0 0 0.75rem; }\n\n.slds-media--small .slds-media__figure--reverse {\n  margin-left: 0.25rem; }\n\n.slds-media--reverse > .slds-media__figure {\n  order: 1; }\n\n.slds-media--reverse.slds-media--small .slds-media__figure {\n  margin-left: 0.25rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-media--double > .slds-media__figure {\n  order: 1; }\n\n.slds-media--double .slds-media__figure--reverse {\n  order: 3;\n  margin: 0 0 0 1rem; }\n\n.slds-media--double .slds-media__body {\n  order: 2; }\n\n/* Lightning Design System 0.12.1 */\n@media (max-width: 48em) {\n  .slds-media--responsive {\n    display: block; }\n    .slds-media--responsive .slds-media__figure {\n      margin: 0 0 0.75rem; } }\n\n/* Lightning Design System 0.12.1 */\n.slds-avatar {\n  overflow: hidden;\n  display: inline-block;\n  vertical-align: middle;\n  border-radius: 0.25rem;\n  line-height: 1; }\n  .slds-avatar--x-small {\n    width: 1.5rem;\n    height: 1.5rem; }\n  .slds-avatar--small {\n    width: 2.25rem;\n    height: 2.25rem; }\n  .slds-avatar--medium {\n    width: 3rem;\n    height: 3rem; }\n  .slds-avatar--large {\n    width: 5rem;\n    height: 5rem; }\n  .slds-avatar--circle {\n    border-radius: 50%; }\n\n/* Lightning Design System 0.12.1 */\n.slds-badge {\n  background-color: #e0e5ee;\n  padding: 0.25rem 0.5rem;\n  border-radius: 15rem;\n  font-size: 0.625rem;\n  line-height: 1.25;\n  text-transform: uppercase;\n  letter-spacing: .0625em;\n  color: #16325c;\n  vertical-align: middle;\n  white-space: nowrap; }\n  .slds-badge + .slds-badge {\n    margin-left: 0.5rem; }\n  .slds-badge:empty {\n    padding: 0; }\n\n/* Lightning Design System 0.12.1 */\n.slds-table {\n  background-color: white; }\n  .slds-table th,\n  .slds-table td {\n    padding: 0.5rem;\n    white-space: nowrap; }\n    .slds-table th.slds-text-center,\n    .slds-table td.slds-text-center {\n      text-align: center; }\n    .slds-table th.slds-text-right,\n    .slds-table td.slds-text-right {\n      text-align: right; }\n  .slds-table tr > th:first-child,\n  .slds-table tr > td:first-child {\n    padding-left: 1.5rem; }\n  .slds-table tr > th:last-child,\n  .slds-table tr > td:last-child {\n    padding-right: 1.5rem; }\n  .slds-table th {\n    font-weight: 400; }\n  .slds-table:not(.slds-no-row-hover) tbody tr:hover > td,\n  .slds-table:not(.slds-no-row-hover) tbody tr:hover > th {\n    background-color: #f4f6f9; }\n  .slds-table tbody tr.slds-is-selected > td,\n  .slds-table tbody tr.slds-is-selected > th,\n  .slds-table:not(.slds-no-row-hover) tr.slds-is-selected:hover > td,\n  .slds-table:not(.slds-no-row-hover) tr.slds-is-selected:hover > th {\n    background-color: #f0f8fc; }\n  .slds-table td.slds-is-selected,\n  .slds-table td.slds-is-selected:hover {\n    box-shadow: #0070d2 0 0 0 2px inset; }\n  .slds-table .slds-truncate {\n    min-width: 3.25rem;\n    max-width: 15rem; }\n  .slds-table .slds-cell-wrap {\n    white-space: normal; }\n  .slds-table .slds-cell-shrink {\n    width: 1%; }\n\n.slds-table--bordered {\n  border-top: 1px solid #d8dde6;\n  border-bottom: 1px solid #d8dde6; }\n  .slds-table--bordered thead > tr + tr > th {\n    border-top: 1px solid #d8dde6; }\n  .slds-table--bordered td,\n  .slds-table--bordered th {\n    border-top: 1px solid #d8dde6; }\n  .slds-table--bordered:not(.slds-no-row-hover) tbody tr:hover > td,\n  .slds-table--bordered:not(.slds-no-row-hover) tbody tr:hover > th {\n    box-shadow: #d8dde6 0 -1px 0 inset; }\n  .slds-table--bordered:not(.slds-no-row-hover) .slds-is-selected:hover > td,\n  .slds-table--bordered:not(.slds-no-row-hover) .slds-is-selected:hover > th {\n    border-color: #0070d2;\n    box-shadow: #0070d2 0 -2px 0 inset; }\n    .slds-table--bordered:not(.slds-no-row-hover) .slds-is-selected:hover > td.slds-is-selected,\n    .slds-table--bordered:not(.slds-no-row-hover) .slds-is-selected:hover > th.slds-is-selected {\n      box-shadow: #0070d2 0 -1px 0 2px inset; }\n\n.slds-table--striped tr:nth-of-type(even) > td {\n  background-color: #f4f6f9; }\n\n.slds-is-sortable {\n  cursor: pointer; }\n  .slds-is-sortable .slds-button {\n    visibility: hidden;\n    margin-left: 0.5rem; }\n  .slds-is-sortable .slds-button__icon {\n    fill: #0070d2; }\n  .slds-is-sortable:hover {\n    background-color: #f4f6f9;\n    color: #0070d2; }\n    .slds-is-sortable:hover .slds-button {\n      visibility: visible; }\n\n/* Lightning Design System 0.12.1 */\n@media (max-width: 48em) {\n  .slds-max-medium-table--stacked {\n    border: 0; }\n    .slds-max-medium-table--stacked thead,\n    .slds-max-medium-table--stacked .slds-row-select,\n    .slds-max-medium-table--stacked .slds-row-action {\n      position: absolute;\n      top: 0;\n      left: -9999em; }\n    .slds-max-medium-table--stacked th {\n      border-top: none; }\n    .slds-max-medium-table--stacked tr {\n      display: block;\n      border-top: 2px solid #d8dde6; }\n    .slds-max-medium-table--stacked td {\n      display: block;\n      padding: 0.75rem;\n      width: 100%;\n      clear: both;\n      white-space: normal;\n      overflow: hidden;\n      text-align: left; }\n      .slds-max-medium-table--stacked td:before {\n        display: block;\n        padding-bottom: 0.25rem;\n        content: attr(data-label);\n        color: #54698d;\n        text-transform: uppercase;\n        font-family: \"Salesforce Sans\", Arial, sans-serif;\n        font-size: 0.75rem;\n        font-weight: 300; }\n    .slds-max-medium-table--stacked tr > td:first-child,\n    .slds-max-medium-table--stacked tr > td:last-child {\n      padding: 0.75rem; }\n    .slds-max-medium-table--stacked:not(.slds-no-row-hover) tbody tr:hover td,\n    .slds-max-medium-table--stacked:not(.slds-no-row-hover) tbody tr:hover th {\n      background-color: inherit;\n      box-shadow: none; }\n    .slds-max-medium-table--stacked .slds-is-interactive .slds-button {\n      visibility: visible; }\n    .slds-max-medium-table--stacked .slds-cell-shrink {\n      width: auto; } }\n\n@media (max-width: 48em) {\n  .slds-max-medium-table--stacked td:before,\n  .slds-max-medium-table--stacked th:before {\n    padding-bottom: 0.25rem; } }\n\n/* Lightning Design System 0.12.1 */\n@media (max-width: 48em) {\n  .slds-max-medium-table--stacked-horizontal {\n    border: 0; }\n    .slds-max-medium-table--stacked-horizontal thead,\n    .slds-max-medium-table--stacked-horizontal .slds-row-select,\n    .slds-max-medium-table--stacked-horizontal .slds-row-action {\n      position: absolute;\n      top: 0;\n      left: -9999em; }\n    .slds-max-medium-table--stacked-horizontal th {\n      border-top: none; }\n    .slds-max-medium-table--stacked-horizontal tr {\n      display: block;\n      border-top: 2px solid #d8dde6; }\n    .slds-max-medium-table--stacked-horizontal td {\n      display: block;\n      padding: 0.75rem;\n      width: 100%;\n      clear: both;\n      white-space: normal;\n      overflow: hidden;\n      text-align: left; }\n      .slds-max-medium-table--stacked-horizontal td:before {\n        display: block;\n        padding-bottom: 0.25rem;\n        content: attr(data-label);\n        color: #54698d;\n        text-transform: uppercase;\n        font-family: \"Salesforce Sans\", Arial, sans-serif;\n        font-size: 0.75rem;\n        font-weight: 300; }\n    .slds-max-medium-table--stacked-horizontal tr > td:first-child,\n    .slds-max-medium-table--stacked-horizontal tr > td:last-child {\n      padding: 0.75rem; }\n    .slds-max-medium-table--stacked-horizontal:not(.slds-no-row-hover) tbody tr:hover td,\n    .slds-max-medium-table--stacked-horizontal:not(.slds-no-row-hover) tbody tr:hover th {\n      background-color: inherit;\n      box-shadow: none; }\n    .slds-max-medium-table--stacked-horizontal .slds-is-interactive .slds-button {\n      visibility: visible; }\n    .slds-max-medium-table--stacked-horizontal .slds-cell-shrink {\n      width: auto; } }\n\n@media (max-width: 48em) {\n  .slds-max-medium-table--stacked-horizontal td {\n    text-align: right; }\n    .slds-max-medium-table--stacked-horizontal td:before {\n      float: left;\n      margin-top: 0.125rem; } }\n\n/* Lightning Design System 0.12.1 */\n/* Lightning Design System 0.12.1 */\n.slds-m-top--xxx-small {\n  margin-top: 0.125rem; }\n\n.slds-m-right--xxx-small {\n  margin-right: 0.125rem; }\n\n.slds-m-bottom--xxx-small {\n  margin-bottom: 0.125rem; }\n\n.slds-m-left--xxx-small {\n  margin-left: 0.125rem; }\n\n.slds-m-vertical--xxx-small {\n  margin-top: 0.125rem;\n  margin-bottom: 0.125rem; }\n\n.slds-m-horizontal--xxx-small {\n  margin-right: 0.125rem;\n  margin-left: 0.125rem; }\n\n.slds-m-around--xxx-small {\n  margin: 0.125rem; }\n\n.slds-m-top--xx-small {\n  margin-top: 0.25rem; }\n\n.slds-m-right--xx-small {\n  margin-right: 0.25rem; }\n\n.slds-m-bottom--xx-small {\n  margin-bottom: 0.25rem; }\n\n.slds-m-left--xx-small {\n  margin-left: 0.25rem; }\n\n.slds-m-vertical--xx-small {\n  margin-top: 0.25rem;\n  margin-bottom: 0.25rem; }\n\n.slds-m-horizontal--xx-small {\n  margin-right: 0.25rem;\n  margin-left: 0.25rem; }\n\n.slds-m-around--xx-small {\n  margin: 0.25rem; }\n\n.slds-m-top--x-small {\n  margin-top: 0.5rem; }\n\n.slds-m-right--x-small {\n  margin-right: 0.5rem; }\n\n.slds-m-bottom--x-small {\n  margin-bottom: 0.5rem; }\n\n.slds-m-left--x-small {\n  margin-left: 0.5rem; }\n\n.slds-m-vertical--x-small {\n  margin-top: 0.5rem;\n  margin-bottom: 0.5rem; }\n\n.slds-m-horizontal--x-small {\n  margin-right: 0.5rem;\n  margin-left: 0.5rem; }\n\n.slds-m-around--x-small {\n  margin: 0.5rem; }\n\n.slds-m-top--small {\n  margin-top: 0.75rem; }\n\n.slds-m-right--small {\n  margin-right: 0.75rem; }\n\n.slds-m-bottom--small {\n  margin-bottom: 0.75rem; }\n\n.slds-m-left--small {\n  margin-left: 0.75rem; }\n\n.slds-m-vertical--small {\n  margin-top: 0.75rem;\n  margin-bottom: 0.75rem; }\n\n.slds-m-horizontal--small {\n  margin-right: 0.75rem;\n  margin-left: 0.75rem; }\n\n.slds-m-around--small {\n  margin: 0.75rem; }\n\n.slds-m-top--medium {\n  margin-top: 1rem; }\n\n.slds-m-right--medium {\n  margin-right: 1rem; }\n\n.slds-m-bottom--medium {\n  margin-bottom: 1rem; }\n\n.slds-m-left--medium {\n  margin-left: 1rem; }\n\n.slds-m-vertical--medium {\n  margin-top: 1rem;\n  margin-bottom: 1rem; }\n\n.slds-m-horizontal--medium {\n  margin-right: 1rem;\n  margin-left: 1rem; }\n\n.slds-m-around--medium {\n  margin: 1rem; }\n\n.slds-m-top--large {\n  margin-top: 1.5rem; }\n\n.slds-m-right--large {\n  margin-right: 1.5rem; }\n\n.slds-m-bottom--large {\n  margin-bottom: 1.5rem; }\n\n.slds-m-left--large {\n  margin-left: 1.5rem; }\n\n.slds-m-vertical--large {\n  margin-top: 1.5rem;\n  margin-bottom: 1.5rem; }\n\n.slds-m-horizontal--large {\n  margin-right: 1.5rem;\n  margin-left: 1.5rem; }\n\n.slds-m-around--large {\n  margin: 1.5rem; }\n\n.slds-m-top--x-large {\n  margin-top: 2rem; }\n\n.slds-m-right--x-large {\n  margin-right: 2rem; }\n\n.slds-m-bottom--x-large {\n  margin-bottom: 2rem; }\n\n.slds-m-left--x-large {\n  margin-left: 2rem; }\n\n.slds-m-vertical--x-large {\n  margin-top: 2rem;\n  margin-bottom: 2rem; }\n\n.slds-m-horizontal--x-large {\n  margin-right: 2rem;\n  margin-left: 2rem; }\n\n.slds-m-around--x-large {\n  margin: 2rem; }\n\n.slds-m-top--xx-large {\n  margin-top: 3rem; }\n\n.slds-m-right--xx-large {\n  margin-right: 3rem; }\n\n.slds-m-bottom--xx-large {\n  margin-bottom: 3rem; }\n\n.slds-m-left--xx-large {\n  margin-left: 3rem; }\n\n.slds-m-vertical--xx-large {\n  margin-top: 3rem;\n  margin-bottom: 3rem; }\n\n.slds-m-horizontal--xx-large {\n  margin-right: 3rem;\n  margin-left: 3rem; }\n\n.slds-m-around--xx-large {\n  margin: 3rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-p-top--xxx-small {\n  padding-top: 0.125rem; }\n\n.slds-p-right--xxx-small {\n  padding-right: 0.125rem; }\n\n.slds-p-bottom--xxx-small {\n  padding-bottom: 0.125rem; }\n\n.slds-p-left--xxx-small {\n  padding-left: 0.125rem; }\n\n.slds-p-vertical--xxx-small {\n  padding-top: 0.125rem;\n  padding-bottom: 0.125rem; }\n\n.slds-p-horizontal--xxx-small {\n  padding-right: 0.125rem;\n  padding-left: 0.125rem; }\n\n.slds-p-around--xxx-small {\n  padding: 0.125rem; }\n\n.slds-p-top--xx-small {\n  padding-top: 0.25rem; }\n\n.slds-p-right--xx-small {\n  padding-right: 0.25rem; }\n\n.slds-p-bottom--xx-small {\n  padding-bottom: 0.25rem; }\n\n.slds-p-left--xx-small {\n  padding-left: 0.25rem; }\n\n.slds-p-vertical--xx-small {\n  padding-top: 0.25rem;\n  padding-bottom: 0.25rem; }\n\n.slds-p-horizontal--xx-small {\n  padding-right: 0.25rem;\n  padding-left: 0.25rem; }\n\n.slds-p-around--xx-small {\n  padding: 0.25rem; }\n\n.slds-p-top--x-small {\n  padding-top: 0.5rem; }\n\n.slds-p-right--x-small {\n  padding-right: 0.5rem; }\n\n.slds-p-bottom--x-small {\n  padding-bottom: 0.5rem; }\n\n.slds-p-left--x-small {\n  padding-left: 0.5rem; }\n\n.slds-p-vertical--x-small {\n  padding-top: 0.5rem;\n  padding-bottom: 0.5rem; }\n\n.slds-p-horizontal--x-small {\n  padding-right: 0.5rem;\n  padding-left: 0.5rem; }\n\n.slds-p-around--x-small {\n  padding: 0.5rem; }\n\n.slds-p-top--small {\n  padding-top: 0.75rem; }\n\n.slds-p-right--small {\n  padding-right: 0.75rem; }\n\n.slds-p-bottom--small {\n  padding-bottom: 0.75rem; }\n\n.slds-p-left--small {\n  padding-left: 0.75rem; }\n\n.slds-p-vertical--small {\n  padding-top: 0.75rem;\n  padding-bottom: 0.75rem; }\n\n.slds-p-horizontal--small {\n  padding-right: 0.75rem;\n  padding-left: 0.75rem; }\n\n.slds-p-around--small {\n  padding: 0.75rem; }\n\n.slds-p-top--medium {\n  padding-top: 1rem; }\n\n.slds-p-right--medium {\n  padding-right: 1rem; }\n\n.slds-p-bottom--medium {\n  padding-bottom: 1rem; }\n\n.slds-p-left--medium {\n  padding-left: 1rem; }\n\n.slds-p-vertical--medium {\n  padding-top: 1rem;\n  padding-bottom: 1rem; }\n\n.slds-p-horizontal--medium {\n  padding-right: 1rem;\n  padding-left: 1rem; }\n\n.slds-p-around--medium {\n  padding: 1rem; }\n\n.slds-p-top--large {\n  padding-top: 1.5rem; }\n\n.slds-p-right--large {\n  padding-right: 1.5rem; }\n\n.slds-p-bottom--large {\n  padding-bottom: 1.5rem; }\n\n.slds-p-left--large {\n  padding-left: 1.5rem; }\n\n.slds-p-vertical--large {\n  padding-top: 1.5rem;\n  padding-bottom: 1.5rem; }\n\n.slds-p-horizontal--large {\n  padding-right: 1.5rem;\n  padding-left: 1.5rem; }\n\n.slds-p-around--large {\n  padding: 1.5rem; }\n\n.slds-p-top--x-large {\n  padding-top: 2rem; }\n\n.slds-p-right--x-large {\n  padding-right: 2rem; }\n\n.slds-p-bottom--x-large {\n  padding-bottom: 2rem; }\n\n.slds-p-left--x-large {\n  padding-left: 2rem; }\n\n.slds-p-vertical--x-large {\n  padding-top: 2rem;\n  padding-bottom: 2rem; }\n\n.slds-p-horizontal--x-large {\n  padding-right: 2rem;\n  padding-left: 2rem; }\n\n.slds-p-around--x-large {\n  padding: 2rem; }\n\n.slds-p-top--xx-large {\n  padding-top: 3rem; }\n\n.slds-p-right--xx-large {\n  padding-right: 3rem; }\n\n.slds-p-bottom--xx-large {\n  padding-bottom: 3rem; }\n\n.slds-p-left--xx-large {\n  padding-left: 3rem; }\n\n.slds-p-vertical--xx-large {\n  padding-top: 3rem;\n  padding-bottom: 3rem; }\n\n.slds-p-horizontal--xx-large {\n  padding-right: 3rem;\n  padding-left: 3rem; }\n\n.slds-p-around--xx-large {\n  padding: 3rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-float--left {\n  float: left; }\n\n/* Lightning Design System 0.12.1 */\n.slds-float--right {\n  float: right; }\n\n/* Lightning Design System 0.12.1 */\n.slds-clearfix:after {\n  content: '';\n  display: table;\n  clear: both; }\n\n.slds-clear {\n  clear: both; }\n\n/* Lightning Design System 0.12.1 */\n.slds-list--dotted {\n  margin-left: 1.5rem;\n  list-style: disc; }\n\n/* Lightning Design System 0.12.1 */\n.slds-list--ordered {\n  margin-left: 1.5rem;\n  list-style: decimal; }\n\n/* Lightning Design System 0.12.1 */\n.slds-dl--inline:after {\n  content: '';\n  display: table;\n  clear: both; }\n\n@media (min-width: 48em) {\n  .slds-dl--inline__label {\n    float: left;\n    clear: left; }\n  .slds-dl--inline__detail {\n    float: left;\n    padding-left: 0.25rem; } }\n\n/* Lightning Design System 0.12.1 */\n@media (min-width: 48em) {\n  .slds-dl--horizontal {\n    flex-wrap: wrap;\n    align-items: flex-start;\n    display: flex; }\n    .slds-dl--horizontal__label {\n      width: 33%;\n      padding-right: 0.75rem; }\n    .slds-dl--horizontal__detail {\n      width: 66%; } }\n\n/* Lightning Design System 0.12.1 */\n.slds-list--horizontal {\n  display: flex; }\n  .slds-list--horizontal > .slds-list__item {\n    align-self: center;\n    display: inline-block;\n    vertical-align: middle; }\n\n.slds-list--horizontal-large > .slds-list__item > a {\n  padding: 0.75rem 1rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-is-nested {\n  margin-left: 1rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-has-divider {\n  margin-top: 0.5rem;\n  padding-top: 0.5rem;\n  border-top: 1px solid #d8dde6; }\n  .slds-has-divider--top {\n    border-top: 1px solid #d8dde6; }\n    .slds-has-divider--top-space {\n      border-top: 1px solid #d8dde6;\n      margin-top: 0.5rem;\n      padding-top: 0.5rem; }\n  .slds-has-divider--bottom {\n    border-bottom: 1px solid #d8dde6; }\n    .slds-has-divider--bottom-space {\n      border-bottom: 1px solid #d8dde6;\n      margin-bottom: 0.5rem;\n      padding-bottom: 0.5rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-list--vertical.slds-has-dividers > .slds-list__item {\n  padding: 0.5rem;\n  border-bottom: 1px solid #d8dde6; }\n  .slds-list--vertical.slds-has-dividers > .slds-list__item:hover {\n    background-color: #f4f6f9;\n    border-color: #d8dde6;\n    cursor: pointer; }\n  .slds-list--vertical.slds-has-dividers > .slds-list__item:active {\n    background-color: #eef1f6;\n    box-shadow: #d8dde6 0 -1px 0 inset; }\n  .slds-list--vertical.slds-has-dividers > .slds-list__item.slds-is-selected {\n    box-shadow: #0070d2 0 0 0 1px inset;\n    background-color: #f0f8fc; }\n    .slds-list--vertical.slds-has-dividers > .slds-list__item.slds-is-selected:hover, .slds-list--vertical.slds-has-dividers > .slds-list__item.slds-is-selected:focus {\n      box-shadow: #1589ee 0 -2px 0 inset, #1589ee 0 0 0 1px inset; }\n\n.slds-has-dividers--top > .slds-list__item {\n  border-top: 1px solid #d8dde6; }\n\n.slds-has-dividers--top-space > .slds-list__item {\n  border-top: 1px solid #d8dde6;\n  padding: 0.75rem; }\n  @media (min-width: 30em) {\n    .slds-has-dividers--top-space > .slds-list__item {\n      padding: 0.5rem; } }\n\n.slds-has-dividers--bottom > .slds-list__item {\n  border-bottom: 1px solid #d8dde6; }\n\n.slds-has-dividers--bottom-space > .slds-list__item {\n  border-bottom: 1px solid #d8dde6;\n  padding: 0.75rem; }\n  @media (min-width: 30em) {\n    .slds-has-dividers--bottom-space > .slds-list__item {\n      padding: 0.5rem; } }\n\n.slds-has-list-interactions > .slds-list__item:hover {\n  background-color: #f4f6f9;\n  border-color: #d8dde6;\n  cursor: pointer; }\n\n.slds-has-list-interactions > .slds-list__item:active {\n  background-color: #eef1f6;\n  box-shadow: #d8dde6 0 -1px 0 inset; }\n\n.slds-has-list-interactions > .slds-list__item.slds-is-selected {\n  box-shadow: #0070d2 0 0 0 1px inset;\n  background-color: #f0f8fc; }\n  .slds-has-list-interactions > .slds-list__item.slds-is-selected:hover, .slds-has-list-interactions > .slds-list__item.slds-is-selected:focus {\n    box-shadow: #1589ee 0 -2px 0 inset, #1589ee 0 0 0 1px inset; }\n\n/* Lightning Design System 0.12.1 */\n.slds-list--horizontal.slds-has-dividers > .slds-list__item {\n  position: relative; }\n  .slds-list--horizontal.slds-has-dividers > .slds-list__item:after {\n    width: 4px;\n    height: 4px;\n    content: '';\n    display: inline-block;\n    vertical-align: middle;\n    margin-left: 0.5rem;\n    margin-right: 0.5rem;\n    border-radius: 50%;\n    background-color: #54698d; }\n  .slds-list--horizontal.slds-has-dividers > .slds-list__item:last-child {\n    margin-right: 0;\n    padding-right: 0; }\n    .slds-list--horizontal.slds-has-dividers > .slds-list__item:last-child:after {\n      content: none; }\n\n.slds-has-dividers--left > .slds-list__item {\n  position: relative; }\n  .slds-has-dividers--left > .slds-list__item:before {\n    width: 4px;\n    height: 4px;\n    content: '';\n    display: inline-block;\n    vertical-align: middle;\n    margin-left: 0.5rem;\n    margin-right: 0.5rem;\n    border-radius: 50%;\n    background-color: #54698d; }\n  .slds-has-dividers--left > .slds-list__item:first-child {\n    margin-right: 0;\n    padding-right: 0; }\n    .slds-has-dividers--left > .slds-list__item:first-child:before {\n      content: none; }\n\n.slds-has-dividers--right > .slds-list__item {\n  position: relative; }\n  .slds-has-dividers--right > .slds-list__item:after {\n    width: 4px;\n    height: 4px;\n    content: '';\n    display: inline-block;\n    vertical-align: middle;\n    margin-left: 0.5rem;\n    margin-right: 0.5rem;\n    border-radius: 50%;\n    background-color: #54698d; }\n  .slds-has-dividers--right > .slds-list__item:last-child {\n    margin-right: 0;\n    padding-right: 0; }\n    .slds-has-dividers--right > .slds-list__item:last-child:after {\n      content: none; }\n\n/* Lightning Design System 0.12.1 */\n.slds-has-cards .slds-list__item {\n  border: 1px solid #d8dde6;\n  border-radius: 0.25rem;\n  background-clip: padding-box; }\n  .slds-has-cards .slds-list__item + .slds-list__item {\n    margin-top: 0.5rem; }\n\n.slds-has-cards--space .slds-list__item {\n  border: 1px solid #d8dde6;\n  border-radius: 0.25rem;\n  background-clip: padding-box;\n  padding: 0.75rem; }\n  @media (min-width: 30em) {\n    .slds-has-cards--space .slds-list__item {\n      padding: 0.5rem; } }\n  .slds-has-cards--space .slds-list__item + .slds-list__item {\n    margin-top: 0.5rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-has-block-links a {\n  display: block;\n  text-decoration: none; }\n\n.slds-has-block-links .slds-is-nested {\n  margin-left: 1rem; }\n\n.slds-has-block-links--space .slds-list__item {\n  padding: 0; }\n\n.slds-has-block-links--space a {\n  display: block;\n  text-decoration: none;\n  padding: 0.75rem; }\n  @media (min-width: 48em) {\n    .slds-has-block-links--space a {\n      padding: 0.5rem; } }\n\n.slds-has-inline-block-links a {\n  display: inline-block;\n  text-decoration: none; }\n\n.slds-has-inline-block-links--space a {\n  display: inline-block;\n  text-decoration: none;\n  padding: 0.75rem; }\n  @media (min-width: 48em) {\n    .slds-has-inline-block-links--space a {\n      padding: 0.5rem; } }\n\n/* Lightning Design System 0.12.1 */\n.slds-truncate {\n  max-width: 100%;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap; }\n\n/* Lightning Design System 0.12.1 */\n.slds-page-header {\n  padding: 1.5rem 1.5rem 0.75rem;\n  border-bottom: 1px solid #d8dde6;\n  background: #f4f6f9; }\n\n/* Lightning Design System 0.12.1 */\n.slds-box {\n  padding: 1rem;\n  border-radius: 0.25rem;\n  background-clip: padding-box;\n  border: 1px solid #d8dde6; }\n  .slds-box--x-small {\n    padding: 0.5rem; }\n  .slds-box--small {\n    padding: 0.75rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-theme--default {\n  background-color: white; }\n\n.slds-theme--shade {\n  background-color: #f4f6f9; }\n\n.slds-theme--inverse {\n  background-color: #061c3f;\n  color: white;\n  border-color: #061c3f; }\n  .slds-theme--inverse a:not(.slds-button--neutral) {\n    color: white;\n    text-decoration: underline; }\n    .slds-theme--inverse a:not(.slds-button--neutral):link, .slds-theme--inverse a:not(.slds-button--neutral):visited {\n      color: white; }\n    .slds-theme--inverse a:not(.slds-button--neutral):hover, .slds-theme--inverse a:not(.slds-button--neutral):focus {\n      color: rgba(255, 255, 255, 0.75); }\n    .slds-theme--inverse a:not(.slds-button--neutral):active {\n      color: rgba(255, 255, 255, 0.5); }\n    .slds-theme--inverse a:not(.slds-button--neutral)[disabled] {\n      color: rgba(255, 255, 255, 0.15); }\n\n.slds-theme--alt-inverse {\n  background-color: #16325c;\n  color: white;\n  border-color: #16325c; }\n  .slds-theme--alt-inverse a:not(.slds-button--neutral) {\n    color: white;\n    text-decoration: underline; }\n    .slds-theme--alt-inverse a:not(.slds-button--neutral):link, .slds-theme--alt-inverse a:not(.slds-button--neutral):visited {\n      color: white; }\n    .slds-theme--alt-inverse a:not(.slds-button--neutral):hover, .slds-theme--alt-inverse a:not(.slds-button--neutral):focus {\n      color: rgba(255, 255, 255, 0.75); }\n    .slds-theme--alt-inverse a:not(.slds-button--neutral):active {\n      color: rgba(255, 255, 255, 0.5); }\n    .slds-theme--alt-inverse a:not(.slds-button--neutral)[disabled] {\n      color: rgba(255, 255, 255, 0.15); }\n\n.slds-theme--success {\n  color: white;\n  background-color: #04844b; }\n  .slds-theme--success a:not(.slds-button--neutral) {\n    color: white;\n    text-decoration: underline; }\n    .slds-theme--success a:not(.slds-button--neutral):link, .slds-theme--success a:not(.slds-button--neutral):visited {\n      color: white; }\n    .slds-theme--success a:not(.slds-button--neutral):hover, .slds-theme--success a:not(.slds-button--neutral):focus {\n      color: rgba(255, 255, 255, 0.75); }\n    .slds-theme--success a:not(.slds-button--neutral):active {\n      color: rgba(255, 255, 255, 0.5); }\n    .slds-theme--success a:not(.slds-button--neutral)[disabled] {\n      color: rgba(255, 255, 255, 0.15); }\n\n.slds-theme--info {\n  color: white;\n  background-color: #54698d; }\n  .slds-theme--info a:not(.slds-button--neutral) {\n    color: white;\n    text-decoration: underline; }\n    .slds-theme--info a:not(.slds-button--neutral):link, .slds-theme--info a:not(.slds-button--neutral):visited {\n      color: white; }\n    .slds-theme--info a:not(.slds-button--neutral):hover, .slds-theme--info a:not(.slds-button--neutral):focus {\n      color: rgba(255, 255, 255, 0.75); }\n    .slds-theme--info a:not(.slds-button--neutral):active {\n      color: rgba(255, 255, 255, 0.5); }\n    .slds-theme--info a:not(.slds-button--neutral)[disabled] {\n      color: rgba(255, 255, 255, 0.15); }\n\n.slds-theme--warning {\n  background-color: #ffb75d;\n  color: #16325c; }\n  .slds-theme--warning .slds-button__icon {\n    fill: #54698d; }\n\n.slds-theme--error {\n  color: white;\n  background-color: #c23934; }\n  .slds-theme--error a:not(.slds-button--neutral) {\n    color: white;\n    text-decoration: underline; }\n    .slds-theme--error a:not(.slds-button--neutral):link, .slds-theme--error a:not(.slds-button--neutral):visited {\n      color: white; }\n    .slds-theme--error a:not(.slds-button--neutral):hover, .slds-theme--error a:not(.slds-button--neutral):focus {\n      color: rgba(255, 255, 255, 0.75); }\n    .slds-theme--error a:not(.slds-button--neutral):active {\n      color: rgba(255, 255, 255, 0.5); }\n    .slds-theme--error a:not(.slds-button--neutral)[disabled] {\n      color: rgba(255, 255, 255, 0.15); }\n\n.slds-theme--offline {\n  color: white;\n  background-color: #444; }\n  .slds-theme--offline a:not(.slds-button--neutral) {\n    color: white;\n    text-decoration: underline; }\n    .slds-theme--offline a:not(.slds-button--neutral):link, .slds-theme--offline a:not(.slds-button--neutral):visited {\n      color: white; }\n    .slds-theme--offline a:not(.slds-button--neutral):hover, .slds-theme--offline a:not(.slds-button--neutral):focus {\n      color: rgba(255, 255, 255, 0.75); }\n    .slds-theme--offline a:not(.slds-button--neutral):active {\n      color: rgba(255, 255, 255, 0.5); }\n    .slds-theme--offline a:not(.slds-button--neutral)[disabled] {\n      color: rgba(255, 255, 255, 0.15); }\n\n.slds-theme--alert-texture {\n  background-image: linear-gradient(45deg, rgba(0, 0, 0, 0.035) 25%, transparent 25%, transparent 50%, rgba(0, 0, 0, 0.035) 50%, rgba(0, 0, 0, 0.035) 75%, transparent 75%, transparent);\n  background-size: 64px 64px; }\n\n.slds-theme--inverse-text {\n  color: white; }\n  .slds-theme--inverse-text a:not(.slds-button--neutral) {\n    color: white;\n    text-decoration: underline; }\n    .slds-theme--inverse-text a:not(.slds-button--neutral):link, .slds-theme--inverse-text a:not(.slds-button--neutral):visited {\n      color: white; }\n    .slds-theme--inverse-text a:not(.slds-button--neutral):hover, .slds-theme--inverse-text a:not(.slds-button--neutral):focus {\n      color: rgba(255, 255, 255, 0.75); }\n    .slds-theme--inverse-text a:not(.slds-button--neutral):active {\n      color: rgba(255, 255, 255, 0.5); }\n    .slds-theme--inverse-text a:not(.slds-button--neutral)[disabled] {\n      color: rgba(255, 255, 255, 0.15); }\n\n.slds-theme--default .slds-text-body--small, .slds-theme--shade .slds-text-body--small, .slds-theme--inverse .slds-text-body--small, .slds-theme--alt-inverse .slds-text-body--small, .slds-theme--success .slds-text-body--small, .slds-theme--info .slds-text-body--small, .slds-theme--warning .slds-text-body--small, .slds-theme--error .slds-text-body--small, .slds-theme--offline .slds-text-body--small, .slds-theme--alert-texture .slds-text-body--small, .slds-theme--inverse-text .slds-text-body--small {\n  color: inherit; }\n\n/* Lightning Design System 0.12.1 */\n.slds-text-body--regular {\n  font-size: 0.875rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-text-heading--small {\n  font-weight: 300;\n  font-size: 1.125rem;\n  line-height: 1.25; }\n\n/* Lightning Design System 0.12.1 */\n.slds-text-heading--medium {\n  font-weight: 300;\n  font-size: 1.5rem;\n  line-height: 1.25; }\n\n/* Lightning Design System 0.12.1 */\n.slds-text-heading--large {\n  font-weight: 300;\n  font-size: 2rem;\n  line-height: 1.25; }\n\n/* Lightning Design System 0.12.1 */\n.slds-text-heading--label {\n  font-size: 0.75rem;\n  line-height: 1.25;\n  text-transform: uppercase;\n  letter-spacing: .0625em;\n  color: #54698d; }\n\n/* Lightning Design System 0.12.1 */\n.slds-text-body--small {\n  font-size: 0.75rem;\n  color: #54698d; }\n\n/* Lightning Design System 0.12.1 */\n.slds-text-align--left {\n  text-align: left; }\n\n.slds-text-align--center {\n  text-align: center; }\n\n.slds-text-align--right {\n  text-align: right; }\n\n/* Lightning Design System 0.12.1 */\n.slds-text-longform h1,\n.slds-text-longform h2,\n.slds-text-longform h3,\n.slds-text-longform p,\n.slds-text-longform ul,\n.slds-text-longform ol,\n.slds-text-longform dl,\n.slds-text-longform img {\n  margin-bottom: 0.75rem; }\n  .slds-text-longform h1:last-child,\n  .slds-text-longform h2:last-child,\n  .slds-text-longform h3:last-child,\n  .slds-text-longform p:last-child,\n  .slds-text-longform ul:last-child,\n  .slds-text-longform ol:last-child,\n  .slds-text-longform dl:last-child,\n  .slds-text-longform img:last-child {\n    margin-bottom: 0; }\n\n.slds-text-longform ul {\n  margin-left: 1.5rem;\n  list-style: disc; }\n\n.slds-text-longform ol {\n  margin-left: 1.5rem;\n  list-style: decimal; }\n\n/* Lightning Design System 0.12.1 */\n.slds-section-title {\n  font-size: 1.125rem; }\n  .slds-section-title > a {\n    display: inline-block;\n    color: #16325c; }\n    .slds-section-title > a:hover, .slds-section-title > a:focus {\n      color: #005fb2; }\n    .slds-section-title > a:focus {\n      box-shadow: 0 0 3px #0070D2; }\n    .slds-section-title > a:active {\n      color: #16325c; }\n  .slds-section-title .slds-icon {\n    width: 1rem;\n    height: 1rem;\n    fill: currentColor; }\n  .slds-section-title .slds-section-group--is-closed .slds-icon {\n    transform: rotate(-90deg); }\n\n/* Lightning Design System 0.12.1 */\n.slds-section-title--divider {\n  font-size: 0.75rem;\n  line-height: 1.25;\n  text-transform: uppercase;\n  letter-spacing: .0625em;\n  color: #54698d;\n  margin: 0 -1rem 1rem;\n  padding: 0.75rem 1rem;\n  background: #f4f6f9; }\n  .slds-section-title--divider:first-child {\n    margin-top: -1rem; }\n\n/* Lightning Design System 0.12.1 */\n.slds-type-focus {\n  border-bottom: 1px solid transparent;\n  cursor: pointer; }\n  .slds-type-focus:hover {\n    border-bottom: 1px solid #005fb2; }\n  .slds-type-focus:focus {\n    outline: thin dotted;\n    outline: 5px auto #1589ee;\n    outline-offset: -2px; }\n\n/* Lightning Design System 0.12.1 */\n.slds-scrollable--y {\n  -webkit-overflow-scrolling: touch;\n  max-height: 100%;\n  overflow: hidden;\n    overflow-y: auto; }\n  .slds-scrollable--y::-webkit-scrollbar {\n    width: 10px;\n    height: 10px; }\n    .slds-scrollable--y::-webkit-scrollbar:window-inactive {\n      opacity: 0; }\n  .slds-scrollable--y::-webkit-scrollbar-thumb {\n    background: #e0e5ee;\n    border-radius: 0.5rem;\n    box-shadow: #a8b7c7 0 0 0 1px inset; }\n  .slds-scrollable--y::-webkit-scrollbar-track {\n    background: #a8b7c7; }\n\n/* Lightning Design System 0.12.1 */\n.slds-scrollable--x {\n  -webkit-overflow-scrolling: touch;\n  max-width: 100%;\n  overflow: hidden;\n    overflow-x: auto; }\n  .slds-scrollable--x::-webkit-scrollbar {\n    width: 10px;\n    height: 10px; }\n    .slds-scrollable--x::-webkit-scrollbar:window-inactive {\n      opacity: 0; }\n  .slds-scrollable--x::-webkit-scrollbar-thumb {\n    background: #e0e5ee;\n    border-radius: 0.5rem;\n    box-shadow: #a8b7c7 0 0 0 1px inset; }\n  .slds-scrollable--x::-webkit-scrollbar-track {\n    background: #a8b7c7; }\n\n/* Lightning Design System 0.12.1 */\n.slds-size--1-of-1 {\n  width: 100%; }\n\n.slds-size--1-of-2 {\n  width: 50%; }\n\n.slds-size--2-of-2 {\n  width: 100%; }\n\n.slds-size--1-of-3 {\n  width: 33.33333%; }\n\n.slds-size--2-of-3 {\n  width: 66.66667%; }\n\n.slds-size--3-of-3 {\n  width: 100%; }\n\n.slds-size--1-of-4 {\n  width: 25%; }\n\n.slds-size--2-of-4 {\n  width: 50%; }\n\n.slds-size--3-of-4 {\n  width: 75%; }\n\n.slds-size--4-of-4 {\n  width: 100%; }\n\n.slds-size--1-of-5 {\n  width: 20%; }\n\n.slds-size--2-of-5 {\n  width: 40%; }\n\n.slds-size--3-of-5 {\n  width: 60%; }\n\n.slds-size--4-of-5 {\n  width: 80%; }\n\n.slds-size--5-of-5 {\n  width: 100%; }\n\n.slds-size--1-of-6 {\n  width: 16.66667%; }\n\n.slds-size--2-of-6 {\n  width: 33.33333%; }\n\n.slds-size--3-of-6 {\n  width: 50%; }\n\n.slds-size--4-of-6 {\n  width: 66.66667%; }\n\n.slds-size--5-of-6 {\n  width: 83.33333%; }\n\n.slds-size--6-of-6 {\n  width: 100%; }\n\n.slds-size--1-of-7 {\n  width: 14.28571%; }\n\n.slds-size--2-of-7 {\n  width: 28.57143%; }\n\n.slds-size--3-of-7 {\n  width: 42.85714%; }\n\n.slds-size--4-of-7 {\n  width: 57.14286%; }\n\n.slds-size--5-of-7 {\n  width: 71.42857%; }\n\n.slds-size--6-of-7 {\n  width: 85.71429%; }\n\n.slds-size--7-of-7 {\n  width: 100%; }\n\n.slds-size--1-of-8 {\n  width: 12.5%; }\n\n.slds-size--2-of-8 {\n  width: 25%; }\n\n.slds-size--3-of-8 {\n  width: 37.5%; }\n\n.slds-size--4-of-8 {\n  width: 50%; }\n\n.slds-size--5-of-8 {\n  width: 62.5%; }\n\n.slds-size--6-of-8 {\n  width: 75%; }\n\n.slds-size--7-of-8 {\n  width: 87.5%; }\n\n.slds-size--8-of-8 {\n  width: 100%; }\n\n.slds-size--1-of-12 {\n  width: 8.33333%; }\n\n.slds-size--2-of-12 {\n  width: 16.66667%; }\n\n.slds-size--3-of-12 {\n  width: 25%; }\n\n.slds-size--4-of-12 {\n  width: 33.33333%; }\n\n.slds-size--5-of-12 {\n  width: 41.66667%; }\n\n.slds-size--6-of-12 {\n  width: 50%; }\n\n.slds-size--7-of-12 {\n  width: 58.33333%; }\n\n.slds-size--8-of-12 {\n  width: 66.66667%; }\n\n.slds-size--9-of-12 {\n  width: 75%; }\n\n.slds-size--10-of-12 {\n  width: 83.33333%; }\n\n.slds-size--11-of-12 {\n  width: 91.66667%; }\n\n.slds-size--12-of-12 {\n  width: 100%; }\n\n.slds-order--1 {\n  order: 1; }\n\n.slds-order--2 {\n  order: 2; }\n\n.slds-order--3 {\n  order: 3; }\n\n.slds-order--4 {\n  order: 4; }\n\n.slds-order--5 {\n  order: 5; }\n\n.slds-order--6 {\n  order: 6; }\n\n.slds-order--7 {\n  order: 7; }\n\n.slds-order--8 {\n  order: 8; }\n\n.slds-order--9 {\n  order: 9; }\n\n.slds-order--10 {\n  order: 10; }\n\n.slds-order--11 {\n  order: 11; }\n\n@media (min-width: 20em) {\n  .slds-x-small-size--1-of-1 {\n    width: 100%; }\n  .slds-x-small-size--1-of-2 {\n    width: 50%; }\n  .slds-x-small-size--2-of-2 {\n    width: 100%; }\n  .slds-x-small-size--1-of-3 {\n    width: 33.33333%; }\n  .slds-x-small-size--2-of-3 {\n    width: 66.66667%; }\n  .slds-x-small-size--3-of-3 {\n    width: 100%; }\n  .slds-x-small-size--1-of-4 {\n    width: 25%; }\n  .slds-x-small-size--2-of-4 {\n    width: 50%; }\n  .slds-x-small-size--3-of-4 {\n    width: 75%; }\n  .slds-x-small-size--4-of-4 {\n    width: 100%; }\n  .slds-x-small-order--1 {\n    order: 1; }\n  .slds-x-small-order--2 {\n    order: 2; }\n  .slds-x-small-order--3 {\n    order: 3; }\n  .slds-x-small-order--4 {\n    order: 4; } }\n\n@media (max-width: 20em) {\n  .slds-max-x-small-size--1-of-1 {\n    width: 100%; }\n  .slds-max-x-small-size--1-of-2 {\n    width: 50%; }\n  .slds-max-x-small-size--2-of-2 {\n    width: 100%; }\n  .slds-max-x-small-size--1-of-3 {\n    width: 33.33333%; }\n  .slds-max-x-small-size--2-of-3 {\n    width: 66.66667%; }\n  .slds-max-x-small-size--3-of-3 {\n    width: 100%; }\n  .slds-max-x-small-size--1-of-4 {\n    width: 25%; }\n  .slds-max-x-small-size--2-of-4 {\n    width: 50%; }\n  .slds-max-x-small-size--3-of-4 {\n    width: 75%; }\n  .slds-max-x-small-size--4-of-4 {\n    width: 100%; }\n  .slds-max-x-small-order--1 {\n    order: 1; }\n  .slds-max-x-small-order--2 {\n    order: 2; }\n  .slds-max-x-small-order--3 {\n    order: 3; }\n  .slds-max-x-small-order--4 {\n    order: 4; } }\n\n@media (min-width: 30em) {\n  .slds-small-size--1-of-1 {\n    width: 100%; }\n  .slds-small-size--1-of-2 {\n    width: 50%; }\n  .slds-small-size--2-of-2 {\n    width: 100%; }\n  .slds-small-size--1-of-3 {\n    width: 33.33333%; }\n  .slds-small-size--2-of-3 {\n    width: 66.66667%; }\n  .slds-small-size--3-of-3 {\n    width: 100%; }\n  .slds-small-size--1-of-4 {\n    width: 25%; }\n  .slds-small-size--2-of-4 {\n    width: 50%; }\n  .slds-small-size--3-of-4 {\n    width: 75%; }\n  .slds-small-size--4-of-4 {\n    width: 100%; }\n  .slds-small-size--1-of-5 {\n    width: 20%; }\n  .slds-small-size--2-of-5 {\n    width: 40%; }\n  .slds-small-size--3-of-5 {\n    width: 60%; }\n  .slds-small-size--4-of-5 {\n    width: 80%; }\n  .slds-small-size--5-of-5 {\n    width: 100%; }\n  .slds-small-size--1-of-6 {\n    width: 16.66667%; }\n  .slds-small-size--2-of-6 {\n    width: 33.33333%; }\n  .slds-small-size--3-of-6 {\n    width: 50%; }\n  .slds-small-size--4-of-6 {\n    width: 66.66667%; }\n  .slds-small-size--5-of-6 {\n    width: 83.33333%; }\n  .slds-small-size--6-of-6 {\n    width: 100%; }\n  .slds-small-size--1-of-7 {\n    width: 14.28571%; }\n  .slds-small-size--2-of-7 {\n    width: 28.57143%; }\n  .slds-small-size--3-of-7 {\n    width: 42.85714%; }\n  .slds-small-size--4-of-7 {\n    width: 57.14286%; }\n  .slds-small-size--5-of-7 {\n    width: 71.42857%; }\n  .slds-small-size--6-of-7 {\n    width: 85.71429%; }\n  .slds-small-size--7-of-7 {\n    width: 100%; }\n  .slds-small-size--1-of-8 {\n    width: 12.5%; }\n  .slds-small-size--2-of-8 {\n    width: 25%; }\n  .slds-small-size--3-of-8 {\n    width: 37.5%; }\n  .slds-small-size--4-of-8 {\n    width: 50%; }\n  .slds-small-size--5-of-8 {\n    width: 62.5%; }\n  .slds-small-size--6-of-8 {\n    width: 75%; }\n  .slds-small-size--7-of-8 {\n    width: 87.5%; }\n  .slds-small-size--8-of-8 {\n    width: 100%; }\n  .slds-small-order--1 {\n    order: 1; }\n  .slds-small-order--2 {\n    order: 2; }\n  .slds-small-order--3 {\n    order: 3; }\n  .slds-small-order--4 {\n    order: 4; }\n  .slds-small-order--5 {\n    order: 5; }\n  .slds-small-order--6 {\n    order: 6; }\n  .slds-small-order--7 {\n    order: 7; }\n  .slds-small-order--8 {\n    order: 8; } }\n\n@media (max-width: 30em) {\n  .slds-max-small-size--1-of-1 {\n    width: 100%; }\n  .slds-max-small-size--1-of-2 {\n    width: 50%; }\n  .slds-max-small-size--2-of-2 {\n    width: 100%; }\n  .slds-max-small-size--1-of-3 {\n    width: 33.33333%; }\n  .slds-max-small-size--2-of-3 {\n    width: 66.66667%; }\n  .slds-max-small-size--3-of-3 {\n    width: 100%; }\n  .slds-max-small-size--1-of-4 {\n    width: 25%; }\n  .slds-max-small-size--2-of-4 {\n    width: 50%; }\n  .slds-max-small-size--3-of-4 {\n    width: 75%; }\n  .slds-max-small-size--4-of-4 {\n    width: 100%; }\n  .slds-max-small-size--1-of-5 {\n    width: 20%; }\n  .slds-max-small-size--2-of-5 {\n    width: 40%; }\n  .slds-max-small-size--3-of-5 {\n    width: 60%; }\n  .slds-max-small-size--4-of-5 {\n    width: 80%; }\n  .slds-max-small-size--5-of-5 {\n    width: 100%; }\n  .slds-max-small-size--1-of-6 {\n    width: 16.66667%; }\n  .slds-max-small-size--2-of-6 {\n    width: 33.33333%; }\n  .slds-max-small-size--3-of-6 {\n    width: 50%; }\n  .slds-max-small-size--4-of-6 {\n    width: 66.66667%; }\n  .slds-max-small-size--5-of-6 {\n    width: 83.33333%; }\n  .slds-max-small-size--6-of-6 {\n    width: 100%; }\n  .slds-max-small-size--1-of-7 {\n    width: 14.28571%; }\n  .slds-max-small-size--2-of-7 {\n    width: 28.57143%; }\n  .slds-max-small-size--3-of-7 {\n    width: 42.85714%; }\n  .slds-max-small-size--4-of-7 {\n    width: 57.14286%; }\n  .slds-max-small-size--5-of-7 {\n    width: 71.42857%; }\n  .slds-max-small-size--6-of-7 {\n    width: 85.71429%; }\n  .slds-max-small-size--7-of-7 {\n    width: 100%; }\n  .slds-max-small-size--1-of-8 {\n    width: 12.5%; }\n  .slds-max-small-size--2-of-8 {\n    width: 25%; }\n  .slds-max-small-size--3-of-8 {\n    width: 37.5%; }\n  .slds-max-small-size--4-of-8 {\n    width: 50%; }\n  .slds-max-small-size--5-of-8 {\n    width: 62.5%; }\n  .slds-max-small-size--6-of-8 {\n    width: 75%; }\n  .slds-max-small-size--7-of-8 {\n    width: 87.5%; }\n  .slds-max-small-size--8-of-8 {\n    width: 100%; }\n  .slds-max-small-order--1 {\n    order: 1; }\n  .slds-max-small-order--2 {\n    order: 2; }\n  .slds-max-small-order--3 {\n    order: 3; }\n  .slds-max-small-order--4 {\n    order: 4; }\n  .slds-max-small-order--5 {\n    order: 5; }\n  .slds-max-small-order--6 {\n    order: 6; }\n  .slds-max-small-order--7 {\n    order: 7; }\n  .slds-max-small-order--8 {\n    order: 8; } }\n\n@media (min-width: 48em) {\n  .slds-medium-size--1-of-1 {\n    width: 100%; }\n  .slds-medium-size--1-of-2 {\n    width: 50%; }\n  .slds-medium-size--2-of-2 {\n    width: 100%; }\n  .slds-medium-size--1-of-3 {\n    width: 33.33333%; }\n  .slds-medium-size--2-of-3 {\n    width: 66.66667%; }\n  .slds-medium-size--3-of-3 {\n    width: 100%; }\n  .slds-medium-size--1-of-4 {\n    width: 25%; }\n  .slds-medium-size--2-of-4 {\n    width: 50%; }\n  .slds-medium-size--3-of-4 {\n    width: 75%; }\n  .slds-medium-size--4-of-4 {\n    width: 100%; }\n  .slds-medium-size--1-of-5 {\n    width: 20%; }\n  .slds-medium-size--2-of-5 {\n    width: 40%; }\n  .slds-medium-size--3-of-5 {\n    width: 60%; }\n  .slds-medium-size--4-of-5 {\n    width: 80%; }\n  .slds-medium-size--5-of-5 {\n    width: 100%; }\n  .slds-medium-size--1-of-6 {\n    width: 16.66667%; }\n  .slds-medium-size--2-of-6 {\n    width: 33.33333%; }\n  .slds-medium-size--3-of-6 {\n    width: 50%; }\n  .slds-medium-size--4-of-6 {\n    width: 66.66667%; }\n  .slds-medium-size--5-of-6 {\n    width: 83.33333%; }\n  .slds-medium-size--6-of-6 {\n    width: 100%; }\n  .slds-medium-size--1-of-7 {\n    width: 14.28571%; }\n  .slds-medium-size--2-of-7 {\n    width: 28.57143%; }\n  .slds-medium-size--3-of-7 {\n    width: 42.85714%; }\n  .slds-medium-size--4-of-7 {\n    width: 57.14286%; }\n  .slds-medium-size--5-of-7 {\n    width: 71.42857%; }\n  .slds-medium-size--6-of-7 {\n    width: 85.71429%; }\n  .slds-medium-size--7-of-7 {\n    width: 100%; }\n  .slds-medium-size--1-of-8 {\n    width: 12.5%; }\n  .slds-medium-size--2-of-8 {\n    width: 25%; }\n  .slds-medium-size--3-of-8 {\n    width: 37.5%; }\n  .slds-medium-size--4-of-8 {\n    width: 50%; }\n  .slds-medium-size--5-of-8 {\n    width: 62.5%; }\n  .slds-medium-size--6-of-8 {\n    width: 75%; }\n  .slds-medium-size--7-of-8 {\n    width: 87.5%; }\n  .slds-medium-size--8-of-8 {\n    width: 100%; }\n  .slds-medium-size--1-of-12 {\n    width: 8.33333%; }\n  .slds-medium-size--2-of-12 {\n    width: 16.66667%; }\n  .slds-medium-size--3-of-12 {\n    width: 25%; }\n  .slds-medium-size--4-of-12 {\n    width: 33.33333%; }\n  .slds-medium-size--5-of-12 {\n    width: 41.66667%; }\n  .slds-medium-size--6-of-12 {\n    width: 50%; }\n  .slds-medium-size--7-of-12 {\n    width: 58.33333%; }\n  .slds-medium-size--8-of-12 {\n    width: 66.66667%; }\n  .slds-medium-size--9-of-12 {\n    width: 75%; }\n  .slds-medium-size--10-of-12 {\n    width: 83.33333%; }\n  .slds-medium-size--11-of-12 {\n    width: 91.66667%; }\n  .slds-medium-size--12-of-12 {\n    width: 100%; }\n  .slds-medium-order--1 {\n    order: 1; }\n  .slds-medium-order--2 {\n    order: 2; }\n  .slds-medium-order--3 {\n    order: 3; }\n  .slds-medium-order--4 {\n    order: 4; }\n  .slds-medium-order--5 {\n    order: 5; }\n  .slds-medium-order--6 {\n    order: 6; }\n  .slds-medium-order--7 {\n    order: 7; }\n  .slds-medium-order--8 {\n    order: 8; }\n  .slds-medium-order--9 {\n    order: 9; }\n  .slds-medium-order--10 {\n    order: 10; }\n  .slds-medium-order--11 {\n    order: 11; }\n  .slds-medium-order--12 {\n    order: 12; } }\n\n@media (max-width: 48em) {\n  .slds-max-medium-size--1-of-1 {\n    width: 100%; }\n  .slds-max-medium-size--1-of-2 {\n    width: 50%; }\n  .slds-max-medium-size--2-of-2 {\n    width: 100%; }\n  .slds-max-medium-size--1-of-3 {\n    width: 33.33333%; }\n  .slds-max-medium-size--2-of-3 {\n    width: 66.66667%; }\n  .slds-max-medium-size--3-of-3 {\n    width: 100%; }\n  .slds-max-medium-size--1-of-4 {\n    width: 25%; }\n  .slds-max-medium-size--2-of-4 {\n    width: 50%; }\n  .slds-max-medium-size--3-of-4 {\n    width: 75%; }\n  .slds-max-medium-size--4-of-4 {\n    width: 100%; }\n  .slds-max-medium-size--1-of-5 {\n    width: 20%; }\n  .slds-max-medium-size--2-of-5 {\n    width: 40%; }\n  .slds-max-medium-size--3-of-5 {\n    width: 60%; }\n  .slds-max-medium-size--4-of-5 {\n    width: 80%; }\n  .slds-max-medium-size--5-of-5 {\n    width: 100%; }\n  .slds-max-medium-size--1-of-6 {\n    width: 16.66667%; }\n  .slds-max-medium-size--2-of-6 {\n    width: 33.33333%; }\n  .slds-max-medium-size--3-of-6 {\n    width: 50%; }\n  .slds-max-medium-size--4-of-6 {\n    width: 66.66667%; }\n  .slds-max-medium-size--5-of-6 {\n    width: 83.33333%; }\n  .slds-max-medium-size--6-of-6 {\n    width: 100%; }\n  .slds-max-medium-size--1-of-7 {\n    width: 14.28571%; }\n  .slds-max-medium-size--2-of-7 {\n    width: 28.57143%; }\n  .slds-max-medium-size--3-of-7 {\n    width: 42.85714%; }\n  .slds-max-medium-size--4-of-7 {\n    width: 57.14286%; }\n  .slds-max-medium-size--5-of-7 {\n    width: 71.42857%; }\n  .slds-max-medium-size--6-of-7 {\n    width: 85.71429%; }\n  .slds-max-medium-size--7-of-7 {\n    width: 100%; }\n  .slds-max-medium-size--1-of-8 {\n    width: 12.5%; }\n  .slds-max-medium-size--2-of-8 {\n    width: 25%; }\n  .slds-max-medium-size--3-of-8 {\n    width: 37.5%; }\n  .slds-max-medium-size--4-of-8 {\n    width: 50%; }\n  .slds-max-medium-size--5-of-8 {\n    width: 62.5%; }\n  .slds-max-medium-size--6-of-8 {\n    width: 75%; }\n  .slds-max-medium-size--7-of-8 {\n    width: 87.5%; }\n  .slds-max-medium-size--8-of-8 {\n    width: 100%; }\n  .slds-max-medium-size--1-of-12 {\n    width: 8.33333%; }\n  .slds-max-medium-size--2-of-12 {\n    width: 16.66667%; }\n  .slds-max-medium-size--3-of-12 {\n    width: 25%; }\n  .slds-max-medium-size--4-of-12 {\n    width: 33.33333%; }\n  .slds-max-medium-size--5-of-12 {\n    width: 41.66667%; }\n  .slds-max-medium-size--6-of-12 {\n    width: 50%; }\n  .slds-max-medium-size--7-of-12 {\n    width: 58.33333%; }\n  .slds-max-medium-size--8-of-12 {\n    width: 66.66667%; }\n  .slds-max-medium-size--9-of-12 {\n    width: 75%; }\n  .slds-max-medium-size--10-of-12 {\n    width: 83.33333%; }\n  .slds-max-medium-size--11-of-12 {\n    width: 91.66667%; }\n  .slds-max-medium-size--12-of-12 {\n    width: 100%; }\n  .slds-max-medium-order--1 {\n    order: 1; }\n  .slds-max-medium-order--2 {\n    order: 2; }\n  .slds-max-medium-order--3 {\n    order: 3; }\n  .slds-max-medium-order--4 {\n    order: 4; }\n  .slds-max-medium-order--5 {\n    order: 5; }\n  .slds-max-medium-order--6 {\n    order: 6; }\n  .slds-max-medium-order--7 {\n    order: 7; }\n  .slds-max-medium-order--8 {\n    order: 8; }\n  .slds-max-medium-order--9 {\n    order: 9; }\n  .slds-max-medium-order--10 {\n    order: 10; }\n  .slds-max-medium-order--11 {\n    order: 11; }\n  .slds-max-medium-order--12 {\n    order: 12; } }\n\n@media (min-width: 64em) {\n  .slds-large-size--1-of-1 {\n    width: 100%; }\n  .slds-large-size--1-of-2 {\n    width: 50%; }\n  .slds-large-size--2-of-2 {\n    width: 100%; }\n  .slds-large-size--1-of-3 {\n    width: 33.33333%; }\n  .slds-large-size--2-of-3 {\n    width: 66.66667%; }\n  .slds-large-size--3-of-3 {\n    width: 100%; }\n  .slds-large-size--1-of-4 {\n    width: 25%; }\n  .slds-large-size--2-of-4 {\n    width: 50%; }\n  .slds-large-size--3-of-4 {\n    width: 75%; }\n  .slds-large-size--4-of-4 {\n    width: 100%; }\n  .slds-large-size--1-of-5 {\n    width: 20%; }\n  .slds-large-size--2-of-5 {\n    width: 40%; }\n  .slds-large-size--3-of-5 {\n    width: 60%; }\n  .slds-large-size--4-of-5 {\n    width: 80%; }\n  .slds-large-size--5-of-5 {\n    width: 100%; }\n  .slds-large-size--1-of-6 {\n    width: 16.66667%; }\n  .slds-large-size--2-of-6 {\n    width: 33.33333%; }\n  .slds-large-size--3-of-6 {\n    width: 50%; }\n  .slds-large-size--4-of-6 {\n    width: 66.66667%; }\n  .slds-large-size--5-of-6 {\n    width: 83.33333%; }\n  .slds-large-size--6-of-6 {\n    width: 100%; }\n  .slds-large-size--1-of-7 {\n    width: 14.28571%; }\n  .slds-large-size--2-of-7 {\n    width: 28.57143%; }\n  .slds-large-size--3-of-7 {\n    width: 42.85714%; }\n  .slds-large-size--4-of-7 {\n    width: 57.14286%; }\n  .slds-large-size--5-of-7 {\n    width: 71.42857%; }\n  .slds-large-size--6-of-7 {\n    width: 85.71429%; }\n  .slds-large-size--7-of-7 {\n    width: 100%; }\n  .slds-large-size--1-of-8 {\n    width: 12.5%; }\n  .slds-large-size--2-of-8 {\n    width: 25%; }\n  .slds-large-size--3-of-8 {\n    width: 37.5%; }\n  .slds-large-size--4-of-8 {\n    width: 50%; }\n  .slds-large-size--5-of-8 {\n    width: 62.5%; }\n  .slds-large-size--6-of-8 {\n    width: 75%; }\n  .slds-large-size--7-of-8 {\n    width: 87.5%; }\n  .slds-large-size--8-of-8 {\n    width: 100%; }\n  .slds-large-size--1-of-12 {\n    width: 8.33333%; }\n  .slds-large-size--2-of-12 {\n    width: 16.66667%; }\n  .slds-large-size--3-of-12 {\n    width: 25%; }\n  .slds-large-size--4-of-12 {\n    width: 33.33333%; }\n  .slds-large-size--5-of-12 {\n    width: 41.66667%; }\n  .slds-large-size--6-of-12 {\n    width: 50%; }\n  .slds-large-size--7-of-12 {\n    width: 58.33333%; }\n  .slds-large-size--8-of-12 {\n    width: 66.66667%; }\n  .slds-large-size--9-of-12 {\n    width: 75%; }\n  .slds-large-size--10-of-12 {\n    width: 83.33333%; }\n  .slds-large-size--11-of-12 {\n    width: 91.66667%; }\n  .slds-large-size--12-of-12 {\n    width: 100%; }\n  .slds-large-order--1 {\n    order: 1; }\n  .slds-large-order--2 {\n    order: 2; }\n  .slds-large-order--3 {\n    order: 3; }\n  .slds-large-order--4 {\n    order: 4; }\n  .slds-large-order--5 {\n    order: 5; }\n  .slds-large-order--6 {\n    order: 6; }\n  .slds-large-order--7 {\n    order: 7; }\n  .slds-large-order--8 {\n    order: 8; }\n  .slds-large-order--9 {\n    order: 9; }\n  .slds-large-order--10 {\n    order: 10; }\n  .slds-large-order--11 {\n    order: 11; }\n  .slds-large-order--12 {\n    order: 12; } }\n\n@media (max-width: 64em) {\n  .slds-max-large-size--1-of-1 {\n    width: 100%; }\n  .slds-max-large-size--1-of-2 {\n    width: 50%; }\n  .slds-max-large-size--2-of-2 {\n    width: 100%; }\n  .slds-max-large-size--1-of-3 {\n    width: 33.33333%; }\n  .slds-max-large-size--2-of-3 {\n    width: 66.66667%; }\n  .slds-max-large-size--3-of-3 {\n    width: 100%; }\n  .slds-max-large-size--1-of-4 {\n    width: 25%; }\n  .slds-max-large-size--2-of-4 {\n    width: 50%; }\n  .slds-max-large-size--3-of-4 {\n    width: 75%; }\n  .slds-max-large-size--4-of-4 {\n    width: 100%; }\n  .slds-max-large-size--1-of-5 {\n    width: 20%; }\n  .slds-max-large-size--2-of-5 {\n    width: 40%; }\n  .slds-max-large-size--3-of-5 {\n    width: 60%; }\n  .slds-max-large-size--4-of-5 {\n    width: 80%; }\n  .slds-max-large-size--5-of-5 {\n    width: 100%; }\n  .slds-max-large-size--1-of-6 {\n    width: 16.66667%; }\n  .slds-max-large-size--2-of-6 {\n    width: 33.33333%; }\n  .slds-max-large-size--3-of-6 {\n    width: 50%; }\n  .slds-max-large-size--4-of-6 {\n    width: 66.66667%; }\n  .slds-max-large-size--5-of-6 {\n    width: 83.33333%; }\n  .slds-max-large-size--6-of-6 {\n    width: 100%; }\n  .slds-max-large-size--1-of-7 {\n    width: 14.28571%; }\n  .slds-max-large-size--2-of-7 {\n    width: 28.57143%; }\n  .slds-max-large-size--3-of-7 {\n    width: 42.85714%; }\n  .slds-max-large-size--4-of-7 {\n    width: 57.14286%; }\n  .slds-max-large-size--5-of-7 {\n    width: 71.42857%; }\n  .slds-max-large-size--6-of-7 {\n    width: 85.71429%; }\n  .slds-max-large-size--7-of-7 {\n    width: 100%; }\n  .slds-max-large-size--1-of-8 {\n    width: 12.5%; }\n  .slds-max-large-size--2-of-8 {\n    width: 25%; }\n  .slds-max-large-size--3-of-8 {\n    width: 37.5%; }\n  .slds-max-large-size--4-of-8 {\n    width: 50%; }\n  .slds-max-large-size--5-of-8 {\n    width: 62.5%; }\n  .slds-max-large-size--6-of-8 {\n    width: 75%; }\n  .slds-max-large-size--7-of-8 {\n    width: 87.5%; }\n  .slds-max-large-size--8-of-8 {\n    width: 100%; }\n  .slds-max-large-size--1-of-12 {\n    width: 8.33333%; }\n  .slds-max-large-size--2-of-12 {\n    width: 16.66667%; }\n  .slds-max-large-size--3-of-12 {\n    width: 25%; }\n  .slds-max-large-size--4-of-12 {\n    width: 33.33333%; }\n  .slds-max-large-size--5-of-12 {\n    width: 41.66667%; }\n  .slds-max-large-size--6-of-12 {\n    width: 50%; }\n  .slds-max-large-size--7-of-12 {\n    width: 58.33333%; }\n  .slds-max-large-size--8-of-12 {\n    width: 66.66667%; }\n  .slds-max-large-size--9-of-12 {\n    width: 75%; }\n  .slds-max-large-size--10-of-12 {\n    width: 83.33333%; }\n  .slds-max-large-size--11-of-12 {\n    width: 91.66667%; }\n  .slds-max-large-size--12-of-12 {\n    width: 100%; }\n  .slds-max-large-order--1 {\n    order: 1; }\n  .slds-max-large-order--2 {\n    order: 2; }\n  .slds-max-large-order--3 {\n    order: 3; }\n  .slds-max-large-order--4 {\n    order: 4; }\n  .slds-max-large-order--5 {\n    order: 5; }\n  .slds-max-large-order--6 {\n    order: 6; }\n  .slds-max-large-order--7 {\n    order: 7; }\n  .slds-max-large-order--8 {\n    order: 8; }\n  .slds-max-large-order--9 {\n    order: 9; }\n  .slds-max-large-order--10 {\n    order: 10; }\n  .slds-max-large-order--11 {\n    order: 11; }\n  .slds-max-large-order--12 {\n    order: 12; } }\n\n/* Lightning Design System 0.12.1 */\n.slds-hide {\n  display: none; }\n\n.slds-show {\n  display: block; }\n\n.slds-show--inline-block {\n  display: inline-block; }\n\n.slds-show--inline {\n  display: inline; }\n\n/* Lightning Design System 0.12.1 */\n.slds-hidden {\n  visibility: hidden; }\n\n.slds-visible {\n  visibility: visible; }\n\n/* Lightning Design System 0.12.1 */\n.slds-transition-hide {\n  opacity: 0; }\n\n.slds-transition-show {\n  opacity: 1; }\n\n/* Lightning Design System 0.12.1 */\n.slds-collapsed {\n  height: 0;\n  overflow: hidden; }\n\n.slds-expanded {\n  height: auto;\n  overflow: visible; }\n\n/* Lightning Design System 0.12.1 */\n.slds-assistive-text {\n  position: absolute !important;\n  margin: -1px !important;\n  border: 0 !important;\n  padding: 0 !important;\n  width: 1px !important;\n  height: 1px !important;\n  overflow: hidden !important;\n  clip: rect(0 0 0 0) !important; }\n\n/* Lightning Design System 0.12.1 */\n.slds-x-small-show {\n  display: none; }\n  @media (min-width: 320px) {\n    .slds-x-small-show {\n      display: block; }\n      .slds-x-small-show--inline-block {\n        display: inline-block; }\n      .slds-x-small-show--inline {\n        display: inline; } }\n\n.slds-x-small-show-only {\n  display: none; }\n  @media (min-width: 320px) and (max-width: 479px) {\n    .slds-x-small-show-only {\n      display: block; }\n      .slds-x-small-show-only--inline-block {\n        display: inline-block; }\n      .slds-x-small-show-only--inline {\n        display: inline; } }\n\n@media (max-width: 479px) {\n  .slds-max-x-small-hide {\n    display: none; } }\n\n.slds-small-show {\n  display: none; }\n  @media (min-width: 480px) {\n    .slds-small-show {\n      display: block; }\n      .slds-small-show--inline-block {\n        display: inline-block; }\n      .slds-small-show--inline {\n        display: inline; } }\n\n.slds-small-show-only {\n  display: none; }\n  @media (min-width: 480px) and (max-width: 767px) {\n    .slds-small-show-only {\n      display: block; }\n      .slds-small-show-only--inline-block {\n        display: inline-block; }\n      .slds-small-show-only--inline {\n        display: inline; } }\n\n@media (max-width: 767px) {\n  .slds-max-small-hide {\n    display: none; } }\n\n.slds-medium-show {\n  display: none; }\n  @media (min-width: 768px) {\n    .slds-medium-show {\n      display: block; }\n      .slds-medium-show--inline-block {\n        display: inline-block; }\n      .slds-medium-show--inline {\n        display: inline; } }\n\n.slds-medium-show-only {\n  display: none; }\n  @media (min-width: 768px) and (max-width: 1023px) {\n    .slds-medium-show-only {\n      display: block; }\n      .slds-medium-show-only--inline-block {\n        display: inline-block; }\n      .slds-medium-show-only--inline {\n        display: inline; } }\n\n@media (max-width: 1023px) {\n  .slds-max-medium-hide {\n    display: none; } }\n\n.slds-large-show {\n  display: none; }\n  @media (min-width: 1024px) {\n    .slds-large-show {\n      display: block; }\n      .slds-large-show--inline-block {\n        display: inline-block; }\n      .slds-large-show--inline {\n        display: inline; } }\n\n@media print {\n  *,\n  *:before,\n  *:after {\n    background: transparent !important;\n    color: #000 !important;\n    box-shadow: none !important;\n    text-shadow: none !important; }\n  a,\n  a:visited {\n    text-decoration: underline; }\n  a[href]:after {\n    content: \" (\" attr(href) \")\"; }\n  abbr[title]:after {\n    content: \" (\" attr(title) \")\"; }\n  a[href^=\"#\"]:after,\n  a[href^=\"javascript:\"]:after {\n    content: \"\"; }\n  pre,\n  blockquote {\n    border: 1px solid #999;\n    page-break-inside: avoid; }\n  thead {\n    display: table-header-group; }\n  tr,\n  img {\n    page-break-inside: avoid; }\n  img {\n    max-width: 100% !important; }\n  p,\n  h2,\n  h3 {\n    orphans: 3;\n    widows: 3; }\n  h2,\n  h3 {\n    page-break-after: avoid; } }\n\nbody {\n  background-color: #DDEAFA;\n  font-size: 24px; }\n\n::-webkit-input-placeholder {\n  color: plum;\n  font-size: 24px; }\n\nli.automatch:hover {\n  background-color: lightyellow;\n  cursor: pointer; }\n\n.catalog-container {\n  height: 100%;\n  padding-top: 2rem;\n  padding-bottom: 2rem; }\n", ""]);

	// exports


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ }
]);