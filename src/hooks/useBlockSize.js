import { useState, useEffect } from 'react';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../gameConstants';

const MAX_BLOCK_SIZE = 30;
const MIN_BLOCK_SIZE = 16;
// Horizontal: container padding (10px each side) + grid padding (5px each side) + border (3px each side) + gaps (9 * 1px)
const H_OVERHEAD = 20 + 10 + 6 + 9;
// Vertical: container padding + score text + grid padding + border + gaps (19 * 1px)
const V_OVERHEAD_BASE = 20 + 50 + 10 + 6 + 19;
const TOUCH_CONTROLS_HEIGHT = 130;

export default function useBlockSize() {
  const [blockSize, setBlockSize] = useState(() =>
    calcBlockSize(window.innerWidth, window.innerHeight)
  );

  useEffect(() => {
    let timeout;
    const onResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(
        () => setBlockSize(calcBlockSize(window.innerWidth, window.innerHeight)),
        150
      );
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return blockSize;
}

const isDesktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function calcBlockSize(viewportWidth, viewportHeight) {
  const vOverhead = V_OVERHEAD_BASE + (isDesktopPointer ? 0 : TOUCH_CONTROLS_HEIGHT);
  const fromWidth = Math.floor((viewportWidth - H_OVERHEAD) / BOARD_WIDTH);
  const fromHeight = Math.floor((viewportHeight - vOverhead) / BOARD_HEIGHT);
  const size = Math.min(fromWidth, fromHeight);
  return Math.max(MIN_BLOCK_SIZE, Math.min(MAX_BLOCK_SIZE, size));
}
