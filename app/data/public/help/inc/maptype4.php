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
$content_en = '<h2>Discontinuities map</h2>';
$content_en .='<p><img src="images/schema_disc.jpg"/></p>';
$content_en .= '<p>When combined with a choropleth representation (see ratio maps), the visualization of discontinuity lines focus on spatial ruptures of the socio-economic phenomena being observed. This is in line with Brunet and Dolphus (1990) expression “geographical space is fundamentally discontinuous”. In this atlas, discontinuities are expressed in relative terms: Maxima (ratio1, ratio2) / Minima (ratio1, ratio2). To express the scope of the discontinuity intensity, we choose to represent it by the “size” of a line, the change of thickness of it being proportional to the intensity of the discontinuity. This kind of representation focus, not on the homogenous zones, but rather on border lines indicating wide variations in the phenomenon represented on the map.  </p>';
$content_en .=$MenuMapType_en;