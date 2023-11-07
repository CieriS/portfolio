<?php

      require("Connessione.php");

      /* L'unico caso in cui, volutamente, l'utente non viene registrato, è quando l'utente immette la stessa Primary Key più volte, a condizione, ovviamente, che il database sia creato correttameente  */

      $query="INSERT INTO Passeggero VALUES ('".$Cod_Fisc."','".$Nome."','".$Cognome."','".$Sesso."','".$Volo."')";

      $risultato=mysqli_query($connection,$query) OR DIE('invio dati non riuscito');

?>

      <meta HTTP-EQUIV="refresh" content="10;URL=../Summary.php">

      <Div class="Allineamento_Bi">
      <p>Verrai Reindirizzato al Sommario in <span id="counter">10</span> second(s)...</p>
      </div>
<script type="text/javascript">
      function countdown() 
        {
          var i = document.getElementById('counter');
          if (parseInt(i.innerHTML)<=0)
            {
              location.href = '../Summary.php';
            }
          i.innerHTML = parseInt(i.innerHTML)-1;
        }
      setInterval(function(){ countdown(); },1000);
</script>

      <Div class='AltoSinistra'>
      <a class='Link' href='../../Index.php'>Home</a>
      </Div>
      
      <Div class='AltoDestra'>
      <a class='Link' href='../Summary.php'>Sommario</a>
      </Div>
      
      <div class='Complimenti'>

      <div class="centra">Hai comprato il biglietto, <br/>Il tuo volo &egrave;: <?php echo $Volo; ?></div>

      </Div>

<?php
      mysqli_close($connection);
?>