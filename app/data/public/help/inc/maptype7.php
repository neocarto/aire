﻿<?php
include('inc/menu_maptypes.php');

// FRANCAIS
$title_fr ='Représensentations cartographiques';
$content_fr = '<h2>Lissage</h2>';
$content_fr .='<p><img src="images/schema_smooth.jpg"/></p>';
$content_fr .='<p>De nombreux phénomènes socio-économiques se répartissent spatialement selon des logiques continues, sans grande rupture au niveau des frontières, qui apparaissent alors comme des coupures artificielles. Si le phénomène observé a une distribution sous-jacente continue, c\'est à dire que le phénomène étudié prend des valeurs qui diffèrent progressivement au fur et à mesure qu\'on se déplace dans l\'espace autour d\'un point donné, l’objectif de la carte « lissée » est de visualiser les grands phénomènes en respectant au mieux l’organisation du phénomène. Si par abus de langage nous parlons de « carte lissées », il s’agit ici d’une méthode de calcul de potentiels. Cette méthode d’analyse spatiale n’a aucune vocation à annuler ou atténuer le bruit(information parasite qui tend à brouiller la lecture) s’affranchit complètement du maillage administratif de départ. Elle permet d’observer ainsi la répartition spatiale du phénomène étudié, quelque soit l’hétérogénéité du maillage affecter en tout point de la carte, la valeur de la densité du phénomène dans le voisinage de ce point. Le calcul de ce potentiel nécessite 2 paramètres : une fonction d’interaction spatiale et une portée. Dans le cadre de cet atlas, nous utilisons comme fonction d’interaction, une fonction gaussienne (ce qui est "proche" compte plus dans le calcul que ce qui est "loin"). En faisant varier la portée de cette fonction (redressement/aplatissement de la fonction gaussienne) on obtient une représentation plus ou moins « généralisé ». Dans le cadre de cet atlas, 4 portées différentes sont utilisées : 50, 100, 200 et 300 km. Comme mesure de distance, nous avons retenu la distance orthodromique qui tient compte de la sphéricité de la terre. D’un point de vue cartographique, ce type de représentation permet d’aider l’œil dans la lecture d\'une carte. De même qu\'une tendance résume de manière plus facilement compréhensible une série de valeurs relevées au fil du temps, une carte lissée permet de dégager uniquement les grands phénomènes. </p>';
$content_fr .=$MenuMapType_fr;


// ANGLAIS
$title_en ='Map types';
$content_en = '<h2>Smoothing</h2>';
$content_en .='<p><img src="images/schema_smooth.jpg"/></p>';
$content_en .= '(not available)';
$content_en .=$MenuMapType_en;