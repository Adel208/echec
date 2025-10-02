import React from 'react';
import type { Chess, Square } from 'chess.js';
import { ChessSquare } from './ChessSquare';
import { ChessPiece } from './ChessPiece';

interface SimpleChessBoardProps {
  chess: Chess;
  selectedSquare: Square | null;
  onSquareClick: (square: Square) => void;
  getLegalMoves: (square: Square) => Square[];
}

export const SimpleChessBoard: React.FC<SimpleChessBoardProps> = ({
  chess,
  selectedSquare,
  onSquareClick,
  getLegalMoves,
}) => {
  // Generate board squares
  const squares: Square[] = [];
  for (let rank = 8; rank >= 1; rank--) {
    for (let file = 0; file < 8; file++) {
      const square = `${String.fromCharCode(97 + file)}${rank}` as Square;
      squares.push(square);
    }
  }

  const legalMoves = selectedSquare ? getLegalMoves(selectedSquare) : [];

  // Get square highlight type
  const getSquareHighlight = (square: Square) => {
    if (selectedSquare === square) return 'selected';
    if (legalMoves.includes(square)) {
      const piece = chess.get(square);
      return piece ? 'legal-capture' : 'legal-move';
    }
    if (chess.inCheck()) {
      const piece = chess.get(square);
      if (piece && piece.type === 'k' && piece.color === chess.turn()) {
        return 'check';
      }
    }
    return null;
  };

  return (
    <div className="chess-board relative bg-gray-800 p-4 rounded-lg shadow-2xl">
      {/* Rank labels (left side) */}
      <div className="absolute left-1 top-4 h-full flex flex-col justify-around text-gray-300 text-sm font-medium">
        {['8', '7', '6', '5', '4', '3', '2', '1'].map(rank => (
          <div key={rank} className="h-12 flex items-center">
            {rank}
          </div>
        ))}
      </div>

      {/* File labels (bottom) */}
      <div className="absolute bottom-1 left-4 w-full flex justify-around text-gray-300 text-sm font-medium">
        {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(file => (
          <div key={file} className="w-12 text-center">
            {file}
          </div>
        ))}
      </div>

      {/* Chess board grid */}
      <div className="grid grid-cols-8 gap-0 w-96 h-96 border-2 border-gray-600 rounded">
        {squares.map((square, index) => {
          const piece = chess.get(square);
          const highlight = getSquareHighlight(square);
          const isLight = (Math.floor(index / 8) + (index % 8)) % 2 === 0;

          return (
            <ChessSquare
              key={square}
              square={square}
              isLight={isLight}
              highlight={highlight}
              onClick={() => onSquareClick(square)}
            >
              {piece && (
                <ChessPiece
                  piece={piece}
                  square={square}
                  onDragStart={() => onSquareClick(square)}
                  onDrop={() => {}} // Not used in simple version
                  disabled={piece.color !== chess.turn()}
                />
              )}
            </ChessSquare>
          );
        })}
      </div>
    </div>
  );
};
