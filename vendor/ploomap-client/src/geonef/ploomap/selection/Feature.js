dojo.provide("geonef.ploomap.selection.Feature");
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('room.widget._Utils');
dojo.require('geonef.ploomap.MapBinding');
dojo.declare('geonef.ploomap.selection.Feature',
		[dijit._Widget, dijit._Templated, room.widget._Utils,
		 geonef.ploomap.MapBinding], {

	listNodeClass: 'vectorList',
	enableInfoBar: true,

	// store property : toggle status of OL feature select control
	active: true,

	// show checkbox in UI, to control vector visibility
	showVectorsControl: false,

	selectControlOptions: {
		multipleKey: 'altKey',
		toggleKey: 'altKey',
		clickout: true,
		box: false,
		multiple: true,
		toggle: true,
	},

	templateString: '<div class="featureSelection">' +
			'<div dojoAttachPoint="showVectorsNode" style="display:none">' +
			'  <input type="checkbox" dojoAttachPoint="activeSwitchNode"/>' +
			'    Afficher les vecteurs</div>' +
			//'<div><span class="link" dojoAttachEvents="onclick:activate">Activer</span></div>' +
			'<div dojoAttachPoint="barNode" class="barNode">' +
			'  <span class="sel_actions">' +
			'    <span dojoAttachPoint="unselActionNode" class="link">vider</span>' +
			'  </span>' +
			'  <span dojoAttachPoint="infoNode" class="info">...</span>' +
			'</div>' +
			'<div dojoAttachPoint="listNode"></div>' +
			'</div>',

	constructor: function() {
		dojo.mixin(this, {
			listNode: null,
			infoBarNode: null,
			selectControlOptions: dojo.mixin({}, this.selectControlOptions)
		});
	},

	_setActiveAttr: function(state) {
		//console.log('_setActiveAttr', this, state);
		this.activeSwitchNode.checked = state;
		dojo.style(this.barNode, 'display', state ? '' : 'none');
		this.parentWidget._layer.setVisibility(state);
	},

	/*
	buildRendering: function(flag) {
		if (flag === true) {
			this.inherited(arguments);
		}
	},*/

	mapBound: function() {
		var self = this;
		var layer = this.parentWidget._layer;
		var controlOptions = dojo.mixin({
			onSelect: function(f) { self.onFeatureSelect(f); },
     	    onUnselect: function(f) { self.onFeatureUnselect(f); },
     	    callbacks: {
     	    	over: function(f) { console.log('over', arguments);self.onFeatureOver(f); },
     	    	out: function(f) { self.onFeatureOut(f); }
     	    }
     	}, this.selectControlOptions);
		this.initStoreProperty([ 'active' ]);
		if (this.showVectorsControl) {
			dojo.style(this.showVectorsNode, 'display', '');
		}
     	if (!this.data.selection)
     		this.data.selection = [];
		this.selectControl = new OpenLayers.Control.SelectFeature(
				layer, controlOptions);
		this.map.map.addControl(this.selectControl);
		dojo.mixin(this.selectControl.handlers.feature, {
			stopUp: false,
			stopDown: false,
			stopClick: true,
		});
		/*this.hoverControl = new OpenLayers.Control.SelectFeature(layer, {
			hover: true,
			renderIntent: 'select',
			onSelect: function(f) { console.log('over2', arguments);self.onFeatureOver(f); },
     	    onUnselect: function(f) { self.onFeatureOut(f); }
		});
		this.map.map.addControl(this.hoverControl);
		dojo.mixin(this.hoverControl.handlers.feature, {
			stopUp: false, stopDown: false,	stopClick: false
		});*/
		// Event & updates of the DOM
		dojo.addClass(this.listNode, this.listNodeClass);
		dojo.connect(this.activeSwitchNode, 'onchange', this, function() {
			//console.log('select change active', this);
			this.attr('active', this.activeSwitchNode.checked);
		});
		dojo.connect(this.unselActionNode, 'onclick', this, function() {
			this.selectControl.unselectAll();
		});
		//this.buildUI();
		dojo.connect(this.parentWidget, 'enable', this, function() {
			//console.log('****** enable', this);
			this.activate();
		});
		dojo.connect(this.parentWidget, 'disable', this, function() {
			//console.log('****** disable', this);
			this.deactivate();
		});
		dojo.connect(layer, 'onFeatureInsert', this, function(f) {
			this.onFeatureAdded(f);
		});
		this.activate();
	},

	activate: function() {
		console.log('activate F', this);
		this.selectControl.activate();
		dojo.style(this.barNode, 'display', '');
		dojo.style(this.listNode, 'display', '');
		if (this.showVectorsControl) {
			dojo.style(this.showVectorsNode, 'display', '');
		}
		this.parentWidget._layer.setVisibility(this.data.active);
	},

	deactivate: function() {
		//console.log('deactivate F', this);
		this.selectControl.deactivate();
		dojo.style(this.barNode, 'display', 'none');
		dojo.style(this.listNode, 'display', 'none');
		if (this.showVectorsControl) {
			dojo.style(this.showVectorsNode, 'display', 'none');
		}
		this.parentWidget._layer.setVisibility(false);
	},

	onFeatureSelect: function(f) {
		if (this.data.selection.indexOf(f.attributes.id) < 0) {
			this.data.selection.push(f.attributes.id); // save to store
		}
		this.openProperties(f);
		this.openPopup(f);
	},

	onFeatureUnselect: function(f) {
		this.closeProperties(f);
		var idx = this.data.selection.indexOf(f.attributes.id);
		if (idx >= 0) { // save to store
			this.data.selection.splice(idx, 1);
		}
		this.closePopup(f);
	},

	onFeatureOver: function(f) {
		var label = this.featureToString(f);
		if (this.infoNode)
			this.infoNode.innerHTML = label;
		//console.log('onFeatureOver', this, f);
		this.parentWidget._layer.drawFeature(f, 'hover');
		this.createContextMover(f);
	},

	onFeatureOut: function(f) {
		if (this.infoNode)
			this.infoNode.innerHTML = '...';
		this.parentWidget._layer.drawFeature(f, f.selDiv ? 'select' : 'default');
		this.removeContextMover();
	},

	createContextMover: function(f) {
		//console.log('createContextMover F', this, f);
		var _h, _h2;
		var oX = oY = 15;
		this._contextNode = dojo.create('div');
		this._contextNode.innerHTML = this.featureToString(f);
		dojo.addClass(this._contextNode, 'mouseContextBubble');
		var _mouseMove = dojo.hitch(this, function(e) {
			this._contextNode.style.left = '' + (e.clientX + oX) + 'px';
			this._contextNode.style.top = '' + (e.clientY + oY) + 'px';
		});
		_h2 = dojo.connect(this.map.map.node, 'onmouseout', this,
			function(evt) {
				dojo.disconnect(_h2);
				this.removeContextMover();
			});
		_h = dojo.connect(window, 'onmousemove', this, function(evt) {
			dojo.disconnect(_h);
			this._contextNode.style.position = 'absolute';
			_mouseMove(evt);
			dojo.body().appendChild(this._contextNode);
			this._contextHandler =
				dojo.connect(window, 'onmousemove', this, _mouseMove);
			//this._contextMover = new dojo.dnd.Mover(node, evt);
		});
	},

	removeContextMover: function() {
		/*this._contextMover.destroy();
		this._contextMover = null;*/
		dojo.disconnect(this._contextHandler);
		this._contextHandler = null;
		if (this._contextNode) {
			dojo.body().removeChild(this._contextNode);
			this._contextNode = null;
		}
	},

	openProperties: function(f) {
		if (!f.selDiv) {
			f.selDiv = document.createElement('div');
			this.buildFeatureNode(f, f.selDiv);
			this.listNode.appendChild(f.selDiv);
			dojo.connect(f, 'destroy', this, function() {
				//console.log('destroy C', f.attributes.id, f, this);
				this.closeProperties(f);
			});
		}
	},

	closeProperties: function(f) {
		//console.log('closeProperties', f.attributes.id, f);
		if (f.selDiv) {
			this.listNode.removeChild(f.selDiv);
			f.selDiv = null;
		}
	},

	openPopup: function(feature) {
		return;
		var content = this.featureToString(feature);
        var popup = new OpenLayers.Popup.FramedCloud("chicken",
        				 //this.map.map.getLonLatFromPixel(event.xy),
                         feature.geometry.getBounds().getCenterLonLat(),
                         null, content, null, true,
                         dojo.hitch(this, 'closePopup'));
		feature.popup = popup;
		this.map.map.addPopup(popup);
		dojo.byId('chicken').zIndex = 420000;
		console.log('chicken', dojo.byId('chicken'));
	},

	closePopup: function(feature) {
		return;
		// close popup
		if (feature.popup) {
	        this.map.map.removePopup(feature.popup);
	        feature.popup.destroy();
	        feature.popup = null;
		}
	},

	// restore persisted select state of added feature
	onFeatureAdded: function(f) {
		//console.log('onFeatureAdded', f.attributes.id, this.data.selection, f, this);
		if (this.data.selection.indexOf(f.attributes.id) >= 0) {
			this.selectControl.select(f);
		}
	},

	buildFeatureNode: function(f, node) {
		node.innerHTML = 'Vecteur';
	},

	featureToString: function(f) {
		return 'Vecteur '+f.fid;
	}



});
