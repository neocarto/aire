<html>
</head>
<script language="JavaScript">
function OuvrirPop(url,nom,haut,Gauche,largeur,hauteur,options) {
ouvpop=window.open(url,nom,"top="+haut+",left="+Gauche+",width="+largeur+",height="+hauteur+","+options);
}
</script>
<link rel=stylesheet type="text/css" href="css/style.css">
</head>

<body>

<div class="intro">
<?php echo __("L'<b>Atlas Interactif des Régions Européennes</b> (AIRE) est un projet de l'UMS 2414 RIATE.<br/><br/>
Au delà d'un simple outil de consultation, l'atlas permet d'avoir accès à de <b>multiples représentations</b>
d'un même phénomène grâce à des méthodes d'analyses spatiales variées et/ou des représentations cartographiques
peu courantes <b>(cartes de potentiels, cartes de discontinuités, carroyages, anamorphoses, ...)</b> selon 5 niveaux de maillage européen différents.<br/><br/>Pour accéder à l'ensemble des représentations, cliquer à gauche sur une thématique puis sur une carte précise de votre choix") ?>
</div>

<div class="language">
<a href="/en"><img src="/aide/images/en.png" width="15"></img></a>
<a href="/fr"><img src="/aide/images/fr.png" width="15"></img></a>
<br/><?php echo __("version française") ?>
</div>

<div class="questionnaire">
<?php
   echo '<a href="http://survey.ums-riate.fr/index.php?sid=25466&lang='.__('fr').'" target="_blank" class="lien_survey">';
	echo __('Répondez au questionnaire');
	echo '</a>';
echo '</div>';
?>
</div>
</body>
</html>