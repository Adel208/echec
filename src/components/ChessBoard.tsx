import React, { useMemo } from 'react';
import type { Square, Color, PieceSymbol } from 'chess.js';
import { ChessSquare } from './ChessSquare';
import { ChessPiece } from './ChessPiece';
import type { GameState } from '../types/chess';

interface ChessBoardProps {
  gameState: GameState;
  orientation: Color;
  onSquareClick: (square: Square) => void;
  onPieceMove: (from: Square, to: Square) => void;
  disabled?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  gameState,
  orientation,
  onSquareClick,
  onPieceMove,
  disabled = false,
}) => {
  const { chess, selectedSquare, legalMoves, lastMove } = gameState;

  // Generate board squares based on orientation
  const squares = useMemo(() => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
    
    const orderedFiles = orientation === 'white' ? files : [...files].reverse();
    const orderedRanks = orientation === 'white' ? [...ranks].reverse() : ranks;
    
    return orderedRanks.map(rank => 
      orderedFiles.map(file => `${file}${rank}` as Square)
    );
  }, [orientation]);

  // Get piece at square
  const getPieceAt = (square: Square) => {
    return chess.get(square);
  };

  // Check if square is highlighted
  const getSquareHighlight = (square: Square) => {
    if (selectedSquare === square) return 'selected';
    if (lastMove && (lastMove.from === square || lastMove.to === square)) return 'last-move';
    if (legalMoves.includes(square)) {
      const piece = getPieceAt(square);
      return piece ? 'legal-capture' : 'legal-move';
    }
    if (gameState.isCheck) {
      const piece = getPieceAt(square);
      if (piece && piece.type === 'k' && piece.color === chess.turn()) {
        return 'check';
      }
    }
    return null;
  };

  // Handle square click
  const handleSquareClick = (square: Square) => {
    if (disabled) return;
    onSquareClick(square);
  };

  // Handle piece drag start
  const handleDragStart = (square: Square) => {
    if (disabled) return;
    const piece = getPieceAt(square);
    if (piece && piece.color === chess.turn()) {
      onSquareClick(square);
    }
  };

  // Handle piece drop
  const handleDrop = (from: Square, to: Square) => {
    if (disabled) return;
    onPieceMove(from, to);
  };

  return (
    <div className="chess-board relative bg-gray-800 p-4 rounded-lg shadow-2xl">
      {/* Rank labels (left side) */}
      <div className="absolute left-1 top-4 h-full flex flex-col justify-around text-gray-300 text-sm font-medium">
        {(orientation === 'white' ? ['8', '7', '6', '5', '4', '3', '2', '1'] : ['1', '2', '3', '4', '5', '6', '7', '8']).map(rank => (
          <div key={rank} className="h-12 flex items-center">
            {rank}
          </div>
        ))}
      </div>

      {/* File labels (bottom) */}
      <div className="absolute bottom-1 left-4 w-full flex justify-around text-gray-300 text-sm font-medium">
        {(orientation === 'white' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']).map(file => (
          <div key={file} className="w-12 text-center">
            {file}
          </div>
        ))}
      </div>

      {/* Chess board grid */}
      <div className="grid grid-cols-8 gap-0 w-96 h-96 border-2 border-gray-600 rounded">
        {squares.flat().map((square, index) => {
          const piece = getPieceAt(square);
          const highlight = getSquareHighlight(square);
          const isLight = (Math.floor(index / 8) + (index % 8)) % 2 === 0;

          return (
            <ChessSquare
              key={square}
              square={square}
              isLight={isLight}
              highlight={highlight}
              onClick={() => handleSquareClick(square)}
              disabled={disabled}
            >
              {piece && (
                <ChessPiece
                  piece={piece}
                  square={square}
                  onDragStart={() => handleDragStart(square)}
                  onDrop={(to) => handleDrop(square, to)}
                  disabled={disabled || piece.color !== chess.turn()}
                />
              )}
            </ChessSquare>
          );
        })}
      </div>

      {/* Game status overlay */}
      {gameState.gameStatus === 'finished' && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <h3 className="text-xl font-bold mb-2">
              {gameState.isCheckmate 
                ? `${gameState.currentPlayer === 'white' ? 'Black' : 'White'} Wins!`
                : gameState.isStalemate
                ? 'Stalemate!'
                : 'Draw!'
              }
            </h3>
            <p className="text-gray-600">
              {gameState.isCheckmate 
                ? 'Checkmate'
                : gameState.isStalemate
                ? 'No legal moves available'
                : 'Game ended in a draw'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
