// Variables del juego
let jugadorAltura, jugadorAncho;
let computadoraAltura, computadoraAncho;
let pelotaDiametro;
let pelotaX, pelotaY;
let velocidadX, velocidadY;
let jugadorY, computadoraY;
let puntuacionJugador, puntuacionComputadora;
const incrementoVelocidad = 0.1;
const velocidadComputadoraBase = 5;
let velocidadComputadora = velocidadComputadoraBase;
let fondo, barraJugadorImg, barraComputadoraImg, bolaImg;
let rotacionPelota = 0;
let sonidoColision, sonidoGol;
let marcoSuperiorY;
let marcoInferiorY;

function preload() {
  // Cargar las imágenes y los sonidos
  fondo = loadImage("fondo1.png");
  barraJugadorImg = loadImage("barra2.png");
  barraComputadoraImg = loadImage("barra2.png");
  bolaImg = loadImage("bola.png");

  // Cargar los sonidos
  sonidoColision = loadSound("bounce.wav");
  sonidoGol = loadSound("j1game_over_mono.wav");
}

function setup() {
  createCanvas(800, 400);
  jugadorAltura = 100;
  jugadorAncho = 10;
  computadoraAltura = 100;
  computadoraAncho = 10;
  pelotaDiametro = 20;
  velocidadX = 5;
  velocidadY = 5;
  jugadorY = height / 2 - jugadorAltura / 2;
  computadoraY = height / 2 - computadoraAltura / 2;
  pelotaX = width / 2;
  pelotaY = height / 2;
  puntuacionJugador = 0;
  puntuacionComputadora = 0;
  marcoSuperiorY = 20;
  marcoInferiorY = height - 20;
}

function draw() {
  // Dibujar el fondo
  image(fondo, 0, 0, width, height);

  // Dibujar el marco superior
  fill(color("#2B3FD6"));
  rect(0, 0, width, marcoSuperiorY);

  // Dibujar el marco inferior
  fill(color("#2B3FD6"));
  rect(0, marcoInferiorY, width, height - marcoInferiorY);

  // Dibujar jugador
  image(barraJugadorImg, jugadorAncho, jugadorY, jugadorAncho, jugadorAltura);

  // Dibujar computadora
  image(
    barraComputadoraImg,
    width - computadoraAncho * 2,
    computadoraY,
    computadoraAncho,
    computadoraAltura
  );

  // Calcular la rotación basada en la velocidad
  let velocidadTotal = sqrt(velocidadX * velocidadX + velocidadY * velocidadY);
  rotacionPelota += velocidadTotal * 0.1; // Ajusta el factor de rotación aquí

  // Dibujar pelota con rotación
  push();
  translate(pelotaX, pelotaY);
  rotate(rotacionPelota);
  image(bolaImg, -pelotaDiametro / 2, -pelotaDiametro / 2, pelotaDiametro, pelotaDiametro);
  pop();

  // Movimiento de la pelota
  pelotaX += velocidadX;
  pelotaY += velocidadY;

  // Colisión con el marco superior
  if (pelotaY <= marcoSuperiorY + pelotaDiametro / 2) {
    velocidadY *= -1;
  }

  // Colisión con el marco inferior
  if (pelotaY >= marcoInferiorY - pelotaDiametro / 2) {
    velocidadY *= -1;
  }

  // Colisión con la raqueta del jugador
  if (pelotaX - pelotaDiametro / 2 <= jugadorAncho * 2) {
    if (pelotaY >= jugadorY && pelotaY <= jugadorY + jugadorAltura) {
      colisionRaquetaJugador();
      velocidadX *= -1;
    } else {
      // Punto para la computadora
      puntuacionComputadora++;
      reiniciarPelota();
    }
  }

  // Colisión con la raqueta de la computadora
  if (pelotaX + pelotaDiametro / 2 >= width - computadoraAncho * 2) {
    if (
      pelotaY >= computadoraY &&
      pelotaY <= computadoraY + computadoraAltura
    ) {
      colisionRaquetaComputadora();
      velocidadX *= -1;
    } else {
      // Punto para el jugador
      puntuacionJugador++;
      reiniciarPelota();
    }
  }

  // Movimiento de la raqueta del jugador con el mouse
  jugadorY = constrain(
    mouseY - jugadorAltura / 2,
    marcoSuperiorY,
    marcoInferiorY - jugadorAltura
  );

  // Movimiento de la raqueta de la computadora
  mejorarIAComputadora();

  // Mostrar puntuaciones
  fill(color("#2B3FD6"));
  textSize(32);
  textAlign(CENTER);
  text(puntuacionJugador + " - " + puntuacionComputadora, width / 2, 50);

  // Ajuste dinámico de la dificultad y velocidad de la pelota
  ajustarDificultad();
}

// Función para reiniciar la posición de la pelota
function reiniciarPelota() {
  pelotaX = width / 2;
  pelotaY = height / 2;
  velocidadX = 5 * (Math.random() > 0.5 ? 1 : -1);
  velocidadY = 5 * (Math.random() > 0.5 ? 1 : -1);

  // Reproducir sonido de gol
  sonidoGol.play();
}

// Función para mejorar la IA de la computadora
function mejorarIAComputadora() {
  let direccionComputadora = pelotaY - (computadoraY + computadoraAltura / 2);
  computadoraY += direccionComputadora * 0.1 * velocidadComputadora;
  computadoraY = constrain(
    computadoraY,
    marcoSuperiorY,
    marcoInferiorY - computadoraAltura
  );
}

// Función para ajustar la dificultad del juego y la velocidad de la pelota
function ajustarDificultad() {
  // Incrementa la velocidad de la pelota después de cada 5 puntos anotados
  if (puntuacionJugador % 5 === 0 && puntuacionJugador > 0) {
    velocidadX *= 1.2; // Ajusta el factor de incremento aquí
    velocidadY *= 1.2; // Ajusta el factor de incremento aquí
  }

  // Ajusta la velocidad de la raqueta de la computadora según las puntuaciones
  if (puntuacionComputadora > puntuacionJugador) {
    velocidadComputadora = 4;
  } else {
    velocidadComputadora = 4;
  }
}

// Función para ajustar el ángulo de la pelota según el punto de colisión
function ajustarAngulo(raquetaY, raquetaAltura, tipoRaqueta) {
  let colisionPoint = pelotaY - raquetaY;
  let colisionRatio = (colisionPoint - raquetaAltura / 2) / (raquetaAltura / 2);

  // Ángulo máximo de desviación (en radianes)
  let maxDesviacion = PI / 3;

  // Calcular el nuevo ángulo basado en el punto de colisión
  let nuevoAngulo = colisionRatio * maxDesviacion;

  // Convertir el ángulo a velocidad
  let velocidadTotal = sqrt(velocidadX * velocidadX + velocidadY * velocidadY);
  if (tipoRaqueta === "jugador") {
    velocidadX = velocidadTotal * cos(nuevoAngulo);
  } else {
    velocidadX = -velocidadTotal * cos(nuevoAngulo);
  }
  velocidadY = velocidadTotal * sin(nuevoAngulo);
}

// Función para manejar la colisión con la raqueta del jugador
function colisionRaquetaJugador() {
  let posicionRelativaPelota = (pelotaY - jugadorY) / jugadorAltura;
  let anguloBase = atan2(velocidadY, velocidadX);
  let ajusteAngulo = (posicionRelativaPelota * PI) / 3;
  let nuevoAngulo = anguloBase + ajusteAngulo;
  nuevoAngulo = constrain(nuevoAngulo, -PI / 3, PI / 3);
  let velocidadTotal = sqrt(velocidadX * velocidadX + velocidadY * velocidadY);
  velocidadY = sin(nuevoAngulo) * velocidadTotal;
  velocidadX = -cos(nuevoAngulo) * velocidadTotal;

  // Reproducir sonido de colisión
  sonidoColision.play();
}

// Función para manejar la colisión con la raqueta de la computadora
function colisionRaquetaComputadora() {
  let posicionRelativaPelota = (pelotaY - computadoraY) / computadoraAltura;
  let anguloBase = atan2(velocidadY, velocidadX);
  let ajusteAngulo = (posicionRelativaPelota * PI) / 3;
  let nuevoAngulo = anguloBase + ajusteAngulo;
  nuevoAngulo = constrain(nuevoAngulo, -PI / 3, PI / 3);
  let velocidadTotal = sqrt(velocidadX * velocidadX + velocidadY * velocidadY);
  velocidadY = sin(nuevoAngulo) * velocidadTotal;
  velocidadX = cos(nuevoAngulo) * velocidadTotal;

  // Reproducir sonido de colisión
  sonidoColision.play();
}
