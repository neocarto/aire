<html>
  <head>
    <title>Glossaire</title>
	<meta charset="utf-8">
	<link rel="stylesheet" type="text/css" href="css/style.css" />
	</head>
  <body>
<div id="contain">
  


  
<?php
// -------------------------------------------------------------------------------------------------
$langue = 'en';
$page='glossary.php';
include('inc/'.$page.'');
// -------------------------------------------------------------------------------------------------



// TITRE
echo '<div id = "title">';
echo ${'title_'.$langue};
echo '</div>';

// MENU
include('inc/menu.php');

echo '<ul id="navigation">';
echo ${'menu_'.$langue};
echo '</ul>';

// CONTENT
echo '<div id = "content">';
echo ${'content_'.$langue};
echo '</div>';
?>

</div>
</body>
</html>