//la funzione aggiunge un effetto di animazione (identificata tramite la classe del css) specificato ad un certo elemento (identificato tramite la classe dell'elemento) {callback è opzionale}
function addAnimationEffect(elementId, animationClass, callback) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error("Element with ID " + elementId + " not found.");
        return;
    }

    element.classList.add(animationClass);

    function onAnimationEnd() {
        element.classList.remove(animationClass);
        if (typeof callback === "function") {
            callback();
        }
        element.removeEventListener("animationend", onAnimationEnd);
    }

    element.addEventListener("animationend", onAnimationEnd);

/*
  // Esempio di utilizzo
  function animazioneCompletata() {
    console.log("Animazione completata!");
    // Puoi eseguire altre operazioni qui dopo il completamento dell'animazione.
  }

  addAnimationEffect("elementoDaAnimare", "fade-in", animazioneCompletata);
*/
}




//Aggiunge l'animazione allo scroll della pagina. Quando viene visualizzata
function animationOnElementView(elementClass, animationClass, callback){
    const elementsToAnimate=document.getElementsByClassName(elementClass);
    for (let i = 0; i < elementsToAnimate.length; i++) {
        let currentElment=elementsToAnimate[i];
    }
}



//QUI DI SEGUITO LE FUNZIONI RELATIVE ALLE DATE

//Questa funzione scrive nel log l'ora esatta nel formato "d/MM/yyyy HH:mm:ss.ms"
function actualTime(stringBeforeLog) {
    let now = new Date();
    let day = String(now.getDate()).padStart(2, '0'); // Ottieni il giorno del mese con due cifre.
    let month = String(now.getMonth() + 1).padStart(2, '0'); // Ottieni il mese (da 0 a 11) con due cifre e aggiungi 1 per ottenere il mese corretto.
    let year = now.getFullYear(); // Ottieni l'anno con quattro cifre.
    let hours = String(now.getHours()).padStart(2, '0'); // Ottieni le ore con due cifre.
    let minutes = String(now.getMinutes()).padStart(2, '0'); // Ottieni i minuti con due cifre.
    let seconds = String(now.getSeconds()).padStart(2, '0'); // Ottieni i secondi con due cifre.
    let milliseconds = now.getMilliseconds();

    let formattedDate = day + '/' + month + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds + '.' + milliseconds;
    console.log(stringBeforeLog + formattedDate);
    return formattedDate;
}

//converte una stringa dal formato "d/MM/yyyy HH:mm:ss.ms" in una new Date valida
function parseFormattedDate(formattedDate) {
    const parts = formattedDate.split(/[/ :.]+/); // Dividi la stringa in base a "/", ":", "." o spazi.
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Sottrai 1 per ottenere il mese corretto (0-11).
    const year = parseInt(parts[2], 10);
    const hours = parseInt(parts[3], 10);
    const minutes = parseInt(parts[4], 10);
    const seconds = parseInt(parts[5], 10);
    const milliseconds = parseInt(parts[6], 10);

    return new Date(year, month, day, hours, minutes, seconds, milliseconds);
}

//restituisce la differenza tra le date. L'ordine dei parametri non è importante
//dentro viene utilizzata parseFormattedDate
function dateDiff(date1, date2){
    let difference = parseFormattedDate(date1) - parseFormattedDate(date2);
    return difference;
}


/* QUI DI SEGUITO FUNZIONI RELATIVE AI CONSOLE.LOG */
function timingForDebug(time1, time2){
    console.log("loading of: " + dateDiff(time1, time2) + "ms");
}





//FUNZIONE SINCRONA DI WAIT
function delayForDebug(sec=0) {
    console.log(`%cN.B.:%c there's a ${sec} sec delay...`, "color: #cc0000; font-weight: 1000;", "color: inherit; font-weight: inherit;");  //stampo a console il tempo di debug
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, sec * 1000);
    });
}  


//funzione che viene eseguita dopo il caricamento di tutto il documento HTML
function waitForDocumentLoad(loadingCnt, effectiveCnt, delaySec=0){

    document.addEventListener("DOMContentLoaded", function() {
        //Attendi tot secondi prima di eseguire il codice
        delayForDebug(delaySec).then(() => {

            //scrive nei log il momento in cui il documento ha finito di caricare e quanto in millisecondi
            let documentLoadedMoment = actualTime("Document loaded at -> ");
            
            // Quando il DOM è pronto, rimuovi la classe 'd-none' di bootstrap dal contenitore principale. e aggiungi lo style "display: none;" al container del loading
            let headerCnt = document.getElementById("principalHeader");
            let contentCnt = document.getElementById("principalContent");
            let footerCnt = document.getElementById("principalFooter");
            let loadingCnt = document.getElementById("loadingContent");
            
            headerCnt.classList.remove("d-none");
            contentCnt.classList.remove("d-none");
            footerCnt.classList.remove("d-none");
            loadingCnt.style.display = "none";
        });
    });
}