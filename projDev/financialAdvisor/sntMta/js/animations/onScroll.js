// Seleziona tutti gli elementi con la classe che vuoi animare
const elementiRightLeft = document.querySelectorAll('.onScrollAnimationRightLeft');
const elementiLeftRight = document.querySelectorAll('.onScrollAnimationLeftRight');
const elementiScaleDown = document.querySelectorAll('.onScrollAnimationScaleDown');
const elementiJello     = document.querySelectorAll('.onScrollAnimationJelloBtn');
const elementiTitle     = document.querySelectorAll('.onScrollAnimationTitle');
const elementiBouncing  = document.querySelectorAll('.onScrollAnimationBouncing');
const elementiScaleIn   = document.querySelectorAll('.onScrollAnimationScaleIn');

// Aggiungi un listener per lo scroll della finestra del browser
window.addEventListener('scroll', () => {
  // Ottieni l'altezza della finestra del browser
  let altezzaFinestra = window.innerHeight;

  // Verifica se uno degli elementi è visibile nella finestra del browser - ANIMAZIONE DA DESTRA A SINISTRA
  elementiRightLeft.forEach((elemento) => {
    // Ottieni la posizione verticale dell'elemento rispetto al top della finestra del browser
    const posizioneElemento = elemento.getBoundingClientRect().top;

    if (posizioneElemento <= altezzaFinestra) {
      // Aggiungi una classe all'elemento per avviare l'animazione
      elemento.classList.add('slideInRightLeft');
    } else {
      // Rimuovi la classe per avviare l'animazione
      elemento.classList.remove('slideInRightLeft');
    }
  });
  // Verifica se uno degli elementi è visibile nella finestra del browser - ANIMAZIONE DA SINISTRA A DESTRA
  elementiLeftRight.forEach((elemento) => {
    // Ottieni la posizione verticale dell'elemento rispetto al top della finestra del browser
    const posizioneElemento = elemento.getBoundingClientRect().top;

    if (posizioneElemento <= altezzaFinestra) {
      // Aggiungi una classe all'elemento per avviare l'animazione
      elemento.classList.add('slideInLeftRight');
    } else {
      // Rimuovi la classe per avviare l'animazione
      elemento.classList.remove('slideInLeftRight');
    }
  });
  // Verifica se uno degli elementi è visibile nella finestra del browser - ANIMAZIONE ScaleDown
  elementiScaleDown.forEach((elemento) => {
    // Ottieni la posizione verticale dell'elemento rispetto al top della finestra del browser
    const posizioneElemento = elemento.getBoundingClientRect().top;

    if (posizioneElemento <= altezzaFinestra) {
      // Aggiungi una classe all'elemento per avviare l'animazione
      elemento.classList.add('scaleDown');
    } else {
      // Rimuovi la classe per avviare l'animazione
      elemento.classList.remove('scaleDown');
    }
  });
  // Verifica se uno degli elementi è visibile nella finestra del browser - ANIMAZIONE Jellow
  elementiJello.forEach((elemento) => {
    // Ottieni la posizione verticale dell'elemento rispetto al top della finestra del browser
    const posizioneElemento = elemento.getBoundingClientRect().top;

    if (posizioneElemento <= altezzaFinestra) {
      // Aggiungi una classe all'elemento per avviare l'animazione
      elemento.classList.add('jelloFormBtn');
    } else {
      // Rimuovi la classe per avviare l'animazione
      elemento.classList.remove('jelloFormBtn');
    }
  });
  // Verifica se uno degli elementi è visibile nella finestra del browser - ANIMAZIONE Title
  elementiTitle.forEach((elemento) => {
    // Ottieni la posizione verticale dell'elemento rispetto al top della finestra del browser
    const posizioneElemento = elemento.getBoundingClientRect().top;

    if (posizioneElemento <= altezzaFinestra) {
      // Aggiungi una classe all'elemento per avviare l'animazione
      elemento.classList.add('titleAnim');
    } else {
      // Rimuovi la classe per avviare l'animazione
      elemento.classList.remove('titleAnim');
    }
  });
  // Verifica se uno degli elementi è visibile nella finestra del browser - ANIMAZIONE Info Form
  elementiBouncing.forEach((elemento) => {
    // Ottieni la posizione verticale dell'elemento rispetto al top della finestra del browser
    const posizioneElemento = elemento.getBoundingClientRect().top;

    if (posizioneElemento <= altezzaFinestra) {
      // Aggiungi una classe all'elemento per avviare l'animazione
      elemento.classList.add('bounceAnimation');
    } else {
      // Rimuovi la classe per avviare l'animazione
      elemento.classList.remove('bounceAnimation');
    }
  });
  // Verifica se uno degli elementi è visibile nella finestra del browser - ANIMAZIONE ScaleIn
  elementiScaleIn.forEach((elemento) => {
    // Ottieni la posizione verticale dell'elemento rispetto al top della finestra del browser
    const posizioneElemento = elemento.getBoundingClientRect().top;

    if (posizioneElemento <= altezzaFinestra) {
      // Aggiungi una classe all'elemento per avviare l'animazione
      elemento.classList.add('scaleIn');
    } else {
      // Rimuovi la classe per avviare l'animazione
      elemento.classList.remove('scaleIn');
    }
  });
});