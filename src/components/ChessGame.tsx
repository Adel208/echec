import React, { useState, useCallback } from 'react';
import { Color } from 'chess.js';
import { ChessBoard } from './ChessBoard';
import { GameControls } from './GameControls';
import { GameInfo } from './GameInfo';
import { useChessGame } from '../hooks/useChessGame';

export const ChessGame: React.FC = () => {
  const {
    gameState,
    settings,
    timer,
    setSettings,
    startNewGame,
    loadGame,
    selectSquare,
    makeMove,
    undoMove,
    getPGN,
    loadPGN,
  } = useChessGame();

  const [showSettings, setShowSettings] = useState(false);

  const handleSquareClick = useCallback((square: string) => {
    selectSquare(square as any);
  }, [selectSquare]);

  const handlePieceMove = useCallback((from: string, to: string) => {
    makeMove(from as any, to as any);
  }, [makeMove]);

  const handleNewGame = useCallback(() => {
    startNewGame();
  }, [startNewGame]);

  const handleUndo = useCallback(() => {
    undoMove();
  }, [undoMove]);

  const handleExportPGN = useCallback(() => {
    const pgn = getPGN();
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chess-game.pgn';
    a.click();
    URL.revokeObjectURL(url);
  }, [getPGN]);

  const handleImportPGN = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const pgn = e.target?.result as string;
        if (loadPGN(pgn)) {
          alert('PGN loaded successfully!');
        } else {
          alert('Failed to load PGN. Please check the format.');
        }
      };
      reader.readAsText(file);
    }
  }, [loadPGN]);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Chess Game
          </h1>
          <p className="text-gray-300">
            Play chess with advanced features and AI opponents
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Info Panel */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <GameInfo
              gameState={gameState}
              timer={timer}
              settings={settings}
            />
          </div>

          {/* Chess Board */}
          <div className="lg:col-span-1 order-1 lg:order-2 flex justify-center">
            <ChessBoard
              gameState={gameState}
              orientation={settings.playerOrientation}
              onSquareClick={handleSquareClick}
              onPieceMove={handlePieceMove}
              disabled={gameState.gameStatus !== 'playing'}
            />
          </div>

          {/* Game Controls */}
          <div className="lg:col-span-1 order-3">
            <GameControls
              gameState={gameState}
              settings={settings}
              onNewGame={handleNewGame}
              onUndo={handleUndo}
              onExportPGN={handleExportPGN}
              onImportPGN={handleImportPGN}
              onSettingsChange={setSettings}
              showSettings={showSettings}
              onShowSettings={setShowSettings}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
