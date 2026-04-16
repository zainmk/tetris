import { useRef, useCallback } from 'react';

export default function TouchControls({ onLeft, onRight, onRotate, onSoftDrop, onHardDrop, disabled }) {
  return (
    <div className="touch-controls">
      <div className="touch-controls-row">
        <TouchButton label="SPIN" onAction={onRotate} disabled={disabled} />
        <TouchButton label="DOWN" onAction={onSoftDrop} disabled={disabled} repeat />
      </div>
      <div className="touch-controls-row">
        <TouchButton label="LEFT" onAction={onLeft} disabled={disabled} repeat />
        <TouchButton label="DROP" onAction={onHardDrop} disabled={disabled} wide />
        <TouchButton label="RIGHT" onAction={onRight} disabled={disabled} repeat />
      </div>
    </div>
  );
}

function TouchButton({ label, onAction, disabled, repeat, wide }) {
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const clearTimers = useCallback(() => {
    clearTimeout(timeoutRef.current);
    clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  }, []);

  const handleStart = useCallback((e) => {
    e.preventDefault();
    if (disabled) return;
    onAction();
    if (repeat) {
      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(onAction, 80);
      }, 200);
    }
  }, [onAction, disabled, repeat]);

  const handleEnd = useCallback((e) => {
    e.preventDefault();
    clearTimers();
  }, [clearTimers]);

  return (
    <button
      className={`touch-btn tetris-button${wide ? ' touch-btn-wide' : ''}`}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      onClick={(e) => { e.preventDefault(); if (!disabled) onAction(); }}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
