<?php
include('inc/menu_maptypes.php');

// FRANCAIS
$title_fr ='Représensentations cartographiques';
$content_fr = '<h2>Cartes de ratio</h2>';
$content_fr .='<p><img src="images/schema_ratio.jpg"/></p>';
$content_fr .='<p>Les données de rapport (ou de taux ou d’intensité) sont des données quantitatives calculées à partir de données brutes dont ont fait le rapport ou dont on calcule le taux à partir d’un total. Elles expriment les caractéristiques des individus observés mais leur total n\'a pas de signification concrète (ex : la densité de population est un caractère de rapport car la somme de plusieurs densités de population n\'a aucun sens). Ces données permettent d’observer un phénomène relativement à un autre et donc de produire une image différente des relations entre les régions européennes. La représentation cartographique des données de rapport laisse un choix plus large au cartographe. Plusieurs moyens graphiques ou variables visuelles peuvent être utilisés. Il s’agit ici de traduire une notion d’ordre et de sélectivité. Ces notions sont parfaitement exprimées par des variations de valeurs ou de couleurs associées à la valeur. La valeur est une variation monochrome d’intensité du plus clair au plus foncé. L’œil classe automatiquement les « taches » des plus claires aux plus foncés et établie directement un ordre et une sélection entre les espaces présentant un phénomène plus faible à un phénomène plus fort. </p>';
$content_fr .=$MenuMapType_fr;


// ANGLAIS
$title_en ='Map types';
$content_en = '<h2>Ratio data map</h2>';
$content_en .='<p><img src="images/schema_ratio.jpg"/></p>';
$content_en .= '<p>Ratio data (rates or intensity) are quantitative data calculated from raw data from which relationships are derived or rates calculated. They represent the characteristics of observed variables but their sum does not have a particular meaning, e.g. population density is a relationship value but the sum of population densities is not a meaningful indicator. Meaningful representation such as comparing various regions of Europe can be made using these data. Representing data relationship on a map gives cartographers greater freedom as they can use a range of graphical methods and visual variables. The important concept here is that of flexibility as the cartographer can arrange data in a variety of ways and be more selective.  Ranking and selectivity concepts are reflected in changes in value data and colors associated with these values. Value in this case is a variation in intensity whose color changes from light to dark. Human eyes have an innate ability to automatically establish a relationship between spots on a map based on their coloration, rank and select between geographic spaces based on their light or dark shades. </p>';
$content_en .=$MenuMapType_en;