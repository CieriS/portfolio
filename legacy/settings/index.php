<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Console</title>
    <style>
        body {
            background-color: pink;
        }
        .textboxTestValidazione {
            border: 1px solid #ccc;
            padding: 5px 10px; /* Assicurati che ci sia spazio sufficiente per l'icona */
        }
        .validationError {
            appearance: auto;
            background-color: rgb(255, 255, 255);
            border-bottom-color: rgba(204, 0, 0, 1);
            border-bottom-style: solid;
            border-bottom-width: 1px;
            border-image-outset: 0;
            border-image-repeat: stretch;
            border-image-slice: 100%;
            border: 3px solid red;
            border-image-source: none;
            border-image-width: 1;
            border-left-color: rgba(204, 0, 0, 1);
            border-left-style: solid;
            border-left-width: 1px;
            border-right-color: rgba(204, 0, 0, 1);
            border-right-style: solid;
            border-right-width: 1px;
            border-top-color: rgba(204, 0, 0, 1);
            outline-color: red;
        }
    </style>
</head>
<body>

<?php

//collect contacts data from DB
require("../db/contactsCollection.php");

?>

<span></span>

<form method="POST" action="modifica.php" autocomplete="off">
    <input type="textbox" name="" class="textboxTestValidazione" required/>
    <br/>
    <button type="submit">Confirm</button>
</form>

<script>

    //funzione di debounce
    function debouncing(fn, delayInMs){
        let timeoutId;
        return function(){
            clearTimeout(timeoutId);
            timeoutId = setTimeout(fn, delayInMs);
        }
    }

    //funzione per delineare cosa comporta la validazione
    function validaInput(){
        let valoreInput = tb.value;

        if(valoreInput.includes(".")){
            //tb.style.outline = "4px solid red";
            tb.classList.add("validationError");
            tb.classList.remove("textboxTestValidazione");
        } else {
            //tb.style.outline = "4px solid lightblue";
            tb.classList.add("textboxTestValidazione");
            tb.classList.remove("validationError");
        }
    }

    //Colleziono l'elemento di input tramite il suo id
    let tb = document.getElementsByClassName("textboxTestValidazione");

    //Aggiungo un event listener al bottone per richiamare una funzione con anche il debounce
    tb.addEventListener("keyup", debouncing(validaInput, 25));

    function validationOn(id, eventListerTriggerType, ){
        const eventListerTriggerTypes = {
            keydown: 'onkeydown',
            keypress: 'onkeypress',
            keyup: 'onkeyup',
            change: 'onchange',
            focusin: 'onfocusin',
            focusout: 'onfocusout',
            click: 'onclick',
            dblclick: 'ondblclick',
            mousedown: 'onmousedown',
            mouseenter: 'onmouseenter',
            mouseleave: 'onmouseleave',
            mousemove: 'onmousemove',
            mouseover: 'onmouseover',
            mouseout: 'onmouseout',
            mouseup: 'onmouseup',
            select: 'onselect',
            submit: 'onsubmit',
            contextmenu: 'oncontextmenu',
            drag: 'ondrag',
            dragend: 'ondragend',
            dragenter: 'ondragenter',
            dragexit: 'ondragexit',
            dragleave: 'ondragleave',
            dragover: 'ondragover',
            dragstart: 'ondragstart',
            drop: 'ondrop',
            scroll: 'onscroll',
            wheel: 'onwheel',
        };
        eventListerTriggerTypes[eventListerTriggerType] ?? ""
    }
</script>

</body>
</html>