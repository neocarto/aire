dojo.provide('geonef.jig._base');

dojo.require('geonef.jig._base.Deferred');
dojo.require('dijit._Contained');

dojo.mixin(geonef.jig,
{
  /**
   * Makes a single-time dojo.connect
   *
   * This works the same as with dojo.connect, but for once only:
   * the handler is automatically disconnected the first time
   * the method is called.
   *
   * However, the connection can be canceled before the call if needed,
   * simply by calling dojo.disconnect.
   *
   * @param {!Object} obj  Source object for event function
   * @param {string} event Name of event function in obj
   * @param {Object} context Object to bind to the method as "this"
   * @param {function()|string} method Function or method name of context
   * @return {Object} Handler for use with dojo.disconnect.
   */
  connectOnce: function(obj, event, context, method) {
    var _h;
    _h = dojo.connect(obj, event, context, function() {
                   dojo.disconnect(_h);
                   method.apply(context, arguments);
                 });
    return _h;
  },

  /**
   * Same as dojo.map, but also works with objects.
   *
   * If an array is given, it's the same than dojo.map.
   *
   * The callback function is called with the following arguments:
   *          - the value of the current property
   *          - the key of the current property
   *          - the entire source object
   *
   * @param {!Object|Array} obj object or array to iterate on
   * @param {function(*, string|number, !Object|Array)} func callback function
   * @param {Object=} thisObj object to bind to callback function as "this"
   */
  map: function(obj, func, thisObj) {
    if (dojo.isArray(obj)) {
      return dojo.map(obj, func, map);
    }
    var newObj = {};
    func = dojo.hitch(thisObj, func);
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        newObj[key] = func(obj[key], key, obj);
      }
    }
    return newObj;
  },

  /**
   * Same as dojo.filter, but also works with objects.
   *
   * If an array is given, it's the same than dojo.filter.
   *
   * If an object is given, the callback function is called for each value
   * of the object. The returned object contains the values where
   * the callback has returned true.
   * The callback function is called with the following arguments:
   *          - the value of the current property
   *          - the key of the current property
   *          - the entire source object
   *
   * @param {!Object|Array} obj object or array to iterate on
   * @param {function(*, string|number, Object|Array): boolean} func callback function
   * @param {Object=} thisObj object to bind to callback function as "this"
   */
  filter: function(obj, func, thisObj) {
    if (dojo.isArray(obj)) {
      return dojo.filter(obj, func, thisObj);
    }
    var newObj = {};
    func = dojo.hitch(thisObj, func);
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (!!func(obj[key], key, obj)) {
          newObj[key] = obj[key];
        }
      }
    }
    return newObj;
  },

  // we should have a different name for working on objects
  // (to avoid confusion between objects and arrays)
  // dojox.lang.functional
  // dojox.lang.functional.forIn
  // http://dojo-toolkit.33424.n3.nabble.com/For-in-helpers-td812651.html
  // http://mail.dojotoolkit.org/pipermail/dojo-interest/2010-May/046043.html

  /**
   * Same as dojo.forEach, but also works with objects.
   *
   * If an array is given, it's the same than dojo.forEach.
   *
   * If an object is given, iterates over its properties.
   * In that situation, the given function is called with
   * the following arguments:
   *          - the value of the current property
   *          - the key of the current property
   *          - the entire source object
   *
   * @param {!Object|Array} obj object or array to iterate on
   * @param {function(*, string|number, Object|Array)} func callback function
   * @param {Object=} thisObj object to bind to callback function as "this"
   */
  forEach: function(obj, func, thisObj) {
    if (dojo.isArray(obj)) {
      return dojo.forEach(obj, func, thisObj);
    }
    func = dojo.hitch(thisObj, func);
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        func(obj[key], key, obj);
      }
    }
    return obj;
  },

  /**
   * Same as dojo.indexOf, but also works with objects
   *
   * If an array is given, it's the same than dojo.indexOf.
   *
   * If an object is given, it's (own) properties are iterated
   * until the value is found. The matching key is returned.
   * If the value is not found, the function returns -1.
   *
   * @param {!Object|Array} haystack object or array to search
   * @param {!*}            needle   value to search for
   */
  indexOf: function(haystack, needle) {
    if (dojo.isArray(haystack)) {
      return dojo.indexOf(haystack, needle);
    }
    for (var i in haystack) {
      if (haystack.hasOwnProperty(i) && haystack[i] === needle) {
        return i;
      }
    }
    return -1;
  },

  /**
   * Make a DOM element using the specified structure
   *
   * Args is an array like [tagName, attributeObj, content].
   * "content" is optionnal, can be another args, or an array of args.
   *
   * This way, whole DOM trees can be specified at once.
   *
   * Attributes are defined in args[1] ; the following magic
   * attributes are supported:
   *   - 'attachPoint': will attach the node to the provided obj
   *                    as the key whose name is the value of that
   *                    'attachPoint' property.
   *
   * @param {Array}             args
   * @param {?Object}           obj
   * @return {?DOMElement}
   */
  makeDOM: function(args, obj) {
    //console.log('makeDOM', arguments);
    if (dojo.isArray(args[0])) {
      args.forEach(function(def) { geonef.jig.makeDOM(def, obj); });
      return null;
    }
    var attrs = dojo.mixin({}, args[1]);
    var magic = {};
    ['attachPoint', '_insert'].forEach(
        function(attr) {
          if (attrs[attr]) {
            magic[attr] = attrs[attr];
            delete attrs[attr];
          }
        });
    var node = dojo.create(args[0], attrs);
    if (args[2]) {
      var child = args[2];
      if (dojo.isArray(child)) {
        if (dojo.isString(child[0])) {
          // child is an args array for makeDOM
          var childNode = geonef.jig.makeDOM(child, obj);
          node.appendChild(childNode);
        } else {
          // assume child is an array of args
          child.map(function(c) { return geonef.jig.makeDOM(c, obj); })
            .forEach(function(childNode) {
                       node.appendChild(childNode);
                     });
        }
      } else {
        // scalar content value - set as text
        node.innerHTML = child;
      }
    }
    if (magic.attachPoint && obj) {
      obj[magic.attachPoint] = node;
    }
    if (magic._insert) {
      magic._insert.appendChild(node);
    }
    return node;
  },

  getParent: function(w) {
    return w.getParent ? w.getParent() :
       dijit._Contained.prototype.getParent.call(w);
  }

});
