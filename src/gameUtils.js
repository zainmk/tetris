import { SHAPES, SHAPE_KEYS, BOARD_WIDTH, BOARD_HEIGHT } from './gameConstants';

export function createEmptyBoard() {
  return Array(BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(null));
}

export function getRandomShape() {
  const shape = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
  return { shape, x: 3, y: 0 };
}

export function rotatePiece(piece) {
  const rotated = [];
  const n = piece.length;
  for (let i = 0; i < n; i++) {
    rotated[i] = [];
    for (let j = 0; j < n; j++) {
      rotated[i][j] = piece[n - 1 - j][i];
    }
  }
  return rotated;
}

export function isColliding(board, shape, shapeData, x, y) {
  for (let row = 0; row < shapeData.length; row++) {
    for (let col = 0; col < shapeData[row].length; col++) {
      if (shapeData[row][col] === 1) {
        const boardY = y + row;
        const boardX = x + col;

        // Check boundaries
        if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
          return true;
        }

        // Check collision with existing blocks
        if (boardY >= 0 && board[boardY][boardX] !== null) {
          return true;
        }
      }
    }
  }
  return false;
}

export function placePiece(board, shape, shapeData, x, y) {
  const newBoard = board.map((row) => [...row]);

  for (let row = 0; row < shapeData.length; row++) {
    for (let col = 0; col < shapeData[row].length; col++) {
      if (shapeData[row][col] === 1) {
        const boardY = y + row;
        const boardX = x + col;

        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = shape;
        }
      }
    }
  }

  return newBoard;
}

export function clearLines(board) {
  let clearedBoard = board.filter((row) => row.some((cell) => cell === null));
  const clearedLines = BOARD_HEIGHT - clearedBoard.length;

  // Add empty rows at the top
  for (let i = 0; i < clearedLines; i++) {
    clearedBoard.unshift(Array(BOARD_WIDTH).fill(null));
  }

  return { board: clearedBoard, clearedLines };
}

export function calculateScore(lines) {
  const scores = [0, 100, 300, 500, 800];
  return scores[Math.min(lines, 4)];
}
