//la utilizzo per la pagina di errore 503
let timeoutId = setTimeout(function() {
    location.replace('..');;
    clearTimeout(timeoutId);
}, 16000);