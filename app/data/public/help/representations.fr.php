<html>
  <head>
    <title>Représentations AIRE</title>
	<link rel="stylesheet" href="style.css">

  </head>
  <body>
<?php

// FRANCAIS

echo '<div class="top">REPRÉSENTATIONS CARTOGRAPHIQUES</div>';
echo '<div class="close"><a href="#" onclick="window.parent.aire.app.setLayout(\'layoutNormal\')&&undefined"><img src="images/fermer.gif" width="30" height="30"></img></a></div>';
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


?>


<br/><br/>
</div>
</body>
</html>