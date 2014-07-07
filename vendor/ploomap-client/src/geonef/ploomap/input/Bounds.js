dojo.provide('geonef.ploomap.input.Bounds');
dojo.require('geonef.ploomap.input.LonLat');
dojo.declare('geonef.ploomap.input.Bounds', geonef.ploomap.input.LonLat, {

	cssClass: 'inputBounds',

	ValueClass: OpenLayers.Bounds,

	dndTypes: [ 'ploomapBounds'],

	_setMapAttr: function(/* geonef.ploomap.Map */ map) {
		this.map = map;
		this.attr('value', this.map.map.getExtent());
	},

	_processSetValue: function(value) {
		if (value) {
			if (value instanceof OpenLayers.Bounds) {
				value = value.clone();
			} else if (value instanceof OpenLayers.LonLat) {
				var center = this.value.getCenterLonLat();
				value = this.value.add(value.lon - center.lon,
									   value.lat - center.lat);
			} else if (dojo.isArray(value) && value.length === 2) {
				var center = this.value.getCenterLonLat();
				value = this.value.add(value[0] - center.lon,
									   value[1] - center.lat);
			} else if (dojo.isArray(value) && value.length >= 4) {
				value = OpenLayers.Bounds.fromArray(value);
			} else if (dojo.isString(value)) {
				value = OpenLayers.Bounds.fromString(value);
			} else {
				throw new Exception(
					'geonef.ploomap.input.Bounds._processSetValue: invalid argument');
			}
		} else {
			value = new OpenLayers.Bounds(undefined, undefined);
			text = '(emplacement non défini)';
		}
		return value;
	},

	formatValueToString: function() {
		var text, value = this.value;
		text = '' + parseInt(value.left) +
				';' + parseInt(value.bottom) +
				';' + parseInt(value.right) +
				';' + parseInt(value.top);
		return text;
	}
});
