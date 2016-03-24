/* global module */
'use strict';
var calendarAPI = (function() {
  // Your Client ID can be retrieved from your project in the Google
  // Developer Console, https://console.developers.google.com
  var _clientId = '';
  var _accessToken = null;
  var _promiseImplementation = null;

  var BASE_URI = ' https://www.googleapis.com/calendar/v3';
  // Represents the scope in the gApi that you are requesting permission for.
  // In this case we want to have read/write permission on the calendar 
  // endpoint.
  var SCOPES = ["https://www.googleapis.com/auth/calendar"];


  var Constr = function(clientId) {
    if(clientId){
      _clientId = clientId;
    }
  };

  Constr.prototype = {
    constructor: calendarAPI
  };
  /**
   * Control if the current application (domain) has been authenticated before.
   * @return Promise{Object} Null if there has not been autenticatio, the 
   *    authentication object otherwise.
   */
  Constr.prototype.isAuthenticated = function() {
    return new Promise(function(resolve,reject){
      gapi.auth.authorize(
        {
          'client_id': _clientId,
          'scope': SCOPES,
          'immediate': true
        }, 
        function(result){
          if(result.access_token){
           _accessToken = result.access_token;
           resolve(result);
          } else {
            reject(result.error);
          }
        }
      );
    });
  }

  Constr.prototype.startAuthentication = function() {
    return new Promise(function(resolve,reject){
      gapi.auth.authorize(
        {
          'client_id': _clientId,
          'scope': SCOPES,
          'immediate': false
        }, 
        function(authResult){
          console.log(authResult);
          if (authResult && !authResult.error) {
            _accessToken = authResult.access_token;
            resolve(authResult);
          } else {
            reject(authResult.error);
          }
        }
      );
    });
  }

  Constr.prototype.initializeCalendarAPI = function() {
    return new Promise(function(resolve,reject){
      gapi.client.load('calendar', 'v3', 
        function() {
          resolve();
        }
      );
    });
  }

  Constr.prototype.getCalendars = function() {
    return new Promise(function(resolve,reject){
      gapi.client.calendar.calendarList.list().execute(
        function(result){
          if (result && !result.error) {
            resolve(result);
          } else {
            reject(result.error);
          }
        }
      );
    });
  }

  Constr.prototype.getMyCalendars = function(options, callback) {
   return new Promise(function(resolve,reject){
      gapi.client.calendar.calendarList.list().execute(
        function(result){
          if (result && !result.error) {
            var listEntry = [];
            console.log(result);
            for (var i in result.items){
              var item = result.items[i];

              if (item["accessRole"]==="owner"){
                // adding only the calendar you own.s
                listEntry.push(item);
              }
            }
            resolve(listEntry);
          } else {
            reject(result.error);
          }
        }
      );
    });
   
  }


  Constr.prototype.getCalendar = function(calendarId) {
    if(!calendarId) calendarId = 'primary';
    return new Promise(function(resolve,reject){
      gapi.client.calendar.calendars.get({calendarId:'primary'}).execute(
        function(result){
          if (result && !result.error) {
            resolve(result.result);
          } else {
            reject(result.error);
          }
        }
      );
    });
  }
  
  Constr.prototype.getEvents = function(calendarId) {
    if(!calendarId) calendarId = 'primary';
    return new Promise(function(resolve,reject){
      gapi.client.calendar.events.list({
          calendarId:'primary', 
          timeMin: (new Date()).toISOString(),
          singleEvent: true
        }).execute(
        function(result){
          if (result && !result.error) {
            resolve(result.result);
          } else {
            reject(result.error);
          }
        }
      );
    });
  }


  /* Helper functions */
  var WrapPromiseWithAbort = function(promise, onAbort) {
    promise.abort = onAbort;
    return promise;
  };

  var _promiseProvider = function(promiseFunction, onAbort) {
    var returnedPromise;
    if (_promiseImplementation !== null) {
      var deferred = _promiseImplementation.defer();
      promiseFunction(function(resolvedResult) {
        deferred.resolve(resolvedResult);
      }, function(rejectedResult) {
        deferred.reject(rejectedResult);
      });
      returnedPromise = deferred.promise;
    } else {
      if (window.Promise) {
        returnedPromise = new window.Promise(promiseFunction);
      }
    }

    if (returnedPromise) {
      return new WrapPromiseWithAbort(returnedPromise, onAbort);
    } else {
      return null;
    }
  };

  var _extend = function() {
    var args = Array.prototype.slice.call(arguments);
    var target = args[0];
    var objects = args.slice(1);
    target = target || {};
    objects.forEach(function(object) {
      for (var j in object) {
        if (object.hasOwnProperty(j)) {
          target[j] = object[j];
        }
      }
    });
    return target;
  };

  var _buildUrl = function(url, parameters) {
    var qs = '';
    for (var key in parameters) {
      if (parameters.hasOwnProperty(key)) {
        var value = parameters[key];
        qs += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
      }
    }
    if (qs.length > 0) {
      // chop off last '&'
      qs = qs.substring(0, qs.length - 1);
      url = url + '?' + qs;
    }
    return url;
  };

  var _performRequest = function(requestData, callback) {

    var req = new XMLHttpRequest();

    var promiseFunction = function(resolve, reject) {

      function success(data) {
        if (resolve) {
          resolve(data);
        }
        if (callback) {
          callback(null, data);
        }
      }

      function failure() {
        if (reject) {
          reject(req);
        }
        if (callback) {
          callback(req, null);
        }
      }

      var type = requestData.type || 'GET';
      req.open(type, _buildUrl(requestData.url, requestData.params));
      if (_accessToken) {
        req.setRequestHeader('Authorization', 'Bearer ' + _accessToken);
      }

      req.onreadystatechange = function() {
        if (req.readyState === 4) {
          var data = null;
          try {
            data = req.responseText ? JSON.parse(req.responseText) : '';
          } catch (e) {
            console.error(e);
          }

          if (req.status >= 200 && req.status < 300) {
            success(data);
          } else {
            failure();
          }
        }
      };

      if (type === 'GET') {
        req.send(null);
      } else {
        req.send(requestData.postData ? JSON.stringify(requestData.postData) : null);
      }
    };

    if (callback) {
      promiseFunction();
      return null;
    } else {
      return _promiseProvider(promiseFunction, function() {
        req.abort();
      });
    }
  };

  var _checkParamsAndPerformRequest = function(requestData, options, callback) {
    var opt = {};
    var cb = null;

    if (typeof options === 'object') {
      opt = options;
      cb = callback;
    } else if (typeof options === 'function') {
      cb = options;
    }

    // options extend postData, if any. Otherwise they extend parameters sent in the url
    var type = requestData.type || 'GET';
    if (type !== 'GET' && requestData.postData) {
      requestData.postData = _extend(requestData.postData, opt);
    } else {
      requestData.params = _extend(requestData.params, opt);
    }
    return _performRequest(requestData, cb);
  };

  return Constr;
})();

if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = calendarAPI;
}