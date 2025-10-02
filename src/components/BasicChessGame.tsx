import React, { useState, useEffect } from 'react';
import { useSimpleChess } from '../hooks/useSimpleChess';
import { useSimpleAI } from '../hooks/useSimpleAI';

export const BasicChessGame: React.FC = () => {
  const { chess, selectedSquare, gameStatus, selectSquare, newGame, undoMove, makeAIMove } = useSimpleChess();
  const { getAIMove } = useSimpleAI();
  
  const [gameMode, setGameMode] = useState<'pvp' | 'ai'>('pvp');
  const [aiLevel, setAILevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [moveCount, setMoveCount] = useState(0); // Pour déclencher l'IA

  // Generate board squares
  const squares: string[] = [];
  for (let rank = 8; rank >= 1; rank--) {
    for (let file = 0; file < 8; file++) {
      const square = `${String.fromCharCode(97 + file)}${rank}`;
      squares.push(square);
    }
  }

  // Mettre à jour le compteur de coups
  useEffect(() => {
    setMoveCount(chess.history().length);
  }, [chess.history().length]);

  // IA Logic - se déclenche quand moveCount change
  useEffect(() => {
    console.log('AI Check:', {
      gameMode,
      turn: chess.turn(),
      gameStatus,
      isAIThinking,
      moveCount,
      shouldAIPlay: gameMode === 'ai' && chess.turn() === 'b' && gameStatus === 'playing' && !isAIThinking
    });
    
    if (gameMode === 'ai' && chess.turn() === 'b' && gameStatus === 'playing' && !isAIThinking) {
      console.log('AI is making a move...');
      setIsAIThinking(true);
      
      // Délai pour simuler la réflexion de l'IA
      const timeout = setTimeout(() => {
        const aiMove = getAIMove(chess, aiLevel);
        console.log('AI Move:', aiMove);
        if (aiMove) {
          const success = makeAIMove(aiMove.from, aiMove.to, aiMove.promotion);
          console.log('AI Move success:', success);
        }
        setIsAIThinking(false);
      }, Math.random() * 1000 + 500); // 0.5-1.5 secondes

      return () => clearTimeout(timeout);
    }
  }, [moveCount, gameMode, aiLevel, gameStatus, isAIThinking, getAIMove, makeAIMove]);

  const getPieceSymbol = (piece: any): string => {
    if (!piece) return '';
    
    const symbols = {
      w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
      b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
    };
    
    return symbols[piece.color as 'w' | 'b'][piece.type as keyof typeof symbols.w] || '';
  };

  const handleNewGame = () => {
    newGame();
    setIsAIThinking(false);
  };

  const canPlayerMove = gameMode === 'pvp' || chess.turn() === 'w';

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <h1>Chess Game</h1>
        <p>
          {gameStatus === 'finished' 
            ? chess.isCheckmate() 
              ? `${chess.turn() === 'w' ? 'Black' : 'White'} wins!`
              : 'Game ended'
            : isAIThinking
            ? '🤖 AI is thinking...'
            : `${chess.turn() === 'w' ? 'White' : 'Black'} to move ${gameMode === 'ai' && chess.turn() === 'b' ? '(AI)' : ''}`
          }
        </p>
      </header>

      <div className="game-layout">
        {/* Chess Board */}
        <div className="board-container">
          <div className="chess-board">
            <div className="board-grid">
              {squares.map((square, index) => {
                const piece = chess.get(square as any);
                const isLight = (Math.floor(index / 8) + (index % 8)) % 2 === 0;
                const isSelected = selectedSquare === square;

                return (
                  <div
                    key={square}
                    className={`chess-square ${isLight ? 'light' : 'dark'} ${isSelected ? 'selected' : ''}`}
                    onClick={() => canPlayerMove && !isAIThinking ? selectSquare(square as any) : undefined}
                    style={{ cursor: canPlayerMove && !isAIThinking ? 'pointer' : 'not-allowed' }}
                  >
                    {getPieceSymbol(piece)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="controls-panel">
          <h3>Game Settings</h3>
          
          {/* Game Mode */}
          <div className="info-section">
            <div className="info-title">Game Mode</div>
            <select 
              value={gameMode} 
              onChange={(e) => setGameMode(e.target.value as 'pvp' | 'ai')}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                backgroundColor: '#374151',
                color: 'white',
                border: '1px solid #4b5563'
              }}
            >
              <option value="pvp">Player vs Player</option>
              <option value="ai">Player vs AI</option>
            </select>
          </div>

          {/* AI Level */}
          {gameMode === 'ai' && (
            <div className="info-section">
              <div className="info-title">AI Difficulty</div>
              <select 
                value={aiLevel} 
                onChange={(e) => setAILevel(parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  backgroundColor: '#374151',
                  color: 'white',
                  border: '1px solid #4b5563'
                }}
              >
                <option value={1}>1 - Beginner (Random)</option>
                <option value={2}>2 - Easy</option>
                <option value={3}>3 - Medium</option>
                <option value={4}>4 - Hard</option>
                <option value={5}>5 - Expert</option>
              </select>
            </div>
          )}
          
          <div className="button-group">
            <button onClick={handleNewGame} className="btn btn-primary">
              New Game
            </button>
            
            <button onClick={undoMove} className="btn btn-secondary">
              Undo Move
            </button>
          </div>

          {/* Game Info */}
          <div className="game-info">
            <div className="info-section">
              <div className="info-title">Move History</div>
              <div className="move-history">
                {chess.history().length === 0 ? (
                  <p style={{color: '#9ca3af'}}>No moves yet</p>
                ) : (
                  chess.history().map((move, index) => (
                    <div key={index} className="move-item">
                      {Math.ceil((index + 1) / 2)}.{index % 2 === 0 ? '' : '..'} {move}
                    </div>
                  ))
                )}
              </div>
            </div>

            {isAIThinking && (
              <div className="status-alert" style={{backgroundColor: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#93c5fd'}}>
                🤖 AI is thinking...
              </div>
            )}

            {chess.inCheck() && (
              <div className="status-alert status-check">
                Check!
              </div>
            )}

            {gameStatus === 'finished' && (
              <div className="status-alert status-game-over">
                <div className="title">Game Over</div>
                <div className="subtitle">
                  {chess.isCheckmate() 
                    ? 'Checkmate'
                    : chess.isStalemate()
                    ? 'Stalemate'
                    : chess.isDraw()
                    ? 'Draw'
                    : 'Game ended'
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
