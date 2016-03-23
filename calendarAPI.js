/* global module */
'use strict';
var calendarAPI = (function() {
	// Your Client ID can be retrieved from your project in the Google
  // Developer Console, https://console.developers.google.com
  var _clientId = '';
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
	 * 		authentication object otherwise.
   */
  Constr.prototype.isAuthenticated = function() {
    return new Promise(function(resolve,reject){
    	gapi.auth.authorize(
        {
          'client_id': _clientId,
          'scope': SCOPES,
          'immediate': true
        }, 
        function(data){
        	resolve(data);
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
        		resolve(authResult);
        	} else {
        		reject(authResult.error);
        	}
        }
      );
    });
  }
  
  return Constr;
})();

if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = calendarAPI;
}