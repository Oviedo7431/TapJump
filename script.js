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
let speed = 6;

let best = localStorage.getItem("best") || 0;

// ------------------ SONIDOS ------------------
const jumpSound = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
const hitSound = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");

// ------------------ SALTO ------------------
function jump() {
  if (!jumping && gameRunning) {
    velocity = 18;
    jumping = true;
    jumpSound.play();
  }
}

document.addEventListener("touchstart", jump);
document.addEventListener("mousedown", jump);

// ------------------ PLAYER ------------------
function updatePlayer() {
  velocity -= gravity;
  playerY += velocity;

  if (playerY <= 0) {
    playerY = 0;
    velocity = 0;
    jumping = false;
  }

  player.style.bottom = (100 + playerY) + "px";
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

    x -= speed;
    obstacle.style.left = x + "px";

    const p = player.getBoundingClientRect();
    const o = obstacle.getBoundingClientRect();

    const collision =
      p.left < o.right &&
      p.right > o.left &&
      p.top < o.bottom &&
      p.bottom > o.top;

    if (collision) {
      hitSound.play();
      endGame();
    }

    if (x < -60) {
      obstacle.remove();
      clearInterval(move);

      score++;
      scoreText.textContent = score;

      // 🔥 dificultad progresiva
      if (score % 10 === 0) {
        speed += 0.5;
      }
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

    const delay = 1200 + Math.random() * 800;

    setTimeout(() => {
      canSpawn = true;
    }, delay);
  }

  setTimeout(obstacleLoop, 100);
}

// ------------------ LOOP ------------------
function loop() {
  if (!gameRunning) return;

  updatePlayer();
  requestAnimationFrame(loop);
}

// ------------------ GAME OVER ------------------
function endGame() {

  gameRunning = false;

  // 🏆 récord
  if (score > best) {
    best = score;
    localStorage.setItem("best", best);
  }

  gameOverScreen.innerHTML = `
    <h1>GAME OVER</h1>
    <p>Puntaje: ${score}</p>
    <p>Récord: ${best}</p>
    <p>Toca para reiniciar</p>
  `;

  // 💥 efecto visual
  document.body.style.background = "red";

  setTimeout(() => {
    document.body.style.background = "#0f172a";
  }, 200);

  gameOverScreen.classList.remove("hidden");
}

// ------------------ RESTART ------------------
function restartGame() {

  document.querySelectorAll(".obstacle").forEach(o => o.remove());

  playerY = 0;
  velocity = 0;
  score = 0;
  speed = 6;

  scoreText.textContent = score;

  gameRunning = true;
  gameOverScreen.classList.add("hidden");

  loop();
  obstacleLoop();
}

gameOverScreen.addEventListener("click", restartGame);

// ------------------ BOTÓN MÓVIL EXTRA ------------------
const btn = document.createElement("button");
btn.innerText = "SALTAR";
btn.style.position = "fixed";
btn.style.bottom = "20px";
btn.style.left = "50%";
btn.style.transform = "translateX(-50%)";
btn.style.padding = "15px 40px";
btn.style.fontSize = "20px";
btn.style.zIndex = "999";

btn.addEventListener("click", jump);
document.body.appendChild(btn);

// ------------------ START ------------------
loop();
obstacleLoop();
