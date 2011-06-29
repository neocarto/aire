var spinnerCount = 0;
function enableSpinner()
{
//  $('spinner').style.display = 'inline';
  spinnerCount++;
}
function disableSpinner()
{
  spinnerCount--;
  if (!spinnerCount)
  {}//  $('spinner').style.display = 'none';
}

function showComment()
{
  var mapsets = $('mapsets');
  var comment = $('comment');
  comment.innerHTML = '<h3>'+__('Chargement du commentaire...')+'</h3>';
  mapsets.hide();
  comment.show();
  $('screen').addClassName('commented');
  var url = '/aire/comment?map='+map.baseLayer.pmName;
  Ploomap.ajaxUpdate('comment', url);
}

function closeComment()
{
  var mapsets = $('mapsets');
  var comment = $('comment');
  $('screen').removeClassName('commented');
  comment.hide();
  mapsets.show();
}

function showHelp(url)
{
  var iframe = $('aide');
  var map = $('map');
  iframe.contentWindow.location = url;
  map.hide();
  iframe.show();
}

function toggleHelp()
{
  var iframe = $('aide');
  var map = $('map');
  if (iframe.style.display == 'none') {
    map.hide();
    iframe.show();
  } else {
    iframe.hide();
    map.show();
  }
}

function closeHelp()
{
  var iframe = $('aide');
  if (iframe.style.display != 'none') {
    var map = $('map');
    iframe.hide();
    map.show();
  }
}

function showSaveBox()
{
  var el = $('export');
  if (el) return; else el = null;
  var left = $('leftarea');
  var box = document.createElement('div');
  box.setAttribute('id', 'export');
  box.setAttribute('class', 'leftbox');
  box.innerHTML = '<h3>'+__('Chargement...')+'</h3>';
  var mapsets = $('mapsets');
  var comment = $('comment');
  comment.hide();
  mapsets.hide();
  left.appendChild(box);
  var url = '/export/box?map='+map.baseLayer.pmName;
  Ploomap.ajaxUpdate('export', url);
}

var saveWinCount = 0;
function saveCommand()
{
  saveWinCount++;
  window.location = '/export/saveSVG/map/'+map.baseLayer.pmName
    +'/title/'+escape(map.baseLayer.title)+'/export.svg';
}

var printWinCount = 0;
function printCommand()
{
  printWinCount++;
  var extent = map.getExtent();
  window.open('/export/print?map='+map.baseLayer.pmName
	      +'&title='+map.baseLayer.title
	      +'&extent='+extent.toBBOX(),
	      'printWin'+printWinCount);
}


function showLayer(layerName)
{
  var layers = map.getLayersByName(layerName);
  if (!layers.length) {
    alert('La couche \''+layerName+'\' ne peut être affichée car elle n\'a pas été declarée.');
    return;
  }
  closeHelp();
  var layer = layers[0];
  if (vectorLayer)
    map.removeLayer(vectorLayer);
  vectorLayer = null;
  if (map.baseLayer.activeImage) {
    map.baseLayer.activeImage.style.display = 'none';
    map.baseLayer.inactiveImage.style.display = 'inline';
  }
  layer.inactiveImage.style.display = 'none';
  layer.activeImage.style.display = 'inline';
  var title = $('map-title');
  if (title && layer.title)
    title.innerHTML = layer.title;
  map.setBaseLayer(layer);
}

function clearClickInfo()
{
  if (vectorLayer) {
    map.removeLayer(vectorLayer);
    vectorLayer = null;
  }
}

var map, legendControl, copyrightLabel, sourceLabel, vectorLayer, wkt;
function initMap()
{
  wkt = new OpenLayers.Format.WKT();
  var extent = new OpenLayers.Bounds(-2462631.1214, -2019675.58984,
				     2667282.51824, 2525707.07414);

  // Creation de la carte
  map = new OpenLayers.Map
    ('map',
     { theme: 'css/ol-theme-aire/style.css',
       controls: [],
       units: 'm',
       maxExtent: extent,
       restrictedExtent: extent,
       resolutions: [9450, 4725, 2362.5, 1181.25]
     });

  // Home map
  var homeLayer = new OpenLayers.Layer.TileCache
		    ("home", "/tilecache-data", "home-map",
		     {format: 'image/jpeg',
		      tileOrigin: new OpenLayers.LonLat(-2462631.1214,
							-2019675.58984)});
  homeLayer.pmName = 'home-map';
  map.addLayer(homeLayer);
  map.setCenter(new OpenLayers.LonLat(2.55, 3.23), 4);
  map.zoomTo(0);

  // Controles
  OpenLayers.ImgPath = 'images/aire/';
  map.addControl(new OpenLayers.Control.Navigation());
  map.addControl(new OpenLayers.Control.PloomapPanZoomBar
		 ({ position: new OpenLayers.Pixel(4, -20) }));
  map.addControl(new OpenLayers.Control.AireToolbar
		 ({div: $('toolbar'),
		   beforeTD: $('sep'),
		   map: map}));
  var legendControls = map.getControlsBy('name', 'pmLegend');
  if (legendControls.length)
    legendControls[0].activate();
  map.addControl(new OpenLayers.Control.ScaleLine({div: $('scaleline'),
 						   maxWidth: 150}));
  $('scaleline').style.position = 'relative';
  map.addControl(new OpenLayers.Control.KeyboardDefaults());
  var overviewMapLayer = new OpenLayers.Layer.WMS
    ("Europe", "/service/overview", {transparent: false}, {singleTile: true});
  map.addControl(new OpenLayers.Control.OverviewMap({
      div: $('overviewmap'),
      layers: [overviewMapLayer],
      size: new OpenLayers.Size(111, 97),
	  mapOptions: {
	theme: 'css/ol-theme-aire/style.css',
	    numZoomLevels: 1,
	    maxExtent: new OpenLayers.Bounds(-2461247.45,-2023746.77,
					     2668752.55, 2522503.23),
	    restrictedExtent: new OpenLayers.Bounds(-2462631.1214, -2019675.58984,
						    2667282.51824, 2525707.07414)}}));
  copyrightLabel = new OpenLayers.Control.pmLabel({elementClass: 'copyright'});
  sourceLabel = new OpenLayers.Control.pmLabel({elementClass: 'source'});
  map.addControl(copyrightLabel);
  map.addControl(sourceLabel);
}
