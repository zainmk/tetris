import { useRef, useCallback } from 'react';

export default function TouchControls({ onLeft, onRight, onRotate, onSoftDrop, onHardDrop, disabled }) {
  return (
    <div className="touch-controls">
      <div className="touch-controls-row">
        <RepeatButton label="&#9664;" onAction={onLeft} disabled={disabled} />
        <SimpleButton label="&#8635;" onAction={onRotate} disabled={disabled} className="touch-btn-rotate" />
        <RepeatButton label="&#9654;" onAction={onRight} disabled={disabled} />
      </div>
      <DropBar onSoftDrop={onSoftDrop} onHardDrop={onHardDrop} disabled={disabled} />
    </div>
  );
}

function SimpleButton({ label, onAction, disabled, className = '' }) {
  const handleStart = useCallback((e) => {
    e.preventDefault();
    if (!disabled) onAction();
  }, [onAction, disabled]);

  return (
    <button
      className={`touch-btn tetris-button ${className}`}
      onTouchStart={handleStart}
      onTouchEnd={(e) => e.preventDefault()}
      onClick={(e) => { e.preventDefault(); if (!disabled) onAction(); }}
      disabled={disabled}
      dangerouslySetInnerHTML={{ __html: label }}
    />
  );
}

function RepeatButton({ label, onAction, disabled }) {
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
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(onAction, 80);
    }, 200);
  }, [onAction, disabled]);

  const handleEnd = useCallback((e) => {
    e.preventDefault();
    clearTimers();
  }, [clearTimers]);

  return (
    <button
      className="touch-btn tetris-button"
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      onClick={(e) => { e.preventDefault(); if (!disabled) onAction(); }}
      disabled={disabled}
      dangerouslySetInnerHTML={{ __html: label }}
    />
  );
}

function DropBar({ onSoftDrop, onHardDrop, disabled }) {
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const lastTapRef = useRef(0);

  const clearTimers = useCallback(() => {
    clearTimeout(timeoutRef.current);
    clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  }, []);

  const handleStart = useCallback((e) => {
    e.preventDefault();
    if (disabled) return;

    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double-tap: hard drop
      clearTimers();
      lastTapRef.current = 0;
      onHardDrop();
      return;
    }
    lastTapRef.current = now;

    // Single tap: soft drop once, then repeat on hold
    onSoftDrop();
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(onSoftDrop, 80);
    }, 200);
  }, [onSoftDrop, onHardDrop, disabled, clearTimers]);

  const handleEnd = useCallback((e) => {
    e.preventDefault();
    clearTimers();
  }, [clearTimers]);

  return (
    <button
      className="touch-btn touch-btn-drop tetris-button"
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      onClick={(e) => { e.preventDefault(); if (!disabled) onSoftDrop(); }}
      disabled={disabled}
    >
      DROP
    </button>
  );
}
