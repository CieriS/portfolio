<!DOCTYPE html>
<html lang="it">
<head>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
    <title>Loading...</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="invia e-mail e controlli su DB">
    <meta name="author" content="Samuele Cieri">    <!-- Autore del sito -->
    <meta name="robots" content="noindex,nofollow"> <!-- specifica se i robot dei motori di ricerca devono indicizzare la pagina -->
    <meta name="googlebot" content="noindex,nofollow">  <!-- specifica come il robot di Google deve indicizzare la pagina -->
    <meta name="theme-color" content="#ffffff"> <!-- specifica il colore del tema del sito web -->
    <meta name="application-name" content="gestore mail, inserimento db">    <!-- specifica il nome dell'applicazione -->
    <meta name="generator" content="php 8.2, mySQL">

    <link rel="icon" type="image/x-icon" href="../img/icon/stonks.png"> <!-- tab icon -->

</head>
<body class="h-100 bg-dark text-light">

<?php

if( isset($_POST['nameForms'], $_POST['surnameForms'], $_POST['telForms'], $_POST['mailForms'], $_POST['selForms']) ){
    header("Location: ..");
    exit();
}

?>

<div class="text-center text-light position-absolute top-50 start-50 translate-middle">
  <div class="spinner-grow" style="width: 15rem; height: 15rem;" role="status" aria-hidden="true">
    <span class="visually-hidden">Loading...</span>
  </div>
</div>

<?php

$nome = $_POST['nameForms'];
$cognome = $_POST['surnameForms'];
$tel = $_POST['telForms'];
$mail = $_POST['mailForms'];
$destinatario = "giusepoke999@gmail.com";
$from = "webMaster@cieri.com";
$req = $_POST['selForms'];
$headers = 'From: webMaster@cieri.com' . "\r\n" . 'Bcc: giusepoke999@gmail.com' . "\r\n" . 'Reply-To: webMaster@cieri.com' . "\r\n" . 'X-Mailer: PHP/' . phpversion();

switch( $req ){
    case 0:
        $req = "Fino a 10.000€";
        break;
    case 1:
        $req = "10.000€ - 20.000€";
        break;
    case 2:
        $req = "20.000€ - 30.000€";
        break;
    case 3:
        $req = "30.000€ - 50.000€";
        break;
    case 4:
        $req = "Oltre 50.000€";
        break;
    default:
        $req = "Fino a 10.000€"; 
}

$oggetto = "[Sito Web] - Richiesta consulenza gratuita da $nome $cognome";

// the message
$msg = "$cognome $nome ha inviato una richiesta\ndi consulenza gratuita.\nNome:\t$nome\nCognome:\t$cognome\nTelefono:\t$tel\nE-Mail:\t$mail\nQuantitativo Richiesto:\t$req";

// use wordwrap() if lines are longer than 70 characters
$msg = wordwrap($msg,70);


?>



<?php

mail( $destinatario, $oggetto, $msg, $headers/*, $Parameters */ );

?>


<?php

/*
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';


//Create an instance; passing `true` enables exceptions
$mail = new PHPMailer(true);

try {
    //Server settings
    $mail->SMTPDebug = //SMTP::DEBUG_SERVER;                      //Enable verbose debug output
    $mail->isSMTP();                                            //Send using SMTP
    $mail->Host       = 'smtp.gmail.com';                                     //Set the SMTP server to send through
    $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
    $mail->Username   = $from;                                  //SMTP username
    $mail->Password   = 'secret';                               //SMTP password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            //Enable implicit TLS encryption
    $mail->Port       = 465;                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

    //Recipients
    $mail->setFrom($from, 'Mailer');
    $mail->addAddress($to, 'Giusepe Tarallo');              //Add a recipient
    $mail->addAddress($to);                                 //Name is optional
    $mail->addReplyTo('info@example.com', 'Information');
    $mail->addCC('cc@example.com');
    $mail->addBCC('bcc@example.com');

    //Attachments
    //$mail->addAttachment('/var/tmp/file.tar.gz');         //Add attachments
    //$mail->addAttachment('/tmp/image.jpg', 'new.jpg');    //Optional name

    //Content
    $mail->isHTML(false);                                  //Set email format to HTML
    $mail->Subject = $subject;
    $mail->Body    = $msg;
    $mail->AltBody = $msg;

    $mail->send();
    echo "Message has been sent {$mail->ErrorInfo}";
} catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}
*/

?>

<script>
    window.location.replace("../");
</script>

</body>
</html>