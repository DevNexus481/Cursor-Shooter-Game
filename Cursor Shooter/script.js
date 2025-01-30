const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let gameActive = false;
let player = { x: canvas.width / 2, y: canvas.height / 2, radius: 20 };
let enemies = [];
let bullets = [];
let powerUps = [];
let enemySpawnInterval;
let shootingInterval;
let enemySpawnRate = 2000; // Initial spawn rate in milliseconds
let shootingRate = 50; // Adjust this value to increase the fire rate (lower value means higher fire rate)

document.getElementById('start-button').addEventListener('click', startGame);
document.getElementById('pause-button').addEventListener('click', pauseGame);
document.getElementById('restart-button').addEventListener('click', restartGame);

function startGame() {
    if (!gameActive) {
        gameActive = true;
        enemySpawnInterval = setInterval(spawnEnemy, enemySpawnRate);
        shootingInterval = setInterval(() => shootBullet(player.targetX, player.targetY), shootingRate); // Adjust the shooting rate as needed
        updateGame();
    }
}

function pauseGame() {
    gameActive = false;
    clearInterval(enemySpawnInterval);
    clearInterval(shootingInterval);
}

function restartGame() {
    gameActive = false;
    clearInterval(enemySpawnInterval);
    clearInterval(shootingInterval);
    score = 0;
    enemies = [];
    bullets = [];
    powerUps = [];
    enemySpawnRate = 2000; // Reset the spawn rate
    shootingRate = 50; // Reset the shooting rate
    document.getElementById('score').innerText = `Score: ${score}`;
    startGame();
}

function updateGame() {
    if (!gameActive) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    updateBullets();
    updateEnemies();
    updatePowerUps();
    checkCollisions();
    document.getElementById('score').innerText = `Score: ${score}`;

    requestAnimationFrame(updateGame);
}

function drawPlayer() {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.closePath();
}

canvas.addEventListener('mousemove', (event) => {
    player.targetX = event.clientX;
    player.targetY = event.clientY;
});

function shootBullet(targetX, targetY) {
    const angle = Math.atan2(targetY - player.y, targetX - player.x);
    bullets.push({
        x: player.x,
        y: player.y,
        radius: 5,
        dx: Math.cos(angle) * 5,
        dy: Math.sin(angle) * 5
    });
}

function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        } else {
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'red';
            ctx.fill();
            ctx.closePath();
        }
    });
}

function spawnEnemy() {
    const x = Math.random() < 0.5 ? 0 : canvas.width;
    const y = Math.random() * canvas.height;
    enemies.push({
        x,
        y,
        radius: 20,
        speed: 1 + score * 0.1 // Increase enemy speed based on score
    });

    // Increase difficulty by reducing the spawn rate
    if (score % 10 === 0 && enemySpawnRate > 500) { // Decrease spawn rate every 10 points
        enemySpawnRate -= 100;
        clearInterval(enemySpawnInterval);
        enemySpawnInterval = setInterval(spawnEnemy, enemySpawnRate);
    }
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x += Math.cos(angle) * enemy.speed;
        enemy.y += Math.sin(angle) * enemy.speed;
        if (enemy.x < 0 || enemy.x > canvas.width || enemy.y < 0 || enemy.y > canvas.height) {
            enemies.splice(index, 1);
        } else {
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'green';
            ctx.fill();
            ctx.closePath();
        }
    });
}

function updatePowerUps() {
    // Implement power-up logic here
}

function checkCollisions() {
    enemies.forEach((enemy, enemyIndex) => {
        const distToPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (distToPlayer - player.radius - enemy.radius < 1) {
            gameOver();
        }

        bullets.forEach((bullet, bulletIndex) => {
            const distToBullet = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
            if (distToBullet - bullet.radius - enemy.radius < 1) {
                setTimeout(() => {
                    enemies.splice(enemyIndex, 1);
                    bullets.splice(bulletIndex, 1);
                    score++;
                }, 0);
            }
        });
    });
}

function gameOver() {
    gameActive = false;
    clearInterval(enemySpawnInterval);
    clearInterval(shootingInterval);
    alert(`Game Over! Your Score: ${score}`);
}