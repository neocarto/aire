/**
 * Tableau contenant des structures de traductions : {src, tr}
 */
var strI18N = [];

/**
 * Enregistre une phrase et sa traduction dans le tableau
 */
function D(src, tr)
{
  strI18N.push({src: src, tr: tr});
}

/**
 * Traduit une chaine en la cherchant dans le tableau
 */
function __(txt)
{
  for (var i = 0; i < strI18N.length; i++)
    if (strI18N[i].src == txt)
      return strI18N[i].tr;
  return '[T]'+txt+'[/T]';
}

D('Chargement du commentaire...', 'Chargement du commentaire...');
D('Chargement...', 'Chargement...');
D('La couche ne peut être affichée car elle n\'a pas été declarée.', 'La couche ne peut être affichée car elle n\'a pas été declarée.');
D('Revenir à l\'accueil', 'Revenir à l\'accueil');
D('Activer le mode navigation', 'Activer le mode navigation');
D('Activer le mode clic d\'informations', 'Activer le mode clic d\'informations');
D('Afficher l\'Europe entière', 'Afficher l\'Europe entière');
D('Activer le mode zoom en rectangle', 'Activer le mode zoom en rectangle');
D('Exporter la carte en SVG', 'Exporter la carte en SVG');
D('Afficher la carte en mode impression', 'Afficher la carte en mode impression');
D('Afficher l\'aide', 'Afficher l\'aide');
D('Afficher ou masquer la légende', 'Afficher ou masquer la légende');
