import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';

export const ModernChess = () => {
  const [chess] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [gameUpdate, setGameUpdate] = useState(0);
  const [hoveredSquare, setHoveredSquare] = useState(null);
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [aiLevel, setAILevel] = useState(3);
  const [gameMode, setGameMode] = useState('ai'); // 'ai' ou 'human'
  const [moveHistory, setMoveHistory] = useState([]);
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });
  const [gameTime, setGameTime] = useState({ white: 600, black: 600 }); // 10 minutes chacun
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Timer
  useEffect(() => {
    let interval = null;
    if (isTimerActive && !chess.isGameOver()) {
      interval = setInterval(() => {
        setGameTime(prev => {
          const newTime = { ...prev };
          const currentTurn = chess.turn();
          if (currentTurn === 'w') {
            newTime.white = Math.max(0, newTime.white - 1);
          } else {
            newTime.black = Math.max(0, newTime.black - 1);
          }
          return newTime;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, gameUpdate]);

  // Formatage du temps
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // IA intelligente (même algorithme)
  const evaluatePosition = (chess) => {
    let score = 0;
    const pieceValues = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0 };
    
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const square = String.fromCharCode(97 + j) + (8 - i);
        const piece = chess.get(square);
        
        if (piece) {
          let pieceValue = pieceValues[piece.type];
          
          // Bonus position
          if (piece.type === 'p') {
            pieceValue += piece.color === 'w' ? (7 - i) * 0.1 : i * 0.1;
          }
          if ((i >= 3 && i <= 4) && (j >= 3 && j <= 4)) {
            pieceValue += 0.3;
          }
          
          score += piece.color === 'w' ? pieceValue : -pieceValue;
        }
      }
    }
    
    if (chess.inCheck()) score += chess.turn() === 'w' ? -0.5 : 0.5;
    if (chess.isCheckmate()) return chess.turn() === 'w' ? -1000 : 1000;
    if (chess.isStalemate() || chess.isDraw()) return 0;
    
    return score;
  };

  const minimax = (chess, depth, alpha, beta, maximizingPlayer) => {
    if (depth === 0 || chess.isGameOver()) return evaluatePosition(chess);
    
    const moves = chess.moves({ verbose: true });
    
    if (maximizingPlayer) {
      let maxEval = -Infinity;
      for (let move of moves) {
        chess.move(move);
        const evaluation = minimax(chess, depth - 1, alpha, beta, false);
        chess.undo();
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let move of moves) {
        chess.move(move);
        const evaluation = minimax(chess, depth - 1, alpha, beta, true);
        chess.undo();
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  };

  const makeAIMove = () => {
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return;
    
    let bestMove = null;
    let bestScore = Infinity;
    const depth = aiLevel;
    
    for (let move of moves) {
      chess.move(move);
      const score = minimax(chess, depth - 1, -Infinity, Infinity, true);
      chess.undo();
      
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    
    if (bestMove) {
      const moveResult = chess.move(bestMove);
      updateGameState(moveResult);
    }
  };

  // Mettre à jour l'état du jeu
  const updateGameState = (move) => {
    if (move) {
      // Démarrer le timer automatiquement au premier coup
      if (chess.history().length === 1 && !isTimerActive) {
        setIsTimerActive(true);
      }
      
      // Ajouter à l'historique
      setMoveHistory(prev => [...prev, move]);
      
      // Capturer les pièces
      if (move.captured) {
        setCapturedPieces(prev => ({
          ...prev,
          [move.color === 'w' ? 'white' : 'black']: [...prev[move.color === 'w' ? 'white' : 'black'], move.captured]
        }));
      }
      
      setGameUpdate(prev => prev + 1);
    }
  };

  // IA automatique
  useEffect(() => {
    if (gameMode === 'ai' && chess.turn() === 'b' && !chess.isGameOver() && !isAIThinking) {
      setIsAIThinking(true);
      setTimeout(() => {
        makeAIMove();
        setIsAIThinking(false);
      }, 800);
    }
  }, [gameUpdate, isAIThinking, gameMode]);

  // Plateau
  const createBoard = () => {
    const board = [];
    for (let rank = 8; rank >= 1; rank--) {
      for (let file = 0; file < 8; file++) {
        board.push(String.fromCharCode(97 + file) + rank);
      }
    }
    return board;
  };

  const squares = createBoard();

  const pieceSymbols = {
    'wk': '♚', 'wq': '♛', 'wr': '♜', 'wb': '♝', 'wn': '♞', 'wp': '♟',
    'bk': '♚', 'bq': '♛', 'br': '♜', 'bb': '♝', 'bn': '♞', 'bp': '♟'
  };

  const getPieceSymbol = (square) => {
    const piece = chess.get(square);
    return piece ? pieceSymbols[piece.color + piece.type] || '' : '';
  };

  // Fonctions de glisser-déposer
  const handleDragStart = (e, square) => {
    if ((gameMode === 'ai' && chess.turn() === 'b') || isAIThinking) {
      e.preventDefault();
      return;
    }

    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
      setDraggedPiece(piece);
      setDraggedFrom(square);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', square);
    } else {
      e.preventDefault();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, square) => {
    e.preventDefault();
    
    if (draggedFrom && draggedFrom !== square) {
      try {
        const move = chess.move({ from: draggedFrom, to: square });
        if (move) {
          updateGameState(move);
        }
      } catch (error) {
        // Coup invalide, ne rien faire
      }
    }
    
    setDraggedPiece(null);
    setDraggedFrom(null);
    setSelectedSquare(null);
  };

  const handleDragEnd = () => {
    setDraggedPiece(null);
    setDraggedFrom(null);
  };

  // Gestion des clics (conservée pour compatibilité)
  const handleClick = (square) => {
    if ((gameMode === 'ai' && chess.turn() === 'b') || isAIThinking) return;

    if (!selectedSquare) {
      const piece = chess.get(square);
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
      }
    } else if (selectedSquare === square) {
      setSelectedSquare(null);
    } else {
      try {
        const move = chess.move({ from: selectedSquare, to: square });
        if (move) {
          updateGameState(move);
          setSelectedSquare(null);
        } else {
          setSelectedSquare(null);
        }
      } catch (e) {
        setSelectedSquare(null);
      }
    }
  };

  // Fonctions utilitaires
  const newGame = () => {
    chess.reset();
    setSelectedSquare(null);
    setIsAIThinking(false);
    setMoveHistory([]);
    setCapturedPieces({ white: [], black: [] });
    setGameTime({ white: 600, black: 600 });
    setIsTimerActive(false);
    setGameUpdate(prev => prev + 1);
  };

  const undoMove = () => {
    if (chess.history().length > 0) {
      chess.undo();
      if (gameMode === 'ai' && chess.history().length > 0) {
        chess.undo(); // Annuler aussi le coup de l'IA
      }
      setMoveHistory(prev => prev.slice(0, -2));
      setGameUpdate(prev => prev + 1);
    }
  };

  const toggleTimer = () => {
    setIsTimerActive(!isTimerActive);
  };

  const exportPGN = () => {
    const pgn = chess.pgn();
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chess-game.pgn';
    a.click();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f9fa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px'
    }}>
      {/* Header simple */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          margin: '0 0 10px 0',
          fontSize: '2.5rem',
          color: '#2c3e50',
          fontWeight: '300'
        }}>
          Chess
        </h1>
        <div style={{
          fontSize: '1.1rem',
          color: chess.isGameOver() ? '#e74c3c' : isAIThinking ? '#f39c12' : '#2c3e50',
          fontWeight: '500'
        }}>
          {chess.isGameOver() 
            ? (chess.isCheckmate() ? 
                `${chess.turn() === 'w' ? 'Black' : 'White'} wins by checkmate!` 
                : 'Game ended in a draw')
            : isAIThinking 
            ? 'AI is thinking...'
            : `${chess.turn() === 'w' ? 'White' : 'Black'} to move`
          }
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '30px',
        maxWidth: '1200px',
        margin: '0 auto',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {/* Plateau principal */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          {/* Timer et joueurs */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '15px',
            padding: '0 10px'
          }}>
            <div style={{
              background: chess.turn() === 'b' && isTimerActive ? '#e74c3c' : chess.turn() === 'b' ? '#2c3e50' : '#ecf0f1',
              color: chess.turn() === 'b' ? 'white' : '#2c3e50',
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: '500',
              border: chess.turn() === 'b' && isTimerActive ? '2px solid #c0392b' : 'none'
            }}>
              ⚫ Black {gameMode === 'ai' ? '(AI)' : ''} - {formatTime(gameTime.black)}
              {chess.turn() === 'b' && isTimerActive && <span style={{marginLeft: '5px'}}>⏰</span>}
            </div>
            <div style={{
              background: chess.turn() === 'w' && isTimerActive ? '#e74c3c' : chess.turn() === 'w' ? '#2c3e50' : '#ecf0f1',
              color: chess.turn() === 'w' ? 'white' : '#2c3e50',
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: '500',
              border: chess.turn() === 'w' && isTimerActive ? '2px solid #c0392b' : 'none'
            }}>
              ⚪ White - {formatTime(gameTime.white)}
              {chess.turn() === 'w' && isTimerActive && <span style={{marginLeft: '5px'}}>⏰</span>}
            </div>
          </div>

          {/* Pièces capturées (noires) */}
          <div style={{
            minHeight: '30px',
            padding: '5px',
            background: '#f8f9fa',
            borderRadius: '6px',
            marginBottom: '10px',
            display: 'flex',
            gap: '2px'
          }}>
            {capturedPieces.white.map((piece, index) => (
              <span key={index} style={{ fontSize: '1.2rem' }}>
                {pieceSymbols['b' + piece]}
              </span>
            ))}
          </div>

          {/* Coordonnées colonnes */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginBottom: '8px',
            paddingLeft: '25px',
            paddingRight: '25px'
          }}>
            {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(letter => (
              <div key={letter} style={{
                width: '80px',
                textAlign: 'center',
                color: '#2c3e50',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>
                {letter}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Coordonnées rangées */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              height: '640px',
              marginRight: '8px'
            }}>
              {[8, 7, 6, 5, 4, 3, 2, 1].map(number => (
                <div key={number} style={{
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#2c3e50',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}>
                  {number}
                </div>
              ))}
            </div>

            {/* Échiquier */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 80px)',
              gridTemplateRows: 'repeat(8, 80px)',
              gap: '0',
              border: '3px solid #2c3e50',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              {squares.map((square, index) => {
                const isLight = (Math.floor(index / 8) + (index % 8)) % 2 === 0;
                const isSelected = selectedSquare === square;
                const isHovered = hoveredSquare === square;
                const isDraggedFrom = draggedFrom === square;
                const piece = chess.get(square);
                
                return (
                  <div
                    key={square}
                    onClick={() => handleClick(square)}
                    onMouseEnter={() => setHoveredSquare(square)}
                    onMouseLeave={() => setHoveredSquare(null)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, square)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '4rem',
                      cursor: piece && piece.color === chess.turn() ? 'grab' : 'pointer',
                      backgroundColor: isSelected || isDraggedFrom
                        ? '#3498db' 
                        : isHovered 
                        ? (isLight ? '#e8f5e8' : '#d4b896')
                        : (isLight ? '#f0d9b5' : '#8b4513'),
                      transition: 'all 0.2s ease',
                      userSelect: 'none',
                      fontWeight: 'bold',
                      position: 'relative',
                      color: piece && piece.color === 'w' ? '#ffffff' : '#000000',
                      opacity: isDraggedFrom ? 0.5 : 1,
                      transform: isHovered ? 'scale(1.02)' : 'scale(1)'
                    }}
                  >
                    <div
                      draggable={piece && piece.color === chess.turn() && !isAIThinking}
                      onDragStart={(e) => handleDragStart(e, square)}
                      onDragEnd={handleDragEnd}
                      style={{
                        cursor: piece && piece.color === chess.turn() ? 'grab' : 'default',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {getPieceSymbol(square)}
                    </div>
                    {/* Nom de la case */}
                    <div style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '3px',
                      fontSize: '0.6rem',
                      color: isLight ? '#6c757d' : '#f8f9fa',
                      fontWeight: 'normal',
                      opacity: 0.7,
                      pointerEvents: 'none'
                    }}>
                      {square}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pièces capturées (blanches) */}
          <div style={{
            minHeight: '30px',
            padding: '5px',
            background: '#f8f9fa',
            borderRadius: '6px',
            marginTop: '10px',
            display: 'flex',
            gap: '2px'
          }}>
            {capturedPieces.black.map((piece, index) => (
              <span key={index} style={{ fontSize: '1.2rem' }}>
                {pieceSymbols['w' + piece]}
              </span>
            ))}
          </div>
        </div>

        {/* Panel de contrôle */}
        <div style={{
          width: '300px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Contrôles de jeu */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Game Controls</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={newGame}
                style={{
                  padding: '12px',
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                🆕 New Game
              </button>
              
              <button
                onClick={undoMove}
                style={{
                  padding: '12px',
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                ↶ Undo Move
              </button>
              
              <button
                onClick={toggleTimer}
                style={{
                  padding: '12px',
                  background: isTimerActive ? '#e74c3c' : '#f39c12',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {isTimerActive ? '⏸️ Pause Timer' : '▶️ Start Timer'}
              </button>
              
              <button
                onClick={exportPGN}
                style={{
                  padding: '12px',
                  background: '#9b59b6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                💾 Export PGN
              </button>
            </div>
          </div>

          {/* Paramètres */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Settings</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#7f8c8d' }}>
                Game Mode
              </label>
              <select
                value={gameMode}
                onChange={(e) => setGameMode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              >
                <option value="ai">vs AI</option>
                <option value="human">vs Human</option>
              </select>
            </div>

            {gameMode === 'ai' && (
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#7f8c8d' }}>
                  AI Level: {aiLevel}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={aiLevel}
                  onChange={(e) => setAILevel(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
                <div style={{ fontSize: '0.8rem', color: '#95a5a6', marginTop: '5px' }}>
                  1: Beginner → 5: Expert
                </div>
              </div>
            )}
          </div>

          {/* Historique */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            flex: 1
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Move History</h3>
            <div style={{
              maxHeight: '200px',
              overflowY: 'auto',
              fontSize: '0.9rem',
              lineHeight: '1.4'
            }}>
              {chess.history().length === 0 ? (
                <div style={{ color: '#95a5a6', fontStyle: 'italic' }}>
                  No moves yet
                </div>
              ) : (
                chess.history().map((move, index) => (
                  <div key={index} style={{
                    padding: '2px 0',
                    color: '#2c3e50'
                  }}>
                    {Math.ceil((index + 1) / 2)}.{index % 2 === 0 ? '' : '..'} {move}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Status */}
          {(chess.inCheck() || chess.isGameOver() || isAIThinking) && (
            <div style={{
              background: chess.inCheck() ? '#e74c3c' : chess.isGameOver() ? '#27ae60' : '#f39c12',
              color: 'white',
              padding: '15px',
              borderRadius: '12px',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              {chess.inCheck() && !chess.isGameOver() && '⚠️ Check!'}
              {chess.isGameOver() && '🏁 Game Over'}
              {isAIThinking && '🤖 AI Thinking...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
