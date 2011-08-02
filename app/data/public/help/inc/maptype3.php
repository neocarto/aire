<?php
include('inc/menu_maptypes.php');

// FRANCAIS
$title_fr ='Représensentations cartographiques';
$content_fr = '<h2>Cartes de stock + ratio</h2>';
$content_fr .='<p><img src="images/schema_stock_and_ratio.jpg"/></p>';
$content_fr .='<p>Ce type de représentation permet de marier, sur une même carte, la représentation des données brutes et celles de rapport. L’observateur n’a plus besoin de passer d’une carte à l’autre mais voit d’un seul « coup d’œil » le phénomène appréhendé selon les deux types de d\'informations. Ici, nous avons choisi d’inscrire la donnée de rapport non plus sur la surface de la région mais à l’intérieur du figuré représentant le stock. Cette méthode permet de donner un poids variable au stock (et donc de le relativiser) en fonction de la valeur du rapport sans gêner la lecture de l’une ou l’autre information prise en compte. Ici, le stock utilisé pour la représentation de la taille est le plus souvent celui du dénominateur du rapport (sauf pour la densté où le numérateur, qui donne la population totale de la maille, est utilisé). </p>';
$content_fr .=$MenuMapType_fr;


// ANGLAIS
$title_en ='Map types';
$content_en = '<h2>Raw and Ratio data map</h2>';
$content_en .='<p><img src="images/schema_stock_and_ratio.jpg"/></p>';
$content_en .= '<p>This kind of representation enables to establish a match between raw and relationship data on a single map. Thus, the user will view a given phenomenon expressed in both raw and relationship data on the same map. In this atlas, we chose to show the relationship not only on the region area but also inside the figure where absolute values (stock) are represented. The advantage of this method is that it confers variable/relative weight to absolute values (stock) based on the value of the relationship data without hindering the reading of other data on the map. </p>';
$content_en .=$MenuMapType_en;