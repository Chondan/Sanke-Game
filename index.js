(() => {
    function setupBoardGame() {
        const canvas = document.getElementById("game-board");
        canvas.height = 400;
        canvas.width = 400;
        // set board game to the center of the screen
        // canvas.style.position = "absolute";
        // canvas.style.left = "50%";
        // canvas.style.transform = "translate(-50%, 0)";
        const canvasContext = canvas.getContext('2d');
        canvasContext.strokeStyle = `rgba(255, 255, 255, 0.5)`;

        const { linex, liney, boardSize } = createBoardSize(25);
        const gap = canvas.width / boardSize;
        // draw vertical line
        liney.forEach((line, index) => {
            canvasContext.moveTo(gap * (index + 1), 0);
            canvasContext.lineTo(gap * (index + 1), canvas.height);
            canvasContext.stroke();
        });
        // draw horizontal line 
        linex.forEach((line, index) => {
            canvasContext.moveTo(0, gap * (index + 1));
            canvasContext.lineTo(canvas.width, gap * (index + 1));
            canvasContext.stroke();
        });
        return { canvas, canvasContext, gap, boardSize };
    }
    function createBoardSize(size) {
        return {
            linex: [...Array(size - 1)],
            liney: [...Array(size - 1)],
            boardSize: size
        }
    }
    function createSnake(gap) {
        return {
            speedX: gap, 
            speedY: gap,
            tail: [ { posX: gap * 2, posY: gap * 2 } ]
        }
    }
    function drawSnake(canvasContext, tail, gap) {
        canvasContext.fillStyle = "blue";
        tail.forEach((body, index) => {
            if (index != 0) {
                canvasContext.fillStyle = "red";
            }
            canvasContext.fillRect(body.posX, body.posY, gap, gap);
        });
    }
    function moveSnake(canvas, tail, directionX, directionY) {
        // copy temporaly array (deep copy)
        const temp = Array(tail.length);
        for (let i = 0; i < tail.length; i++) {
            temp[i] = Object.assign({}, tail[i]);
        }
        
        // update position of the body
        tail.forEach((body, index) => {
            if (index == 0) {
                body.posX += directionX;
                body.posY += directionY;
                if (body.posX > canvas.width) {
                    body.posX = 0;
                } else if (body.posX < 0) {
                    body.posX = canvas.width;
                }
                if (body.posY > canvas.height) {
                    body.posY = 0;
                } else if (body.posY < 0) {
                    body.posY = canvas.height;
                }
            } else {
                body.posX = temp[index - 1].posX;
                body.posY = temp[index - 1].posY;
            }
        });
    }
    function random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function randomFood(boardSize) {
        const foodPositionX = random(0, boardSize - 1);
        const foodPositionY = random(0, boardSize - 1);
        return { foodPositionX, foodPositionY };
    }
    function App() {
        const { canvas, canvasContext, gap, boardSize } = setupBoardGame();
        const { tail } = createSnake(gap);
        let { foodPositionX, foodPositionY } = randomFood(boardSize);
        moveX = gap; moveY = 0;

        drawSnake(canvasContext, tail, gap);
        const run = setInterval(() => {
                setupBoardGame();
                moveSnake(canvas, tail, moveX, moveY);
                // eat food then extend the tail
                if ((tail[0].posX == foodPositionX * gap) && (tail[0].posY == foodPositionY * gap)) {
                    tail.push({ posX: tail[tail.length - 1].posX , posY: tail[tail.length - 1]});
                    foodPositionX = randomFood(boardSize).foodPositionX;
                    foodPositionY = randomFood(boardSize).foodPositionY;
                }
                // check wheter snake eat it own body
                tail.forEach((body, index) => {
                    if (index != 0) {
                        if (tail[0].posX + moveX == body.posX && tail[0].posY + moveY == body.posY) {
                            console.log("Game Over");
                            clearInterval(run);
                        }
                    }
                })
                // draw snake
                drawSnake(canvasContext, tail, gap);

                // draw food
                canvasContext.fillStyle = "yellow";
                canvasContext.fillRect(foodPositionX * gap, foodPositionY * gap, gap, gap);
        }, 100);

        // control snake
        document.addEventListener('keydown', event => {
            if (event.key == "ArrowDown") {
                if (moveX != 0) {
                    moveX = 0;
                    moveY = gap;
                }
            } else if (event.key == "ArrowRight") {
                if (moveY != 0) {
                    moveX = gap;
                    moveY = 0;
                }
            } else if (event.key == "ArrowUp") {
                if (moveX != 0) {
                    moveX = 0;
                    moveY = -gap;
                }
            } else if (event.key == "ArrowLeft") {
                if (moveY != 0) {
                    moveX = -gap;
                    moveY = 0;
                }
            }
        });

        // control by touch control
        const touchBox = document.getElementById("touch-control");
        let touchArr = [];
        touchBox.addEventListener('touchstart', (e) => {
            touchArr = [];
        });
        touchBox.addEventListener('touchmove', (e) => {
            e.preventDefault();
            touchArr.push(e.targetTouches);
            
        });
        touchBox.addEventListener('touchend', (e) => {
            if (touchArr < 5) {
                return;
            }
            const x2 = touchArr[touchArr.length - 1][0].clientX;
            const x1 = touchArr[touchArr.length - 4][0].clientX;
            const y2 = touchArr[touchArr.length - 1][0].clientY;
            const y1 = touchArr[touchArr.length - 4][0].clientY;

            let direction = "";
            if (moveX == 0) {
                if (x2 - x1 > y2 - y1 && x2 - x1 > y1 - y2) {
                    // move right
                    direction = "right";
                } 
                if (x1 - x2 > y2 - y1 && x1 - x2 > y1 - y2) {
                    // move left
                    direction = "left";
                } 
            }
            if (moveY == 0) {
                if (y1 - y2 > x1 - x2 && y1 - y2 > x2 - x1) {
                    // move up
                    direction = "up";
                }
                if (y2 - y1 > x1 - x2 && y2 - y1 > x2 - x1) {
                    // move down
                    direction = "down";
                }
            }
            console.log(direction);
            
            switch(direction) {
                case "down": 
                    if (moveX != 0) {
                        moveX = 0;
                        moveY = gap;
                    }
                    break;
                case "up":
                    if (moveX != 0) {
                        moveX = 0;
                        moveY = -gap;
                    }
                    break;
                case "right": 
                    if (moveY != 0) {
                        moveX = gap;
                        moveY = 0;
                    }
                    break;
                case "left":
                    if (moveY != 0) {
                        moveX = -gap;
                        moveY = 0;
                    }
                    break;
            }
        });

    }
    App();
})();
