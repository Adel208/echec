import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { useSimpleAI } from '../hooks/useSimpleAI';

export const WorkingChessGame: React.FC = () => {
  const [chess] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<'pvp' | 'ai'>('pvp');
  const [aiLevel, setAILevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [gameKey, setGameKey] = useState(0); // Pour forcer les re-renders
  
  const { getAIMove } = useSimpleAI();

  // IA automatique
  useEffect(() => {
    if (gameMode === 'ai' && chess.turn() === 'b' && !chess.isGameOver() && !isAIThinking) {
      setIsAIThinking(true);
      
      const timeout = setTimeout(() => {
        const aiMove = getAIMove(chess, aiLevel);
        if (aiMove) {
          try {
            chess.move({
              from: aiMove.from,
              to: aiMove.to,
              promotion: aiMove.promotion as any,
            });
            setGameKey(prev => prev + 1); // Force re-render
          } catch (error) {
            console.error('AI move failed:', error);
          }
        }
        setIsAIThinking(false);
      }, Math.random() * 1000 + 500);

      return () => clearTimeout(timeout);
    }
  }, [gameKey, gameMode, chess, aiLevel, isAIThinking, getAIMove]);

  // Generate board squares
  const squares: string[] = [];
  for (let rank = 8; rank >= 1; rank--) {
    for (let file = 0; file < 8; file++) {
      const square = `${String.fromCharCode(97 + file)}${rank}`;
      squares.push(square);
    }
  }

  const getPieceSymbol = (piece: any): string => {
    if (!piece) return '';
    
    const symbols = {
      w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
      b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
    };
    
    return symbols[piece.color as 'w' | 'b'][piece.type as keyof typeof symbols.w] || '';
  };

  const handleSquareClick = (square: string) => {
    // Ne pas jouer si c'est le tour de l'IA ou si l'IA réfléchit
    if (gameMode === 'ai' && (chess.turn() === 'b' || isAIThinking)) {
      return;
    }

    if (selectedSquare === null) {
      // Sélectionner une pièce
      const piece = chess.get(square as any);
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
      }
    } else if (selectedSquare === square) {
      // Désélectionner
      setSelectedSquare(null);
    } else {
      // Essayer de faire un coup
      try {
        const move = chess.move({ from: selectedSquare as any, to: square as any });
        if (move) {
          setSelectedSquare(null);
          setGameKey(prev => prev + 1); // Force re-render et déclenche l'IA
        } else {
          // Coup invalide, essayer de sélectionner une nouvelle pièce
          const piece = chess.get(square as any);
          if (piece && piece.color === chess.turn()) {
            setSelectedSquare(square);
          } else {
            setSelectedSquare(null);
          }
        }
      } catch (error) {
        setSelectedSquare(null);
      }
    }
  };

  const handleNewGame = () => {
    chess.reset();
    setSelectedSquare(null);
    setIsAIThinking(false);
    setGameKey(prev => prev + 1);
  };

  const handleUndo = () => {
    chess.undo();
    setSelectedSquare(null);
    setGameKey(prev => prev + 1);
  };

  const canPlayerMove = gameMode === 'pvp' || chess.turn() === 'w';

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <h1>Chess Game</h1>
        <p>
          {chess.isGameOver()
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
                    onClick={() => handleSquareClick(square)}
                    style={{ 
                      cursor: canPlayerMove && !isAIThinking ? 'pointer' : 'not-allowed',
                      opacity: canPlayerMove && !isAIThinking ? 1 : 0.7
                    }}
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
            
            <button onClick={handleUndo} className="btn btn-secondary">
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

            {chess.isGameOver() && (
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
