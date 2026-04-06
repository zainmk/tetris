import { useState, useEffect, useRef } from 'react';
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
  const [currentPiece, setCurrentPiece] = useState({
    ...getRandomShape(),
    rotation: 0,
  });
  const [nextPiece, setNextPiece] = useState(getRandomShape());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const gameLoopRef = useRef(null);
  const dropSpeedRef = useRef(500);

  const shapeData = SHAPES[currentPiece.shape];
  
  // Get rotated shape data based on rotation state
  const getRotatedShape = (shape, rotationCount) => {
    let rotated = shape;
    for (let i = 0; i < rotationCount; i++) {
      rotated = rotatePiece(rotated);
    }
    return rotated;
  };
  
  const currentShapeData = getRotatedShape(shapeData, currentPiece.rotation);

  // Check if game is over
  useEffect(() => {
    if (gameOver) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }
  }, [gameOver]);

  // MAIN GAME LOOP
  useEffect(() => {
    if (gameOver) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      return;
    }

    gameLoopRef.current = setInterval(() => {
      setBoard((prevBoard) => {
        const newY = currentPiece.y + 1;

        // Check if can move down
        if (!isColliding(prevBoard, currentPiece.shape, currentShapeData, currentPiece.x, newY)) {
          setCurrentPiece((prev) => ({ ...prev, y: newY }));
          return prevBoard;
        }

        // Place piece
        let newBoard = placePiece(prevBoard, currentPiece.shape, currentShapeData, currentPiece.x, currentPiece.y);

        // Clear lines
        const { board: clearedBoard, clearedLines } = clearLines(newBoard);
        newBoard = clearedBoard;

        if (clearedLines > 0) {
          setScore((prev) => prev + calculateScore(clearedLines));
        }

        // Spawn next piece
        const newPiece = { ...nextPiece, rotation: 0 };
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
  }, [currentPiece.y, currentPiece.shape, currentPiece.x, currentShapeData, nextPiece, gameOver]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver) {
        if (e.key === ' ') {
          e.preventDefault();
          handleReset();
        }
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentPiece((prev) => {
          if (!isColliding(board, prev.shape, currentShapeData, prev.x - 1, prev.y)) {
            return { ...prev, x: prev.x - 1 };
          }
          return prev;
        });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentPiece((prev) => {
          if (!isColliding(board, prev.shape, currentShapeData, prev.x + 1, prev.y)) {
            return { ...prev, x: prev.x + 1 };
          }
          return prev;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentPiece((prev) => {
          const newRotation = (prev.rotation + 1) % 4;
          const rotatedShape = getRotatedShape(SHAPES[prev.shape], newRotation);
          if (!isColliding(board, prev.shape, rotatedShape, prev.x, prev.y)) {
            return { ...prev, rotation: newRotation };
          }
          return prev;
        });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentPiece((prev) => {
          if (!isColliding(board, prev.shape, currentShapeData, prev.x, prev.y + 1)) {
            return { ...prev, y: prev.y + 1 };
          }
          return prev;
        });
      } else if (e.key === ' ') {
        e.preventDefault();
        setBoard((prevBoard) => {
          let newY = currentPiece.y;
          // Find the lowest position the piece can go
          while (!isColliding(prevBoard, currentPiece.shape, currentShapeData, currentPiece.x, newY + 1)) {
            newY++;
          }
          // Place the piece at its final position
          let newBoard = placePiece(prevBoard, currentPiece.shape, currentShapeData, currentPiece.x, newY);
          
          // Clear lines
          const { board: clearedBoard, clearedLines } = clearLines(newBoard);
          newBoard = clearedBoard;
          
          if (clearedLines > 0) {
            setScore((prev) => prev + calculateScore(clearedLines));
          }
          
          // Spawn next piece
          const newPiece = { ...nextPiece, rotation: 0 };
          setNextPiece(getRandomShape());
          
          // Check game over
          if (isColliding(newBoard, newPiece.shape, SHAPES[newPiece.shape], newPiece.x, newPiece.y)) {
            setGameOver(true);
            return newBoard;
          }
          
          setCurrentPiece(newPiece);
          return newBoard;
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [board, currentShapeData, currentPiece, gameOver, nextPiece]);

  const handleRotate = () => {
    if (gameOver) return;
    
    setCurrentPiece((prev) => {
      const newRotation = (prev.rotation + 1) % 4;
      const rotatedShape = getRotatedShape(SHAPES[prev.shape], newRotation);
      if (!isColliding(board, prev.shape, rotatedShape, prev.x, prev.y)) {
        return { ...prev, rotation: newRotation };
      }
      return prev;
    });
  };

  const handleReset = () => {
    setBoard(createEmptyBoard());
    setCurrentPiece({ ...getRandomShape(), rotation: 0 });
    setNextPiece(getRandomShape());
    setScore(0);
    setGameOver(false);
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
    for (let row = 0; row < currentShapeData.length; row++) {
      for (let col = 0; col < currentShapeData[row].length; col++) {
        if (currentShapeData[row][col] === 1) {
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

  return (
    <div className="tetris-container">
        <div className="tetris-content">
          <div className="game-board">
            <div style={gridStyle}>{renderBoard()}</div>
          </div>
        </div>
        <p className='tetris-title'> {score} </p>
    </div>
  );
}
