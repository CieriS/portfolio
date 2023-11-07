<!doctype html>
<html>
<head>
<style>
.night{
    background-color: black;
    color: white;
}
</style>
</head>
<body ID="container">

<?php

    echo "<h1>Calcolo Maggiore et&agrave; giusta</h1>";

    $ContatoreMaggiorenni=1; /* Parte da uno perchè il richiedente è sicuramente maggiorenne */
    $ContatoreMinorenni=0;
    $c=DATE('d-m-y');
    $n="16-08-2002";

    $cD=DATE('d');
    $cM=DATE('m');
    $cY=DATE('Y');

    $nD=date('d', strtotime($DataNascita));
    $nM=date('m', strtotime($DataNascita));
    $nY=date('Y', strtotime($DataNascita));
    echo "Data Nascita: $n<br/>";
    echo "Oggi: $c<br/>";

    if( ($cY-$nY) >= 18 ){
        if( ($cY-$nY) > 18 ){
            $ContatoreMaggiorenni++;
        }
        if( ($cY-$nY) == 18 ){
            if( $nM <= $cM ){
                if( $nM < $cM ){
                    $ContatoreMaggiorenni++;
                }
                if( $nM == $cM ){
                    if( $nD <= $cD ){
                        $ContatoreMaggiorenni++;
                    }
                    else
                    {
                        $ContatoreMinorenni++;
                    }
                }
            }
            else
            {
                $ContatoreMinorenni++;
            }
        }
    }
    else
    {
        $ContatoreMinorenni++;
    }

echo "$ContatoreMaggiorenni <br/> $ContatoreMinorenni";

    echo "<hr/>";

    echo "<h1>test pt. isee</h1>";


    /*for($ISEE=0;$ISEE<=7500;$ISEE=$ISEE+2000){*/
        $ISEE=rand(0,10000);

    /* Punteggio per indicatore ISEE */
    switch ($ISEE) {
        case ($ISEE == 0):
        $PunteggioISEE=100;
        break;
        case ($ISEE >= 1 && $ISEE <= 1500):
        $PunteggioISEE=100;
        break;
        case ($ISEE >= 1501 && $ISEE <= 3000):
        $PunteggioISEE=80;
        break;
        case ($ISEE >= 3001 && $ISEE <= 4500):
        $PunteggioISEE=60;
        break;
        case ($ISEE >= 4501 && $ISEE <= 6000):
        $PunteggioISEE=40;
        break;
        case ($ISEE >= 6001 && $ISEE <= 7500):
        $PunteggioISEE=20;
        break;
        default:
        /* die("") dovrebbe fermare tutto perchè se l'isee non è fra 0 e 7.5k non ci dovrebbe essere nessun calcolo del punteggio ;*/
    }
/*
    if($PunteggioISEE != 100){*/
    echo "ISEE:$ISEE<br/>";
    echo "Punti Assegnati:$PunteggioISEE<br/><hr/>";
/*
    }
*/
   /* } */


echo "<h1>test presenza minori</h1>";

            $nAdulti=rand(1,2);
            $nMinori=rand(1,10);
            /* Punteggio per presenza di minori */
            if( $nMinori >= 1 && $nAdulti== 1 )
                {
                    $PunteggioPresenzaMinori=15+(4*$nMinori);
                }
            if( $nAdulti > 1 && $nMinori >= 1 )
                {
                    $PunteggioPresenzaMinori=10+(4*$nMinori);
                }
            echo "Adulti: $nAdulti Minori: $nMinori<br/>PuntiAssegnati:$PunteggioPresenzaMinori";


echo "<hr/>";

echo "<h1>test input type date</h1>";

echo "<input type='date' name='bolshevick' />"; /* Non funziona su safari */

echo "<hr/>";

echo "<h1>test input name</h1>";

if($_REQUEST)
{

    $y=1;
    $variabile=$_REQUEST["ciao$y"];
    echo "$variabile";

}
else
{

    $action=$_SERVER['PHP_SELF'];
    echo "<form action=" . $action . " method='POST' autocomplete='Off'>";
    $i=1;


    echo "<input type='text' name='ciao$i' />
    <input type='submit' name='invia' />"; ?>
    </form>
    <?php

}

echo "<hr/>";

echo "<h1>test primmaiusc</h1>";


$nome=UCFIRST(STRTOLOWER("SAMUEhE"));
echo "$nome";

echo "<hr/>";

echo "<h1>test buio</h1>";

$ora=Date('H');

echo "$ora";
if($ora >= 22 || $ora <= 8 ){
?>

<script>

        var div = document.getElementById("container");
        div.className += " night";

</script>

<?php
}
echo "<hr/>";

echo "<h1>testerello</h1>";

require('../../FileInclude/FileRequired/Connessione.php');

echo DATE('d/m/Y')."<br/>";
echo "";

?>
<script>
if( confirm("Il richiedente è nel periodo di stallo, è sicuro di voler assegnare comunque la tessera?\nOk per assegnare comunque\nAnnulla per non assegnare") ){
}else{
}
</script>
<?php

echo "<hr/>";

echo "<h1>test Javascript</h1>";

$data=DATE('d-m-Y');
echo "$data<br/>";

?>

<input type="number" onchange="getInputValue();" placeholder="Type something..." id="myInput"><button onclick="getInputValue();">OK</button>
    
    <script>
            var inputVal = document.getElementById("myInput").value;
            window.globalVar = document.getElementById("myInput").value;

            for( i = 1 ; i <= inputVal ; i++ ) {
                document.write("ok<br/>");
            }
    </script>

continuo a scrovere



    



</body>
</html>