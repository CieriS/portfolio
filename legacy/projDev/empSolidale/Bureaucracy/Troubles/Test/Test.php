<!doctype html>
<html lang="it" ondragstart='return false' onselectstart='return false'>
<head>
<link href="../FileInclude/Style.css" rel="stylesheet" type="text/css">
<script src="FileInclude/JavaScript.js"></script>
</head>
<body ID="container">

<?php
    /*require('../FileInclude/FileRequired/Functions.php');*/ 
        echo "<form action='test2.php' method='POST' autocomplete='Off'>";
            ?>

            <img ID="container" class="banner" src="../FileInclude/immagini/EmporioSolidale.png" />

            <h1>DOMANDA DI ACCESSO ALL'EMPORIO SOLIDALE</h1>
            <h3>DATI ANAGRAFICI E RESIDENZIALI DEL RICHIEDENTE</h3>

            <table Class="Anag Sep" border="0">

                <tr>
                    <th Class="AlignLeft" colspan="2"><input Class="DatiAnagrafici" type="text" name="CognomeRichiedente" required/><br/><div Class="Weighter">Cognome</div></th>

                    <th Class="AlignLeft" colspan="2"><input Class="DatiAnagrafici" type="text" name="NomeRichiedente" required/><br/><div Class="Weighter">Nome</div></th>
                </tr>

                <tr>
                    <th Class="AlignLeft"><input Class="DatiAnagrafici" type="text" name="LuogoNascitaRichiedente" required/><br/><div Class="Weighter">Nat... a</div></th>

                    <th Class="AlignLeft"><input Class="DatiAnagrafici" type="date" name="DataNascitaRichiedente" required/><br/><div Class="Weighter">Il</div></th>

                    <th Class="AlignLeft"><input Class="DatiAnagrafici" type="text" name="Cittadinanza" required/><br/><div Class="Weighter">Cittadinanza</div></th>

                    <th Class="AlignLeft"><input Class="DatiAnagrafici" type="text" maxlength="4" minlength="4" name="InItaliaDallAnno" required/><br/><div Class="Weighter">In Italia Dall'Anno</div></th>
                </tr>

                <tr>
                    <th Class="AlignLeft"><input Class="DatiAnagrafici" type="text" name="Residenza" required/><br/><div Class="Weighter">Residente a</div></th>

                    <th Class="AlignLeft" colspan="2"><input Class="DatiAnagrafici" type="text" name="Via" required/><br/><div Class="Weighter">Via</div></th>

                    <th Class="AlignLeft"><input Class="DatiAnagrafici" type="text" name="CodiceFiscale" minlength="16" maxlength="16" required/><br/><div Class="Weighter">C.F.</div></th>
                </tr>

                <tr>
                    <th colspan="4" Class="AlignLeft">
                    <select Class="DatiAnagrafici" name="TipoDiAlloggio">
                    <optgroup label="Alloggio:">
                    <option value="" disabled selected></option>
                    <option value="Propriet&agrave;">Propriet&agrave;</option>
                    <option value="Affitto Privato">Affitto Privato</option>
                    <option value="Convenzionato">Convenzionato</option>
                    <option value="Popolare">Popolare</option>
                    <option value="Emergenza Abitativa">Emergenza Abitativa</option>
                    </optgroup>
                    </select>
                    <br/><div Class="Weighter">Tipo di Alloggio (Propriet&agrave;, Affitto Privato, Convenzionato, Popolare, Emergernza abitativa)</div></th>
                </tr>

                <tr>
                    <th Class="AlignLeft" colspan="2"><input Class="DatiAnagrafici" type="text" minlength="9" maxlength="9" name="DocumentoDIdent" required/><br/><div Class="Weighter">Documento D'Identit&agrave;</div></th>

                    <th Class="AlignLeft" colspan="2"><input Class="DatiAnagrafici" type="text" name="DocumentoDImmig" required/><br/><div Class="Weighter">Documento D'Immigrazione</div></th>
                </tr>

                <tr>
                    <th Class="AlignLeft" colspan="2"><input Class="DatiAnagrafici" type="text" maxlength="10" name="Telefono" required/><br/><div Class="Weighter">Telefono</div></th>

                    <th Class="AlignLeft" colspan="2"><input Class="DatiAnagrafici" type="email" name="Mail" required/><br/><div Class="Weighter">E-mail</div></th>
                </tr>

                <tr>
                    <th colspan="4" Class="AlignLeft">
                    <select Class="DatiAnagrafici" name="ServiziSociali">
                    <optgroup label="Domanda:">
                    <option value="" disabled selected></option>
                    <option value="Si">Si</option>
                    <option value="No">No</option>
                    <option value="Area">Area</option>
                    <option value="Assistenza Sociale">Assistenza Sociale</option>
                    </optgroup>
                    </select>
                    <br/><div Class="Weighter">Gi&agrave; in carico ai Servizi Sociali (SI, NO, AREA, Ass. Sociale)</div></th>
                </tr>

                <tr>
                    <th colspan="4" Class="AlignLeft">
                    <input Class="DatiAnagrafici" type="text" name="ComeHaConosciutoLEmporio"/>
                    <br/><div Class="Weighter">Come ha conosciuto l'Emporio</div></th>
                </tr>

                <tr>
                    <th colspan="4" Class="AlignLeft">
                    <select Class="DatiAnagrafici" name="TipoDiDomanda">
                    <optgroup label="Tipo di Domanda:">
                    <option value="" disabled selected></option>
                    <option value="Domanda Nuova">Domanda Nuova</option>
                    <option value="Domanda Di Modifica">Domanda Di Modifica</option>
                    <option value="Domanda Reiterata">Domanda Reiterata</option>
                    </optgroup>
                    </select>
                    <br/><div Class="Weighter">Tipo di Domanda (Domanda Nuova - Domanda di modifica - Domanda reiterata)</div></th>
                </tr>

                <tr>
                    <th colspan="4" Class="AlignLeft">
                    <input Class="DatiAnagrafici" type="Number" name="nComponentiNucleoFamiliare" required/>
                    <br/><div Class="Weighter">Numero Componenti Nucleo Familiare (Incluso Richiedente)</div></th>
                </tr>

            </table>

            <p Class="interruzione">&nbsp;</p>

            <h3><span Class="underline">COMPOSIZIONE NUCLEO FAMILIARE (Come da ISEE)</span></h3>

            <table Class="test" border='1'>

                <tr> <!---- Intestazione della tabella: COMPOSIZIONE NUCLEO FAMILIARE (Come da ISEE) "" ---->
                    <th Class="BGcolorIntestazioneTable">N.</th>
                    <th Class="BGcolorIntestazioneTable">Nome</th>
                    <th Class="BGcolorIntestazioneTable">Nat... a</th>
                    <th Class="BGcolorIntestazioneTable">Il</th>
                    <th Class="BGcolorIntestazioneTable">Parentela</th>
                    <th Class="BGcolorIntestazioneTable">Occupazione</th>
                </tr>

                <?php

                    for($i=1;$i<=10;$i++){
                        echo "<tr>";
                            echo "<td Class='bold'>$i</td>";
                            echo "<td><input title='Nome e Cognome del componente' type='text' name='Nome[$i]' /></td>";
                            echo "<td><input type='text' name='LuogoNascita[$i]' /></td>";
                            echo "<td><input type='date' name='DataNascita[$i]' /></td>";
                            echo "<td><input title='Padre / Madre o altra parentela' type='text' name='Parentela[$i]' /></td>";
                            echo "<td><input title='Disoccupato / Semi Occupato / Altra Occupazione' type='text' name='Occupazione[$i]' /></td>";
                        echo "</tr>";
                    }

                ?>
            </table>


            <h3><span Class="underline">COMPONENTI EXTRA ISEE</span></h3>

            <table Class="Sep" border='1'>

                <tr>  <!---- Intestazione della tabella: "Componenti extra ISEE" ---->
                    <th Class="BGcolorIntestazioneTable">N.</th>
                    <th Class="BGcolorIntestazioneTable">Nome</th>
                    <th Class="BGcolorIntestazioneTable">Nat... a</th>
                    <th Class="BGcolorIntestazioneTable">Il</th>
                    <th Class="BGcolorIntestazioneTable">Parentela</th>
                    <th Class="BGcolorIntestazioneTable">Occupazione</th>
                </tr>
                <?php

                    for($i=11;$i<=12;$i++){
                        echo "<tr>";
                            echo "<td Class='bold'>$i</td>";
                            echo "<td><input type='text' name='Nome[$i]' /></td>";
                            echo "<td><input type='text' name='LuogoNascita[$i]' /></td>";
                            echo "<td><input type='date' name='DataNascita[$i]' /></td>";
                            echo "<td><input type='text' name='Parentela[$i]' /></td>";
                            echo "<td><input title='Disoccupato / Semi Occupato / Altra Occupazione' type='text' name='Occupazione[$i]' /></td>";
                        echo "</tr>";
                    }

                ?>
            </table>

            <h3><span Class="underline Sep">SITUAZIONE SOCIO-SANITARIA DEL NUCLEO FAMILIARE</span></h3>

            <table Class="Sep" border='1'>
                <tr>  <!---- Intestazione della tabella: "SITUAZIONE SOCIO-SANITARIA DEL NUCLEO FAMILIARE" ---->
                    <th Class="BGcolorIntestazioneTable">N.</th>
                    <th Class="BGcolorIntestazioneTable">Evento</th>
                    <th Class="BGcolorIntestazioneTable">Anno</th>
                    <th Class="BGcolorIntestazioneTable">Doc. All.</th>
                </tr>

                <?php

                    $Evento1="Mancanza del partner per...";
                    $Evento2="Violenze e maltrattamenti familiari";
                    $Evento3="Presenza d'invalidt&agrave; media (oltre il 75&#65285;)";
                    $Evento4="Presenza d'invalidit&agrave; grave (oltre il 100&#65285;)";
                    $Evento5="Restrizioni della libert&agrave;";
                    $Evento6="Pignoramenti in corso";
                    $Evento7="Morosit&agrave; per affitto e/o utenze domestiche";
                    $Evento8="Mancato pagamento di rate del mutuo casa";
                    $Evento9="Avviso di sfratto";
                    $Evento10="Sfratto imminente";
                    $Evento11="Non poter sostenere spese impreviste";
                    $Evento12="Non potersi permettere l'automobile";

                    for($i=1;$i<=12;$i++){
                        echo "<tr>";
                            echo "<td Class='bold'>$i</td>";
                            echo "<td> ${'Evento'.$i} </td>";
                            echo "<td><input type='text' maxlength='4' name='Anno[$i]' /></td>";
                            echo "<td><input type='text' name='DocAll[$i]' /></td>";
                        echo "</tr>";
                    }

                ?>
            </table>

            <p Class="interruzione">&nbsp;</p>

            <h3><span Class="underline">CONDIZIONE LAVORATIVA DEL NUCLEO FAMILIARE</span><br/><span Class="TextSmaller">(esclusi i componenti minorenni)</span></h3>

            <?php

                for($i=1;$i<=8;$i++){ /*  La variabile $nAdulti ancora non esiste DA RICORDARE */
                  
                    echo "<table Class='CLNF' border='0'>";
                        echo "<tr>";
                            echo "<th valign='top' Class='AlignLeft' rowspan='7'>$i</th>";
                            echo "<td Class='AlignLeft bold'>Nome</td><th colspan='3'><input type='text' name='NomeAdulto[$i]' /></th>";
                        echo "</tr>";
                        
                        echo "<tr>";
                            echo "<td Class='AlignLeft bold'>Titolo Di Studio</td><th colspan='3'><input type='text' name='TitoloDiStudio[$i]' /></th>";
                        echo "</tr>";

                        echo "<tr>";
                            echo "<td Class='AlignLeft bold'>Competenze</td><th colspan='3'><input type='text' name='Competenze[$i]' /></th>";
                        echo "</tr>";

                        echo "<tr>";
                            echo "<td Class='AlignLeft bold'>Conoscenza Lingua</td><th><input Class='smaller AlignRight' type='text' name='ConoscenzaLingua[$i]' /></th><td Class='AlignRight bold'>Patente</td><th><input type='text' Class='smaller' name='Patente[$i]' /></th>";
                        echo "</tr>";

                        echo "<tr>";
                            echo "<td Class='AlignLeft bold'>Attivit&agrave; Attuale</td><th colspan='3'><input type='text' name='AttAtt[$i]' /></th>";
                        echo "</tr>";

                        echo "<tr>";
                            echo "<td Class='AlignLeft bold'>Presso</td><th><input type='text' Class='smaller' name='Presso[$i]' /></th><td Class='AlignRight bold'>Termine</td><th><input Class='smaller' type='text' name='Termine[$i]' /></th>";
                        echo "</tr>";

                        echo "<tr>";
                            echo "<td Class='AlignLeft bold'>Senza Lavoro Da</td><th colspan='3'><input type='text' name='SenzaLavoroDa[$i]' /></th>";
                        echo "</tr>";

                    echo "</table>";

                }

            ?>

            <p Class="interruzione">&nbsp;</p>

            <h3><span Class="underline">ANALISI ECONOMICO/FINANZIARIA DEL NUCLEO FAMILIARE</span></h3>
            
            <table Class="Sep">
                <tr>
                    <th Class="sot bold AlignRight">INDICE ISEE: <input type="number" name="IndiceISEE" value="0" min="0" max="7500" /></th>
                </tr>
            </table>

            <h3><span Class="underline">PATRIMONIO ATTIVO DEL NUCLEO FAMILIARE</span></h3>

            <table Class="Sep" border='1'>
                <tr>
                    <th Class="BGcolorIntestazioneTable">N.</th>
                    <th Class="BGcolorIntestazioneTable">Elemento</th>
                    <th Class="BGcolorIntestazioneTable">Valore</th>
                </tr>

                <?php

                    $ElementoAtt1="Immobili";
                    $ElementoAtt2="Veicoli";
                    $ElementoAtt3="Crediti (Liquidazioni, Assicurazioni, Altro)";
                    $ElementoAtt4="Altre Voci";

                    for($i=1;$i<=4;$i++){
                        echo "<tr>";
                        echo "<td Class='AlignLeft bold'>$i</td>";
                        echo "<td Class='AlignLeft'> ${'ElementoAtt'.$i} </td>";
                        echo "<td><input type='number' value='0' name='ValoreSPatt[]' /></td>";
                        echo "</tr>";
                    }

                ?>

            </table>


            <h3><span Class="underline">PATRIMONIO PASSIVO DEL NUCLEO FAMILIARE</span></h3>

            <table Class="Sep" border='1'>
                <tr>
                    <th Class="BGcolorIntestazioneTable">N.</th>
                    <th Class="BGcolorIntestazioneTable">Elemento</th>
                    <th Class="BGcolorIntestazioneTable">Valore</th>
                    <th Class="BGcolorIntestazioneTable">Scadenza</th>
                </tr>

                <?php

                    $ElementoPas1="Debiti v/Pubblica Amm.ne e Agenzia delle Entrate";
                    $ElementoPas2="Mutui";
                    $ElementoPas3="Debiti Privati e/o ACER";
                    $ElementoPas4="Altre Voci";

                    for($i=1;$i<=4;$i++){
                        echo "<tr>";
                        echo "<td Class='AlignLeft bold'>$i</td>";
                        echo "<td Class='AlignLeft'> ${'ElementoPas'.$i} </td>";
                        echo "<td><input type='number' value='0' name='ValoreSPpas[]' /></td>";
                        echo "<td><input type='date' name='ScadenzaSPpas[]' /></td>";
                        echo "</tr>";
                    }

                ?>
            </table>


            <h3><span Class="underline">ENTRATE DEL NUCLEO FAMILIARE</span></h3>

            <table Class="Sep" border='1'>
                <tr>
                    <th Class="BGcolorIntestazioneTable">N.</th>
                    <th Class="BGcolorIntestazioneTable">Elemento</th>
                    <th Class="BGcolorIntestazioneTable">Valore</th>
                    <th Class="BGcolorIntestazioneTable">Scadenza</th>
                </tr>

                <?php

                    $ElementoEnt1="Stipendi";
                    $ElementoEnt2="Pensioni di Anzianit&agrave;";
                    $ElementoEnt3="Pensioni di invalidit&agrave;, accompagnamento, cura";
                    $ElementoEnt4="Indennit&agrave;: (Disoccupazione, Mobilit&agrave;, Altro)";
                    $ElementoEnt5="Contributi: (REI, RES, Reddito Cittadinanza)";
                    $ElementoEnt6="Entrate straordinarie (compresi sociali consolidate)";
                    $ElementoEnt7="Altre entrate (Ass. Mantenimento, altro)";

                    for($i=1;$i<=7;$i++){
                        echo "<tr>";
                            echo "<td Class='AlignLeft bold'>$i</td>";
                            echo "<td Class='AlignLeft'> ${'ElementoEnt'.$i} </td>";
                            echo "<td><input type='number' value='0' name='ValoreENT[]' /></td>";
                            echo "<td><input type='date' name='ScadenzaENT[]' /></td>";
                        echo "</tr>";
                    }

                ?>

            </table>


            <h3><span Class="underline">USCITE DEL NUCLEO FAMILIARE</span></h3>
            
            <table Class="Sep" border='1'>

                <tr>
                    <th Class="BGcolorIntestazioneTable">N.</th>
                    <th Class="BGcolorIntestazioneTable">Elemento</th>
                    <th Class="BGcolorIntestazioneTable">Valore</th>
                    <th Class="BGcolorIntestazioneTable">Scadenza</th>
                </tr>

                <?php

                    $ElementoUsc1="Affitto Mensile";
                    $ElementoUsc2="Rata mensile di mutui";
                    $ElementoUsc3="Utenze medie mensili";
                    $ElementoUsc4="Spese medico-sanitarie";
                    $ElementoUsc5="Rate mensili di debiti privati:";
                    $ElementoUsc6="Altre Uscite:";

                    for($i=1;$i<=6;$i++){
                        echo "<tr>";
                            echo "<td Class='AlignLeft bold'>$i</td>";
                            echo "<td Class='AlignLeft'> ${'ElementoUsc'.$i} </td>";
                            echo "<td><input type='number' name='ValoreUSC[]' value='0' /></td>";
                            echo "<td><input type='date' name='ScadenzaUSC[]' /></td>";
                        echo "</tr>";
                    }

                ?>

            </table>

            <p Class="interruzione">&nbsp;</p>

            <h3><span Class="underline">DISPONIBILIT&Agrave; COLLABORATIVE</span></h3>

            <table Class="DomandeFinali" border='1'>

                <tr>
                    <th Class="BGchocolate">Ambito Formativo</th>
                </tr>
                
                <tr>
                    <td><textarea Class="padding" name="Formativo" maxlength="255"></textarea></td>
                </tr>
                
                <tr>
                    <th Class="BGorange">Ambito Lavorativo</th>
                </tr>

                <tr>
                    <td><textarea Class="padding" name="Lavorativo" maxlength="255"></textarea></td>
                </tr>
                
                <tr>
                    <th Class="BGyellow">Ambito Sociale</th>
                </tr>

                <tr>
                    <td><textarea Class="padding" name="Sociale" maxlength="255"></textarea></td>
                </tr>

            </table> 

            <h3><span Class="underline">VALUTAZIONI DELLA COMMISSIONE</span></h3>   

            <Div class="TextAreaDiv">
                    <textarea name="ValutCommissione" maxlength="255"></textarea>
            </Div>

            <?php
                $Odierno=Date('d-m-Y');
                echo "<table Class='dataodierna'>";
                    echo "<tr>";
                        echo "<th Class='AlignLeft'><input type='text' minlength='10' maxlength='10' value='$Odierno'/><br/><span Class='Weighter'>Data</span></th>";
                    echo "</tr>";
                echo "</table>";
            ?>

            <input Class="invia" type="submit" name="invia" value="invia" />

            <img ID="container" class="Footer" src="../FileInclude/immagini/Footer.png" />
        </form>

</body>
</html>