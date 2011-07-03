<a name="ratioGrid"></a>
<div class="title">Carroyage</div><br/>
<img src="images/schema_grid.jpg" width="100%"/><br/><br/>
La représentation cartographique s’appuie, le plus souvent, sur un maillage administratif qui est un filtre spatial de l’information géographique.
Ce filtre déforme d’autant plus le message véhiculé par la carte que le maillage est hétérogène. Ceci est le cas en Europe où, par exemple, au niveau NUTS3, la plus petite unité administrative a une superficie de 13km2 alors que la plus grande a une superficie de 98249km2 (3300km2 en moyenne).
La méthode du carroyage est une des possibilités pour essayer de s'affranchir de l'arbitraire et de l'irrégularité d'un découpage administratif.
Elle met en évidence les grandes tendances de le répartition spatiale d'une donnée et de traiter des données, en découpant le territoire en « carreaux égaux et repérés » (Les mots de la géographie).
La donnée y est répartie sur un quadrillage régulier, dans un système de projection donné,  apposé sur la carte. La donnée obtenue par carreau est discrétisée puis affichée sur le quadrillage en plages de couleurs. Le principe retenu ici consiste à affecter aux carreaux de la grille, les stocks associés au maillage administratif, en fonction de la surface couverte par chaque carreau (affectation des valeurs au prorata de la surface). L’affectation des données sur la grille reste alors dépendant du maillage administratif sous jacent.
4 Carroyages à résolutions différentes sont utilisés dans le cadre de ce projet (40km, 80km, 160km et 320km).
Ces euils de résolutions correspondent à un lien spatial entre niveau de nuts et taille de grille.
