const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const platformImage = new Image();
platformImage.src = "img/plataforma.png";
const trapCoinImage = new Image();
trapCoinImage.src = "img/crystal64.png";

const jumpSound = new Audio("audio/jump.mp3");
const backgroundMusic = new Audio("audio/background.mp3");
const buttonSound = new Audio("audio/button.mp3")
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5; 

const menuSound = new Audio("audio/menuSound.mp3")
menuSound.loop = true;
backgroundMusic.volume = 0.5; 

window.addEventListener("load", () => {
  // Evita autoplay bloqueado
  document.body.addEventListener("click", () => {
    if (menuSound.paused) {
      menuSound.play();
    }
  }, { once: true });

  // Exibe o menu e inicia som se possível
  document.getElementById("menu").style.display = "block";
});

window.addEventListener("click", () => {
  iniciarMusicaMenu();
}, { once: true });

let player, gravity, keys, platforms, objective, currentLevel, movingPlatforms = [];
let timer = 20000;
let timerActive = false;
let lastTime = 0;
let trapCoin;
let timerInterval;

// trap coin
let trapCoinFrame = 12;
let trapCoinFrameDelay = 10;
let trapCoinFrameCounter = 12;
const TRAPCOIN_FRAME_WIDTH = 64; // largura de um frame do sprite
const TRAPCOIN_FRAME_HEIGHT = 64; // altura
const TRAPCOIN_TOTAL_FRAMES = 12; // ajuste conforme seu sprite sheet


// nave 
const shipSprite = new Image();
shipSprite.src = "img/ShipSprite.png";
let shipFrame = 0;
let shipFrameCounter = 0;
const SHIP_TOTAL_FRAMES = 2;
const SHIP_FRAME_WIDTH = 48;
const SHIP_FRAME_HEIGHT = 64;
const SHIP_FRAME_DELAY = 20;

const deathCounter = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0
};

let paused = false;
let animationId = null;

const sprites = {
  idle: new Image(),
  run: new Image(),
  jump: new Image()
};

sprites.idle.src = 'img/IdleAstronaut.png';
sprites.run.src = 'img/RunAstronaut.png';
sprites.jump.src = 'img/JumpAstronaut.png';


const FRAME_WIDTH = 18;
const FRAME_HEIGHT = 24;
const TOTAL_FRAMES = 4;
let currentFrame = 0;
let frameCounter = 0;
const FRAME_DELAY = 10;

document.querySelectorAll("button").forEach(button => {
  button.addEventListener("click", () => {
    buttonSound.currentTime = 0;
    buttonSound.play();
  });
});


document.getElementById("fase1").addEventListener("click", () => startGame(1));
document.getElementById("fase2").addEventListener("click", () => startGame(2));
document.getElementById("fase3").addEventListener("click", () => startGame(3));
document.getElementById("fase4").addEventListener("click", () => startGame(4));
document.getElementById("fase5").addEventListener("click", () => startGame(5));


function startGame(level) {
  currentLevel = level;
  document.getElementById("menu").style.display = "none";
  canvas.style.display = "block";


menuSound.pause();
menuSound.currentTime = 0;

backgroundMusic.play().catch(() => {
  // fallback para garantir reprodução quando possível
  document.body.addEventListener("click", () => {
    backgroundMusic.play();
  }, { once: true });
});

// Garante que a música de menu pare ao entrar na fase
if (!menuSound.paused) {
  menuSound.pause();
  menuSound.currentTime = 0;
}

// Toca a música de fundo só se ainda não estiver tocando
if (backgroundMusic.paused) {
  backgroundMusic.play().catch(() => {});
}


  gravity = 0.3;
  keys = {};
  movingPlatforms = [];
  timer = 20;

  gameStarted = true;
  gameOver = false;
  totalTime = 0;
  if (level === 4) {
    startTimer();
  }


  // Posição inicial
  player = {
    x: 50,
    y: 300,
    width: 18,
    height: 24,
    dx: 0,
    dy: 0,
    jumping: false,
    facingLeft: false,
    state: "idle",
    startX: 50,     //  Adicionado
    startY: 300     //  Adicionado
  };

  trapCoin = null; // Limpa qualquer trapCoin anterior

  if (level === 1) {
    platforms = [
      { x: 0, y: 370, width: 200, height: 30 },
      { x: 420, y: 370, width: 200, height: 30 },

      { x: 250, y: 300, width: 100, height: 20 },
      { x: 420, y: 250, width: 100, height: 20 },
      { x: 600, y: 200, width: 100, height: 20 },
    ];
    objective = { x: 750, y: 120, width: 48, height: 64 };


  } else if (level === 2) {
    platforms = [
      { x: 100, y: 230, width: 100, height: 20 },
      { x: 250, y: 300, width: 100, height: 20, moving: true, dir: 1, speed: 1 },
      { x: 400, y: 250, width: 100, height: 20, moving: true, dir: -1, speed: 1 },
      { x: 550, y: 200, width: 100, height: 20, moving: true, dir: 1, speed: 1 },
      { x: 700, y: 150, width: 100, height: 20, moving: true, dir: -1, speed: 2 },
      { x: 0, y: 500, width: 0, height: 0 } // chão invisível
    ];
    movingPlatforms = platforms.filter(p => p.moving);
    objective = { x: 850, y: 350, width: 48, height: 64 };
    player.x = 100;
    player.y = 200;
    player.startX = 100; // Atualiza ponto inicial
    player.startY = 200;

  } else if (level === 3) {
    platforms = [
      { x: 0, y: 570, width: 0, height: 0 }, // chão 
      { x: 63, y: 220, width: 100, height: 20 },
      { x: 250, y: 450, width: 100, height: 20, moving: true, dir: 1, speed: 2, horizontal: true },
      { x: 450, y: 400, width: 100, height: 20, moving: true, dir: -1, speed: 2, horizontal: true },
      { x: 870, y: 220, width: 100, height: 20, moving: true, dir: -1, speed: 2, minY: 80, maxY: 300 },
      { x: 700, y: 130, width: 100, height: 20 },
      { x: 730, y: 330, width: 100, height: 20 }
    ];

    movingPlatforms = platforms.filter(p => p.moving);
    objective = { x: 550, y: 220, width: 48, height: 64 };
    player.x = 60;
    player.y = 100;
    player.startX = 60;
    player.startY = 100;

  } else if (level === 4) {
    platforms = [
      { x: 0, y: 550, width: 100, height: 20 },
      { x: 150, y: 480, width: 100, height: 20 },
      { x: 300, y: 410, width: 100, height: 20 },
      { x: 450, y: 340, width: 100, height: 20, type: "moving", direction: "vertical", speed: 1.5, range: 80, initial: 340 },
      { x: 600, y: 270, width: 100, height: 20, type: "moving", direction: "horizontal", speed: 2, range: 40, initial: 600 },
      { x: 750, y: 200, width: 100, height: 20, type: "falling", triggered: false, fallDelay: 30, fallSpeed: 4, timer: 0 },
      { x: 900, y: 130, width: 100, height: 20, type: "moving", direction: "horizontal", speed: 2.5, range: 100, initial: 900 },
    ];
    objective = { x: 1020, y: 100, width: 48, height: 64 };
    trapCoin = { x: 320, y: 380, width: 20, height: 20, color: "yellow" }; // Trapcoin adicionada
    startTimer();

  } else if (level === 5) {
    platforms = [
      { x: 0, y: 370, width: 90, height: 30 },
      { x: 100, y: 320, width: 20, height: 15, type: "moving", direction: "vertical", speed: 3, range: 80, initial: 240 },
      { x: 220, y: 270, width: 20, height: 15, type: "moving", direction: "vertical", speed: 4, range: 80, initial: 240 },
      { x: 320, y: 270, width: 20, height: 15, type: "moving", direction: "vertical", speed: 5, range: 80, initial: 240 },
      { x: 430, y: 220, width: 20, height: 15, type: "moving", direction: "vertical", speed: 6, range: 80, initial: 240 },
      { x: 550, y: 170, width: 20, height: 15, type: "moving", direction: "vertical", speed: 8, range: 80, initial: 240 },
      { x: 680, y: 200, width: 10, height: 430, type: "falling", triggered: false, fallDelay: 2, fallSpeed: 5 }, // Essa aqui
      { x: 800, y: 550, width: 20, height: 15, type: "falling", triggered: false, fallDelay: 2, fallSpeed: 5 },
      { x: 910, y: 550, width: 20, height: 15, type: "falling", triggered: false, fallDelay: 2, fallSpeed: 5 },
      { x: 1000, y: 550, width: 20, height: 15, type: "falling", triggered: false, fallDelay: 2, fallSpeed: 5 },

    ];
    objective = { x: 1110, y: 500, width: 48, height: 64 };
  } if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // Troca a música do menu pela de fase
if (menuSound && !menuSound.paused) {
  menuSound.pause();
  menuSound.currentTime = 0;
}

if (backgroundMusic.paused) {
    menuSound.pause();
    menuSound.currentTime = 0;

    backgroundMusic.play().catch(() => {});
  }
  animationId = requestAnimationFrame(update);
}


document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

function update() {
  if (keys["ArrowLeft"] || keys["KeyA"]) {
    player.dx = -2;
    player.facingLeft = true;
  } else if (keys["ArrowRight"] || keys["KeyD"]) {
    player.dx = 2;
    player.facingLeft = false;
  } else {
    player.dx = 0;
  }

  // verica acao para trocar sprite
  if (player.jumping || player.dy !== 0) {
    player.state = "jump";
  } else if (player.dx !== 0) {
    player.state = "run";
  } else {
    player.state = "idle";
  }

  if ((keys["ArrowUp"] || keys["KeyW"]) && !player.jumping) {
    player.dy = -7;
    player.jumping = true;
    jumpSound.play()
  }

  player.dy += gravity;
  player.x += player.dx;
  player.y += player.dy;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
  if (player.y + player.height > canvas.height) {
    clearInterval(timerInterval);
    showGameOver("Game Over!");
    return;
  }

  frameCounter++;
  if (frameCounter >= FRAME_DELAY) {
    frameCounter = 0;
    currentFrame = (currentFrame + 1) % TOTAL_FRAMES;
  }

  //att animaçao nave
  shipFrameCounter++;
  if (shipFrameCounter >= SHIP_FRAME_DELAY) {
    shipFrameCounter = 0;
    shipFrame = (shipFrame + 1) % SHIP_TOTAL_FRAMES;
  }

  if (currentLevel === 1) updateLevel1();
  else if (currentLevel === 2) updateLevel2();
  else if (currentLevel === 3) updateLevel3();
  else if (currentLevel === 4) updateLevel4();
  else if (currentLevel === 5) updateLevel5();
}

function updateLevel1() {
  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
    player.dy = 0;
    player.jumping = false;
  }
  if (player.y < 0) {
    player.y = 0;
    player.dy = 0;
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
      if (plat.moving) {
        if (plat.horizontal) {
          player.x += plat.dir * plat.speed;
        } else {
          player.y += plat.dir * plat.speed;
        }
      }
    }
  }

  player.jumping = !onPlatform; // <-- ADICIONE ISSO

  drawGame();

  drawGame();

  if (checkVictory()) {
    showVictoryMessage();
    return;
  }

  animationId = requestAnimationFrame(update);
}

function updateLevel2() {
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
      if (plat.moving) {
        if (plat.horizontal) {
          player.x += plat.dir * plat.speed;
        } else {
          player.y += plat.dir * plat.speed;
        }
      }
    }
  }

  player.jumping = !onPlatform; // <-- ADICIONE ISSO


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

  animationId = requestAnimationFrame(update);
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer--;
    if (timer <= 0) {
      clearInterval(timerInterval);
      showGameOver("Tempo esgotado!");
    }
  }, 1000);
}

function updateLevel3() {
  if (player.y < 0) {
    player.y = 0;
    player.dy = 0;
  }

  // Move as plataformas
  for (let plat of movingPlatforms) {
    if (plat.horizontal) {
      plat.x += plat.dir * plat.speed;
      if (plat.x <= 200 || plat.x + plat.width >= 700) plat.dir *= -1;
    } else {
      plat.y += plat.dir * plat.speed;
      if (plat.y <= 160 || plat.y >= 500) plat.dir *= -1;
    }


  }

  let onPlatform = false;

  // Colisão refinada (por cima apenas)
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

      if (plat.moving) {
        if (plat.horizontal) {
          player.x += plat.dir * plat.speed;
        } else {
          player.y += plat.dir * plat.speed;
        }
      }
    }
  }

  // Game Over se cair no chão sem plataforma
  const ground = platforms.find(p => p.y === 570);
  if (player.y + player.height >= ground.y && !onPlatform) {
    showGameOver();
    return;
  }

  drawGame();

  // Vitória
  if (checkVictory()) {
    showVictoryMessage();
    return;
  }

  animationId = requestAnimationFrame(update);

}

function updateLevel4() {

  let onPlatform = false;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
  if (player.y + player.height > canvas.height) {
    clearInterval(timerInterval);
    showGameOver("Game Over!");
    return;
  }

  if (player.y < 0) {
    player.y = 0;
    player.dy = 0;
  }

  const prevTop = player.y - player.dy;

  for (let plat of platforms) {
    // === Plataformas móveis ===
    if (plat.type === "moving") {
      if (plat.direction === "vertical") {
        plat.y += plat.speed;
        if (plat.y > plat.initial + plat.range || plat.y < plat.initial - plat.range) {
          plat.speed *= -1;
        }
      } else if (plat.direction === "horizontal") {
        plat.x += plat.speed;
        if (plat.x > plat.initial + plat.range || plat.x < plat.initial - plat.range) {
          plat.speed *= -1;

        }

      }
    }

    // === Plataformas que caem ===
    if (plat.type === "falling") {
      const touching = (
        player.x < plat.x + plat.width &&
        player.x + player.width > plat.x &&
        player.y + player.height > plat.y &&
        player.y < plat.y + plat.height
      );

      if (touching && !plat.triggered) {
        plat.triggered = true;
        plat.timer = -1;
      }

      if (plat.triggered) {
        plat.timer++;
        if (plat.timer >= plat.fallDelay) {
          plat.y += plat.fallSpeed;
        }
      }
    }

    if (
      player.x < plat.x + plat.width &&
      player.x + player.width > plat.x &&
      player.y < plat.y + plat.height &&
      player.y + player.height > plat.y
    ) {
      // Colisão por cima
      if (player.dy >= 0 && player.y + player.height - player.dy <= plat.y) {
        player.y = plat.y - player.height;
        player.dy = 0;
        player.jumping = false;
        onPlatform = true;

        if (plat.type === "moving") {
          if (plat.direction === "vertical") {
            player.y += plat.speed;
          } else if (plat.direction === "horizontal") {
            player.x += plat.speed;
          }
        }
      }
      // Colisão por baixo
      else if (prevTop >= plat.y + plat.height && player.dy < 0) {
        player.y = plat.y + plat.height;
        player.dy = 0;
      }
      // Colisão lateral esquerda (jogador à direita da plataforma)
      else if (player.dx > 0 && player.x + player.width > plat.x && player.x < plat.x) {
        player.x = plat.x - player.width;
        player.dx = 0;
      }
      // Colisão lateral direita (jogador à esquerda da plataforma)
      else if (player.dx < 0 && player.x < plat.x + plat.width && player.x + player.width > plat.x + plat.width) {
        player.x = plat.x + plat.width;
        player.dx = 0;
      }

    }


  }

  // Colisão com moeda maldita
  if (trapCoin &&
    player.x < trapCoin.x + trapCoin.width &&
    player.x + player.width > trapCoin.x &&
    player.y < trapCoin.y + trapCoin.height &&
    player.y + player.height > trapCoin.y
  ) {
    player.x = player.startX;
    player.y = player.startY;
    player.dy = 0;
  }

  // Desenhar trapCoin
  if (trapCoin) {
    ctx.fillStyle = trapCoin.color;
    ctx.fillRect(trapCoin.x, trapCoin.y, trapCoin.width, trapCoin.height);
  }

  // Colisão com objetivo
  if (
    player.x < objective.x + objective.width &&
    player.x + player.width > objective.x &&
    player.y < objective.y + objective.height &&
    player.y + player.height > objective.y
  ) {
    clearInterval(timerInterval);
    showVictoryMessage();
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "20px sans-serif";
  ctx.fillText(`${timer}`, 580, 580);


  if (player.y + player.height > canvas.height && !onPlatform) {
    showGameOver();
    return;
  }

  drawGame();

  if (checkVictory()) {
    showVictoryMessage();
    return;
  }
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(`Time: ${Math.floor(timer / 1000)}s`, 10, 30);


  animationId = requestAnimationFrame(update);
}


function updateLevel5() {
  if (player.y < 0) {
    player.y = 0;
    player.dy = 0;
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
      // Corrige a posição do jogador
      player.y = plat.y - player.height;
      player.dy = 0;
      player.jumping = false;
      onPlatform = true;

      // Se a plataforma for vertical, mover o jogador junto com ela
      if (plat.type === "moving" && plat.direction === "vertical") {
        player.y += plat.speed;
      }
    }
  }

  for (let plat of platforms) {
    if (plat.type === "moving") {
      if (plat.direction === "vertical") {
        plat.y += plat.speed;
        if (plat.y > plat.initial + plat.range || plat.y < plat.initial - plat.range) {
          plat.speed *= -1;
        }
      }
    }

    if (plat.type === "falling") {
      const touching = (
        player.x < plat.x + plat.width &&
        player.x + player.width > plat.x &&
        player.y + player.height >= plat.y &&
        player.y + player.height <= plat.y + plat.height &&
        player.dy >= 0
      );

      if (touching && !plat.triggered) {
        plat.triggered = true;
        plat.timer = 0;
      }

      if (plat.triggered) {
        if (plat.timer < plat.fallDelay) {
          plat.timer++;
        } else {
          plat.y += plat.fallSpeed;
        }
      }
    }
  }

  platforms = platforms.filter(plat => plat.type !== "falling" || plat.y < canvas.height + 100);


  if (player.y + player.height > canvas.height && !onPlatform) {
    showGameOver();
    return;
  }

  drawGame();

  if (checkVictory()) {
    showVictoryMessage();
    return;
  }

  animationId = requestAnimationFrame(update);
}


function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const sprite = sprites[player.state];

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

  // Desenhar plataformas
  for (let plat of platforms) {
    if (platformImage.complete) {
      ctx.drawImage(platformImage, plat.x, plat.y, plat.width, plat.height);
    } else {
      ctx.fillStyle = "#fff";
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
    }
  }

  // Desenhar trapCoin aqui (visível)
if (trapCoin && trapCoinImage.complete) {
  ctx.drawImage(
    trapCoinImage,
    trapCoinFrame * TRAPCOIN_FRAME_WIDTH, 0,
    TRAPCOIN_FRAME_WIDTH, TRAPCOIN_FRAME_HEIGHT,
    trapCoin.x, trapCoin.y,
    trapCoin.width, trapCoin.height
  );

  // Atualiza frame de animação
  trapCoinFrameCounter++;
  if (trapCoinFrameCounter >= trapCoinFrameDelay) {
    trapCoinFrameCounter = 0;
    trapCoinFrame = (trapCoinFrame + 1) % TRAPCOIN_TOTAL_FRAMES;
  }
}
  // Desenhar objetivo
  ctx.drawImage(
    shipSprite,
    shipFrame * SHIP_FRAME_WIDTH, 0,            // X do frame no sprite
    SHIP_FRAME_WIDTH, SHIP_FRAME_HEIGHT,        // tamanho do recorte
    objective.x, objective.y,                   // onde desenhar na tela
    objective.width, objective.height           // tamanho na tela
  );

  // Mostrar timer


  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText(`Mortes: ${deathCounter[currentLevel]}`, 10, 20);


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

  // Marca botão da fase como completa
  const button = document.getElementById(`fase${currentLevel}`);
  if (button) {
    button.classList.add("fase-completa");
  }

  setTimeout(() => {
    canvas.style.display = "none";
    document.getElementById("menu").style.display = "block";
  }, 2000);
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

backgroundMusic.pause();

menuSound.currentTime = 0; // reinicia do começo
menuSound.play();
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

  deathCounter[currentLevel]++;

  // Exibe mensagem e contador
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.fillText(message, canvas.width / 2 - 70, canvas.height / 2 - 20);
  ctx.fillText(`Mortes na fase ${currentLevel}: ${deathCounter[currentLevel]}`, canvas.width / 2 - 110, canvas.height / 2 + 20);


  setTimeout(() => {
    startGame(currentLevel);
  }, 2000);
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

document.addEventListener("keydown", e => {
  if (e.code === "Escape" && canvas.style.display === "block") {
    togglePause();
  }
});

function togglePause() {
  paused = !paused;
  const pauseMenu = document.getElementById("pauseMenu");

  if (paused) {
    pauseMenu.style.display = "block";
    cancelAnimationFrame(animationId); // Pausa a animação
  } else {
    pauseMenu.style.display = "none";
    animationId = requestAnimationFrame(update); // Retoma a animação
  }
}

document.getElementById("btnContinue").addEventListener("click", () => {
  paused = false;
  document.getElementById("pauseMenu").style.display = "none";
  animationId = requestAnimationFrame(update);
});

// Quando clicar em "Voltar para o Menu"
document.getElementById("btnBackToMenu").addEventListener("click", () => {
  paused = false;
  document.getElementById("pauseMenu").style.display = "none";
  canvas.style.display = "none";
  document.getElementById("menu").style.display = "block";

  // Música: parar fase e voltar menu
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
  if (menuSound.paused) {
    menuSound.play();
  }
});

window.addEventListener("click", () => {
  if (menuSound.paused) {
    menuSound.play().catch(() => {});
  }
}, { once: true });


