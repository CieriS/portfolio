//pagina di errore: testo con countdown e, al termine, reindirizzamento
function countdown() 
{
    var i = document.getElementById('counterCountdownErrorPage');
    if (parseInt(i.innerHTML)<=0)
        {
            window.location.replace("..");
        }
    i.innerHTML = parseInt(i.innerHTML)-1;
}
setInterval(function(){ countdown(); },1000);