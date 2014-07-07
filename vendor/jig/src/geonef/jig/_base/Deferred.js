
dojo.provide('geonef.jig._base.Deferred');

dojo.require('geonef.jig.widget.Processing');
/**
 * Add dependency functionnalities to dojo.Deferred
 *
 * @class
 * @todo error handling!
 */
dojo.declare('geonef.jig.Deferred', dojo.Deferred,
{

  constructor: function(depCount) {
    //console.log('constructor', this, arguments);
    // copied from parent
    // this.chain = [];
    // this.id = this._nextId();
    // this.fired = -1;
    // this.paused = 0;
    // this.results = [null, null];
    // this.canceller = dojo.isFunction(depCount) ? depCount : undefined;
    // this.silentlyCancelled = false;
    // this.isFiring = false;
    // owns
    this.depCount = 1; //dojo.isFunction(depCount) || depCount === undefined ?
      //1 : depCount; // for this.callback
    this.origCallback = this.callback;
    this.callback = function() {
      if (this._calledCallback) { return; }
      this._calledCallback = true;
      this._satisfyOneDependency();
    };
  },

  dependsOnNew: function() {
    // returns a function which need to be called later
    // to "satisfy" the dependency
    if (!this.depCount) {
      console.warn('Deferred has fired. dependsOnNew() '
                   + 'returns dumb function!', this);
      //throw new Error('Deferred has fired. It makes no sense to create a dep!');
      return function() {};
    }
    ++this.depCount;
    //console.log('DEP++', this.depCount, this);
    return dojo.hitch(this, '_satisfyOneDependency');
  },

  dependsOn: function(deferred) {
    deferred.addCallback(this.dependsOnNew());
    return this;
  },

  dependsOnCall: function(obj, name) {
    geonef.jig.connectOnce(obj, name, this, this.dependsOnNew());
    return this;
  },

  dependsOnCallback: function(deferred, func) {
    var dep = this.dependsOnNew();
    deferred.addCallback(function() { func(); dep(); });
  },

  // jigCallback: function() {
  //   console.log('callback', this, arguments);
  //   if (this._calledCallback) { return; }
  //   this._calledCallback = true;
  //   this._satisfyOneDependency();
  // },

  /**
   * @param {Object} obj
   * @param {Array.<string>} methods
   */
  deferCall: function(obj, methods) {
    // obj: object
    // methods: array of string
    var self = this;
    (dojo.isArray(methods) ? methods : [methods]).forEach(
        function(method) {
          var _m = obj[method];
          obj[method] =
              function() {
                var _args = arguments;
                self.addCallback(
                    function() {
                      _m.apply(obj, _args);
                    });
              };
        });
  },

  _satisfyOneDependency: function() {
    if (!this.depCount) {
      console.warn('_satisfyOneDependency: already fired', this);
      return; // already fired
    }
    --this.depCount;
    //console.log('DEP--', this.depCount, this);
    if (!this.depCount) {
      //console.log('FIRE!', this, arguments);
      this.origCallback();
      this.afterCallback();
      //dojo.Deferred.prototype.callback.apply(this, []);
    }
  },

  afterCallback: function() {
    if (this.control) {
      this.control.end();
    }
  },


  hasFired: function() {
    return this.fired !== -1;
  },

  setControl: function(node) {
    if (!this.hasFired()) {
      this.control = new geonef.jig.widget.Processing({ processingNode: node });
      this.control.startup();
    }
    return this;
  }

});
