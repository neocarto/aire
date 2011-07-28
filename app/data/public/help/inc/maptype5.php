﻿<?php
include('inc/menu_maptypes.php');

// FRANCAIS
$title_fr ='Représensentations cartographiques';
$content_fr = '<h2>Anamorphoses</h2>';
$content_fr .='<p><img src="images/schema_anamorphose.jpg"/></p>';
$content_fr .='<p>De façon générale, une anamorphose est une image déformée, une déformation réversible d\'une image à l\'aide d\'un système optique ou d’un procédé mathématique. Cela permet de déformer les unités territoriales (polygones) sur la base d\'un attribut rapporté à la superficie des entités (densité). Même si plusieurs méthodes de déformation existent, dans le cadre de ce projet, la méthode utilisée est basée sur l\'algorithme de diffusion Michael T. Gastner et M. E. J. Newman. Fondé sur le processus physique de la diffusion des gaz (diffusion linéaire) cet algorithme fonctionne d’après un calcul de densité dans une grille régulière donnée qui est progressivement déformée. Les zones à forte densité sont propagées vers les zones à faible densité jusqu’à ce que la densité de chaque zone soit égale à la densité moyenne. Cet algorithme conserve la topologie. Appliquée en cartographie, le principe de l’anamorphose débouche sur la déformation du fond de carte pour montrer l\'importance d\'un phénomène donné. La carte ne représente alors plus la réalité géographique mais la réalité du phénomène. Ainsi, l\'espace peut être différemment perçu selon le phénomène représenté. Par exemple, une commune sera agrandie par rapport aux autres si elle contient plus de population que la moyenne des autres. L’anamorphose ne change pas le message, mais peut permettre d’en améliorer sa lisibilité. Les anamorphoses présentées ici sont toutes réalisés en fonction des valeurs de stock de chaque phénomène. En général, la déformation en anamorphose est réalisée à l\'aide du stock du dénominateur, sauf ci celui ci est la superficie. </p>';
$content_fr .=$MenuMapType_fr;


// ANGLAIS
$title_en ='Map types';
$content_en = '<h2>Anamorphosis</h2>';
$content_en .='<p><img src="images/schema_anamorphose.jpg"/></p>';
$content_en .= '(not available)';
$content_en .=$MenuMapType_en;