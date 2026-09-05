const sudokuGrid = document.getElementById("sudoku-grid");
const difficultySelect = document.getElementById("difficulty");
const newGameButton = document.getElementById("new-game");
const checkButton = document.getElementById("check-puzzle");
const hintButton = document.getElementById("hint-button");
const timerDisplay = document.getElementById("timer-display");
const messageBox = document.getElementById("message");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const scoreBody = document.getElementById("score-body");

let board = [];
let solution = [];
let fixedCells = new Set();
let lockedHintCells = new Set();
let timer = 0;
let timerInterval = null;
let currentDifficulty = "medium";
let hintsUsed = 0;

function formatTime(seconds) {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secondsLeft = String(seconds % 60).padStart(2, "0");
    return `${minutes}:${secondsLeft}`;
}

function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(timer);
}

function serializeBoard() {
    return board.map((row) => row.join("")).join(";");
}

function loadScores() {
    const raw = localStorage.getItem("sudoku-top-scores");
    return raw ? JSON.parse(raw) : [];
}

function saveScores(scores) {
    localStorage.setItem("sudoku-top-scores", JSON.stringify(scores));
}

function renderScores() {
    const scores = loadScores();
    scoreBody.innerHTML = "";
    if (!scores.length) {
        scoreBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-row">No saved scores yet.</td>
            </tr>
        `;
        return;
    }

    scores.slice(0, 10).forEach((record, index) => {
        scoreBody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${record.name}</td>
                <td>${record.time}</td>
                <td>${record.difficulty}</td>
                <td>${record.hints}</td>
            </tr>
        `;
    });
}

async function fetchPuzzle(difficulty) {
    const response = await fetch(`/puzzle?difficulty=${difficulty}`);
    return response.json();
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function startTimer() {
    stopTimer();
    timer = 0;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timer += 1;
        updateTimerDisplay();
    }, 1000);
}

function createCell(row, col, value, isPrefilled, blockIndex) {
    const cell = document.createElement("div");
    cell.className = `sudoku-cell ${isPrefilled ? "prefilled locked" : ""}`.trim();
    cell.dataset.row = row;
    cell.dataset.col = col;
    cell.dataset.block = blockIndex;

    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "numeric";
    input.maxLength = 1;
    input.value = value ? value : "";
    input.autocomplete = "off";

    if (isPrefilled) {
        input.readOnly = true;
        input.tabIndex = -1;
    }

    input.addEventListener("input", (event) => {
        const newValue = event.target.value.replace(/[^1-9]/g, "");
        event.target.value = newValue;
        board[row][col] = newValue ? Number(newValue) : 0;
        event.target.value = newValue;
        validateCell(row, col);

        if (board.every((r) => r.every((v) => v !== 0))) {
            checkPuzzle(true);
        }
    });

    cell.appendChild(input);
    sudokuGrid.appendChild(cell);
}

function renderBoard() {
    sudokuGrid.innerHTML = "";
    for (let row = 0; row < 9; row += 1) {
        for (let col = 0; col < 9; col += 1) {
            const blockIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);
            const value = board[row][col];
            const isPrefilled = fixedCells.has(`${row}-${col}`);
            createCell(row, col, value, isPrefilled, blockIndex);
        }
    }
}

function resetHighlights() {
    document.querySelectorAll(".sudoku-cell").forEach((cell) => {
        cell.classList.remove("invalid", "incorrect");
    });
}

function validateCell(row, col) {
    const value = board[row][col];
    const cell = document.querySelector(`.sudoku-cell[data-row='${row}'][data-col='${col}']`);
    if (!cell) return;

    cell.classList.remove("invalid");
    if (!value) {
        return;
    }

    const isRowConflict = board[row].filter((v) => v === value).length > 1;
    const isColConflict = board.map((r) => r[col]).filter((v) => v === value).length > 1;
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    let isBoxConflict = false;

    for (let r = startRow; r < startRow + 3; r += 1) {
        for (let c = startCol; c < startCol + 3; c += 1) {
            if (r === row && c === col) continue;
            if (board[r][c] === value) {
                isBoxConflict = true;
            }
        }
    }

    if (isRowConflict || isColConflict || isBoxConflict) {
        cell.classList.add("invalid");
    }
}

function highlightMismatch(cell, expectedValue) {
    cell.classList.add("incorrect");
    const input = cell.querySelector("input");
    if (input) {
        input.value = expectedValue;
    }
}

function showMessage(text, type = "info") {
    messageBox.textContent = text;
    messageBox.style.color = type === "success" ? "var(--success)" : type === "danger" ? "var(--danger)" : "var(--text)";
}

function getCellInput(row, col) {
    const cell = document.querySelector(`.sudoku-cell[data-row='${row}'][data-col='${col}']`);
    return cell ? cell.querySelector("input") : null;
}

function checkPuzzle(finalCheck = false) {
    resetHighlights();
    let hasError = false;
    let incomplete = false;

    for (let row = 0; row < 9; row += 1) {
        for (let col = 0; col < 9; col += 1) {
            const value = board[row][col];
            if (!value) {
                incomplete = true;
                continue;
            }
            const expected = solution[row][col];
            const cell = document.querySelector(`.sudoku-cell[data-row='${row}'][data-col='${col}']`);
            if (!cell) continue;
            if (value !== expected) {
                hasError = true;
                if (finalCheck) {
                    highlightMismatch(cell, expected);
                } else {
                    cell.classList.add("invalid");
                }
            }
        }
    }

    if (finalCheck && !hasError && !incomplete) {
        stopTimer();
        showMessage(`Congratulations! You solved the puzzle in ${formatTime(timer)}.`, "success");
        promptHighScore();
        return;
    }

    if (hasError) {
        showMessage("Some numbers are incorrect. Keep trying.", "danger");
    } else if (!incomplete) {
        showMessage("All cells are filled. Click Check to verify.");
    } else {
        showMessage("Keep going. You can use Hint if you get stuck.");
    }
}

function findHintCell() {
    const emptyCells = [];
    for (let row = 0; row < 9; row += 1) {
        for (let col = 0; col < 9; col += 1) {
            if (board[row][col] === 0) {
                emptyCells.push({ row, col });
            }
        }
    }
    if (!emptyCells.length) {
        return null;
    }
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function applyHint() {
    const target = findHintCell();
    if (!target) {
        showMessage("No empty cells remain.", "info");
        return;
    }

    const { row, col } = target;
    const cell = getCellInput(row, col);
    if (!cell) return;

    board[row][col] = solution[row][col];
    cell.value = solution[row][col];
    cell.readOnly = true;
    const wrapper = cell.parentElement;
    if (wrapper) {
        wrapper.classList.add("locked");
    }
    hintsUsed += 1;
    showMessage("Hint added. Keep going!", "success");
    if (wrapper) {
        wrapper.classList.add("prefilled");
    }
}

function promptHighScore() {
    const name = window.prompt("You made the top 10! Enter your name:", "Player") || "Player";
    const record = {
        name,
        time: formatTime(timer),
        difficulty: currentDifficulty,
        hints: hintsUsed,
    };
    const scores = loadScores();
    scores.push(record);
    scores.sort((a, b) => {
        const [aMin, aSec] = a.time.split(":").map(Number);
        const [bMin, bSec] = b.time.split(":").map(Number);
        return aMin * 60 + aSec - (bMin * 60 + bSec);
    });
    saveScores(scores.slice(0, 10));
    renderScores();
}

async function startNewGame() {
    currentDifficulty = difficultySelect.value;
    hintsUsed = 0;
    showMessage("Generating a fresh puzzle...", "info");
    const result = await fetchPuzzle(currentDifficulty);
    board = result.puzzle.map((row) => row.slice());
    solution = result.solution.map((row) => row.slice());
    fixedCells.clear();
    lockedHintCells.clear();

    board.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
            if (value !== 0) {
                fixedCells.add(`${rowIndex}-${colIndex}`);
            }
        });
    });

    renderBoard();
    startTimer();
    showMessage("Good luck! Use Check to verify or Hint for help.");
}

function toggleDarkMode() {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    darkModeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
    darkModeToggle.setAttribute("aria-pressed", String(isDark));
}

newGameButton.addEventListener("click", () => {
    startNewGame();
});
checkButton.addEventListener("click", () => {
    checkPuzzle(true);
});
hintButton.addEventListener("click", () => {
    applyHint();
});
darkModeToggle.addEventListener("click", () => {
    toggleDarkMode();
});

window.addEventListener("DOMContentLoaded", async () => {
    renderScores();
    await startNewGame();
});