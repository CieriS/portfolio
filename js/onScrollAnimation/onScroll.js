function perspectiveMovement(){
    // Seleziona tutti gli elementi con la classe che vuoi animare
    const skills = document.querySelectorAll('.popUpSkills');

    //finestra altezza browser
    skills.forEach(element => {
        const posizioneElemento = element.getBoundingClientRect().top;
        const altezza = window.innerHeight;

        if( posizioneElemento < altezza ){
            const scrollPosition = window.scrollY;
            const scrollPercentage = ( altezza - posizioneElemento - scrollPosition ) / altezza;
            
            //Calcolo dei valori di animazione
            const opacityValue = scrollPercentage;
            const translateYValue = (1 - scrollPercentage) * 20;

            //applico valori di animazione
            element.style.opacity = opacityValue;
            element.style.transform = `translateY(${translateYValue}px)`;
        }
    });
}

document.addEventListener('DOMContentLoaded', function(){
    window.addEventListener('scroll', perspectiveMovement())
});