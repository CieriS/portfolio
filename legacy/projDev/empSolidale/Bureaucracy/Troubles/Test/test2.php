<!doctype html>
<html lang="it" ondragstart='return false' onselectstart='return false'>
<head>
<link href="../FileInclude/Style.css" rel="stylesheet" type="text/css">
</head>
<body>

    <?php

        /* √ Variabili Generalità Richiedente √ */
            /* Salvataggio di tutte le variabili *Quelle sotto "if(isset) non sono sempre obbligatorie* (Ho Considerato la mail non obbligatoria) */
            $nComponentiNucleo=$_REQUEST['nComponentiNucleoFamiliare']; /* Richiedente compreso */
            $CognomeRichiedente=UCWORDS(STRTOLOWER($_REQUEST['CognomeRichiedente']));
            $NomeRichiedente=UCWORDS(STRTOLOWER($_REQUEST['NomeRichiedente']));
            $LuogoNascitaRichiedente=UCWORDS(STRTOLOWER($_REQUEST['LuogoNascitaRichiedente']));
            $DataNascitaRichiedente=$_REQUEST['DataNascitaRichiedente'];
            $Cittadinanza=UCWORDS(STRTOLOWER($_REQUEST['Cittadinanza']));
            if(isset($_REQUEST['InItaliaDallAnno'])){
                $InItaliaDallAnno=$_REQUEST['InItaliaDallAnno'];
            }
            $Residenza=UCWORDS(STRTOLOWER($_REQUEST['Residenza']));
            $Via=UCWORDS(STRTOLOWER($_REQUEST['Via']));
            $CodiceFiscale=STRTOUPPER($_REQUEST['CodiceFiscale']);
            if( isset($_REQUEST['TipoDiAlloggio']) ){
                $Alloggio=$_REQUEST['TipoDiAlloggio'];
            }
            else
            {
                $Alloggio="";
            }
            $DocumentoDIdentita=UCWORDS(STRTOLOWER($_REQUEST['DocumentoDIdent']));
            if(isset($_REQUEST['DocumentoDImmig'])){
                $DocumentoDImmigrazione=$_REQUEST['DocumentoDImmig'];
            }
            if(isset($_REQUEST['Telefono'])){
                $Telefono=$_REQUEST['Telefono'];
            }
            if(isset($_REQUEST['Mail'])){
                $Mail=$_REQUEST['Mail'];
            }
            if( isset($_REQUEST['ServiziSociali']) ){
                $ServiziSociali=$_REQUEST['ServiziSociali'];
            }
            if(isset($_REQUEST['ComeHaConosciutoLEmporio'])){
                $ComeHaConosciutoLEmporio=$_REQUEST['ComeHaConosciutoLEmporio'];
            }
            if( isset($_REQUEST['TipoDiDomanda']) ){
                $TipoDiDomanda=$_REQUEST['TipoDiDomanda'];
            }
            $nMembri=$_REQUEST['nComponentiNucleoFamiliare'];
        /*————*/

        /* Patrimonio, Entrate e Uscite */
            $ValPatrimonioAtt=array();
            $ValPatrimonioPas=array();
            $ValEntrate=array();
            $ValUscite=array();

            for( $i=1;$i<=4;$i++ ) {
                if( isset($_REQUEST['ValoreSPatt']) ){
                    $ValPatrimonioAtt[$i]=$_REQUEST['ValoreSPatt'];
                }
            }

            for( $i=1;$i<=4;$i++ ) {
                if( isset($_REQUEST["ValoreSPpas"]) ){
                    $ValPatrimonioPas[$i]=$_REQUEST['ValoreSPpas'];
                    $ScadPatrimonioPas[$i]=$_REQUEST['ScadenzaSPpas'];
                }
            }

            for( $i=1;$i<=7;$i++ ) {
                if( isset($_REQUEST['ValoreENT']) ){
                    $ValEntrate[$i]=$_REQUEST['ValoreENT'];
                    $ScadPatrimonioPas[$i]=$_REQUEST['ScadenzaENT'];
                }
            }

            for( $i=1;$i<=6;$i++ ) {
                if( isset($_REQUEST['ValoreUSC']) ){
                    $ValUscite[$i]=$_REQUEST['ValoreUSC'];
                    $ScadPatrimonioPas[$i]=$_REQUEST['ScadenzaUSC'];
                }
            }
        /*————*/

        /* √ Contatori √ */
            $ContatoreMaggiorenni=1; /* Parte da uno perchè il richiedente è sicuramente maggiorenne */
            $ContatoreMinorenni=0;
            $cPadre=0;
            $cMadre=0;
            $cSemiDisoccupati=0;
            $cDisoccupati=0;
        /*————*/

        /* √ Varibili Generalità membri nucleo familiare √ */
            for($i=1;$i<$nComponentiNucleo;$i++){ /* salvataggio tabelle con membri famiglia */
                if(isset($_REQUEST["Nome$i"])){
                    ${'Nome'.$i}=UCWORDS(STRTOLOWER($_REQUEST["Nome$i"]));
                }

                if(isset($_REQUEST["LuogoNascita$i"])){
                    ${'LuogoNascita'.$i}=UCWORDS(STRTOLOWER($_REQUEST["LuogoNascita$i"]));
                }

                if(isset($_REQUEST["DataNascita$i"])){
                    ${'DataNascita'.$i}=$_REQUEST["DataNascita$i"];

                    $Oggi=DATE('d-m-y');

                    $cD=DATE('d');
                    $cM=DATE('m');
                    $cY=DATE('Y');

                    $nD=date('d', strtotime(${'DataNascita'.$i}));
                    $nM=date('m', strtotime(${'DataNascita'.$i}));
                    $nY=date('Y', strtotime(${'DataNascita'.$i}));

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

                }

                if(isset($_REQUEST["Parentela$i"])){
                    ${'Parentela'.$i}=UCWORDS(STRTOLOWER($_REQUEST["Parentela$i"]));
                    if( ${'Parentela'.$i}=="Padre" ){
                        $cPadre++;
                    }
                    if( ${'Parentela'.$i}=="Madre" ){
                        $cMadre++;
                    }
                }

                if(isset($_REQUEST["Occupazione$i"])){
                    ${'Occupazione'.$i}=UCWORDS(STRTOLOWER($_REQUEST["Occupazione$i"]));
                    if( ${'Occupazione'.$i}=="Disoccupato" || ${'Occupazione'.$i}=="Disoccupata" || ${'Occupazione'.$i}=="" ){
                        $cDisoccupati++;
                        if( ${'Parentela'.$i}=="Padre" ){
                            $PadreDisoccupato=TRUE;
                        }
                        else
                        {
                            $PadreDisoccupato=FALSE;
                        }
                        if( ${'Parentela'.$i}=="Madre" ){
                            $MadreDisoccupata=TRUE;
                        }
                        {
                            $MadreDisoccupata=FALSE;
                        }
                    }
                    if( ${'Occupazione'.$i}=="Semi Occupata" || ${'Occupazione'.$i}=="Semi Occupato" ){
                        $cSemiDisoccupati++;
                        if( ${'Parentela'.$i}=="Padre" ){
                            $PadreSemiDisoccupato=TRUE;
                        }
                        else
                        {
                            $PadreSemiDisoccupato=FALSE;
                        }
                        if( ${'Parentela'.$i}=="Madre" ){
                            $MadreSemiDisoccupata=TRUE;
                        }
                        {
                            $MadreSemiDisoccupata=FALSE;
                        }
                    }
                }
            }
            $AnnoSSS=array();
            for( $i=1; $i<= 12 ; $i++ ) {
                if( isset($_REQUEST["Anno$i"]) ){
                    $AnnoSSS[$i]=$_REQUEST["Anno$i"];
                    ${'FlagSSS'.$i}=TRUE;
                }
                else
                {
                    ${'FlagSSS'.$i}=FALSE;
                }
            }
        /*————*/

        /* √ Variabili Punteggi √ */
            $ISEE=$_REQUEST['IndiceISEE'];
            $PunteggioPresenzaMinori=0;
            $PunteggioDisoccupazione=0;
            $PunteggioInvalidi=0;
            $PunteggioSituazioneDebitoria=0;
            $PunteggioBenefit=0;
            $PunteggioTotale=0;
        /*————*/

        /* √ Variabili domande finali e valutazione √ */
            $AmbitoFormativo=$_REQUEST['Formativo'];
            $AmbitoLavorativo=$_REQUEST['Lavorativo'];
            $AmbitoSociale=$_REQUEST['Sociale'];
            $ValutazioneCommissione=$_REQUEST['ValutCommissione'];
        /*————*/

        /* √ Punteggio per indicatore ISEE √ */
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
            die("");
            }
        /*————*/

        /* √ Punteggio per presenza di minori √ */
            if( $ContatoreMinorenni >= 1 && $ContatoreMaggiorenni == 1 ){
                $PunteggioPresenzaMinori=15+(4*$ContatoreMinorenni);
            }
            if( $ContatoreMaggiorenni > 1 && $ContatoreMinorenni >= 1 ){
                $PunteggioPresenzaMinori=10+(4*$ContatoreMinorenni); /* Se un figlio è adulto e in totale sono 3? l'ho gestita in modo che se c'è più di un adulto viene assegnata la seconda categoria di punteggi */
            }
        /*————*/

        /* √† Punteggio per disoccupazione †√ */
            if( $cDisoccupati >= 1 ){
                $PunteggioDisoccupazione=$PunteggioDisoccupazione+(10*$cDisoccupati); /* 10 punti per ogni disoccupato */
            }
            if( $cSemiDisoccupati >= 1 ){
                $PunteggioDisoccupazione=$PunteggioDisoccupazione+(5*$cSemiDisoccupati); /* 5 punti per ogni semiodisoccupato */
            }
            if( ($cPadre == 1 xor $cMadre == 1) && ($PadreDisoccupato xor $MadreDisoccupata) && ($ContatoreMinorenni >= 1) ){
                $PunteggioDisoccupazione=$PunteggioDisoccupazione+10; /* 10 punti per 1 genitore solo */
            }
            if( (($cPadre == 1 && $cMadre == 1) || ($cPadre == 2 && $cMadre == 0) || ($cPadre == 0 && $cMadre == 2)) && ($PadreDisoccupato && $MadreDisoccupata) && ($ContatoreMinorenni >= 1) ){
                $PunteggioDisoccupazione=$PunteggioDisoccupazione+10; /* 10 punti ci sono due genitori entrambi disoccupati e con figli minori */
            }
            if( (($cPadre == 1 && $cMadre == 1) || ($cPadre == 2 && $cMadre == 0) || ($cPadre == 0 && $cMadre == 2)) && (($PadreDisoccupato xor $MadreDisoccupata) || ($PadreSemiDisoccupato xor $MadreSemiDisoccupata)) && ($ContatoreMinorenni >= 1) ){ /* X  */
                $PunteggioDisoccupazione=$PunteggioDisoccupazione+5; /* Semi Occupazione? */
            }
            $nAdulti=$nComponentiNucleo-$cPadre-$cMadre-$ContatoreMinorenni;
            if( $nAdulti > 0 ){ /* Assegno punteggio per ogni altro adulto a carico  */
                $PunteggioDisoccupazione=$PunteggioDisoccupazione+(5*($nComponentiNucleo-$cPadre-$cMadre-$ContatoreMinorenni));
            }
        /*————*/

        /* √† Punteggio per invalidità, inabilità o malattia grave †√ */
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
        /*————*/

        /* √† Punteggio per situazione debitoria †√ */
            if( $FlagSSS6 == TRUE ){/* Pignoramento di stipendio pensione, C/C */
                $PunteggioSituazioneDebitoria=$PunteggioSituazioneDebitoria+(5);
            }
            if( $FlagSSS7 == TRUE ){/* Morosità d'affitto e/o utenze domestiche */
                $PunteggioSituazioneDebitoria=$PunteggioSituazioneDebitoria+(5);
            }
            if( $FlagSSS9 == TRUE || $FlagSSS10 == TRUE ){/* Sfratto esecutivo o in corso o emergenza abitativa */
                $PunteggioSituazioneDebitoria=$PunteggioSituazioneDebitoria+(10);
            }
            if( $ValPatrimonioPas[4] > 0  ){/* Altre voci nei debiti (SPp) */
                $PunteggioSituazioneDebitoria=$PunteggioSituazioneDebitoria+rand(2,10);
            }
        /*————*/

        /* √† Punteggio da dedurre per benefit †√ */
            if( $Alloggio == "Popolare" ){
                $PunteggioBenefit=$PunteggioBenefit-10;
            }
            if( $ValEntrate[4] > 0 ){
                $PunteggioBenefit=$PunteggioBenefit-10;
            }
            if( $ValEntrate[2] > 0 ){
                $PunteggioBenefit=$PunteggioBenefit-10;
            }
            if( $ValEntrate[3] > 0 ){
                if( $ValEntrate[3] < 1000 ){
                    $PunteggioBenefit=$PunteggioBenefit-2;
                }
                if( $ValEntrate[3] < 2000 ){
                    $PunteggioBenefit=$PunteggioBenefit-3;
                }
                if( $ValEntrate[3] < 3000 ){
                    $PunteggioBenefit=$PunteggioBenefit-4;
                }
                if( $ValEntrate[3] < 4000 ){
                    $PunteggioBenefit=$PunteggioBenefit-5;
                }
            }
        /*————*/

        /* √ Punteggio Totale √ */
            $PunteggioTotale=$PunteggioISEE+$PunteggioPresenzaMinori+$PunteggioDisoccupazione+$PunteggioInvalidi+$PunteggioSituazioneDebitoria+$PunteggioBenefit;
        /*————*/

        /* √ Scrittura √ */
            echo "<table style='font-size: 1vw;' border='1'><tr><tr><th>PunteggioISEE</th><th>PunteggioPresenzaMinori</th><th>PunteggioDisoccupazione</th><th>PunteggioInvalidi</th><th>PunteggioSituazioneDebitoria</th><th>PunteggioBenefit</th><th>PunteggioTotale</th></tr><th>$PunteggioISEE</th><th>$PunteggioPresenzaMinori</th><th>$PunteggioDisoccupazione</th><th>$PunteggioInvalidi</th><th>$PunteggioSituazioneDebitoria</th><th>$PunteggioBenefit</th><th>$PunteggioTotale</th></tr></table>";
            echo "$AmbitoLavorativo<br/>$AmbitoLavorativo<br/>$AmbitoSociale<br/>$ValutazioneCommissione";
        /*————*/

        /* inserimento nella table Punteggio */

            $insert="INSERT INTO Punteggio VALUES ('".$CodiceFiscale."','".$PunteggioISEE."','".$PunteggioPresenzaMinori."','".$PunteggioDisoccupazione."','".$PunteggioInvalidi."','".$PunteggioSituazioneDebitoria."','".$PunteggioBenefit."','".$PunteggioTotale."');";

            $risultatoInserimentoPunteggio=mysqli_query($connection,$insert) OR HEADER('Location: Test.php');

        /*————*/

        /* inserimento generalità richiedente nella tabella rchiedente (Senza campo tessera (ultimo)) */

            $insertGenRichiedente="INSERT INTO Richiedente (Cod_Fiscale, Cognome, Nome, LuogoNascita, DataNascita, Cittadinanza, InItaliaDallAnno, Residenza, Via, TipoAlloggio, DocumentoIdent, DocumentoImmig, Telefono, Mail, ServiziSociali, ComeHaConosciutoEmporio, TipoDomanda) VALUES ('".$CodiceFiscale."','".$CognomeRichiedente."','".$NomeRichiedente."','".$LuogoNascitaRichiedente."','".$DataNascitaRichiedente."','".$Cittadinanza."','".$InItaliaDallAnno."','".$Residenza."','".$Via."','".$Alloggio."','".$DocumentoDIdentita."','".$DocumentoDImmigrazione."','".$Telefono."','".$Mail."','".$ServiziSociali."','".$ComeHaConosciutoEmporio."','".$TipoDiDomanda."';";

            $risultatoInserimentoGenRichiedente=mysqli_query($connection,$insertGenRichiedente) OR HEADER('Location: Test.php');

        /*————*/

        

    ?>

</body>
</html>
</body>
</html>