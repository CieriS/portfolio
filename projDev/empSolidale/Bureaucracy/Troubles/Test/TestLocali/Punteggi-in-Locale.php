<!doctype html>
<html>
<head>
    <style>
        body{
            text-align: center;
            padding: 0;
            border: 0;
        }
        hr{
            height: 20px;
            background-color: green;
            width: 100%;
        }
    </style>
</head>
<body ID="container">

<?php

    echo "<h1>TEST PUNTEGGIO PRESENZA MINORI</h1>";



        $ContatoreMaggiorenni=rand(1,3);
        $ContatoreMinorenni=rand(0,5);
        $PunteggioPresenzaMinori=0;

        if( $ContatoreMinorenni >= 1 && $ContatoreMaggiorenni == 1 ){
            $PunteggioPresenzaMinori=15+(4*$ContatoreMinorenni);
        }
        if( $ContatoreMaggiorenni > 1 && $ContatoreMinorenni >= 1 ){
            $PunteggioPresenzaMinori=10+(4*$ContatoreMinorenni);
        }

        echo "Maggiorenni: $ContatoreMaggiorenni <br/> Minorenni: $ContatoreMinorenni <br/> 15+(4*nMinori) — 10+(4*nMinori)<br/>";
        echo "$PunteggioPresenzaMinori";



    /*———————————————————————————————————————————————————————————————————————*/
    echo "<br/><hr/>";
    echo "<h1>TEST PUNTEGGIO DISOCCUPAZIONE</h1>";

        /*
        if( $cDisoccupati >= 1 ){
            $PunteggioDisoccupazione=$PunteggioDisoccupazione+(10*$cDisoccupati);
        }
        if( $cSemiDisoccupati >= 1 ){
            $PunteggioDisoccupazione=$PunteggioDisoccupazione+(5*$cSemiDisoccupati);
        }
        if( ($cPadre == 1 xor $cMadre == 1) && ($PadreDisoccupato xor $MadreDisoccupata) && ($ContatoreMinorenni >= 1) ){
            $PunteggioDisoccupazione=$PunteggioDisoccupazione+10;
        }
        if( (($cPadre == 1 && $cMadre == 1) || ($cPadre == 2 && $cMadre == 0) || ($cPadre == 0 && $cMadre == 2)) && ($PadreDisoccupato && $MadreDisoccupata) && ($ContatoreMinorenni >= 1) ){
            $PunteggioDisoccupazione=$PunteggioDisoccupazione+10;
        }
        if( (($cPadre == 1 && $cMadre == 1) || ($cPadre == 2 && $cMadre == 0) || ($cPadre == 0 && $cMadre == 2)) && (($PadreDisoccupato xor $MadreDisoccupata) || ($PadreSemiDisoccupato xor $MadreSemiDisoccupata)) && ($ContatoreMinorenni >= 1) ){
            $PunteggioDisoccupazione=$PunteggioDisoccupazione+5;
        }
        $nAdulti=$nComponentiNucleo-$cPadre-$cMadre-$ContatoreMinorenni;
        if( $nAdulti > 0 ){
            $PunteggioDisoccupazione=$PunteggioDisoccupazione+(5*($nComponentiNucleo-$cPadre-$cMadre-$ContatoreMinorenni));
        }
        */


    /*———————————————————————————————————————————————————————————————————————*/
    echo "<br/><hr/>";
    echo "<h1>TEST PUNTEGGIO INVALIDI</h1>";

        if( ($nComponentiNucleo > 1) && ( $FlagSSS3 == True || $FlagSSS4 == True ) ){ /* inv totale o malattia con inabilità lavorativa (in nucleo): 10 pnt */
            $PunteggioInvalidi=$PunteggioInvalidi+(10);                
        }
        if( ($nComponentiNucleo == 1) && ( $FlagSSS3 == True || $FlagSSS4 == True ) ){ /* inv totale o malattia con inabilità lavorativa (Da solo/a) : 20 pnt */
            $PunteggioInvalidi=$PunteggioInvalidi+(20);            
        }
        if( ($nComponentiNucleo > 1) && ( $FlagSSS3 == True || $FlagSSS4 == True ) ){ /* invalidità grave o malattia di adulto (in nucleo) : 5 pnt */
            $PunteggioInvalidi=$PunteggioInvalidi+(5);            
        }
        if( ($nComponentiNucleo == 1) && ( $FlagSSS3 == True || $FlagSSS4 == True ) ){ /* invalidità grave o malattia di adulto (da solo/a)  : 10 pnt */
            $PunteggioInvalidi=$PunteggioInvalidi+(10);
        }
        if( ($ContatoreMinorenni >= 1) && ( $FlagSSS3 == True || $FlagSSS4 == True ) ){ /* Invalidità grave di minore : 10 pnt † */
            $PunteggioInvalidi=$PunteggioInvalidi+(10);            
        }

    /*———————————————————————————————————————————————————————————————————————*/
    echo "<br/><hr/>";
    echo "<h1>TEST PUNTEGGIO SITUAZIONE DEBITORIA</h1>";

        /*  */

    /*———————————————————————————————————————————————————————————————————————*/
    echo "<br/><hr/>";
    echo "<h1>TEST PUNTEGGIO BENEFIT</h1>";

        /*  */

    /*———————————————————————————————————————————————————————————————————————*/
    echo "<br/><hr/>";

?>

</body>
</html>