document.onkeydown = function(blocco_tasti)
{
    if(event.keyCode == 123) 
        {
            return false;
        }
    if(blocco_tasti.ctrlKey && blocco_tasti.shiftKey && blocco_tasti.keyCode == 'I'.charCodeAt(0))
        {
            return false;
        }
    if(blocco_tasti.ctrlKey && blocco_tasti.shiftKey && blocco_tasti.keyCode == 'C'.charCodeAt(0))
        {
            return false;
        }
    if(blocco_tasti.ctrlKey && blocco_tasti.shiftKey && blocco_tasti.keyCode == 'J'.charCodeAt(0))
        {
            return false;
        }
    if(blocco_tasti.ctrlKey && blocco_tasti.keyCode == 'U'.charCodeAt(0))
        {
            return false;
        } 
}