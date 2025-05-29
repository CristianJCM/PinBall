const canvas = document.getElementById('pinball');
const ctx = canvas.getContext('2d');

const paddleWidth = 100;
const paddleHeight = 15;
const paddleSpeed = 8;

const ballRadius = 12;

const blockRowCount = 5;
const blockColumnCount = 8;
const blockWidth = 60;
const blockHeight = 20;
const blockPadding = 10;
const blockOffsetTop = 30;
const blockOffsetLeft = 30;

let score = 0;
let isPaused = false;
let isGameOver = false;

const blocks = [];
for (let r = 0; r < blockRowCount; r++) {
  blocks[r] = [];
  for (let c = 0; c < blockColumnCount; c++) {
    blocks[r][c] = { x: 0, y: 0, broken: false };
  }
}

const paddle = {
  x: canvas.width / 2 - paddleWidth / 2,
  y: canvas.height - 50,
  width: paddleWidth,
  height: paddleHeight,
  dx: 0
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: ballRadius,
  speed: 5,
  dx: 4,
  dy: -4
};

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

function drawScore() {
  document.getElementById('score').textContent = score;
}

function drawBlocks() {
  for (let r = 0; r < blockRowCount; r++) {
    for (let c = 0; c < blockColumnCount; c++) {
      const b = blocks[r][c];
      if (!b.broken) {
        const x = c * (blockWidth + blockPadding) + blockOffsetLeft;
        const y = r * (blockHeight + blockPadding) + blockOffsetTop;
        b.x = x;
        b.y = y;
        drawRect(x, y, blockWidth, blockHeight, '#0f0');
      }
    }
  }
}

function update() {
  if (isPaused || isGameOver) return;

  paddle.x += paddle.dx;
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;

  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;
  }

  if (ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
  }

  if (
    ball.y + ball.radius > paddle.y &&
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.width
  ) {
    ball.dy = -ball.dy;
    let collidePoint = ball.x - (paddle.x + paddle.width / 2);
    collidePoint = collidePoint / (paddle.width / 2);
    ball.dx = collidePoint * ball.speed;
    score++;
    drawScore();
  }

  // Colisión con bloques
  for (let r = 0; r < blockRowCount; r++) {
    for (let c = 0; c < blockColumnCount; c++) {
      const b = blocks[r][c];
      if (!b.broken) {
        if (
          ball.x > b.x &&
          ball.x < b.x + blockWidth &&
          ball.y > b.y &&
          ball.y < b.y + blockHeight
        ) {
          ball.dy = -ball.dy;
          b.broken = true;
          score += 5;
          drawScore();
        }
      }
    }
  }

  if (ball.y - ball.radius > canvas.height) {
    isGameOver = true;
    document.getElementById('game-over-message').style.display = 'block';
  }
}

function resetGame() {
  score = 0;
  drawScore();
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = 4;
  ball.dy = -4;
  paddle.x = canvas.width / 2 - paddleWidth / 2;
  isPaused = false;
  isGameOver = false;
  document.getElementById('pause-message').style.display = 'none';
  document.getElementById('game-over-message').style.display = 'none';

  for (let r = 0; r < blockRowCount; r++) {
    for (let c = 0; c < blockColumnCount; c++) {
      blocks[r][c].broken = false;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRect(paddle.x, paddle.y, paddle.width, paddle.height, '#0ff');
  drawCircle(ball.x, ball.y, ball.radius, '#0ff');
  drawBlocks();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') {
    paddle.dx = -paddleSpeed;
  } else if (e.key === 'ArrowRight') {
    paddle.dx = paddleSpeed;
  } else if (e.key === 'Escape') {
    isPaused = !isPaused;
    document.getElementById('pause-message').style.display = isPaused ? 'block' : 'none';
  } else if (e.key === 'r' || e.key === 'R') {
    if (isGameOver) resetGame();
  }
});

document.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    paddle.dx = 0;
  }
});

drawScore();
gameLoop();
