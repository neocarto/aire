
/**
 * @requires OpenLayers/Layer/TMS.js
 */

dojo.provide('geonef.ploomap.OpenLayers.Layer.LegacyTMS');

//dojo.require('dojox.io.xhrPlugins');

(function() {
   var domain = 'b.tiles.cartapatate.net';
   var withToken;
   (function() {
      var token = 'x';
      var expires;
      var deferred;

      /**
       * Whenever the token is available, the given func is called
       * with the token passed as 1st arg.
       */
      withToken = function(func) {
        //console.log('withToken', arguments, token, expires, deferred);
        if (expires && expires.getTime() > (new Date).getTime() + 1000) {
          //console.log('go with token', token);
          func(token);
        } else {
          if (!deferred) {
            deferred = new dojo.Deferred();
            //console.log('request token');
            OpenLayers.Request.GET({
              url: 'http://'+domain+'/drm/getToken:workspace',
              callback: function(req) {
                var s = req.responseText;
                //console.log('response', req, s);
                var f = s.split(':');
                token = f[0];
                var ttl = parseInt(f[1]);
                expires = new Date((new Date).getTime() + ttl * 1000);
                //console.log('got token', token, expires);
                deferred.callback();
                deferred = null;
              }
            });
          }
          deferred.addCallback(function() { func(token); });
        }
      };

    })();

/**
 * Class: OpenLayers.Layer.pmTMS
 *
 * Inherits from:
 *  - <OpenLayers.Layer.TMS>
 */
geonef.ploomap.OpenLayers.Layer.LegacyTMS = OpenLayers.Class(OpenLayers.Layer.TMS,
{

  isBaseLayer: false,
  tileOrigin: new OpenLayers.LonLat(0, 0),
  maxResolution: "auto",
  type: 'png',
  transitionEffect: 'resize',
  layerExtent: null,
  domain: domain,

  serverResolutions: [
    156543.03390625, 78271.516953125, 39135.7584765625,
    19567.87923828125, 9783.939619140625, 4891.9698095703125,
    2445.9849047851562, 1222.9924523925781, 611.4962261962891,
    305.74811309814453, 152.87405654907226, 76.43702827453613,
    38.218514137268066, 19.109257068634033, 9.554628534317017,
    4.777314267158508, 2.388657133579254, 1.194328566789627,
    0.5971642833948135
  ],

  /**
    * APIProperty: async
    * {Boolean} Request images asynchronously.  Default is true.
    */
  async: true,

  initialize: function(name, mapName, options) {
    this.mapName = mapName;
    this.pmExportMap = mapName;
    var newArguments = [];
    newArguments.push(name, 'http://'+this.domain+'/tiles/', options);
    OpenLayers.Layer.TMS.prototype.initialize.apply(this, newArguments);
  },

  /**
   * APIMethod:destroy
   */
  destroy: function() {
    // for now, nothing special to do here.
    OpenLayers.Layer.Grid.prototype.destroy.apply(this, arguments);
  },

  /**
   * APIMethod: clone
   *
   * Parameters:
   * obj - {Object}
   *
   * Returns:
   * {<OpenLayers.Layer.pmTMS>} An exact clone of this <OpenLayers.Layer.pmTMS>
   */
  clone: function (obj) {
    if (!obj) {
      obj = new geonef.ploomap.OpenLayers.Layer.LegacyTMS(this.name, this.mapName, this.options);
    }
    //get all additions from superclasses
    obj = OpenLayers.Layer.TMS.prototype.clone.apply(this, [obj]);
    // copy/set any non-init, non-simple values here
    return obj;
  },

  /**
   * Method: getURL
   *
   * Parameters:
   * bounds - {<OpenLayers.Bounds>}
   *
   * Returns:
   * {String} A string with the layer's url and parameters and also the
   *          passed-in bounds and appropriate tile size specified as
   *          parameters
   */
  getURL: function (bounds) {
    if (!this.map) { console.log('inGetUrl', this, arguments); return null; }
    bounds = this.adjustBounds(bounds);
    if (this.layerExtent &&
           (bounds.right < this.layerExtent.left ||
            bounds.left > this.layerExtent.right ||
            bounds.bottom > this.layerExtent.top ||
            bounds.top < this.layerExtent.bottom)) {
        //console.log('out of OL bounds', this, bounds, this.layerExtent);
        return null;
    }
    var res = this.map.getResolution();
    var x = Math.round((bounds.left - this.tileOrigin.lon) / (res * this.tileSize.w));
    var y = Math.round((bounds.bottom - this.tileOrigin.lat) / (res * this.tileSize.h));
    var z = OpenLayers.Util.indexOf(this.serverResolutions, res);
    /*  if (!w1) { w1 = true;
     alert('res: '+res+' bounds.L: '+bounds.left+'x: '+x);
     }*/
    var path = this.mapName + "/" + z + "-" + x + "-" + y + "." +
      this.type + "?res=" + res + '&token=' + this.token;
    var url = this.url;
    if (url instanceof Array) {
      url = this.selectUrl(path, url);
    }
    //console.log('return path', path);
    return url + path;
  },

  withToken: function(callback) {
    withToken(callback);
  },

    /**
     * Method: getURLasync
     * Get an image url this layer asynchronously, and execute a callback
     *     when the image url is generated.
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds>} A bounds representing the bbox for the
     *     request.
     * scope - {Object} The scope of the callback method.
     * prop - {String} The name of the property in the scoped object to
     *     recieve the image url.
     * callback - {Function} Function to call when image url is retrieved.
     */
    getURLasync: function(bounds, scope, prop, callback) {
      var self = this;
      withToken(
        function(token) {
          self.token = token;
          //self.async = false;
          scope[prop] = self.getURL(bounds);
          callback.call(scope);
        });
    },


  /*checkServer: function(callback) {
    console.log('checkserver', this, arguments);
    dojo.publish('jig/workspace/flash', [ "Test du server "+this.domain +
                                          " pour la couche "+this.name+" ..." ]);
    //alert('http://'+this.domain+'/check.txt');
    dojox.io.xhrPlugins.addCrossSiteXhr("http://"+this.domain+"/");
    // http://www.sitepen.com/blog/2008/07/31/cross-site-xhr-plugin-registry/
    //dojo.io.iframe.send
    dojo.xhrGet
    ({
                  url: 'http://'+this.domain+'/check.txt',
                  timeout: 5000,
                  handle: function(response) {
                    console.log('handle', arguments);
                    var msg = response === '0kap1' ? "Le test a réussi :)" : "Le test a échoué :(";
                    dojo.publish('jig/workspace/flash', [ msg ]);
                    callback(status);
                  }
                });
  },*/


  CLASS_NAME: "OpenLayers.Layer.pmTMS"

});

})();
