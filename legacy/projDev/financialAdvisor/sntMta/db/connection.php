<?php

//Host
$host="localhost";

//User
$user="root";

//password
$psw="";

//Nome DB
$DBn="_Aeroporto_";

/* Connessione al dbms */
$connection=mysqli_connect($host,$user,$psw,$DBn) or die ("Connessione al DBMS non riuscite:<br/>" . mysqli_connect_error());

?>