dojo.provide('geonef.jig.util');

dojo.mixin(geonef.jig.util,
{

  getClass: function(name, require) {
    if (dojo.isFunction(name)) {
      return name;
    }
    var Class = dojo.getObject(name);
    if (!dojo.isFunction(Class)) {
      require = require === undefined ? true : require;
      //console.log('loading class', name, require);
      if (require) {
        dojo['require'](name);
      }
      Class = dojo.getObject(name);
    }
    if (!dojo.isFunction(Class)) {
      console.error(name, 'is not a class!', Class, arguments);
      throw new Error(name+' is not a class!');
    }
    return Class;
  },

  getFirstNamedDescendants: function(node) {
    // summary:
    //   made as a separate function to allow child-classes to use it and include widgets outside this' domNode
    //
    var widgets = [];
    dijit.findWidgets(node).forEach(
      function(w) {
        if (w.name) {
          widgets.push(w);
        } else {
          geonef.jig.util.getFirstNamedDescendants(w.domNode).forEach(
            function(w2) { widgets.push(w2); });
        }
      }
    );
    return widgets;
  },

  unserializePhp: function(str) {
    // sumary:
    //   Unserializes a PHP value serialized through serialize()
    //
    // NOT USED (NOR TESTED) AT THE MOMENT!
    //
    // see:
    //        http://en.php.net/manual/en/function.serialize.php
    //
    var _getLength = function(input) {
      input = input.substring(2);
      var length = Number(input.substr(0, input.indexOf(':')));
      return length;
    };
    var doUnserialize;
    doUnserialize = function(input) {
      var length = 0;
      switch (input.charAt(0)) {
        /**
         * Array
         */
      case 'a':
        length = _getLength(input);
        input  = input.substr(String(length).length + 4);

        var arr   = new Array();
        var key   = null;
        var value = null;

        for (var i=0; i<length; ++i) {
          key   = doUnserialize(input);
          input = key[1];

          value = doUnserialize(input);
          input = value[1];

          arr[key[0]] = value[0];
        }

        input = input.substr(1);
        return [arr, input];
        break;

        /**
         * Objects
         */
      case 'O':
        length = _getLength(input);
        var classname = String(input.substr(String(length).length + 4, length));

        input  = input.substr(String(length).length + 6 + length);
        var numProperties = Number(input.substring(0, input.indexOf(':')));
        input = input.substr(String(numProperties).length + 2);

        var obj      = new Object();
        var property = null;
        var value    = null;

        for (var i=0; i<numProperties; ++i) {
          key   = doUnserialize(input);
          input = key[1];

          // Handle private/protected
          key[0] = key[0].replace(new RegExp('^\x00' + classname + '\x00'), '');
          key[0] = key[0].replace(new RegExp('^\x00\\*\x00'), '');

          value = doUnserialize(input);
          input = value[1];

          obj[key[0]] = value[0];
        }

        input = input.substr(1);
        return [obj, input];
        break;

        /**
         * Strings
         */
      case 's':
        length = _getLength(input);
        return [String(input.substr(String(length).length + 4, length)), input.substr(String(length).length + 6 + length)];
        break;

        /**
         * Integers and doubles
         */
      case 'i':
      case 'd':
        var num = Number(input.substring(2, input.indexOf(';')));
        return [num, input.substr(String(num).length + 3)];
        break;

        /**
         * Booleans
         */
      case 'b':
        var bool = (input.substr(2, 1) == 1);
        return [bool, input.substr(4)];
        break;

        /**
         * Null
         */
      case 'N':
        return [null, input.substr(2)];
        break;

        /**
         * Unsupported
         */
      case 'o':
      case 'r':
      case 'C':
      case 'R':
      case 'U':
        console.err('Error: Unsupported PHP data type found!');

        /**
         * Error
         */
      default:
        return [null, null];
        break;
      }
    };
    var result = doUnserialize(str);
    return result[0];
  }


});
