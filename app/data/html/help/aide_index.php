<?php
$lang = substr($_SERVER['HTTP_REFERER'], -2);  
if ($lang=="fr"){include ('aide_fr.php');}
else {include ('aide_en.php');}
?>
