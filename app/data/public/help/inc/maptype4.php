<?php
include('inc/menu_maptypes.php');

// FRANCAIS
$title_fr ='Représensentations cartographiques';
$content_fr = '<h2>Cartes de discontinuités</h2>';
$content_fr .='<p><img src="images/schema_disc.jpg"/></p>';
$content_fr .='<p>Combinée à la représentation par aplats de couleurs (Cf. cartes de ratio), la visualisation de lignes de discontinuités permet de mettre en exergue les ruptures spatiales des phénomènes socio-économiques étudiés, qui selon la formule de Brunet et Dolphus (1990) montre que « l’espace géographique est fondamentalement discontinu ». Dans le cadre de cet atlas, les discontinuités sont exprimées de façon relative : Max (ratio1,ratio2) / Min(ratio1,ratio2). Pour rendre compte de l’intensité de la discontinuité, nous avons choisi de la représenter, par l’intermédiaire de la variable visuelle taille, l’épaisseur de la limite variant proportionnellement à l’intensité de la discontinuité. Ce type de représentation permet d’attirer l’œil du lecteur de la carte, non pas sur les grandes zones homogènes, mais plutôt sur les frontières marquant une forte disparité du phénomène étudié de part et d’autre de cette limite. </p>';
$content_fr .=$MenuMapType_fr;


// ANGLAIS
$title_en ='Map types';
$content_en = '<h2>Discontinuity map</h2>';
$content_en .='<p><img src="images/schema_disc.jpg"/></p>';
$content_en .= '(not available)';
$content_en .=$MenuMapType_en;