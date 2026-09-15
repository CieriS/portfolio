<?php
      
      $Host="localhost";
      $User="root"; //  cierisamuele
      $Password=""; //  ...
      $DataBaseName="EmporioSolidale";  //  my_cierisamuele

      $connection=MYSQLI_CONNECT($Host,$User,$Password,$DataBaseName) OR DIE ("Error 104: " . MYSQLI_CONNECT_ERROR());

?>