const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const platformImage = new Image();
platformImage.src = "plataforma.png";

let player, gravity, keys, platforms, objective, currentLevel, movingPlatforms = [];
const sprite = new Image();
sprite.src = 'personagemTeste.png';

const FRAME_WIDTH = 32;
const FRAME_HEIGHT = 32;
const TOTAL_FRAMES = 4;
let currentFrame = 0;
let frameCounter = 0;
const FRAME_DELAY = 10;

document.getElementById("fase1").addEventListener("click", () => startGame(1));
document.getElementById("fase2").addEventListener("click", () => startGame(2));
document.getElementById("fase3").addEventListener("click", () => startGame(3));

function startGame(level) {
  currentLevel = level;
  document.getElementById("menu").style.display = "none";
  canvas.style.display = "block";

  gravity = 0.5;
  keys = {};
  movingPlatforms = [];

  player = {
    x: 50,
    y: 300,
    width: 32,
    height: 32,
    dx: 0,
    dy: 0,
    jumping: false,
    facingLeft: false
  };

  if (level === 1) {
    platforms = [
      { x: 0, y: 370, width: 800, height: 30 },
      { x: 200, y: 300, width: 100, height: 20 },
      { x: 400, y: 250, width: 100, height: 20 },
      { x: 550, y: 125, width: 100, height: 20 },
    ];
    objective = { x: 650, y: 90, width: 30, height: 30, color: "green" };

  } else if (level === 2) {
    platforms = [
      { x: 0, y: 370, width: 800, height: 30 },
      { x: 150, y: 320, width: 120, height: 20 },
      { x: 350, y: 280, width: 120, height: 20 },
      { x: 550, y: 240, width: 120, height: 20 },
    ];
    objective = { x: 680, y: 210, width: 30, height: 30, color: "purple" };

  } else if (level === 3) {
    platforms = [
      { x: 100, y: 230, width: 100, height: 20 },
      { x: 250, y: 300, width: 100, height: 20, moving: true, dir: 1, speed: 1 },
      { x: 400, y: 250, width: 100, height: 20, moving: true, dir: -1, speed: 1 },
      { x: 550, y: 200, width: 100, height: 20, moving: true, dir: 1, speed: 1 },
      { x: 700, y: 150, width: 100, height: 20, moving: true, dir: -1, speed: 2 },
      { x: 0, y: 500, width: 0, height: 0 } // chão invisível
    ];
    movingPlatforms = platforms.filter(p => p.moving);
    objective = { x: 850, y: 350, width: 30, height: 30, color: "gold" };
    player.x = 100;
    player.y = 200;
  }

  requestAnimationFrame(update);
}

document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

function update() {
  if (keys["ArrowLeft"] || keys["KeyA"]) {
    player.dx = -3;
    player.facingLeft = true;
  } else if (keys["ArrowRight"] || keys["KeyD"]) {
    player.dx = 3;
    player.facingLeft = false;
  } else {
    player.dx = 0;
  }

  if ((keys["ArrowUp"] || keys["KeyW"]) && !player.jumping) {
    player.dy = -10;
    player.jumping = true;
  }

  player.dy += gravity;
  player.x += player.dx;
  player.y += player.dy;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

  frameCounter++;
  if (frameCounter >= FRAME_DELAY) {
    frameCounter = 0;
    currentFrame = (currentFrame + 1) % TOTAL_FRAMES;
  }

  if (currentLevel === 1 || currentLevel === 2) updateLevel1And2();
  else if (currentLevel === 3) updateLevel3();
}

function updateLevel1And2() {
  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
    player.dy = 0;
    player.jumping = false;
  }
  if (player.y < 0) {
    player.y = 0;
    player.dy = 0;
  }

  for (let plat of platforms) {
    if (
      player.x < plat.x + plat.width &&
      player.x + player.width > plat.x &&
      player.y < plat.y + plat.height &&
      player.y + player.height > plat.y
    ) {
      player.y = plat.y - player.height;
      player.dy = 0;
      player.jumping = false;
    }
  }

  drawGame();

  if (checkVictory()) {
    showVictoryMessage();
    return;
  }

  requestAnimationFrame(update);
}

function updateLevel3() {
  if (player.y < 0) {
    player.y = 0;
    player.dy = 0;
  }

  for (let plat of movingPlatforms) {
    plat.y += plat.dir * plat.speed;
    if (plat.y <= 50 || plat.y >= 350) plat.dir *= -1;
  }

  let onPlatform = false;

  for (let plat of platforms) {
    if (
      player.x < plat.x + plat.width &&
      player.x + player.width > plat.x &&
      player.y + player.height >= plat.y &&
      player.y + player.height <= plat.y + plat.height &&
      player.dy >= 0
    ) {
      player.y = plat.y - player.height;
      player.dy = 0;
      player.jumping = false;
      onPlatform = true;
    }
  }

  const ground = platforms.find(p => p.y === 500);
  if (player.y + player.height >= ground.y && !onPlatform) {
    showGameOver();
    return;
  }

  drawGame();

  if (checkVictory()) {
    showVictoryMessage();
    return;
  }

  requestAnimationFrame(update);
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Desenha o jogador com a imagem do sprite
  ctx.save();
  if (player.facingLeft) {
    ctx.translate(player.x + player.width, player.y);
    ctx.scale(-1, 1);
    ctx.drawImage(
      sprite,
      currentFrame * FRAME_WIDTH, 0,
      FRAME_WIDTH, FRAME_HEIGHT,
      0, 0,
      player.width, player.height
    );
  } else {
    ctx.drawImage(
      sprite,
      currentFrame * FRAME_WIDTH, 0,
      FRAME_WIDTH, FRAME_HEIGHT,
      player.x, player.y,
      player.width, player.height
    );
  }
  ctx.restore();

  for (let plat of platforms) {
      if (platformImage.complete) {
    ctx.drawImage(platformImage, plat.x, plat.y, plat.width, plat.height);
  } else {
    ctx.fillStyle = plat.moving ? "gray" : "#fff";
    ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
  }
  }

  ctx.fillStyle = objective.color;
  ctx.fillRect(objective.x, objective.y, objective.width, objective.height);
}

function checkVictory() {
  return (
    player.x < objective.x + objective.width &&
    player.x + player.width > objective.x &&
    player.y < objective.y + objective.height &&
    player.y + player.height > objective.y
  );
}

function showVictoryMessage() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "36px sans-serif";
  const message = "Você completou a fase!";
  const textWidth = ctx.measureText(message).width;
  const x = (canvas.width - textWidth) / 2;
  const y = canvas.height / 2;
  ctx.fillText(message, x, y);
  setTimeout(() => {
    canvas.style.display = "none";
    document.getElementById("menu").style.display = "block";
  }, 2000);
}

function showGameOver() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "red";
  ctx.font = "36px sans-serif";
  const message = "Game Over!";
  const textWidth = ctx.measureText(message).width;
  const x = (canvas.width - textWidth) / 2;
  const y = canvas.height / 2;
  ctx.fillText(message, x, y);
  setTimeout(() => {
    canvas.style.display = "none";
    document.getElementById("menu").style.display = "block";
  }, 2000);
}
