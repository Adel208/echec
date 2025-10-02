import { useCallback } from 'react';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';

interface AIMove {
  from: Square;
  to: Square;
  promotion?: string;
}

export const useSimpleAI = () => {
  // Simple AI that makes random legal moves
  const getRandomMove = useCallback((chess: Chess): AIMove | null => {
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return null;
    
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    return {
      from: randomMove.from,
      to: randomMove.to,
      promotion: randomMove.promotion,
    };
  }, []);

  // Slightly better AI that prefers captures and checks
  const getSmartMove = useCallback((chess: Chess): AIMove | null => {
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return null;

    // Prioritize moves: checkmate > check > capture > other
    const checkmateMoves = moves.filter(move => {
      const tempChess = new Chess(chess.fen());
      tempChess.move(move);
      return tempChess.isCheckmate();
    });

    if (checkmateMoves.length > 0) {
      const move = checkmateMoves[0];
      return { from: move.from, to: move.to, promotion: move.promotion };
    }

    const checkMoves = moves.filter(move => {
      const tempChess = new Chess(chess.fen());
      tempChess.move(move);
      return tempChess.inCheck();
    });

    if (checkMoves.length > 0) {
      const move = checkMoves[Math.floor(Math.random() * checkMoves.length)];
      return { from: move.from, to: move.to, promotion: move.promotion };
    }

    const captureMoves = moves.filter(move => move.captured);
    if (captureMoves.length > 0) {
      const move = captureMoves[Math.floor(Math.random() * captureMoves.length)];
      return { from: move.from, to: move.to, promotion: move.promotion };
    }

    // If no special moves, make a random move
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    return {
      from: randomMove.from,
      to: randomMove.to,
      promotion: randomMove.promotion,
    };
  }, []);

  // Minimax AI with basic evaluation (more advanced)
  const evaluatePosition = useCallback((chess: Chess): number => {
    if (chess.isCheckmate()) {
      return chess.turn() === 'w' ? -9999 : 9999;
    }
    if (chess.isDraw() || chess.isStalemate()) {
      return 0;
    }

    const pieceValues: { [key: string]: number } = {
      p: 1, n: 3, b: 3, r: 5, q: 9, k: 0
    };

    let evaluation = 0;
    const board = chess.board();

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece) {
          const value = pieceValues[piece.type];
          evaluation += piece.color === 'w' ? value : -value;
        }
      }
    }

    return evaluation;
  }, []);

  const minimax = useCallback((chess: Chess, depth: number, isMaximizing: boolean): number => {
    if (depth === 0 || chess.isGameOver()) {
      return evaluatePosition(chess);
    }

    const moves = chess.moves({ verbose: true });
    
    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const tempChess = new Chess(chess.fen());
        tempChess.move(move);
        const evaluation = minimax(tempChess, depth - 1, false);
        maxEval = Math.max(maxEval, evaluation);
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const tempChess = new Chess(chess.fen());
        tempChess.move(move);
        const evaluation = minimax(tempChess, depth - 1, true);
        minEval = Math.min(minEval, evaluation);
      }
      return minEval;
    }
  }, [evaluatePosition]);

  const getMinimaxMove = useCallback((chess: Chess, depth: number = 2): AIMove | null => {
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return null;

    let bestMove = moves[0];
    let bestValue = -Infinity;

    for (const move of moves) {
      const tempChess = new Chess(chess.fen());
      tempChess.move(move);
      const value = minimax(tempChess, depth - 1, false);
      
      if (value > bestValue) {
        bestValue = value;
        bestMove = move;
      }
    }

    return {
      from: bestMove.from,
      to: bestMove.to,
      promotion: bestMove.promotion,
    };
  }, [minimax]);

  const getAIMove = useCallback((chess: Chess, difficulty: 1 | 2 | 3 | 4 | 5): AIMove | null => {
    switch (difficulty) {
      case 1:
        return getRandomMove(chess);
      case 2:
      case 3:
        return getSmartMove(chess);
      case 4:
        return getMinimaxMove(chess, 2);
      case 5:
        return getMinimaxMove(chess, 3);
      default:
        return getRandomMove(chess);
    }
  }, [getRandomMove, getSmartMove, getMinimaxMove]);

  return {
    getAIMove,
    getRandomMove,
    getSmartMove,
    getMinimaxMove,
  };
};
