let docTitle = document.title;
window.addEventListener("blur", () => {
    document.title = "Come back to see my portfolio :(";    //titolo quando perdi il focus sulla pagina web
})
window.addEventListener("focus", () => {
    document.title = "Portfolio - Samuele Cieri";   //titolo quando il focus è su quella scheda
})