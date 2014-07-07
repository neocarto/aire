
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="content-type">
    <title><?php echo $data['title'] ?></title>
    <script src="/x/dojo/dojo.js" type="text/javascript"></script>
    <script src="http://maps.google.com/maps?file=api&amp;v=2&amp;sensor=false&amp;key=<?php echo $data['gmapKey'] ?>" type="text/javascript"></script>
    <script src="http://openlayers.org/api/OpenLayers.js" type="text/javascript"></script>

    <script src="/js/ploomap/ol/Layer_pmTMS.js" type="text/javascript"></script>
    <script src="/js/ploomap/ol/Marker_Label.js" type="text/javascript"></script>
    <script src="/js/ploomap/ol/Control_FeatureHover.js" type="text/javascript"></script>
    <script src="/js/ploomap/ol/Control_LoadingPanel.js" type="text/javascript"></script>
    <script src="/x/workspace_default.js?<?php echo time() ?>" type="text/javascript"></script>
    <script src="/js/start.js" type="text/javascript"></script>
    <script type="text/javascript">window.workspaceKey = "<?php echo $key ?>";
      window.workspaceData = <?php echo json_encode($data) ?>;
    </script>
    <link rel="stylesheet" type="text/css" href="/js/dijit/themes/tundra/tundra.css"/>
    <link rel="stylesheet" type="text/css" href="/js/jig/css/jig.css"/></head>
  <body class="patate tundra">
    <div id="app"></div>

    <div id="wait">
      <div>Chargement de l'application <i><?php echo $data['title'] ?></i> ...</div>
    </div>
  </body>
</html>
