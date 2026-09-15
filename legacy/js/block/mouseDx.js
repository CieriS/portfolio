//impedisco il click di destro col mouse
function blocco_mousedx() {
    return(false);
}
document.oncontextmenu = blocco_mousedx;