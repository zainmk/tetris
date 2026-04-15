import { useState } from 'react';
import { Card, Input, Button } from 'pixel-retroui';

const NAME_MAX_LENGTH = 12;
const NAME_PATTERN = /^[A-Za-z0-9 _-]+$/;
const STORAGE_KEY = 'tetris_lastName';

export default function GameOverModal({
  score,
  topScores,
  loadError,
  isHighScore,
  modalPhase,
  newEntryId,
  onSubmit,
}) {
  // Prefill the name from localStorage on first mount.
  const [name, setName] = useState(() => localStorage.getItem(STORAGE_KEY) || '');

  const trimmed = name.trim();
  const isValidName =
    trimmed.length >= 1 &&
    trimmed.length <= NAME_MAX_LENGTH &&
    NAME_PATTERN.test(trimmed);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidName || modalPhase !== 'entering') return;
    localStorage.setItem(STORAGE_KEY, trimmed);
    onSubmit(trimmed);
  };

  const renderLeaderboard = () => {
    if (loadError) {
      return <p className="leaderboard-error">COULDN'T LOAD SCORES</p>;
    }
    if (topScores === null) {
      return <p className="leaderboard-loading">LOADING...</p>;
    }
    if (topScores.length === 0) {
      return <p className="leaderboard-empty"> - </p>;
    }
    return (
      <ol className="leaderboard-list">
        {topScores.map((entry, idx) => {
          const isNew = newEntryId && entry.id === newEntryId;
          return (
            <li
              key={entry.id}
              className={`leaderboard-row${isNew ? ' leaderboard-row-new' : ''}`}
            >
              <span className="leaderboard-rank">{idx + 1}.</span>
              <span className="leaderboard-name">{entry.name}</span>
              <span className="leaderboard-score">{entry.score}</span>
            </li>
          );
        })}
      </ol>
    );
  };

  const renderFooter = () => {
    if (isHighScore && modalPhase === 'entering') {
      return (
        <form className="game-over-form" onSubmit={handleSubmit}>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={NAME_MAX_LENGTH}
            placeholder="NAME"
            autoFocus
            bg="#0f3460"
            textColor="#00ff00"
            borderColor="#00ff00"
          />
          <Button
            type="submit"
            disabled={!isValidName}
            bg="#00ff00"
            textColor="#000000"
            shadow="#0f0"
          >
            SUBMIT
          </Button>
        </form>
      );
    }
    if (modalPhase === 'submitting') {
      return <p className="game-over-status">SAVING...</p>;
    }
    if (modalPhase === 'submitted') {
      return <p className="game-over-status">SAVED — PRESS SPACE TO PLAY AGAIN</p>;
    }
    return <p className="game-over-status">PRESS SPACE TO PLAY AGAIN</p>;
  };

  return (
    <div className="game-over-overlay">
      <Card
        className="game-over-card"
        bg="#0f3460"
        textColor="#00ff00"
        borderColor="#00ff00"
        shadowColor="#00ff00"
      >
        <h2 className="game-over-title">GAME OVER</h2>
        <p className="game-over-score">SCORE: {score}</p>
        <h3 className="leaderboard-title">TOP 10</h3>
        {renderLeaderboard()}
        {renderFooter()}
      </Card>
    </div>
  );
}
