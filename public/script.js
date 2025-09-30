const socket = io(); // auto connects to same domain

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = false;
let onlineRoom = null;

const boardElement = document.getElementById("board");
const status = document.getElementById("status");

// Create cells
function initBoard() {
  boardElement.innerHTML = "";
  board.forEach((_, i) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.addEventListener("click", () => handleCellClick(i));
    boardElement.appendChild(cell);
  });
}
initBoard();

// Offline play
function startOffline() {
  resetGame();
  gameActive = true;
  onlineRoom = null;
  status.textContent = "Playing offline!";
}

// Handle moves
function handleCellClick(index) {
  if (!gameActive || board[index] !== "") return;

  board[index] = currentPlayer;
  document.getElementsByClassName("cell")[index].textContent = currentPlayer;

  if (onlineRoom) {
    socket.emit("move", { room: onlineRoom, index, symbol: currentPlayer });
  }

  checkWinner();

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  status.textContent = `Player ${currentPlayer}'s turn`;
}

// Check winner
function checkWinner() {
  const winCombos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  for (let combo of winCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      document.getElementsByClassName("cell")[a].classList.add("winner");
      document.getElementsByClassName("cell")[b].classList.add("winner");
      document.getElementsByClassName("cell")[c].classList.add("winner");
      status.textContent = `Player ${board[a]} wins! 🎉`;
      gameActive = false;
      return;
    }
  }

  if (!board.includes("")) {
    status.textContent = "It's a draw!";
    gameActive = false;
  }
}

// Reset game
function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  status.textContent = "Game reset!";
  initBoard();
}

// Online play
function createRoom() {
  const code = document.getElementById("roomCode").value.trim();
  socket.emit("createRoom", code);
}

function joinRoom() {
  const code = document.getElementById("roomCode").value.trim();
  socket.emit("joinRoom", code);
}

// Socket events
socket.on("roomCreated", (room) => {
  onlineRoom = room;
  status.textContent = `Room ${room} created. Waiting for opponent...`;
});

socket.on("startGame", (room) => {
  onlineRoom = room;
  gameActive = true;
  status.textContent = `Room ${room} started! Player X begins.`;
});

socket.on("move", ({ index, symbol }) => {
  board[index] = symbol;
  document.getElementsByClassName("cell")[index].textContent = symbol;
  checkWinner();
  currentPlayer = symbol === "X" ? "O" : "X";
});

socket.on("errorMsg", (msg) => {
  alert(msg);
});
