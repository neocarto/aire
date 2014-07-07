dojo.provide('geonef.jig.layout.AnchorButton');

dojo.require('dijit.form.Button');

dojo.declare('geonef.jig.layout.AnchorButton', dijit.form.Button, {
	// summary:
	//		Super-button to move the related widget to some location in the workspace
	//
	// description:
	//		UI is a normal dijit button, but allow the user to:
	//			- click&release to make the widget floating
	//			- click&drag to take the widget to another place,
	//			  depending on active anchors in the workspace
	//
	//		This widget manages the DnD operation, user selection among anchors
	//		through graphical effect (SVG + XHTML).
	//
	//		The "anchoring" step (really move the widget to the anchor)
	//		is done by the targetted anchor (see geonef.jig.layout.anchor.*).

	label: 'M',

	effectStyle: {
		selected: '#f00',
		//unselected: '#ff0'
	},

	relatedWidget: '',

	postMixInProperties: function() {
		this.inherited(arguments);
		if (this.relatedWidget) {
			this.relatedWidget = dijit.byId(this.relatedWidget);
		}
	},

	onClick: function() {
		if (this._floatAnchor) {
			alert('Le cacoin est déjà flottant.');
		} else {
			alert('soon');
		}
	},

	postCreate: function() {
		this.inherited(arguments);
		//console.log('AnchorButton postCreate', this);
		dojo.addClass(this.domNode, 'jigLayoutAnchorButton');
		this.connect(this, 'onMouseDown', 'startMouseDown');
	},

	/*startup: function() {
		console.log('######################### startup', this)
		this.relatedWidget = dijit.getEnclosingWidget(this.domNode)
		console.log('relatedWidget', this.relatedWidget)
		this.inherited(arguments);
	},*/

	startMouseDown: function(event) {
		// summary:
		//		do all the stuff, until MouseUp happens
		//

		//console.log('AnchorButton startMouseDown', event, this);
		this._mouseWithin = true;
		this.seekStartPoint = { x: event.clientX, y: event.clientY };
		var onLeave = this.connect(this, 'onMouseLeave', 'startSeek'),
			onEnter = this.connect(this, 'onMouseEnter', 'stopSeek'),
			onUp = this.connect(dojo.body(), 'onmouseup',
							function(event) {
								//console.log('AnchorButton onMouseUp', event, this);
								this.disconnect(onUp);
								this.disconnect(onEnter);
								this.disconnect(onLeave);
								if (this._seeking) {
									this.selectSeek();
								} else {
									this.destroyAnchors();
								}
							});
	},

	startSeek: function(event) {
		// summary:
		//		do all the stuff, until MouseUp happens
		//

		//console.log('AnchorButton startSeek', event, this);
		this._seeking = true;
		if (!this.relatedWidget) {
			this.relatedWidget = dijit.getEnclosingWidget(this.domNode.parentNode);
		}
		this.installAnchorPoints();
		this.createSvgDisplay();
		var currentPoint = { x: event.clientX, y: event.clientY };
		this.currentAnchor = null;
		this.updateSeekPosition(event);
		var onMove = this.connect(dojo.body(), 'onmousemove', 'updateSeekPosition'),
		onStopSeek = this.connect(this, 'stopSeek',
						function() {
							this.disconnect(onStopSeek);
							this.disconnect(onMove);
						});
	},

	updateSeekPosition: function(event) {
		//console.log('AnchorButton updateSeekPosition', //this.seekStartPoint,
		//			{ x: event.clientX, y: event.clientY });
		var angle = this.getAngle(this.seekStartPoint,
								  { x: event.clientX, y: event.clientY }),
            currentA = this.currentAnchor || this.seekAnchorPoints[0],
			self = this,
			checkFunc = function(anchor) {
					if (self.isAngleWithin(angle, anchor.prevA.limitUp, anchor.limitUp)) {
						return anchor;
					} else if (anchor.nextA !== currentA){
						return checkFunc(anchor.nextA);
					} else {
						console.warn('found no anchor for angle: ', angle);
						return null;
					}
				},
			newA = checkFunc(currentA);
		//console.log('AnchorButton angle', angle);
		if (newA && (newA !== currentA || !this.currentAnchor)) {
			this.highlightAnchor(newA);
		}
	},

	highlightAnchor: function(anchor) {
		//console.log('AnchorButton highlightAnchor', anchor);
		if (this.currentAnchor) {
			this.currentAnchor.attr('highlighted', false);
			if (this.currentAnchor.svgPath) {
				dojo.attr(this.currentAnchor.svgPath, 'stroke', this.effectStyle.unselected);
			}
		}
		this.currentAnchor = anchor;
		if (this.currentAnchor) {
			this.currentAnchor.attr('highlighted', true);
			if (this.currentAnchor.svgPath) {
				dojo.attr(this.currentAnchor.svgPath, 'stroke', this.effectStyle.selected);
			}
		}
	},

	selectSeek: function() {
		//console.log('AnchorButton selectSeek', this);
		if (this.currentAnchor) {
			try {
				this.currentAnchor.accept(this.relatedWidget);
			}
			catch(e) {
				console.error('Error while moving the cacoin:');
				console.error(e);
				alert('Désolé, un bug a empêché le déplacement du cacoin.');
			}
		}
		this.stopSeek();
		this.destroyAnchors();
	},

	stopSeek: function() {
		//console.log('AnchorButton stopSeek', this);
		this._seeking = false;
		if (this.svgNode) {
			dojo.destroy(this.svgNode);
			this.svgNode = null;
			dojo.style(this.domNode, 'z-index', 'auto');
		}
		//dojo.destroy(this.anchorMarker);
	},

	installAnchorPoints: function() {
		// called by this.startSeek() to detect and process all anchors
		//
		if (this.seekAnchorPoints) {
			return;
		}
		var self = this;
		// get all anchors
		this.seekAnchorPoints = [];
		dijit.registry
			 .filter(function(w) {
				 return w !== self.relatedWidget && w.buildAnchors; })
			 .forEach(function(w) {
				w.buildAnchors().forEach(function(anchor) {
					self.seekAnchorPoints.push(anchor);
				});
			});
		// compute angle
		this.seekAnchorPoints.forEach(function(anchor) {
			anchor.angle = self.getAngle(self.seekStartPoint, anchor);
			anchor.domNode.setAttribute('angle', anchor.angle);
		});
		// sort by angle
		this.seekAnchorPoints.sort(
				function(_a2, _a1) {
					return (function(a2, a1) {
						if (a1 >= 0 && a2 >= 0) {
							return a2 - a1;
						} else if (a1 <= 0 && a2 <= 0) {
							return a2 - a1;
						} else {
							return a1;	// [0;-PI] is greater than [0;PI]
						}
					})(_a2.angle, _a1.angle);
				});
		// make it a double-chained list
		for (var i = 0; i < this.seekAnchorPoints.length; i++) {
			var nextI = i === this.seekAnchorPoints.length - 1 ? 0 : i + 1,
				prevI = i === 0 ? this.seekAnchorPoints.length - 1 : i - 1,
				anchor = this.seekAnchorPoints[i];
			//console.log({i: i, next: nextI, prev: prevI});
			dojo.mixin(anchor, {
				i: i,
				prevA: this.seekAnchorPoints[prevI],
				nextA: this.seekAnchorPoints[nextI],
				limitUp: this.angleAverage(anchor.angle, this.seekAnchorPoints[nextI].angle)
			});
			//console.log('anchor point', anchor.angle, ' | ', anchor.limitUp);
		}
		//console.log('anchor points');
		//console.dir(this.seekAnchorPoints);
	},

	destroyAnchors: function() {
		//console.log('destroyAnchors');
		if (this.seekAnchorPoints) {
			this.seekAnchorPoints.forEach(function(a) { a.destroy(); });
		}
		this.seekAnchorPoints = null;
		this.currentAnchor = null;
	},

	getAngle: function(p1, p2) {
		var x = p2.x - p1.x,
			y = p1.y - p2.y,
			teta = Math.atan(y / Math.abs(x));
		if (x < 0) {
			teta = Math.PI - teta;
		}
		return this.diffAngle(teta, 0);
		//return Math.atan(Math.abs((p1.y - p2.y) / (p1.x - p2.x)));
	},

	diffAngle: function(a2, a1) {
		var diff = a2 - a1;
		if (diff < -1 * Math.PI) {
			diff += 2 * Math.PI;
		} else if (diff > Math.PI) {
			diff -= 2 * Math.PI;
		}
		return diff;
	},

	isAngleWithin: function(angle, min, max) {
		return  this.diffAngle(angle, min) > 0 &&
				this.diffAngle(max, angle) > 0;
		/*if (min > 0 && max < 0) {	// case of break around -PI ; PI

		} else {
			//if (x > 0 ? y > 0 : y < 0) {	// have same sign
			return angle > min && angle < max;
		}*/

	},

	angleAverage: function(a1, a2) {
		// return bissectrice of smaller angle
		//if (a1 >= 0 && a2 >= 0 || a1 <= 0 && a2 <= 0) {
		if (a2 >= 0 || a1 < 0) {	// doesn't go through the break PI:-PI
			return (a1 + a2) / 2;
		} else {
			return this.diffAngle((a1 + a2 + 2 * Math.PI) / 2, 0);
		}
		//return (a1 + a2) / 2;
	},

	createSvgDisplay: function() {
		var dims = dijit.getViewport();

		var svgDiv = dojo.create('div', {}, dojo.body()),
			svg = this.createSvg('svg', {
							width: ''+dims.w+'px',
							height: ''+dims.h+'px',
							viewBox: '0 0 '+dims.w+' '+dims.h
					}, svgDiv),
			//g = this.createSvg('g', { style: 'stroke-width:5px; stroke:#f00' }, svg),
			g = this.createSvg('g', {
					"stroke-width": '5',
					stroke: this.effectStyle.unselected
				}, svg),
			self = this;
		this.seekAnchorPoints.forEach(function(anchor) {
			anchor.svgPath = self.createSvg('path', {
				d: 'M '+ self.seekStartPoint.x+' '+self.seekStartPoint.y+' '+
					anchor.x+' '+anchor.y
			}, g);
		});
		dojo.style(svgDiv, {
			position: 'absolute',
			left: 0, top: 0, right: 0, bottom: 0, zIndex: 200000
		});
		this.svgNode = svgDiv;
		dojo.style(this.domNode, 'z-index', 300000);
	},

	createSvg: function(tag, attrs, parent) {
		var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
		if (attrs) {
			for (var i in attrs) {
				if (attrs.hasOwnProperty(i)) {
					el.setAttribute(i, attrs[i]);
				}
			}
		}
		if (parent) {
			parent.appendChild(el);
		}
		return el;
	}

});
