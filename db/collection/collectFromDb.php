<?php 

function isArrayUnique($array){
    $uniqueArray = array_unique($array);
    return count($uniqueArray) === count($array);
}

//funzione utile al collezionamento di dati dal db
function collectData($dbConnect, $querySql, $arrayParameters, &$arrayOfObjects=[]){

    //controllo che tutte i parametri siano valorizzati correttamente
    //$dbConnect che sia settato
    //$querySql che sia settato
    //$arrayParameters che sia settato e che sia un array
    if(!isset($dbConnect) || !isset($querySql) || (!is_array($arrayParameters) && !isset($arrayParameters))){
        return false;
    }

    //esegue la query parametro a DB
    $risultato=mysqli_query($dbConnect, $querySql) OR DIE(mysqli_error($dbConnect));

    //ciclo che estrae ogni row dal db
    while($row=mysqli_fetch_array($risultato, MYSQLI_ASSOC)) {
        //ricerco quale delle colonne sia chiave primaria
        /*foreach($row as $key => $value){
            if(isArrayUnique($row[$key])){
                $indexOf = $row[$key]; //array che contiene tutti gli indici
                break; //esco dal ciclo 
            }
        }*/

        $indexOf = $row[$arrayParameters[0]]; //array che contiene tutti gli indici

        //creo l'oggetto obj e raccolgo tutti i dati da db
        $obj = new stdClass();
        foreach($row as $key => $value){
            $obj -> $key = $row[$key];
        }

        $objs[$indexOf] = $obj; // Aggiungo l'oggetto all'array associativo con la chiave copywritingMsgIndexes
    }

    //stampo in console l'array di oggetti
    printInConsoleArrayOfObjects("collectFromDb.php File says", $objs);

    //ritorno l'array di oggetti tramite parametro per riferimento
    $arrayOfObjects = $objs;

    //ritorno true per confermare il completamento in modo corretto della funzione
    return true;
}

?>