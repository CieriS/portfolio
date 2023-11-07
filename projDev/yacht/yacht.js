// Variabili per tenere traccia della posizione della nave
let x = 0;
let y = 0;

// Funzione per aggiornare la posizione della nave
function updatePosition(newX, newY) {
  x = newX;
  y = newY;
}

// Funzioni per spostare la nave
function moveUp() {
  updatePosition(x, y - 100);
}

function moveDown() {
  updatePosition(x, y + 100);
}

function moveLeft() {
  updatePosition(x - 100, y);
}

function moveRight() {
  updatePosition(x + 100, y);
}

// Ascoltatori di eventi per gli input dell'utente
document.addEventListener("keydown", function(event) {
  if (event.key === "ArrowUp") {
    moveUp();
  } else if (event.key === "ArrowDown") {
    moveDown();
  } else if (event.key === "ArrowLeft") {
    moveLeft();
  } else if (event.key === "ArrowRight") {
    moveRight();
  }
});

// Ottieni il riferimento al canvas
const canvas = document.getElementById("map");

// Ottieni il contesto di rendering del canvas
const context = canvas.getContext("2d");

// Disegna la nave alla sua posizione corrente
context.drawImage(shipImage, x, y);
