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

function jump() {
  if (!jumping && gameRunning) {
    velocity = 18; // salto más fuerte
    jumping = true;
  }
}

document.addEventListener("touchstart", jump);
document.addEventListener("mousedown", jump);

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

function loop() {
  if (!gameRunning) return;

  updatePlayer();
  requestAnimationFrame(loop);
}

function obstacleLoop() {
  if (!gameRunning) return;

  createObstacle();

  const time = 1000 + Math.random() * 1200;
  setTimeout(obstacleLoop, time);
}

function endGame() {
  gameRunning = false;
  gameOverScreen.classList.remove("hidden");
}

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

gameOverScreen.addEventListener("click", restartGame);

loop();
obstacleLoop();