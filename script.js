const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const CANVAS_HEIGHT = canvas.height;
const CANVAS_WIDTH = canvas.width;

const BOARD_Y = 50;
const BOARD_P1_X = 300;
const BOARD_P2_X = 500;

const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 100;
const PADDLE_P1_X = 10;
const PADDLE_P2_X = 770;
const PADDLE_START_Y = (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2;

const BALL_R = 15;
const BALL_START_X = CANVAS_WIDTH / 2;
const BALL_START_Y = CANVAS_HEIGHT / 2;
const BALL_START_DX = 4.5;
const BALL_START_DY = 1.5;

const STATE_CHANGE_INTERVAL = 10;

const PADDLE_STEP = 3;

const P1_UP_BUTTON = "KeyQ";
const P1_DOWN_BUTTON = "KeyA";
const P2_UP_BUTTON = "KeyP";
const P2_DOWN_BUTTON = "KeyL";
const PAUSE_BUTTON = "KeyB";

const UP_ACTION = "up";
const DOWN_ACTION = "down";
const STOP_ACTION = "stop";

let p1Action = STOP_ACTION;
let p2Action = STOP_ACTION;
let paused = false;

ctx.font = "30px Arial";

function drawPaddle(x, y) {
	ctx.fillRect(x, y, PADDLE_WIDTH, PADDLE_HEIGHT);
}

function drawPoints(text, x) {
	ctx.fillText(text, x, BOARD_Y);
}

function drawCircle(x, y, r) {
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.fill();
}

function drawBall(x, y) {
	drawCircle(x, y, BALL_R);
}

function clearCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

let ballX = BALL_START_X;
let ballY = BALL_START_Y;
let ballDX = BALL_START_DX;
let ballDY = BALL_START_DY;
let p1PaddleY = PADDLE_START_Y;
let p2PaddleY = PADDLE_START_Y;
let p1Points = 0;
let p2Points = 0;

function drawState() {
	clearCanvas();
	drawPoints(p1Points.toString(), BOARD_P1_X);
	drawPoints(p2Points.toString(), BOARD_P2_X);
	drawBall(ballX, ballY);
	drawPaddle(PADDLE_P1_X, p1PaddleY);
	drawPaddle(PADDLE_P2_X, p2PaddleY);
}

function updateState() {
	ballX += ballDX;
	ballY = ballDY;

	p1PaddleY++;
	p2PaddleY--;
	p1Points++;
	p2Points += 3;
}

function updateAndDrewState() {
	if (paused) return;
	updateState();
	drawState();
}

setInterval(updateAndDrewState, STATE_CHANGE_INTERVAL);

window.addEventListener("keydown", function (event) {
	const code = event.code;
	if (code === P1_UP_BUTTON) {
		p1Action = UP_ACTION;
	} else if (code === P1_DOWN_BUTTON) {
		p1Action = DOWN_ACTION;
	} else if (code === P2_UP_BUTTON) {
		p2Action = UP_ACTION;
	} else if (code === P2_DOWN_BUTTON) {
		p2Action = DOWN_ACTION;
	}
	if (code === PAUSE_BUTTON) {
		paused = !paused;
	}
});

window.addEventListener("keyup", function (event) {
	let code = event.code;
	if (
		(code === P1_UP_BUTTON && p1Action === UP_ACTION) ||
		(code === P1_DOWN_BUTTON && p1Action === DOWN_ACTION)
	) {
		p1Action = STOP_ACTION;
	} else if (
		(code === P2_UP_BUTTON && p2Action === UP_ACTION) ||
		(code === P2_DOWN_BUTTON && p2Action === DOWN_ACTION)
	) {
		p2Action = STOP_ACTION;
	}
});

function coerceIn(value, min, max) {
	return Math.max(Math.min(value, max), min);
}

function coercePaddle(paddleY) {
	const minPaddleY = 0;
	const maxPaddleY = CANVAS_HEIGHT - PADDLE_HEIGHT;
	return coerceIn(paddleY, minPaddleY, maxPaddleY);
}

function movePaddles() {
	if (p1Action === UP_ACTION) {
		p1PaddleY = coercePaddle(p1PaddleY - PADDLE_STEP);
	} else if (p1Action === DOWN_ACTION) {
		p1PaddleY = coercePaddle(p1PaddleY + PADDLE_STEP);
	}
	if (p2Action === UP_ACTION) {
		p2PaddleY = coercePaddle(p2PaddleY - PADDLE_STEP);
	} else if (p2Action === DOWN_ACTION) {
		p2PaddleY = coercePaddle(p2PaddleY + PADDLE_STEP);
	}
}

function updateState() {
	moveBall();
	movePaddles();
}

function moveBallByStep() {
	ballX += ballDX;
	ballY += ballDY;
}

function moveBallToStart() {
	ballX = BALL_START_X;
	ballY = BALL_START_Y;
}

function ballIsOutsideOnLeft() {
	return ballX <= 0;
}

function ballIsOutsideOnRight() {
	return ballX >= CANVAS_WIDTH;
}

function bounceBallFromWall() {
	ballDY = -ballDY;
}

function bounceBallFromPaddle() {
	ballDX = -ballDX;
}

function shouldBounceFromTop() {
	return ballY < BALL_R && ballDY < 0;
}

function shouldBounceFromBottom() {
	return ballY + BALL_R >= CANVAS_HEIGHT && ballDY > 0;
}

function isInBetween(value, min, max) {
	return value >= min && value <= max;
}

function isBallSameHeightPaddle(paddleY) {
	return isInBetween(ballY, paddleY, paddleY + PADDLE_HEIGHT);
}

function shouldBounceFromLPaddle() {
	return (
		ballDX < 0 &&
		isInBetween(ballX - BALL_R, PADDLE_P1_X, PADDLE_P1_X + PADDLE_WIDTH) &&
		isBallSameHeightPaddle(p1PaddleY)
	);
}

function shouldBounceFromRPaddle() {
	return (
		ballDX > 0 &&
		isInBetween(ballX + BALL_R, PADDLE_P2_X, PADDLE_P2_X + PADDLE_WIDTH) &&
		isBallSameHeightPaddle(p2PaddleY)
	);
}

function moveBall() {
	if (shouldBounceFromBottom() || shouldBounceFromTop()) {
		bounceBallFromWall();
	}

	if (shouldBounceFromLPaddle() || shouldBounceFromRPaddle()) {
		bounceBallFromPaddle();
	}

	if (ballIsOutsideOnLeft()) {
		moveBallToStart();
		p2Points++;
	} else if (ballIsOutsideOnRight()) {
		moveBallToStart();
		p1Points++;
	}

	moveBallByStep();
}
