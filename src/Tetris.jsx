import { useState, useEffect, useRef } from 'react';
import { Card } from 'pixel-retroui';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  BLOCK_SIZE,
  SHAPES,
  COLORS,
} from './gameConstants';
import {
  createEmptyBoard,
  getRandomShape,
  rotatePiece,
  isColliding,
  placePiece,
  clearLines,
  calculateScore,
} from './gameUtils';
import './Tetris.css';

export default function Tetris() {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(getRandomShape());
  const [nextPiece, setNextPiece] = useState(getRandomShape());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef(null);
  const dropSpeedRef = useRef(500);

  const shapeData = SHAPES[currentPiece.shape];

  // Check if game is over
  useEffect(() => {
    if (gameOver) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }
  }, [gameOver]);

  // Main game loop
  useEffect(() => {
    if (gameOver || isPaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      return;
    }

    gameLoopRef.current = setInterval(() => {
      setBoard((prevBoard) => {
        const newY = currentPiece.y + 1;

        // Check if can move down
        if (!isColliding(prevBoard, currentPiece.shape, shapeData, currentPiece.x, newY)) {
          setCurrentPiece((prev) => ({ ...prev, y: newY }));
          return prevBoard;
        }

        // Place piece
        let newBoard = placePiece(prevBoard, currentPiece.shape, shapeData, currentPiece.x, currentPiece.y);

        // Clear lines
        const { board: clearedBoard, clearedLines } = clearLines(newBoard);
        newBoard = clearedBoard;

        if (clearedLines > 0) {
          setScore((prev) => prev + calculateScore(clearedLines));
        }

        // Spawn next piece
        const newPiece = nextPiece;
        setNextPiece(getRandomShape());

        // Check game over
        if (isColliding(newBoard, newPiece.shape, SHAPES[newPiece.shape], newPiece.x, newPiece.y)) {
          setGameOver(true);
          return newBoard;
        }

        setCurrentPiece(newPiece);
        return newBoard;
      });
    }, dropSpeedRef.current);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [currentPiece.y, currentPiece.shape, currentPiece.x, shapeData, nextPiece, gameOver, isPaused]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver || isPaused) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentPiece((prev) => {
          if (!isColliding(board, prev.shape, shapeData, prev.x - 1, prev.y)) {
            return { ...prev, x: prev.x - 1 };
          }
          return prev;
        });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentPiece((prev) => {
          if (!isColliding(board, prev.shape, shapeData, prev.x + 1, prev.y)) {
            return { ...prev, x: prev.x + 1 };
          }
          return prev;
        });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        dropSpeedRef.current = 100;
      } else if (e.key === ' ') {
        e.preventDefault();
        setCurrentPiece((prev) => {
          const rotated = rotatePiece(shapeData);
          if (!isColliding(board, prev.shape, rotated, prev.x, prev.y)) {
            return prev;
          }
          return prev;
        });
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowDown') {
        dropSpeedRef.current = 500;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [board, shapeData, gameOver, isPaused]);

  const handleRotate = () => {
    if (gameOver || isPaused) return;
    
    setCurrentPiece((prev) => {
      const rotated = rotatePiece(shapeData);
      if (!isColliding(board, prev.shape, rotated, prev.x, prev.y)) {
        return prev;
      }
      return prev;
    });
  };

  const handleReset = () => {
    setBoard(createEmptyBoard());
    setCurrentPiece(getRandomShape());
    setNextPiece(getRandomShape());
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    dropSpeedRef.current = 500;
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${BLOCK_SIZE}px)`,
    gap: '1px',
    backgroundColor: '#000',
    padding: '5px',
    width: 'fit-content',
    margin: '0 auto',
  };

  const renderBoard = () => {
    const displayBoard = board.map((row) => [...row]);

    // Render current piece
    for (let row = 0; row < shapeData.length; row++) {
      for (let col = 0; col < shapeData[row].length; col++) {
        if (shapeData[row][col] === 1) {
          const boardY = currentPiece.y + row;
          const boardX = currentPiece.x + col;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            displayBoard[boardY][boardX] = currentPiece.shape;
          }
        }
      }
    }

    return displayBoard.map((row, rowIdx) =>
      row.map((cell, colIdx) => (
        <div
          key={`${rowIdx}-${colIdx}`}
          className="block"
          style={{
            width: BLOCK_SIZE,
            height: BLOCK_SIZE,
            backgroundColor: cell ? COLORS[cell] : '#111',
            border: '1px solid #333',
            boxSizing: 'border-box',
          }}
        />
      ))
    );
  };

  const renderNextPiece = () => {
    const nextShapeData = SHAPES[nextPiece.shape];
    const nextGrid = Array(4)
      .fill(null)
      .map(() => Array(4).fill(null));

    for (let row = 0; row < nextShapeData.length; row++) {
      for (let col = 0; col < nextShapeData[row].length; col++) {
        if (nextShapeData[row][col] === 1) {
          nextGrid[row][col] = nextPiece.shape;
        }
      }
    }

    return nextGrid.map((row, rowIdx) =>
      row.map((cell, colIdx) => (
        <div
          key={`next-${rowIdx}-${colIdx}`}
          style={{
            width: 20,
            height: 20,
            backgroundColor: cell ? COLORS[cell] : '#eee',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
          }}
        />
      ))
    );
  };

  return (
    <div className="tetris-container">
      <Card className="tetris-wrapper p-6">
        <h1 className="tetris-title">TETRIS</h1>

        <div className="tetris-content">
          <div className="game-board">
            <div style={gridStyle}>{renderBoard()}</div>
          </div>

          <div className="game-info">
            <Card className="info-card p-4">
              <div className="info-section">
                <h3>SCORE</h3>
                <p className="score-value">{score}</p>
              </div>

              <Card className="next-piece-card p-3" style={{ marginTop: '20px' }}>
                <h3 style={{ marginTop: 0 }}>NEXT</h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 20px)',
                    gap: '1px',
                    justifyContent: 'center',
                    marginTop: '10px',
                  }}
                >
                  {renderNextPiece()}
                </div>
              </Card>

              <div className="controls" style={{ marginTop: '30px' }}>
                <button
                  className="tetris-button"
                  onClick={() => setIsPaused(!isPaused)}
                  style={{ marginBottom: '10px' }}
                >
                  {isPaused ? 'RESUME' : 'PAUSE'}
                </button>
                <button
                  className="tetris-button"
                  onClick={handleRotate}
                  style={{ marginBottom: '10px' }}
                >
                  ROTATE
                </button>
                <button className="tetris-button" onClick={handleReset}>
                  NEW GAME
                </button>
              </div>

              {gameOver && (
                <div className="game-over-message">
                  <p>GAME OVER!</p>
                  <p>Final Score: {score}</p>
                </div>
              )}
            </Card>
          </div>
        </div>

        <div className="controls-info p-3" style={{ marginTop: '30px' }}>
          <h3>CONTROLS</h3>
          <p>← → Arrow Keys: Move</p>
          <p>↓ Arrow Key: Drop</p>
          <p>SPACE: Rotate</p>
        </div>
      </Card>
    </div>
  );
}
