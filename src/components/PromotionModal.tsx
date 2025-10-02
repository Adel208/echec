import React from 'react';
import type { PieceSymbol, Color } from 'chess.js';
import { ChessPiece } from './ChessPiece';

interface PromotionModalProps {
  color: Color;
  onSelect: (piece: PieceSymbol) => void;
  onCancel: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  color,
  onSelect,
  onCancel,
}) => {
  const promotionPieces: PieceSymbol[] = ['q', 'r', 'b', 'n'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
          Choose Promotion Piece
        </h3>
        
        <div className="grid grid-cols-4 gap-4 mb-4">
          {promotionPieces.map((piece) => (
            <button
              key={piece}
              onClick={() => onSelect(piece)}
              className="w-16 h-16 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors border-2 hover:border-blue-500"
            >
              <div className="w-12 h-12">
                <ChessPiece
                  piece={{ type: piece, color }}
                  square={'a1' as any}
                  onDragStart={() => {}}
                  onDrop={() => {}}
                  disabled={false}
                />
              </div>
            </button>
          ))}
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
