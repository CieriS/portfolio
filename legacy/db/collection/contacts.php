<?php

//query
$allContacts='
    SELECT * 
    FROM commonLinks 
    WHERE owner = 4;
';

$risultato=mysqli_query($connection,$allContacts) OR DIE(mysqli_error($connection));

while($riga=mysqli_fetch_array($risultato,MYSQLI_ASSOC)) {

    //questo array conterrà tutti gli indici e rappresenterà quindi tutti gli indici che rappresentano ogni oggetto dell'array associativo
    $hReference = $riga['hReference'];

    //creo l'oggetto contacts e raccolgo tutti i dati da db
    $contact = new stdClass();
    $contact -> hReference = $riga['hReference'];
    $contact -> hUrl = $riga['hUrl'];
    $contact -> description = $riga['description'];

    // Aggiungo l'oggetto all'array associativo con la chiave hReference
    $contacts[$hReference] = $contact;
};

?>

<script>
    //salvo in una variabile js const il json $contacts da php
    //lo stampo nei log
    const tableContactsCollected = <?php echo json_encode($contacts); ?>;
    console.log("%c Contact references:", "font-size: 12px; font-style: italic; color: #787276;");
    console.table(tableContactsCollected);
</script>