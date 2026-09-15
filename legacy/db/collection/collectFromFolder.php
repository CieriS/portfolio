<?php

function actualPath(){
    $actualPathContents = scandir(".");
    return $actualPathContents;
}

function checkPathExistence($path){
    $isNotDir = !is_dir($path);
    return $isNotDir; 
}
function collectFromFolder($folderPath="."){

    $isNotDir = checkPathExistence($folderPath);

    $isFolderPathEmpty = $folderPath == "";
    
    if( $isFolderPathEmpty || $isNotDir )
        $folderPath = ".";

    $pathOnConsole = "[collectFromFolder.php] Directory '" . $folderPath . "' contains";

    $directoryContents = scandir($folderPath); // Utilizza scandir() per ottenere l'elenco dei file e delle directory

    $directoryContents = array_diff($directoryContents, array(".", "..")); // Rimuovi "." e ".." che rappresentano la directory corrente e quella superiore

    printInConsoleArrayOfObjects($pathOnConsole, $directoryContents);

    return $directoryContents;
}

?>