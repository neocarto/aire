<?php
include('inc/menu_maptypes.php');

// FRANCAIS
$title_fr ='Représensentations cartographiques';
$content_fr = '<h2>Cartes de stock</h2>';
$content_fr .='<p><img src="images/schema_stock.jpg"/></p>';
$content_fr .='<p>Les cartes de stock permettent de représenter des données de stocks. Ces données sont de nature quantitative brute ou absolue. Une donnée est dite « quantitative » si ses modalités s\'expriment par des nombres et si la moyenne de ces nombres a un sens. Elles expriment des quantités concrètes : la somme des modalités des éléments a un sens (ex : la population est une donnée de stock car la somme de plusieurs populations a un sens). Ces données sont à la base de toute l’information géographique présentée dans cet atlas. En effet, c’est à partir de ces données brutes que l’ensemble des autres données ont été calculées et traitées. Pour l’ensemble des pays de l’Union Européenne, elles proviennent du site Eurostat 2007. Pour la Suisse et la Norvège, elles sont issues de la base de données ESPON 2006. La représentation cartographique des données de stock est soumise à des règles de sémiologie graphique très strictes. Quelle que soit l’implantation (ponctuelle, linéaire ou zonale), il faut utiliser une variable visuelle traduisant visuellement les quantités brutes et permettant de traduire la variation de distance qu’il existe entre les données : la seule variable visuelle possible est la TAILLE. La taille renvoie à la variation de surface, de longueur, de hauteur ou de volume d’un figuré. Elle est le seul moyen graphique qui permette d’obtenir un rapport de proportionnalité lié au poids des figurés et donc de traduire directement des quantités brutes. </p>';
$content_fr .=$MenuMapType_fr;


// ANGLAIS
$title_en ='Map types';
$content_en = '<h2>Stock map</h2>';
$content_en .='<p><img src="images/schema_stock.jpg"/></p>';
$content_en .= '(not available)';
$content_en .=$MenuMapType_en;