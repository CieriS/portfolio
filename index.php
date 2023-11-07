<!DOCTYPE html>
<html lang="en" ondragstart='return false' onselectstart='return false'>
<head>

    <!-- JS -->
    <script src="js/fnCieri.js"></script>   <!-- Variabili globali -->
    <script src="js/globalVar.js"></script>   <!-- Variabili globali -->
    <script src="js/block/mouseDx.js"></script>   <!-- Blocco tasto destro mouse -->
    <script src="js/block/shortcutKeys.js"></script>   <!-- Blocco scorciatoie da tastiera -->
    <!--<script src="js/includeHTML.js"></script>-->   <!-- html includer -->

    <!-- Documenti php necessari -->
    <?php
        require("db/connection.php");
        require("db/function/printInConsole.php");
        require("db/collection/contacts.php");
        require("db/collection/visual.php");
        require("db/collection/collectFromFolder.php");
        
        collectFromFolder("img");

        //nelle successive due righe 
        //ho provato a realizzare una funzione per 
        //collezionare i dati da db ogni volta
        //che è necessario. Così da non dover creare un file per ogni collect che devo fare. Funzionante. Sarebbe da aggiungere un messaggio parlante nei log
        //LA PRIMA RIGA è l'inclusione della funzione
        //LA RIGA SUCCESSIVA, OVVERO LA SEONDA,
        //CHIAMA LA FNUZIONE
        //$msgVisualizzati = [];
        /*require("db/collection/collect.php");
        collectData($connection, 'SELECT W.id AS id, L.language AS language, W.description AS description FROM writings AS W INNER JOIN lang as L ON W.language = L.id WHERE LOWER(L.language) LIKE "english"', ["id", "language", "description"], $msgVisualizzati);*/
    ?>


    <!-- linked -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-KK94CHFLLe+nY2dmCWGMq91rCGa5gtU4mk92HdvYe+M/SXH301p5ILy+dN9+nJOZ" crossorigin="anonymous">  <!-- Bootstrap 5.3.0 -->

    <link href="./fontawesome-free-6.4.0-web/css/fontawesome.css" rel="stylesheet"> <!-- FontAwesome -->
    <link href="./fontawesome-free-6.4.0-web/css/brands.css" rel="stylesheet">  <!-- FontAwesome -->
    <link href="./fontawesome-free-6.4.0-web/css/solid.css" rel="stylesheet">   <!-- FontAwesome -->

    <!-- Tab Icon -->
    <link rel="icon" type="image/x-icon" href="img/icon/iconRed.ico"> <!-- tab icon -->

    <!-- CSS -->
    <link rel="stylesheet" type="text/css" href="css/landingPage.css">  <!-- Default: body and other -->
    <link rel="stylesheet" type="text/css" href="css/lampeggioAnimation.css">  <!-- animation -->
    <link rel="stylesheet" type="text/css" href="css/paragraphAnimation.css">  <!-- animation -->
    <link rel="stylesheet" type="text/css" href="css/btnPuffInAnimation.css">  <!-- animation -->
    <link rel="stylesheet" type="text/css" href="css/noScriptJs.css">  <!-- css -->


    <title>Samuele Cieri - Portfolio</title>   <!-- Titolo descrittivo e unico. Parole chiave e pertinenti al contenuto e max 70 char -->

    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="google-site-verification" content="T5c3P7cS7dBywrdG9im2HkKwb2Qt46Rm7pmODRtlUUM" />  <!-- VERIFICA DI proprietà google: (ottenuto tramite google) -->
    <meta name="description" content="Take a look at Samuele's portfolio! u'll can see a few projects and his ton of ambitions!!!">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="keywords" content="Portfolio, Cieri, SamueleCieri, CieriSamuele, Cieri Samuele">   <!-- parole chiave principali per la tua pagina -->
    <meta name="author" content="Samuele Cieri">    <!-- Autore del sito -->
    <meta name="robots" content="index,follow"> <!-- specifica se i robot dei motori di ricerca devono indicizzare la pagina -->
    <meta name="googlebot" content="index,follow">  <!-- specifica come il robot di Google deve indicizzare la pagina -->
    <meta name="theme-color" content="#000000"> <!-- specifica il colore del tema del sito web -->
    <meta property="og:title" content="Cieri Samuele">    <!-- specifica il titolo della pagina quando viene condivisa sui social media -->
    <meta property="og:description" content="Alright, that's my portfolio! So, come take a look and let me know what you think!">    <!-- specifica la descrizione della pagina quando viene condivisa sui social media -->
    <meta property="og:image" content="<?php echo PORTFOLIO_ALTERVISTA; ?>img/icon/iconRed.ico">  <!-- specifica l'immagine che viene utilizzata come anteprima quando la pagina viene condivisa sui social media -->
    <meta property="og:url" content="<?php echo PORTFOLIO_ALTERVISTA; ?>">    <!-- specifica l'URL della pagina quando viene condivisa sui social media -->
    <meta property="og:type" content="website"> <!-- specifica il tipo di contenuto della pagina -->

</head>
<body class="d-flex flex-column justify-content-between mx-0 text-center text-bg-dark">

    <div id='loadingContent' class="d-flex flex-row justify-content-center align-items-center h-100 bg-dark">
        <!-- Qui ci metterò un CANVAS -->
        <div class="spinner-border text-white" role="status" style="font-size: 5rem; width: 15rem; height: 15rem;">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>

    <noscript class="noJsWarn">
        <section>
            <span>
                <strong class="d-block">Javascript is Disabled</strong>
                <small>This inconvenience may cause some problems...<br/>please consider enabling JavaScript to continue.</small>
            </span>
        </section>
    </noscript>

    <header id="principalHeader" class="d-none align-self-center w-75 mt-2">
        <nav class="d-none d-md-flex flex-row justify-content-between align-items-center align-self-center w-100 navbar navbar-expand-lg"><!-- SCHERMO GRANDE -->
            <picture class="invisible">
                    <a class='navbar-brand' href="<?php echo PORTFOLIO_ALTERVISTA; ?>">
                        <img src='img/icon/iconRed.ico' alt='logo brand' style='height: 10vh; aspect-ratio: 1; object-fit: fill; mix-blend-mode: lighten;'/>
                    </a>
            </picture>
            <ul class="nav navbar-nav nav-pills fw-bolder" id="v-pills-tab" role="tablist">
                <li class="nav-item"> <!-- Home -->
                    <a class="nav-link text-light fw-bolder fs-5 active" id="homeTab" data-bs-toggle="pill" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">
                        <span>Home</span>
                    </a>
                </li>
                <!--
                <li class="nav-item">
                    <a class="nav-link text-light fs-5" id="educationTab" data-bs-toggle="pill" data-bs-target="#education" type="button" role="tab" aria-controls="education" aria-selected="false">
                        Education
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-light fs-5" id="profExpTab" data-bs-toggle="pill" data-bs-target="#profExp" type="button" role="tab" aria-controls="profExp" aria-selected="false">
                        Experience
                    </a>
                </li>
                -->
                <li class="nav-item"> <!-- AboutMe -->
                    <a class="nav-link text-light fs-5" id="aboutMeTab" data-bs-toggle="pill" data-bs-target="#aboutMe" type="button" role="tab" aria-controls="aboutMe" aria-selected="false">
                        About Me
                    </a>
                </li>
            </ul>
        </nav>
        <div class="d-block d-md-none btn-group float-end mt-4">    <!-- SCHERMO PICCOLO -->
            <button type="button" class="btn btn-outline-light btn-lg dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                <span class="fa fa-bars"></span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end" id="v-pills-tab" role="tablist">
                <li>
                    <a class="dropdown-item fw-bolder fs-5 active" id="homeTab" data-bs-toggle="pill" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">
                        <span>Home</span>
                    </a>
                </li>
                <li>
                    <a class="dropdown-item fs-5" id="aboutMeTab" data-bs-toggle="pill" data-bs-target="#aboutMe" type="button" role="tab" aria-controls="aboutMe" aria-selected="false">
                        About Me
                    </a>
                </li>
            </ul>
        </div>
    </header>

    <main id="principalContent" class="d-none container-fluid tab-content d-flex flex-column justify-content-between align-items-center text-center align-self-center" id="v-pills-tabContent">
        <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="homeTab" tabindex="0">
            <section class="d-flex flex-column justify-content-between align-items-center text-center align-self-center">
                <h1 class="text-center lampeggio">
                    Samuele Cieri
                </h1>
                <p class="paragraph lh-lg my-3" style="text-align: right;">
                    Behold, a digital garden of creative <em>blooms</em>,<br/> Where ideas and designs find their <em>rooms</em>,<br/> A web portfolio, a masterpiece that <em></em>looms</em>.
                </p>
                <div class="align-self-end">
                    <a href="proj/" class="btn btn-outline-light fw-bolder btnz" title="View Project summary">
                        View Projects
                    </a>
                </div>
            </section>
        </div>
        <div class="tab-pane fade" id="education" role="tabpanel" aria-labelledby="educationTab" tabindex="0">
            <section class="d-flex flex-column justify-content-between align-items-center text-center align-self-center border">
                <h2 class="text-center lampeggio">
                    Education
                </h2>
                <div class="d-flex flex-row">
                    <span class="visible">
                        <a class='btn btn-outline-light m-1' href='<?php echo $contacts['telegram'] -> hUrl; ?>' role='button' title='Check out this telegram channel'>
                            <i class="fa-brands fa-telegram"></i>
                        </a>
                    </span>
                    <p class="paragraph lh-lg my-3" style="text-align: right;">
                        World belongs to people who asks<br/>
                    </p>
                </div>
                <div class="align-self-end" style="max-width: 50%;">
                    <a href="proj/" class="btn btn-lg btn-outline-light fw-bolder btnz" title="Click to learn more about my passions!">
                        Hobbies
                    </a>
                </div>
            </section>
        </div>
        <div class="tab-pane fade" id="profExp" role="tabpanel" aria-labelledby="profExpTab" tabindex="0">
            <section class="d-flex flex-column justify-content-between align-items-center text-center align-self-center border">
                <h2 class="text-center lampeggio">
                    Professional Experience
                </h2>
                <section class="d-flex flex-row">
                    <span class="visible">
                        <a class='btn btn-outline-light m-1' href='<?php echo $contacts['telegram'] -> hUrl; ?>' role='button' title='Check out this telegram channel'>
                            <i class="fa-brands fa-telegram"></i>
                        </a>
                    </span>
                    <p class="paragraph lh-lg my-3" style="text-align: right;">
                        World belongs to people who asks<br/>
                    </p>
                </section>
                <div class="align-self-end" style="max-width: 50%;">
                    <a href="proj/" class="btn btn-lg btn-outline-light fw-bolder btnz" title="Click to learn more about my passions!">
                        Hobbies
                    </a>
                </div>
            </section>
        </div>
        <div class="tab-pane fade" id="aboutMe" role="tabpanel" aria-labelledby="aboutMeTab" tabindex="0">
            <section class="d-flex flex-column justify-content-between align-items-center text-center align-self-center">
                <h2 class="text-center lampeggio">
                    About Me
                </h2>
                <div class="d-flex flex-row justify-content-around paragraph">
                    <p class="w-75 lh-lg my-3" style="text-align: right;">
                        World belongs to people who asks<br/>
                    </p>
                </div>
                <div class="align-self-end border">
                    <a href="error/" class="btn btn-lg btn-outline-light fw-bolder btnz" title="Click to learn more about my passions!">
                        Skills
                    </a>
                    <a href="error/" class="btn btn-lg btn-outline-light fw-bolder btnz" title="Click to learn more about my passions!">
                        Hobbies
                    </a>
                </div>
            </section>
        </div>
    </main>
    
    <footer id="principalFooter" class="d-none container-fluid d-flex flex-column justify-content-end mb-2">
        <section class="align-self-center">
            <span class="visible"> <!-- telegram -->
                    <a class='btn btn-outline-light m-1' href='<?php echo $contacts['telegram'] -> hUrl; ?>' role='button' title='Reach me on telegram'>
                        <i class="fa-brands fa-telegram"></i>
                    </a>
            </span>

            <span class="visible"> <!-- instagram -->
                <a class='btn btn-outline-light m-1' href="<?php echo $contacts['instagram'] -> hUrl; ?>" role='button' title='Visit my instagram profile'>
                    <i class="fa-brands fa-instagram"></i>
                </a>
            </span>

            <span class="visible"> <!-- linkedIn -->
                <a class='btn btn-outline-light m-1' href="<?php echo $contacts['linkedIn'] -> hUrl; ?>" role='button' title='Get in touch with me!'>
                    <i class="fa-brands fa-linkedin-in"></i>
                </a>
            </span>

            <span class="visible"> <!-- gitHub -->
                <a class='btn btn-outline-light m-1' href="<?php echo $contacts['github'] -> hUrl; ?>" role='button' title='Take a look at my works!'>
                    <i class="fa-brands fa-github"></i>
                </a>
            </span>

            <span class="visible"> <!-- PayPal -->
                <a class='btn btn-outline-light m-1' href="<?php echo $contacts['payPal'] -> hUrl; ?>" role='button' data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title='Support me!' title='Support me!'>
                    <i class="fa-brands fa-paypal"></i>
                </a>
            </span>
        </section>
        <section class="d-flex justify-content-between">
            <small class="align-self-end" style="font-size: 70%;">
                Built with <strong>css, javascript, php</strong>
            </small>
            <small class="align-self-center mb-3" style="position:absolute;left:50%;transform: translate(-50%,50%);"> <!-- copyright & link -->     
                ©<?php echo date("Y"); ?> Copyright:
                <a class='text-white' href='<?php echo PORTFOLIO_ALTERVISTA; ?>'>
                    cieri.com
                </a>
            </small>
            <small class="align-self-end" style="font-size: 70%;">
                powered by <strong>cieri</strong>
            </small>
        </section>
    </footer>

    <div class="d-none">   <!-- Raggruppatore script js -->
        <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.7/dist/umd/popper.min.js" integrity="sha384-zYPOMqeu1DAVkHiLqWBUTcbYfZ8osu1Nd6Z89ify25QV9guujx43ITvfi12/QExE" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.min.js" integrity="sha384-Y4oOpwW3duJdCWv5ly8SCFYWqFDsfob/3GkgExXKV4idmbt98QcxXYs9UoXAB7BZ" crossorigin="anonymous"></script>

        <script>
            //Script che viene eseguito dopo il caricamento di tutto il documento HTML
            //da trasformare in una funzione RIUTILIZZABILE per altri documenti
            document.addEventListener("DOMContentLoaded", function() {
                
                //Attendi tot secondi prima di eseguire il codice
                delayForDebug(0).then(() => {
                
                    //scrive nei log il momento in cui il documento ha finito di caricare e quanto in millisecondi
                    let documentLoadedMoment = actualTime("Document loaded at -> ");
                    timingForDebug(documentLoadedMoment, connectionToDbMoment); //stampa il tempo passato nei log
                    
                    // Quando il DOM è pronto, rimuovi la classe 'd-none' di bootstrap dal contenitore principale. e aggiungi lo style "display: none;" al container del loading
                    let headerCnt = document.getElementById("principalHeader");
                    let contentCnt = document.getElementById("principalContent");
                    let footerCnt = document.getElementById("principalFooter");
                    let loadingCnt = document.getElementById("loadingContent");
                    
                    headerCnt.classList.remove("d-none");
                    contentCnt.classList.remove("d-none");
                    footerCnt.classList.remove("d-none");
                    loadingCnt.classList.add("d-none");
                    //loadingCnt.style.display = "none";
                });
            });
        </script>
    </div>

</body>
</html>