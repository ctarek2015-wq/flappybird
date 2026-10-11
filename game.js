const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- Asset Loading ---
const bg = new Image();
bg.src = "assets/GameObjects/background-day.png";
const ground = new Image();
ground.src = "assets/GameObjects/base.png";
const birdImg = new Image();
birdImg.src = "assets/GameObjects/yellowbird-midflap.png";
const pipeImg = new Image();
pipeImg.src = "assets/GameObjects/pipe-green.png";

// --- Game Variables ---
let frames = 0;
let score = 0;
let gameOver = false;

// Ground position for endless scrolling
let groundX = 0;
const GROUND_HEIGHT = 112;

// --- Bird Object ---
const bird = {
  x: 50,
  y: 150,
  width: 34,
  height: 24,
  gravity: 0.25,
  jump: 4.6,
  velocity: 0,

  draw() {
    ctx.drawImage(birdImg, this.x, this.y, this.width, this.height);
  },

  flap() {
    this.velocity = -this.jump;
  },

  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;

    // Ground Collision
    if (this.y + this.height >= canvas.height - GROUND_HEIGHT) {
      this.y = canvas.height - GROUND_HEIGHT - this.height;
      triggerGameOver();
    }

    // Ceiling Limit
    if (this.y <= 0) {
      this.y = 0;
      this.velocity = 0;
    }
  },

  reset() {
    this.y = 150;
    this.velocity = 0;
  },
};

// --- Pipes Array & Manager ---
const pipes = {
  position: [],
  topPipeY: -200,
  gap: 90,
  dx: 2,

  draw() {
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];
      let topY = p.y;
      let bottomY = p.y + pipeImg.height + this.gap;

      // Top pipe (Flipped)
      ctx.save();
      ctx.translate(p.x + pipeImg.width / 2, topY + pipeImg.height / 2);
      ctx.scale(1, -1);
      ctx.drawImage(pipeImg, -pipeImg.width / 2, -pipeImg.height / 2);
      ctx.restore();

      // Bottom pipe
      ctx.drawImage(pipeImg, p.x, bottomY);
    }
  },

  update() {
    // Spawn pipes every 100 frames
    if (frames % 100 === 0) {
      this.position.push({
        x: canvas.width,
        y: -150 * (Math.random() + 1),
      });
    }

    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];
      p.x -= this.dx;

      let bottomPipeY = p.y + pipeImg.height + this.gap;

      // --- Collision Detection ---
      // Top Pipe Collision
      if (
        bird.x + bird.width > p.x &&
        bird.x < p.x + pipeImg.width &&
        bird.y < p.y + pipeImg.height
      ) {
        triggerGameOver();
      }

      // Bottom Pipe Collision
      if (
        bird.x + bird.width > p.x &&
        bird.x < p.x + pipeImg.width &&
        bird.y + bird.height > bottomPipeY
      ) {
        triggerGameOver();
      }

      // --- Scoring ---
      if (p.x + pipeImg.width < bird.x && !p.passed) {
        score++;
        p.passed = true;
      }

      // Remove off-screen pipes
      if (p.x + pipeImg.width < 0) {
        this.position.shift();
      }
    }
  },

  reset() {
    this.position = [];
  },
};

// --- Controls ---
window.addEventListener("keydown", (e) => {
  if (e.code === "Space") handleInput();
});
canvas.addEventListener("click", handleInput);

function handleInput() {
  if (gameOver) {
    resetGame();
  } else {
    bird.flap();
  }
}

function triggerGameOver() {
  if (!gameOver) {
    gameOver = true;
  }
}

function resetGame() {
  bird.reset();
  pipes.reset();
  score = 0;
  frames = 0;
  gameOver = false;
  loop();
}

// --- UI Overlay ---
function drawScore() {
  ctx.fillStyle = "#FFF";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.font = "35px sans-serif";

  if (!gameOver) {
    ctx.fillText(score, canvas.width / 2 - 10, 50);
    ctx.strokeText(score, canvas.width / 2 - 10, 50);
  } else {
    ctx.font = "25px sans-serif";
    ctx.fillText("GAME OVER", 80, 200);
    ctx.strokeText("GAME OVER", 80, 200);

    ctx.font = "18px sans-serif";
    ctx.fillText(`Score: ${score}`, 120, 240);
    ctx.fillText("Click or Press Space to Restart", 40, 280);
  }
}

// --- Main Game Loop ---
function loop() {
  // 1. Update positions
  if (!gameOver) {
    bird.update();
    pipes.update();
    groundX = (groundX - pipes.dx) % 14; // Infinite ground scroll offset
  }

  // 2. Clear canvas & Render visuals
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  pipes.draw();

  // Render scrolling ground
  ctx.drawImage(
    ground,
    groundX,
    canvas.height - GROUND_HEIGHT,
    canvas.width + 20,
    GROUND_HEIGHT,
  );

  bird.draw();
  drawScore();

  frames++;

  // 3. Next frame request
  if (!gameOver) {
    requestAnimationFrame(loop);
  }
}

// Start game loop when assets are loaded
bg.onload = () => {
  loop();
};
