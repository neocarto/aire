<html>
  <head>
    <title>Representations AIRE</title>
	<link rel="stylesheet" href="style.css">

  </head>
  <body>
<?php
$lang = substr($_SERVER['HTTP_REFERER'], -2);  

// FRANCAIS
if ($lang=="fr"){

echo '<div class="top">REPRÉSENTATIONS CARTOGRAPHIQUES</div>';
echo '<div class="close"><a href="#" onclick="window.parent.closeHelp();"><img src="images/fermer.gif" width="30" height="30"></img></a></div>';
echo '<div class="content">';

include ('representations/representation0_fr.php');
echo '<br>';
include ('representations/representation1_fr.php');
echo '<br>';
include ('representations/representation2_fr.php');
echo '<br>';
include ('representations/representation3_fr.php');
echo '<br>';
include ('representations/representation4_fr.php');
echo '<br>';
include ('representations/representation5_fr.php');
echo '<br>';
include ('representations/representation6_fr.php');
echo '<br>';
include ('representations/representation7_fr.php');
echo '<br><br>';
}


// AUTRE

echo '<div class="top">CARTOGRAPHIC REPRESENTATION</div>';
echo '<div class="close"><a href="#" onclick="window.parent.closeHelp();"><img src="images/fermer.gif" width="30" height="30"></img></a></div>';
echo '<div class="content">';

include ('representations/representation0_en.php');
echo '<br>';
include ('representations/representation1_en.php');
echo '<br>';
include ('representations/representation2_en.php');
echo '<br>';
include ('representations/representation3_en.php');
echo '<br>';
include ('representations/representation4_en.php');
echo '<br>';
include ('representations/representation5_en.php');
echo '<br>';
include ('representations/representation6_en.php');
echo '<br>';
include ('representations/representation7_en.php');
echo '<br><br>';
?>


<br/><br/>
</div>
</body>
</html>