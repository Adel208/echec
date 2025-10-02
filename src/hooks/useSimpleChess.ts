import { useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import type { Square, Color } from 'chess.js';

export const useSimpleChess = () => {
  const [chess] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'finished'>('playing');
  const [updateTrigger, setUpdateTrigger] = useState(0); // Pour forcer les re-renders

  const triggerUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);

  const selectSquare = useCallback((square: Square) => {
    if (selectedSquare === null) {
      // Select piece if it belongs to current player
      const piece = chess.get(square);
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
      }
    } else if (selectedSquare === square) {
      // Deselect if clicking same square
      setSelectedSquare(null);
    } else {
      // Try to make move
      try {
        const move = chess.move({ from: selectedSquare, to: square });
        if (move) {
          setSelectedSquare(null);
          if (chess.isGameOver()) {
            setGameStatus('finished');
          }
          triggerUpdate(); // Force re-render après un coup
        } else {
          // Invalid move, try selecting new piece
          const piece = chess.get(square);
          if (piece && piece.color === chess.turn()) {
            setSelectedSquare(square);
          } else {
            setSelectedSquare(null);
          }
        }
      } catch (error) {
        // Invalid move, deselect
        setSelectedSquare(null);
      }
    }
  }, [chess, selectedSquare]);

  const getLegalMoves = useCallback((square: Square): Square[] => {
    try {
      const moves = chess.moves({ square, verbose: true });
      return moves.map(move => move.to);
    } catch {
      return [];
    }
  }, [chess]);

  const newGame = useCallback(() => {
    chess.reset();
    setSelectedSquare(null);
    setGameStatus('playing');
    triggerUpdate();
  }, [chess, triggerUpdate]);

  const undoMove = useCallback(() => {
    chess.undo();
    setSelectedSquare(null);
    if (gameStatus === 'finished') {
      setGameStatus('playing');
    }
    triggerUpdate();
  }, [chess, gameStatus, triggerUpdate]);

  // Fonction spéciale pour l'IA
  const makeAIMove = useCallback((from: string, to: string, promotion?: string) => {
    try {
      const move = chess.move({ from, to, promotion });
      if (move) {
        setSelectedSquare(null);
        if (chess.isGameOver()) {
          setGameStatus('finished');
        }
        triggerUpdate();
        return true;
      }
    } catch (error) {
      console.error('AI move failed:', error);
    }
    return false;
  }, [chess, triggerUpdate]);

  return {
    chess,
    selectedSquare,
    gameStatus,
    selectSquare,
    getLegalMoves,
    newGame,
    undoMove,
    makeAIMove,
  };
};
