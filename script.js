const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('statusDisplay');
const resetBtn = document.getElementById('resetBtn');
const modeAiBtn = document.getElementById('modeAiBtn');
const modePvpBtn = document.getElementById('modePvpBtn');

let isVsAI = true;
let gameActive = true;
let currentPlayer = 'X';
let gameState = ['', '', '', '', '', '', '', '', ''];

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Initialize Game
function initGame() {
    cells.forEach(cell => {
        cell.addEventListener('click', handleClick);
    });
    resetBtn.addEventListener('click', resetGame);
    modeAiBtn.addEventListener('click', () => setMode(true));
    modePvpBtn.addEventListener('click', () => setMode(false));
    createParticles();
}

function setMode(vsAI) {
    isVsAI = vsAI;
    if (isVsAI) {
        modeAiBtn.classList.add('active');
        modePvpBtn.classList.remove('active');
    } else {
        modePvpBtn.classList.add('active');
        modeAiBtn.classList.remove('active');
    }
    resetGame();
}

function handleClick(e) {
    const cell = e.target;
    const cellIndex = parseInt(cell.getAttribute('data-index'));

    if (gameState[cellIndex] !== '' || !gameActive || (isVsAI && currentPlayer === 'O')) {
        return;
    }

    handleCellPlayed(cell, cellIndex);
    checkWinOrDraw();
}

function handleCellPlayed(cell, index) {
    gameState[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    const neonClass = currentPlayer === 'X' ? 'neon-x' : 'neon-o';
    
    statusDisplay.innerHTML = `Player <span class="${neonClass}">${currentPlayer}</span>'s turn`;
    
    // Trigger animation
    statusDisplay.classList.remove('animate');
    void statusDisplay.offsetWidth; // Trigger reflow
    statusDisplay.classList.add('animate');

    // Make AI move
    if (gameActive && isVsAI && currentPlayer === 'O') {
        setTimeout(makeAIMove, 500); // Small delay for UX
    }
}

function makeAIMove() {
    let bestScore = -Infinity;
    let move;
    
    // Try all available spots
    for (let i = 0; i < 9; i++) {
        if (gameState[i] === '') {
            gameState[i] = 'O';
            let score = minimax(gameState, 0, false);
            gameState[i] = ''; // undo move
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    
    if (move !== undefined) {
        const cell = cells[move];
        handleCellPlayed(cell, move);
        checkWinOrDraw();
    }
}

function minimax(state, depth, isMaximizing) {
    let result = checkWinForMinimax();
    if (result !== null) {
        if (result === 'O') return 10 - depth;
        if (result === 'X') return depth - 10;
        if (result === 'tie') return 0;
    }
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (state[i] === '') {
                state[i] = 'O';
                let score = minimax(state, depth + 1, false);
                state[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (state[i] === '') {
                state[i] = 'X';
                let score = minimax(state, depth + 1, true);
                state[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinForMinimax() {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            return gameState[a];
        }
    }
    if (!gameState.includes('')) {
        return 'tie';
    }
    return null;
}

function checkWinOrDraw() {
    let roundWon = false;
    let winningCombination = [];

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            roundWon = true;
            winningCombination = [a, b, c];
            break;
        }
    }

    if (roundWon) {
        gameActive = false;
        highlightWinningCells(winningCombination);
        setTimeout(() => {
            const neonClass = currentPlayer === 'X' ? 'neon-x' : 'neon-o';
            statusDisplay.innerHTML = `Player <span class="${neonClass}">${currentPlayer}</span> Wins! 🎉`;
            statusDisplay.classList.remove('animate');
            void statusDisplay.offsetWidth;
            statusDisplay.classList.add('animate');
        }, 300); // small delay for UX feel
        return;
    }

    const roundDraw = !gameState.includes('');
    if (roundDraw) {
        gameActive = false;
        setTimeout(() => {
            statusDisplay.innerHTML = `Draw Match 🤝`;
            statusDisplay.classList.remove('animate');
            void statusDisplay.offsetWidth;
            statusDisplay.classList.add('animate');
        }, 300);
        return;
    }

    switchPlayer();
}

function highlightWinningCells(winningCombination) {
    winningCombination.forEach(index => {
        cells[index].classList.add('winner');
    });
}

function resetGame() {
    gameActive = true;
    currentPlayer = 'X';
    gameState = ['', '', '', '', '', '', '', '', ''];
    
    statusDisplay.innerHTML = `Player <span class="neon-x">X</span>'s turn`;
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winner');
    });
}

// Bonus: Particle Animation
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Randomize size, position, and animation duration
        const size = Math.random() * 8 + 2;
        const posX = Math.random() * 100;
        const duration = Math.random() * 10 + 5;
        const delay = Math.random() * 5;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}vw`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        
        particlesContainer.appendChild(particle);
    }
}

// Start Game
initGame();
