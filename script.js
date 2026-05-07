const player = document.getElementById("player");
const game = document.getElementById("game");
const scoreText = document.getElementById("score");
const gameOverScreen = document.getElementById("gameOver");

let playerY = 0;
let velocity = 0;
let gravity = 0.6;

let jumping = false;
let gameRunning = true;
let score = 0;

const groundHeight = 100;

// ------------------ SALTO ------------------

function jump() {
  if (!jumping && gameRunning) {
    velocity = 18;
    jumping = true;
  }
}

document.addEventListener("touchstart", jump);
document.addEventListener("mousedown", jump);

// ------------------ PLAYER UPDATE ------------------

function updatePlayer() {
  velocity -= gravity;
  playerY += velocity;

  if (playerY <= 0) {
    playerY = 0;
    velocity = 0;
    jumping = false;
  }

  player.style.bottom = (groundHeight + playerY) + "px";
}

// ------------------ OBSTÁCULOS ------------------

function createObstacle() {
  if (!gameRunning) return;

  const obstacle = document.createElement("div");
  obstacle.classList.add("obstacle");

  let x = window.innerWidth;
  obstacle.style.left = x + "px";

  game.appendChild(obstacle);

  const move = setInterval(() => {
    if (!gameRunning) {
      clearInterval(move);
      return;
    }

    x -= 6;
    obstacle.style.left = x + "px";

    const p = player.getBoundingClientRect();
    const o = obstacle.getBoundingClientRect();

    const collision =
      p.left < o.right &&
      p.right > o.left &&
      p.top < o.bottom &&
      p.bottom > o.top;

    if (collision) {
      endGame();
    }

    if (x < -60) {
      obstacle.remove();
      clearInterval(move);

      score++;
      scoreText.textContent = score;
    }

  }, 20);
}

// ------------------ SPAWN CONTROLADO ------------------

let canSpawn = true;

function obstacleLoop() {

  if (!gameRunning) return;

  if (canSpawn) {
    createObstacle();

    canSpawn = false;

    const delay = 1400 + Math.random() * 800;

    setTimeout(() => {
      canSpawn = true;
    }, delay);
  }

  setTimeout(obstacleLoop, 100);
}

// ------------------ GAME LOOP ------------------

function loop() {
  if (!gameRunning) return;

  updatePlayer();
  requestAnimationFrame(loop);
}

// ------------------ GAME OVER ------------------

function endGame() {
  gameRunning = false;
  gameOverScreen.classList.remove("hidden");
}

// ------------------ RESTART ------------------

function restartGame() {

  document.querySelectorAll(".obstacle").forEach(o => o.remove());

  playerY = 0;
  velocity = 0;
  score = 0;

  scoreText.textContent = score;

  gameRunning = true;
  gameOverScreen.classList.add("hidden");

  loop();
  obstacleLoop();
}

// click/touch para reiniciar
gameOverScreen.addEventListener("click", restartGame);

// ------------------ START ------------------

loop();
obstacleLoop();
