dojo.provide('geonef.jig.layout.anchor.Corner');

dojo.require('dijit._Widget');
dojo.declare('geonef.jig.layout.anchor.Corner', dijit._Widget, {

	// designate which corner
	// one among: ['TL','TR','BL','BR']
	corner: null,

	cornerStyles: {
		TL: { top: 0, left: 0 },
		TR: { top: 0, right: 0},
		BL: { bottom: 0, left: 0},
		BR: { bottom: 0, right: 0 }
	},

	// buffer in pixels
	buffer: 15,

	buildRendering: function() {
		this.inherited(arguments);
		this.domNode.innerHTML = 'ANCHOR';
		dojo.style(this.domNode, {
			backgroundColor: '#ff0',
			border: '1px solid #f00',
			padding: '10px',
			zIndex: 300000,
			position: 'absolute',
			width: '30px',
			height: '30px'
			/*top: '0',
			left: '0',*/
		});
		this.installCorner();
	},

	installCorner: function() {
		//var b = 10, // buffer (in px) to avoid conflicts between widgets
		this.box = dojo.coords(this.widget.domNode);
		if (this.corner === 'TL') {
			this.x = this.box.x + this.buffer;
			this.y = this.box.y + this.buffer;
			this.domNode.innerHTML = 'ANCHOR TL';
		} else if (this.corner === 'TR') {
			this.x = this.box.x + this.box.w - this.buffer;
			this.y = this.box.y + this.buffer;
			this.domNode.innerHTML = 'ANCHOR TR';
		} else if (this.corner === 'BL') {
			this.x = this.box.x + this.buffer;
			this.y = this.box.y + this.box.h - this.buffer;
			this.domNode.innerHTML = 'ANCHOR BL';
		} else if (this.corner === 'BR') {
			this.x = this.box.x + this.box.w - this.buffer;
			this.y = this.box.y + this.box.h - this.buffer;
			this.domNode.innerHTML = 'ANCHOR BR';
		}
		this.domNode.innerHTML = '';
		dojo.style(this.domNode, this.cornerStyles[this.corner]);
		dojo.place(this.domNode, this.widget.domNode);
		/*var _e = dojo.create('div', {innerHTML: 'X'}, dojo.body());
		dojo.style(_e, { position:'absolute',zIndex: 180000,background:'#00f',
				left:''+this.x+'px', top:''+this.y+'px'});*/
		//console.log('anchor corner', this.x, this.y,this.widget.declaredClass);
	},

	_setHighlightedAttr: function(state) {
		this.highlighted = state;
		dojo.addClass(this.domNode, state ? 'highlighted' : 'notHighlighted');
		dojo.removeClass(this.domNode, !state ? 'highlighted' : 'notHighlighted');
		dojo.style(this.domNode, 'backgroundColor', state ? '#f00' : '#ff0');
	},

	accept: function(widget) {
		console.log('accept!!!!', widget, '!!! IN !!', this.widget);
		var width = dojo.style(widget.domNode, 'width'),
			height = dojo.style(widget.domNode, 'height'),
			minWidth = dojo.style(widget.domNode, 'min-width'),
			minHeight = dojo.style(widget.domNode, 'min-height');
		var wasFloating = widget._floatAnchor,
			parent = widget.getParent();
		if (parent && parent.removeChild) {
			parent.removeChild(widget);
		} else { // ie. comes from DialogTooltip
			widget.domNode.parentNode.removeChild(widget.domNode);
		}
		//this.widget.floatingChildrenProperties[widget.id] =
		//	this.cornerStyles[this.corner];
		dojo.style(widget.domNode, dojo.mixin({
					position: 'absolute', zIndex: 42000, overflow: 'auto',
					left: 'auto', top: 'auto', right: 'auto', bottom: 'auto'},
				this.cornerStyles[this.corner]));
		if (!wasFloating) {
			var w = parseInt(width, 10),
				h = parseInt(height, 10),
				limit = 100;
			console.log('w/h', width, height, minWidth, minHeight);
			w = w > 0 ? Math.min(w, limit) : limit;
			h = h > 0 ? Math.min(h, limit) : limit;
			//if (!minWidth)
			dojo.style(widget.domNode, 'width', ''+w+'px');
			dojo.style(widget.domNode, 'height', ''+h+'px');
		}
		this.widget.addChild(widget);
	}

});
