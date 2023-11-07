<script>
  let connectionToDbMoment = actualTime("Connection to DB at -> ");
</script>

<?php
  
//costante con definito l'URL root
define('PORTFOLIO_LOCAL', 'http://localhost/Developement/webSitePortfolio/');
define('PORTFOLIO_ALTERVISTA', 'https://cierisamuele.altervista.org/');

//error URL const
define('PORTFOLIO_ERRORURLDEBUG', PORTFOLIO_LOCAL . 'error');
define('PORTFOLIO_ERRORURLREAL', PORTFOLIO_LOCAL . 'error');

//variabili d'ambiente
$host="localhost";
$user="root";
$psw="";
$dbName="my_cierisamuele";

//console log per ricordarmi il l'url del sito
echo '<script>console.log("%c welcome! %c\nURL: ' . PORTFOLIO_ALTERVISTA . '\n", "color: green;", "color: inherit;")</script>';

//Connessione al db o reindirizzamento alla pagina di errore
$connection=MYSQLI_CONNECT($host,$user,$psw,$dbName) OR DIE(header("Location: " .PORTFOLIO_ERRORURLREAL));

?>

<script>
  //Log di connessione al db avvenuta
  console.log("%c Database Connected!", "font-weight: 1000;")
</script>