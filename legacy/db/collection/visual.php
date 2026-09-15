<?php
//QUESTO DOCUMENTO RACCOGLIE DA DB TUTTO IL MATERIALE DI COPYWRITING DA SCRIVERE IN OUTPUT A VIDEO

//Qui dovrò ricvare in base all'utente la sua lingua, se italiano o inglese e rendere ttuto minuscolo
$userLanguage = strtolower("english");

//query
$allCopywritingsMsgs='
    SELECT W.id AS id, L.language AS language, W.description AS description 
    FROM writings AS W INNER JOIN lang as L 
    ON W.language = L.id 
    WHERE LOWER(L.language) LIKE "'. $userLanguage .'";
';

$risultato=mysqli_query($connection, $allCopywritingsMsgs) OR DIE(mysqli_error($connection));

while($riga=mysqli_fetch_array($risultato,MYSQLI_ASSOC)) {

    //questo array conterrà tutti gli indici e rappresenterà quindi tutti gli indici che rappresentano ogni oggetto dell'array associativo
    $copywritingMsgIndexes = $riga['id'];

    //creo l'oggetto copywritingMsg e raccolgo tutti i dati da db
    $copywritingMsg = new stdClass();
    $copywritingMsg -> id = $riga['id'];
    $copywritingMsg -> language = $riga['language'];
    $copywritingMsg -> description = $riga['description'];

    // Aggiungo l'oggetto all'array associativo con la chiave copywritingMsgIndexes
    $copywritingMsgs[$copywritingMsgIndexes] = $copywritingMsg;
};

$randomMsgIndex = random_int(1, count($copywritingMsgs));

$randMsg = $copywritingMsgs[$randomMsgIndex] -> description;

?>

<script>
    //salvo in una variabile js const il json $contacts da php
    //lo stampo nei log
    const tableMsgsCollected = <?php echo json_encode($copywritingMsgs); ?>;
    console.log("%c Copywriting Message references:", "font-size: 12px; font-style: italic; color: #787276;");
    console.table(tableMsgsCollected);

    console.log("Sentence generated:\n%c" + "<?php echo $randMsg; ?>", "font-style: italic; color: #787276;");
</script>