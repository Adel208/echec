import { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import type { Square, Color, PieceSymbol } from 'chess.js';

interface PromotionState {
  isPromoting: boolean;
  from: Square | null;
  to: Square | null;
  color: Color;
}

export const useAdvancedChess = () => {
  const [chess] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'finished'>('playing');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [promotionState, setPromotionState] = useState<PromotionState>({
    isPromoting: false,
    from: null,
    to: null,
    color: 'w',
  });

  // Update move history when game state changes
  useEffect(() => {
    setMoveHistory(chess.history());
  }, [chess]);

  const checkForPromotion = useCallback((from: Square, to: Square): boolean => {
    const piece = chess.get(from);
    if (!piece || piece.type !== 'p') return false;
    
    const toRank = parseInt(to[1]);
    return (piece.color === 'w' && toRank === 8) || (piece.color === 'b' && toRank === 1);
  }, [chess]);

  const selectSquare = useCallback((square: Square) => {
    if (promotionState.isPromoting) return;

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
      // Check if this would be a promotion move
      if (checkForPromotion(selectedSquare, square)) {
        const piece = chess.get(selectedSquare);
        if (piece) {
          setPromotionState({
            isPromoting: true,
            from: selectedSquare,
            to: square,
            color: piece.color,
          });
        }
        return;
      }

      // Try to make move
      try {
        const move = chess.move({ from: selectedSquare, to: square });
        if (move) {
          setSelectedSquare(null);
          if (chess.isGameOver()) {
            setGameStatus('finished');
          }
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
  }, [chess, selectedSquare, promotionState.isPromoting, checkForPromotion]);

  const handlePromotion = useCallback((piece: PieceSymbol) => {
    if (!promotionState.from || !promotionState.to) return;

    try {
      const move = chess.move({
        from: promotionState.from,
        to: promotionState.to,
        promotion: piece,
      });

      if (move) {
        setSelectedSquare(null);
        setPromotionState({
          isPromoting: false,
          from: null,
          to: null,
          color: 'w',
        });

        if (chess.isGameOver()) {
          setGameStatus('finished');
        }
      }
    } catch (error) {
      console.error('Promotion failed:', error);
    }
  }, [chess, promotionState]);

  const cancelPromotion = useCallback(() => {
    setPromotionState({
      isPromoting: false,
      from: null,
      to: null,
      color: 'w',
    });
    setSelectedSquare(null);
  }, []);

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
    setPromotionState({
      isPromoting: false,
      from: null,
      to: null,
      color: 'w',
    });
  }, [chess]);

  const undoMove = useCallback(() => {
    if (promotionState.isPromoting) {
      cancelPromotion();
      return;
    }
    
    chess.undo();
    setSelectedSquare(null);
    if (gameStatus === 'finished') {
      setGameStatus('playing');
    }
  }, [chess, gameStatus, promotionState.isPromoting, cancelPromotion]);

  const exportPGN = useCallback(() => {
    return chess.pgn();
  }, [chess]);

  const importPGN = useCallback((pgn: string): boolean => {
    try {
      const newChess = new Chess();
      newChess.loadPgn(pgn);
      
      // Copy the position to our chess instance
      chess.load(newChess.fen());
      setSelectedSquare(null);
      setGameStatus(chess.isGameOver() ? 'finished' : 'playing');
      setPromotionState({
        isPromoting: false,
        from: null,
        to: null,
        color: 'w',
      });
      
      return true;
    } catch (error) {
      console.error('Failed to import PGN:', error);
      return false;
    }
  }, [chess]);

  const getGameResult = useCallback(() => {
    if (!chess.isGameOver()) return null;
    
    if (chess.isCheckmate()) {
      return {
        result: chess.turn() === 'w' ? 'Black wins' : 'White wins',
        reason: 'Checkmate',
      };
    } else if (chess.isStalemate()) {
      return {
        result: 'Draw',
        reason: 'Stalemate',
      };
    } else if (chess.isDraw()) {
      return {
        result: 'Draw',
        reason: 'Draw by repetition or insufficient material',
      };
    }
    
    return {
      result: 'Draw',
      reason: 'Game ended',
    };
  }, [chess]);

  return {
    chess,
    selectedSquare,
    gameStatus,
    moveHistory,
    promotionState,
    selectSquare,
    getLegalMoves,
    newGame,
    undoMove,
    handlePromotion,
    cancelPromotion,
    exportPGN,
    importPGN,
    getGameResult,
  };
};
