import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

interface Ball {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
}

@Component({
  selector: 'app-pong-game',
  templateUrl: './pong-game.component.html',
  styleUrls: ['./pong-game.component.css']
})
export class PongGameComponent implements AfterViewInit {
  @ViewChild('gameCanvas') gameCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  private playerPaddle: Paddle = { x: 20, y: 250, width: 10, height: 100, speed: 5 };
  private computerPaddle: Paddle = { x: 770, y: 250, width: 10, height: 100, speed: 3 };
  private ball: Ball = { x: 400, y: 300, size: 10, speedX: 5, speedY: 3 };

  private upPressed = false;
  private downPressed = false;

  public playerScore: number = 0;
  public computerScore: number = 0;

  private speedIncrement: number = 0.05; 

  ngAfterViewInit(): void {
    this.ctx = this.gameCanvas.nativeElement.getContext('2d')!;
    this.startGame();
  }

  startGame(): void {
    document.addEventListener('keydown', this.keyDownHandler.bind(this));
    document.addEventListener('keyup', this.keyUpHandler.bind(this));
    this.update();
  }

  keyDownHandler(e: KeyboardEvent): void {
    if (e.key === 'ArrowUp') {
      this.upPressed = true;
    } else if (e.key === 'ArrowDown') {
      this.downPressed = true;
    }
  }

  keyUpHandler(e: KeyboardEvent): void {
    if (e.key === 'ArrowUp') {
      this.upPressed = false;
    } else if (e.key === 'ArrowDown') {
      this.downPressed = false;
    }
  }

  update(): void {
    this.movePlayerPaddle();
    this.moveComputerPaddle();
    this.moveBall();
    this.checkCollisions();
    this.draw();
    requestAnimationFrame(this.update.bind(this));
  }

  movePlayerPaddle(): void {
    if (this.upPressed && this.playerPaddle.y > 0) {
      this.playerPaddle.y -= this.playerPaddle.speed;
    }
    if (this.downPressed && this.playerPaddle.y < this.gameCanvas.nativeElement.height - this.playerPaddle.height) {
      this.playerPaddle.y += this.playerPaddle.speed;
    }
  }

  moveComputerPaddle(): void {
    if (this.ball.y > this.computerPaddle.y + this.computerPaddle.height / 2) {
      this.computerPaddle.y += this.computerPaddle.speed;
    } else {
      this.computerPaddle.y -= this.computerPaddle.speed;
    }

    //bind to the bounds of the component window...  
    if (this.computerPaddle.y < 0) {
      this.computerPaddle.y = 0;
    } else if (this.computerPaddle.y > this.gameCanvas.nativeElement.height - this.computerPaddle.height) {
      this.computerPaddle.y = this.gameCanvas.nativeElement.height - this.computerPaddle.height;
    }
  }

  moveBall(): void {
    this.ball.x += this.ball.speedX;
    this.ball.y += this.ball.speedY;

    //get collision from walls, should be reorganized into check collisions frankly... 
    if (this.ball.y <= 0 || this.ball.y >= this.gameCanvas.nativeElement.height - this.ball.size) {
      this.ball.speedY = -this.ball.speedY;
    }
  }

  checkCollisions(): void {
    const buffer = 5; //had issues with collisions, didn't want to push the paddles further in 

    //collisions from paddles... add some speed on to increase difficulty...
    if (this.ball.x - this.ball.size <= this.playerPaddle.x + this.playerPaddle.width + buffer &&
      this.ball.y + this.ball.size >= this.playerPaddle.y &&
      this.ball.y - this.ball.size <= this.playerPaddle.y + this.playerPaddle.height) {
      this.ball.x = this.playerPaddle.x + this.playerPaddle.width + this.ball.size; //bounce it back out... 
      this.ball.speedX = -this.ball.speedX;
      this.increaseSpeed();
    }

    if (this.ball.x + this.ball.size >= this.computerPaddle.x - buffer &&
      this.ball.y + this.ball.size >= this.computerPaddle.y &&
      this.ball.y - this.ball.size <= this.computerPaddle.y + this.computerPaddle.height) {
      this.ball.x = this.computerPaddle.x - this.ball.size; //bounce it back out... 
      this.ball.speedX = -this.ball.speedX;
      this.increaseSpeed();
    }

    // get score based off of where it went out of bounds...  
    if (this.ball.x < 0) {
      this.computerScore++;
      this.resetBall();
    } else if (this.ball.x > this.gameCanvas.nativeElement.width) {
      this.playerScore++;
      this.resetBall();
      //I will figure out how to make a generalizable "collision" tag system... 
    }
  }


  resetBall(): void {
    this.ball.x = 400;
    this.ball.y = 300;
    this.ball.speedX = 5;
    this.ball.speedY = 3;
  }

  increaseSpeed(): void {
    this.ball.speedX += this.speedIncrement * (this.ball.speedX > 0 ? 1 : -1);
    this.ball.speedY += this.speedIncrement * (this.ball.speedY > 0 ? 1 : -1);
  }

  draw(): void {
    this.ctx.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);

    //make paddles... 
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(this.playerPaddle.x, this.playerPaddle.y, this.playerPaddle.width, this.playerPaddle.height);
    this.ctx.fillRect(this.computerPaddle.x, this.computerPaddle.y, this.computerPaddle.width, this.computerPaddle.height);

    //make ball... 
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.size, 0, Math.PI * 2);
    this.ctx.fill();

    //scoreboard... 
    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = 'black';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Player: ${this.playerScore}`, this.gameCanvas.nativeElement.width / 4, 30);
    this.ctx.fillText(`Computer: ${this.computerScore}`, 3 * this.gameCanvas.nativeElement.width / 4, 30);
  }
}


