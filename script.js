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

// ------------------ DIFICULTAD ------------------
let speed = 6;
let baseDelay = 1400;

// ------------------ RÉCORD ------------------
let best = localStorage.getItem("best") || 0;

// ------------------ MÚSICA ------------------
const music = new Audio("https://cdn.pixabay.com/download/audio/2022/10/25/audio_3b1f8a0b7a.mp3?filename=arcade-loop-115747.mp3");
music.loop = true;
music.volume = 0.3;

// ------------------ SALTO ------------------
function jump() {
  if (!jumping && gameRunning) {
    velocity = 18;
    jumping = true;

    // 📱 vibración
    if (navigator.vibrate) navigator.vibrate(30);

    spawnParticles();
  }
}

document.addEventListener("touchstart", jump);
document.addEventListener("mousedown", jump);

// ------------------ PARTÍCULAS ------------------
function spawnParticles() {
  for (let i = 0; i < 6; i++) {
    const p = document.createElement("div");
    p.style.position = "absolute";
    p.style.width = "6px";
    p.style.height = "6px";
    p.style.background = "#22d3ee";
    p.style.left = "120px";
    p.style.bottom = "120px";
    p.style.borderRadius = "50%";
    p.style.opacity = 1;

    game.appendChild(p);

    let x = 0;
    let y = 0;

    const interval = setInterval(() => {
      x += (Math.random() - 0.5) * 6;
      y += Math.random() * 4;

      p.style.transform = `translate(${x}px, ${y}px)`;
      p.style.opacity -= 0.05;

      if (p.style.opacity <= 0) {
        clearInterval(interval);
        p.remove();
      }
    }, 20);
  }
}

// ------------------ DIFICULTAD ------------------
function updateDifficulty() {

  speed = 6 + score * 0.15;
  baseDelay = Math.max(450, 1400 - score * 12);

  // ⚡ modo furia
  if (score > 30) {
    speed *= 1.3;
    game.style.filter = "hue-rotate(90deg)";
  } else {
    game.style.filter = "none";
  }

  // 🎵 música más rápida
  music.playbackRate = 1 + score * 0.01;
}

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
      endGame();
    }

    if (x < -60) {
      obstacle.remove();
      clearInterval(move);

      score++;
      scoreText.textContent = score;

      updateDifficulty();
    }

  }, 20);
}

// ------------------ SPAWN ------------------
let canSpawn = true;

function obstacleLoop() {

  if (!gameRunning) return;

  if (canSpawn) {
    createObstacle();
    canSpawn = false;

    updateDifficulty();

    setTimeout(() => {
      canSpawn = true;
    }, baseDelay);
  }

  setTimeout(obstacleLoop, 80);
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

  music.pause();

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

  gameOverScreen.classList.remove("hidden");
}

// ------------------ RESTART ------------------
function restartGame() {

  document.querySelectorAll(".obstacle").forEach(o => o.remove());

  playerY = 0;
  velocity = 0;
  score = 0;

  speed = 6;
  baseDelay = 1400;

  scoreText.textContent = score;

  gameRunning = true;
  gameOverScreen.classList.add("hidden");

  music.currentTime = 0;
  music.play();

  loop();
  obstacleLoop();
}

gameOverScreen.addEventListener("click", restartGame);

// ------------------ START ------------------
music.play();
loop();
obstacleLoop();
