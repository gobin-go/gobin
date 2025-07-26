// main.js
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const GROUND_Y = canvas.height - 500;
const jumpSound = document.getElementById('jumpSound');
const scoreDisplay = document.getElementById('score');
const restartButton = document.getElementById('restartBtn');
const heartsDisplay = document.getElementById('hearts');

let frame = 0;
let nextCactusTime = Math.floor(Math.random() * 100) + 100;
let obstacles = [];
let particles = [];
let animation;
let jumpCount = 0;
let gravity = 0.5;
let rotation = 0;
let lives = 3;

let score = 0;
let displayedScore = 0;
let scoreTimer = 0;
let speed = 8;
let gameStarted = false;
let gameOver = false;
let blinkTimer = 0;
let blinking = false;
const bgColors = ['#ffffff', '#cceeff', '#ccffcc', '#ffffcc', '#ffccee', '#e0ccff', '#ffe0cc'];

let flipTrigger = false;
let flipBlinkCounter = 0;
let shouldFlipNow = false;

class Dino {
  constructor() {
    this.x = 100;
    this.y = GROUND_Y - 30;
    this.width = 30;
    this.height = 30;
    this.defaultY = GROUND_Y - 30;
    this.velocityY = 0;
    this.rotation = 0;
  }

  draw() {
    if (blinking && frame % 10 < 5) return;

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    if (shouldFlipNow) ctx.rotate(Math.PI);
    ctx.rotate(this.rotation);
    ctx.translate(-this.width / 2, -this.height / 2);

    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.width, 5);
    ctx.lineTo(this.width - 5, this.height);
    ctx.lineTo(5, this.height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.fillRect(5, 6, 4, 4);
    ctx.fillStyle = 'black';
    ctx.fillRect(5, 17, 15, 3);

    ctx.restore();
  }

  update() {
    this.velocityY += gravity;
    this.y += this.velocityY;
    this.rotation = this.velocityY * 0.1;

    if (this.y > this.defaultY) {
      this.y = this.defaultY;
      this.velocityY = 0;
      jumpCount = 0;
      this.rotation = 0;
    }
    this.draw();
  }

  jump() {
    this.velocityY = -10;
    jumpSound.currentTime = 0;
    jumpSound.play();

    let count = 10;
    let color = 'rgba(120,120,120,';
    if (jumpCount === 2) {
      count = 30;
      color = 'rgba(255,80,0,';
    }
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(
        this.x + this.width / 2,
        this.y + this.height,
        color,
        jumpCount === 2 ? 4 : 2
      ));
    }
  }
}

class Cactus {
  constructor() {
    this.x = canvas.width;
    this.type = Math.random() < 0.5 ? 'box' : 'trapezoid';
    this.width = 20;
    this.height = Math.random() < 0.5 ? 30 : 40;
    this.y = GROUND_Y - this.height;
  }

  draw() {
    ctx.fillStyle = '#cc4444';
    if (this.type === 'box') {
      ctx.fillRect(this.x, this.y, this.width, this.height);
    } else {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.width, this.y - 10);
      ctx.lineTo(this.x + this.width, this.y + this.height);
      ctx.lineTo(this.x, this.y + this.height);
      ctx.closePath();
      ctx.fill();
    }
  }

  update() {
    this.x -= speed;
    this.draw();
  }
}

class Particle {
  constructor(x, y, color = 'rgba(120,120,120,', size = 2) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * size + 1;
    this.alpha = 1;
    this.dy = Math.random() * -2 - 1;
    this.dx = Math.random() * 4 - 2;
    this.color = color;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
    this.alpha -= 0.03;
  }

  draw() {
    ctx.fillStyle = `${this.color}${this.alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  isAlive() {
    return this.alpha > 0;
  }
}

function detectCollision(dino, cactus) {
  return (
    cactus.x < dino.x + dino.width &&
    cactus.x + cactus.width > dino.x &&
    cactus.y < dino.y + dino.height &&
    cactus.y + cactus.height > dino.y
  );
}

function drawGround() {
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 1);
  ctx.lineTo(canvas.width, GROUND_Y + 1);
  ctx.stroke();
}

function drawHearts() {
  heartsDisplay.innerHTML = '❤'.repeat(lives);
}

const dino = new Dino();

document.addEventListener("DOMContentLoaded", () => {
  drawGround();
  dino.draw();
  drawHearts();
});

function gameLoop() {
  if (gameOver) return;

  animation = requestAnimationFrame(gameLoop);
  frame++;

 // 화면 반전 처리
if ((displayedScore % 3000) < 1000 && displayedScore >= 3000) {
  if (!flipTrigger) {
    flipTrigger = true;
    flipBlinkCounter = 20;
  } else if (flipBlinkCounter > 0) {
    flipBlinkCounter--;
    if (flipBlinkCounter % 2 === 0) {
      canvas.style.visibility = 'hidden';
    } else {
      canvas.style.visibility = 'visible';
    }
    return;
  } else {
    canvas.style.visibility = 'visible';
    shouldFlipNow = true;
  }
} else {
  shouldFlipNow = false;
  flipTrigger = false;
}


  const flipMode = shouldFlipNow;
  ctx.save();
  if (flipMode) {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.PI);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGround();

  if (frame % nextCactusTime === 0) {
    obstacles.push(new Cactus());
    nextCactusTime = Math.floor(Math.random() * (120 - speed * 2)) + 120;
    speed += 0.1;
  }

  obstacles.forEach((cactus, index) => {
    cactus.update();
    if (cactus.x + cactus.width < 0) {
      obstacles.splice(index, 1);
    }
    if (detectCollision(dino, cactus)) {
      lives--;
      drawHearts();
      obstacles.splice(index, 1);
      blinking = true;
      blinkTimer = 30;
      for (let i = 0; i < 5; i++) {
        particles.push(new Particle(dino.x + dino.width / 2, dino.y + dino.height / 2, 'rgba(255,200,50,'));
      }
      if (lives <= 0) {
        gameOver = true;
        cancelAnimationFrame(animation);
        scoreDisplay.innerText = `Game Over! Final Score: ${score}`;
        restartButton.style.display = 'block';
      }
    }
  });

  if (blinking) {
    blinkTimer--;
    if (blinkTimer <= 0) blinking = false;
  }

  scoreTimer++;
  if (scoreTimer >= 30) {
    score += 100;
    scoreTimer = 0;
    speed += 0.02;
  }
  if (displayedScore < score) displayedScore += 1;

  const bgIndex = Math.floor(displayedScore / 1000) % bgColors.length;
  canvas.style.background = bgColors[bgIndex];

  particles.forEach((p, i) => {
    p.update();
    p.draw();
    if (!p.isAlive()) {
      particles.splice(i, 1);
    }
  });

  dino.update();
  scoreDisplay.innerText = `Score: ${displayedScore}`;
  ctx.restore();
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    if (!gameStarted) {
      gameStarted = true;
      drawHearts();
      gameLoop();
    }
    if (jumpCount < 3) {
      dino.jump();
      jumpCount++;
    }
  }
});

canvas.addEventListener('touchstart', () => {
  if (!gameStarted) {
    gameStarted = true;
    drawHearts();
    gameLoop();
  }
  if (jumpCount < 3) {
    dino.jump();
    jumpCount++;
  }
});

restartButton.addEventListener('click', () => {
  location.reload();
});
