dojo.provide('geonef.jig.workspace.fx');

dojo.require('dojo.fx');
dojo.require('dojo.fx.easing');

dojo.mixin(geonef.jig.workspace.fx,
{
  color: {
    openStart: '#ffffff',
    openEnd: '#ffff50',
    close: '#ffff00',
    warn: '#ff0000',
    done: '#0000ff',
    focus: '#ffff00',
    glimpse: '#a03030'
  },

  widget: {

    open: function(div, box) {
      //console.log('open', arguments);
      var lib = geonef.jig.workspace.fx._lib
      , fx1 = dojo.animateProperty(
        {
          node: div, duration: 200,
	  properties: { backgroundColor: {
                          start: geonef.jig.workspace.fx.color.openStart,
                          end: geonef.jig.workspace.fx.color.openEnd },
                        opacity: { start: 0, end: 1 }},
	  easing: dojo.fx.easing.sinOut
        })
      , fx2 = dojo.animateProperty(
        {
          node: div, duration: 600,
	  properties: { opacity: { start: 1, end: 0 } },
	  easing: dojo.fx.easing.circIn
        })
      //, fx2 = lib.shrink({ node: div, easing: dojo.fx.easing.sinOut }, box, 0.1)
      , fx3 = dojo.fx.chain([ fx1, fx2 ]);
      //, fx1 = lib.grow({ node: div, duration: 1500 }, box, 2);
      dojo.style(div, { top: ''+box.y+'px', left: ''+box.x+'px', width: ''+box.w+'px', height: ''+box.h+'px' });
      //dojo.style(div, { top: box.y, left: box.x, width: box.w, height: box.h });
      return fx3;
    },

    close: function(div, box) {
      return null;
      var lib = geonef.jig.workspace.fx._lib
      , fx1 = lib.grow({ node: div, easing: dojo.fx.easing.sinOut }, box, 1.7);
      //, fx2 = lib.grow({ node: div, easing: dojo.fx.easing.sinIn }, box, 0.1)
      //, fx3 = dojo.fx.chain([ fx1, fx2 ]);
      dojo.style(div, { backgroundColor: geonef.jig.workspace.fx.color.close});
      return fx1;
    },

    warn: function(div, box) {
      var lib = geonef.jig.workspace.fx._lib
      , fx1 = lib.shrink({ node: div }, box, 4, dojo.fx.easing.sinOut)
      , fx2 = lib.grow({ node: div }, box, 4, dojo.fx.easing.sinOut)
      , fx3 = dojo.fx.chain([ fx1, fx2 ])
      ;
      dojo.style(div, { backgroundColor: geonef.jig.workspace.fx.color.warn });
      return fx3;
    },

    done: function(div, box) {
      var lib = geonef.jig.workspace.fx._lib
      , color = geonef.jig.workspace.fx.color.done
      , fx1 = dojo.animateProperty(
        {
          node: div, duration: 1000,
	  properties: { opacity: { start: 1, end: 0 }},
	  easing: dojo.fx.easing.sinOut
        })
      ;
      dojo.style(div, { backgroundColor: color });
      return fx1;
    },

    focus: function(div, box) {
      var lib = geonef.jig.workspace.fx._lib
      , fx1 = lib.shrink({ node: div }, box, 4, dojo.fx.easing.sinOut)
      , fx2 = dojo.animateProperty(
        {
          node: div, duration: 500,
	  properties: { opacity: { start: 1, end: 0 }},
	  easing: dojo.fx.easing.sinOut
        })
      , fx3 = dojo.fx.chain([ fx1, fx2 ])
      ;
      dojo.style(div, { backgroundColor: geonef.jig.workspace.fx.color.focus });
      return fx3;
    },

    glimpse: function(div, box) {
      //console.log('open', arguments);
      var lib = geonef.jig.workspace.fx._lib
      , fx1 = dojo.animateProperty(
        {
          node: div, duration: 600,
	  properties: { opacity: { start: 1, end: 0 }},
	  easing: dojo.fx.easing.sinIn
        });
      dojo.style(div, { top: ''+box.y+'px', left: ''+box.x+'px',
                        width: ''+box.w+'px', height: ''+box.h+'px',
                        backgroundColor: geonef.jig.workspace.fx.color.glimpse });
      //dojo.style(div, { top: box.y, left: box.x, width: box.w, height: box.h });
      return fx1;
    },

  },


  /////////////////////////////////////////////////////

  _util: {

    minFunc: function(coord, size, factor) {
      return coord - size * (factor - 1) / 2;
    }

  },

  _lib: {

    shrink: function(props, box, factor, easing) {
      //console.log('shrink', arguments);
      var minFunc = geonef.jig.workspace.fx._util.minFunc
        , f = factor ? factor : 2;;
      return dojo.animateProperty(dojo.mixin(
        {
          duration: 800,
	  properties: {
	    top: { start: minFunc(box.y, box.h, f), end: box.y },
	    left: { start: minFunc(box.x, box.w, f), end: box.x },
	    width: { start: box.w * factor, end: box.w, unit:"px" },
	    height: { start:box.h * factor, end: box.h, unit:"px" },
	    opacity: { start: 0, end: 1 }
	  },
	  easing: easing || dojo.fx.easing.bounceOut
        }, props));
    },

    grow: function(props, box, factor, easing) {
      var minFunc = geonef.jig.workspace.fx._util.minFunc
        , f = factor ? factor : 2;
      return dojo.animateProperty(dojo.mixin(
        {
          duration: 800,
          properties: {
            top: { start: box.y, end: minFunc(box.y, box.h, f) },
	    left: { start: box.x, end: minFunc(box.x, box.w, f) },
	    width: { start: box.w, end: box.w * factor, unit:"px" },
	    height: { start:box.h, end: box.h * factor, unit:"px" },
	    opacity: { start: 1, end: 0 }
	  },
	  easing: easing || dojo.fx.easing.bounceIn
        }, props));
    }

  }



});
