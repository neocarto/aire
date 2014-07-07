
dojo.provide('geonef.jig.api');

dojo.require('dojox.uuid.generateRandomUuid');

dojo.mixin(geonef.jig.api,
{
  // summary:
  //   API
  //
  // todo:
  //    implement caching based in scalar params
  //

  // url: string
  //    Default URL, if not given in params
  url: '/api',

  // requestCommonParams: object
  //    Common parameters which are added automatically to every request
  requestCommonParams: {},

  // noticeTopic: string
  //    Name of topic to publish events to. First arg is a boolean telling whether an XHR is active
  noticeTopic: 'jig/api/request',

  // _deferredRequests: object
  //    Parallel requests deferred to later execution
  _deferredRequests: {},

  // summary:
  //    Make API request
  //
  // xhrOptions: object for parameters to pass to dojo XHR.
  //    Custom params are:
  //            - defer: boolean
  //                    if true, the request is remembered, and is executed
  //                    the next time a request is made with a falsy defer.
  //
  request: function(request, xhrOptions) {
    xhrOptions = xhrOptions || {};
    var uuid = dojox.uuid.generateRandomUuid();
    geonef.jig.api._deferredRequests[uuid] = request;
    //console.log('api request', uuid, request.module, request.action);
    if (!geonef.jig.api._timeout) {
      geonef.jig.api._deferred = new geonef.jig.Deferred();
      geonef.jig.api._timeout = window.setTimeout(
          function() {
            geonef.jig.api._timeout = null;
            var reqs = dojo.mixin({}, geonef.jig.api._deferredRequests);
            geonef.jig.api._deferredRequests = {};
            geonef.jig.api._deferred.dependsOn(geonef.jig.api._doRequest(reqs, xhrOptions));
            geonef.jig.api._deferred.callback();
          }, 0);
    }
    var deferred = (new geonef.jig.Deferred()).dependsOn(geonef.jig.api._deferred);
    deferred.callback();
    return deferred;
  },

  _doRequest: function(request, xhrOptions) {

    var _processResponseReq = function(request, response, xhr) {
      var ret;
      if (request.callback) {
	//console.log('XHR: calling callback', arguments);
	if (response.status === 'error') {
	  console.error('error status from API', response);
	}
	if (response.status === 'exception') {
	  console.error('Server API exception', response);
          geonef.jig.api.processException(request, response);
	}
	ret = request.callback.apply(request.scope || window,
                                     [response, xhr]);
      }
      return ret;
    };

    var _processResponse = function(text, xhr) {
      //console.log('JiG API Response', xhr, text);
      dojo.publish('noticeTopic', [ false ]);
      var ret = 0, data = null;
      try {
	data = dojo.fromJson(text);
      }
      catch (e) {
	console.error('JiG  API response: invalid JSON string: ',
	              text, xhr);
	if (dojo.isFunction(request.transportError)) {
	  request.transportError(text, xhr);
	}
	return false;
      }
      // check if one req or many in the structure
      if (dojo.isFunction(request.callback)) {
	ret = _processResponseReq(request, data, xhr);
      } else {
	for (var i in data) {
          if (data.hasOwnProperty(i)) {
	    ret = _processResponseReq(request[i], data[i], xhr);
	  }
        }
      }
      data.callbackStatus = ret;
      //console.log('returning', ret);
      return ret;
    };

    var _processError = function(error, xhr) {
      dojo.publish('noticeTopic', [ false ]);
      console.error('JiG API Error: ', error, xhr);
    };

    var _prepareRequest = function(origRequest) {
      var ret = dojo.mixin({}, origRequest, geonef.jig.api.requestCommonParams);
      delete ret.scope;
      return ret;
    };

    var requestToSend;
    if (request.module) {
      requestToSend = _prepareRequest(request);
      //dojo.mixin(request, geonef.jig.api.requestCommonParams);
    } else {
      requestToSend = {};
      for (var i in request) {
        if (request.hasOwnProperty(i)) {
          requestToSend[i] = _prepareRequest(request[i]);
        }
      }
      //dojo.forEach(request, // forEach on object ??
      //  function(r) { dojo.mixin(r, geonef.jig.api.requestCommonParams); });
    }
    dojo.publish('noticeTopic', [ true ]);
    return dojo.xhr('POST', dojo.mixin(
                      {
                        url: xhrOptions.url || geonef.jig.api.url,
                        handleAs: 'text', //'json',
                        postData: dojo.toJson(requestToSend),
                        load: _processResponse,
                        error: _processError
                      }, xhrOptions), true);
  },

  processException: function(request, response) {
    var Class = geonef.jig.util.getClass('geonef.jig.tool.dev.ExceptionDump');
    var dump = new Class(
      dojo.mixin({ context: { request: request, response: response }},
                 response.exception));
    geonef.jig.workspace.autoAnchorWidget(dump);
    dump.startup();
    console.log('started exception', this, arguments);
  }

});
