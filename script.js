const canvas = document.querySelector("#game-board");
const ctx = canvas.getContext("2d");
const scoreElement = document.querySelector("#score");
const bestScoreElement = document.querySelector("#best-score");
const startButton = document.querySelector("#start-button");
const pauseButton = document.querySelector("#pause-button");
const message = document.querySelector("#message");
const controlButtons = document.querySelectorAll(".control");

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const gameSpeed = 115;
const directions = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

let snake;
let food;
let direction;
let nextDirection;
let score;
let bestScore = Number(localStorage.getItem("snakeBestScore")) || 0;
let gameTimer = null;
let isPaused = false;
let isGameOver = true;

bestScoreElement.textContent = bestScore;
resetGame();
draw();

startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", togglePause);
document.addEventListener("keydown", handleKeyPress);
controlButtons.forEach((button) => {
  button.addEventListener("click", () => setDirection(button.dataset.direction));
});

function resetGame() {
  snake = [
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 7, y: 10 }
  ];
  direction = directions.right;
  nextDirection = directions.right;
  score = 0;
  food = createFood();
  scoreElement.textContent = score;
}

function startGame() {
  clearInterval(gameTimer);
  resetGame();
  isPaused = false;
  isGameOver = false;
  startButton.textContent = "重新开始";
  pauseButton.disabled = false;
  pauseButton.textContent = "暂停";
  hideMessage();
  gameTimer = setInterval(gameLoop, gameSpeed);
  draw();
}

function togglePause() {
  if (isGameOver) return;

  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? "继续" : "暂停";
  message.textContent = isPaused ? "已暂停" : "";
  message.classList.toggle("hidden", !isPaused);
}

function gameLoop() {
  if (isPaused || isGameOver) return;

  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  if (hasCollision(head)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreElement.textContent = score;
    food = createFood();
  } else {
    snake.pop();
  }

  draw();
}

function setDirection(directionName) {
  const requestedDirection = directions[directionName];
  if (!requestedDirection || isOpposite(requestedDirection, direction)) return;

  nextDirection = requestedDirection;
}

function handleKeyPress(event) {
  const keyMap = {
    ArrowUp: "up",
    w: "up",
    W: "up",
    ArrowDown: "down",
    s: "down",
    S: "down",
    ArrowLeft: "left",
    a: "left",
    A: "left",
    ArrowRight: "right",
    d: "right",
    D: "right"
  };

  if (event.code === "Space") {
    event.preventDefault();
    togglePause();
    return;
  }

  if (keyMap[event.key]) {
    event.preventDefault();
    setDirection(keyMap[event.key]);
  }
}

function isOpposite(first, second) {
  return first.x + second.x === 0 && first.y + second.y === 0;
}

function hasCollision(head) {
  const hitsWall = head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;
  const hitsSelf = snake.some((segment) => segment.x === head.x && segment.y === head.y);
  return hitsWall || hitsSelf;
}

function createFood() {
  let newFood;

  do {
    newFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y));

  return newFood;
}

function endGame() {
  clearInterval(gameTimer);
  isGameOver = true;
  pauseButton.disabled = true;
  startButton.textContent = "再玩一次";

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("snakeBestScore", bestScore);
    bestScoreElement.textContent = bestScore;
  }

  message.textContent = `游戏结束！得分 ${score}`;
  message.classList.remove("hidden");
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawFood();
  drawSnake();
}

function drawSnake() {
  snake.forEach((segment, index) => {
    const inset = index === 0 ? 2 : 3;
    const gradient = ctx.createLinearGradient(
      segment.x * gridSize,
      segment.y * gridSize,
      (segment.x + 1) * gridSize,
      (segment.y + 1) * gridSize
    );
    gradient.addColorStop(0, index === 0 ? "#eaff6a" : "#6df7a7");
    gradient.addColorStop(1, index === 0 ? "#6df7a7" : "#1edc83");

    ctx.fillStyle = gradient;
    roundRect(
      segment.x * gridSize + inset,
      segment.y * gridSize + inset,
      gridSize - inset * 2,
      gridSize - inset * 2,
      6
    );
  });
}

function drawFood() {
  const centerX = food.x * gridSize + gridSize / 2;
  const centerY = food.y * gridSize + gridSize / 2;
  const pulse = 4 + Math.sin(Date.now() / 130) * 1.5;

  ctx.beginPath();
  ctx.fillStyle = "#ff5c7a";
  ctx.shadowBlur = 18;
  ctx.shadowColor = "#ff5c7a";
  ctx.arc(centerX, centerY, pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}

function hideMessage() {
  message.classList.add("hidden");
}
