const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    let player, gravity, keys, platforms, objective;

    // Corrigir: adicionar eventos ao DOM
    document.getElementById("fase1").addEventListener("click", () => startGame(1));
    document.getElementById("fase2").addEventListener("click", () => startGame(2));

    function startGame(level) {
      document.getElementById("menu").style.display = "none";
      canvas.style.display = "block";

      gravity = 0.5;
      keys = {};

      player = {
        x: 50,
        y: 300,
        width: 30,
        height: 30,
        dx: 0,
        dy: 0,
        jumping: false,
        color: "cyan"
      };

      if (level === 1) {
        platforms = [
          { x: 0, y: 370, width: 800, height: 30 },
          { x: 200, y: 300, width: 100, height: 20 },
          { x: 400, y: 250, width: 100, height: 20 },
        ];
      } else if (level === 2) {
        platforms = [
          { x: 0, y: 370, width: 800, height: 30 },
          { x: 150, y: 320, width: 120, height: 20 },
          { x: 350, y: 280, width: 120, height: 20 },
          { x: 550, y: 240, width: 120, height: 20 },
        ];
      }

      if (level === 1) {
        objective = { x: 700, y: 340, width: 30, height: 30, color: "lime" };
      } else if (level === 2) {
        objective = { x: 720, y: 200, width: 30, height: 30, color: "orange" };
      }

      requestAnimationFrame(update);
    }

    document.addEventListener("keydown", e => keys[e.code] = true);
    document.addEventListener("keyup", e => keys[e.code] = false);

    function update() {
      if (keys["ArrowLeft"] || keys["KeyA"]) player.dx = -3;
      else if (keys["ArrowRight"] || keys["KeyD"]) player.dx = 3;
      else player.dx = 0;

      if ((keys["ArrowUp"] || keys["KeyW"]) && !player.jumping) {
        player.dy = -10;
        player.jumping = true;
      }

      player.dy += gravity;
      player.x += player.dx;
      player.y += player.dy;
      // Limites da tela
      if (player.x < 0) player.x = 0;
      if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
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

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = player.color;
      ctx.fillRect(player.x, player.y, player.width, player.height);

      ctx.fillStyle = "#fff";
      for (let plat of platforms) {
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);        
      }

      ctx.fillStyle = objective.color;
      ctx.fillRect(objective.x, objective.y, objective.width, objective.height);

      

      if (
        player.x < objective.x + objective.width &&
        player.x + player.width > objective.x &&
        player.y < objective.y + objective.height &&
        player.y + player.height > objective.y) {
        showVictoryMessage();
        return;
      }
      requestAnimationFrame(update);
    }
    function showVictoryMessage() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.font = "36px sans-serif";
      ctx.fillText("Você completou a fase!", 200, 200);

      setTimeout(() => {
        canvas.style.display = "none";
        document.getElementById("menu").style.display = "block";
      }, 2000);
    }