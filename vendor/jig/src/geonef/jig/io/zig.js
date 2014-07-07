dojo.provide("geonef.jig.io.zig");

geonef.jig.io.zig = {

	apiUrl: '/api',

	send: function(data, options) {
	    var _processReq = function(request, response, xhr) {
	    	var ret;
	    	if (request.callback) {
	        	//console.log('XHR: calling callback', arguments);
	        	if (response.status === 'error' && !request.privateError) {
	        		app.onApiErrorResponse(response);
	        	}
	        	ret = request.callback(response, xhr);
	        }
	        return ret;
	    };
	    if (request.module) {
	    	dojo.mixin(request, this.requestCommonParams);
	    } else {
	    	dojo.forEach(request, function(r) {
	    		dojo.mixin(r, this.requestCommonParams);
	    	});
	    }
		dojo.publish('geonef.jig.io.zig/request', [ true ]);
	    return app.xhr('POST', dojo.mixin({
	        url: this.apiUrl,
	        handleAs: 'json',
	        postData: dojo.toJson(request),
	        load: function(data, xhr) {
	            //console.log('data from POST', data);
	    		dojo.publish('geonef.jig.io.zig/request', false);
	            var ret = 0;
	            // check if one req or many in the structure
	            if (dojo.isString(data.status)) {
	            	ret = _processReq(request, data, xhr);
	            } else {
	                for (var i in data) { if (data.hasOwnProperty(i)) {
	                	ret = _processReq(request[i], data[i], xhr);
	                }}
	            }
	            data.callbackStatus = ret;
	            //console.log('returning', ret);
	            return ret;
	        }/*,
	        error: function(error, xhr) {
				this.notice('Error');
	        }*/
	    }, xhrOptions), true);
	},

	xhr: function(method, options, hasBody) {
		var onLoad = options.load,
			onError = options.error;
		options.load = function() {
			app.notice(null);
			if (dojo.isFunction(onLoad)) {
				onLoad.apply(this, arguments);
			}
		};
		options.error = function(error, xhr) {
			console.warn("Store request error: ", error, xhr);
			console.warn("Response as text: ", xhr.responseText);
			this.notice('Loading error');
			if (dojo.isFunction(onError)) {
				onError.apply(this, arguments);
			}
		};
		this.notice();
		//console.log('making request', this, arguments);
		return dojo.xhr(method, options, hasBody);
	},

    onApiErrorResponse: function(response) {
    	var msg;
		if (response.error === 'credentials:unsufficient') {
			msg = __('error.api.unsufficientCredentials');
		} else {
			msg = __('error.api.unknown');

		}
		if (response.message !== undefined) {
			msg = __(response.message);
		}
    	alert(msg);
    },

};
