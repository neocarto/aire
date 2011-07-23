<html>
  <head>
    <title>HELP</title>
	<meta charset="utf-8">
	<link rel="stylesheet" type="text/css" href="css/style.css" />
	<link rel="stylesheet" type="text/css" href="themes/cupertino/jquery-ui-1.8.14.custom.css" />
	<script src="js/jquery-1.6.2.min.js"></script>
	<script src="js/jquery-ui-1.8.9.custom.min.js"></script>
	</head>
  <body>
<script>
	$(function() {
		$( "#tabs" ).tabs({ selected: 0 });
		$( ".tabs-bottom .ui-tabs-nav, .tabs-bottom .ui-tabs-nav > *" )
			.removeClass( "ui-corner-all ui-corner-top" )
			.addClass( "ui-corner-bottom" );
	});
	</script>
	<style>
	#tabs { height: 458px;} 
	.tabs-bottom { position: relative; font-size:10px; text-align:justify;} 
	.tabs-bottom .ui-tabs-panel { height: 412px; overflow: auto; } 
	.tabs-bottom .ui-tabs-nav { position: absolute !important; left: 0; bottom: 0; right:0; padding: 0 0.1em 0.1em 0; } 
	.tabs-bottom .ui-tabs-nav li { margin-top: -2px !important; margin-bottom: 1px !important; border-top: none; border-bottom-width: 1px; }
	.ui-tabs-selected { margin-top: -3px !important; }
	</style>
  
<div id="tabs" class="tabs-bottom">
	<ul>
		<li><a href="#tabs-1">Help</a></li>
		<li><a href="#tabs-2">Map types</a></li>
		<li><a href="#tabs-3">Glossary</a></li>
		<li><a href="#tabs-4">Ressources</a></li>
		<li><a href="#tabs-5">Credits</a></li>
		<li><a href="#tabs-6">E-learning</a></li>
		<li><a href="#tabs-7">Links</a></li>
	</ul>

	<div id="tabs-1"><?php include('inc/help.en.php');?></div>
	<div id="tabs-2"><?php include('inc/representations.en.php');?></div>
	<div id="tabs-3"><?php include('inc/glossaire.en.php');?></div>
	<div id="tabs-4"><?php include('inc/ressources.en.php');?></div>
	<div id="tabs-5"><?php include('inc/credits.en.php');?></div>
	<div id="tabs-6"><?php include('inc/elearning.en.php');?></div>
	<div id="tabs-7"><?php include('inc/liens.en.php');?></div>	
</div>

