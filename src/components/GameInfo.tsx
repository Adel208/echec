import React from 'react';
import { Clock, User, Crown, AlertTriangle } from 'lucide-react';
import type { GameState, GameSettings, Timer } from '../types/chess';

interface GameInfoProps {
  gameState: GameState;
  timer: Timer;
  settings: GameSettings;
}

const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const getGameStatusText = (gameState: GameState): string => {
  if (gameState.isCheckmate) {
    return `${gameState.currentPlayer === 'w' ? 'Black' : 'White'} wins by checkmate!`;
  }
  if (gameState.isStalemate) {
    return 'Draw by stalemate';
  }
  if (gameState.isDraw) {
    return 'Draw';
  }
  if (gameState.isCheck) {
    return `${gameState.currentPlayer === 'w' ? 'White' : 'Black'} is in check`;
  }
  return `${gameState.currentPlayer === 'w' ? 'White' : 'Black'} to move`;
};

export const GameInfo: React.FC<GameInfoProps> = ({
  gameState,
  timer,
  settings,
}) => {
  return (
    <div className="space-y-6">
      {/* Game Status */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Crown size={20} />
          Game Status
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {gameState.isCheck && <AlertTriangle className="text-red-400" size={16} />}
            <span className="text-gray-300">
              {getGameStatusText(gameState)}
            </span>
          </div>
          
          <div className="text-sm text-gray-400">
            Move: {Math.ceil(gameState.moveHistory.length / 2)}
          </div>
          
          {gameState.gameStatus === 'finished' && (
            <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-3">
              <div className="text-yellow-200 font-medium">
                Game Over
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timer */}
      {settings.timeControl.type !== 'unlimited' && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={20} />
            Timer
          </h3>
          
          <div className="space-y-3">
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              timer.activePlayer === 'w' ? 'bg-blue-600/30 border border-blue-600/50' : 'bg-gray-600/30'
            }`}>
              <span className="text-white font-medium">White</span>
              <span className="text-white font-mono text-lg">
                {formatTime(timer.white)}
              </span>
            </div>
            
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              timer.activePlayer === 'b' ? 'bg-blue-600/30 border border-blue-600/50' : 'bg-gray-600/30'
            }`}>
              <span className="text-white font-medium">Black</span>
              <span className="text-white font-mono text-lg">
                {formatTime(timer.black)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Move History */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Move History</h3>
        
        <div className="max-h-64 overflow-y-auto">
          {gameState.moveHistory.length === 0 ? (
            <p className="text-gray-400 text-sm">No moves yet</p>
          ) : (
            <div className="space-y-1">
              {gameState.moveHistory.map((move, index) => {
                const moveNumber = Math.ceil((index + 1) / 2);
                const isWhiteMove = index % 2 === 0;
                
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm hover:bg-white/5 rounded px-2 py-1"
                  >
                    {isWhiteMove && (
                      <span className="text-gray-400 w-8">
                        {moveNumber}.
                      </span>
                    )}
                    <span className="text-white font-mono">
                      {move}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Captured Pieces */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Captured Pieces</h3>
        
        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-300 mb-2">White captured:</div>
            <div className="flex flex-wrap gap-1">
              {gameState.capturedPieces.white.length === 0 ? (
                <span className="text-gray-500 text-sm">None</span>
              ) : (
                gameState.capturedPieces.white.map((piece, index) => (
                  <span key={index} className="text-white text-lg">
                    {getPieceSymbol(piece, 'b')}
                  </span>
                ))
              )}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-300 mb-2">Black captured:</div>
            <div className="flex flex-wrap gap-1">
              {gameState.capturedPieces.black.length === 0 ? (
                <span className="text-gray-500 text-sm">None</span>
              ) : (
                gameState.capturedPieces.black.map((piece, index) => (
                  <span key={index} className="text-white text-lg">
                    {getPieceSymbol(piece, 'w')}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get piece symbol
const getPieceSymbol = (piece: string, color: 'w' | 'b'): string => {
  const symbols = {
    w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
    b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
  };
  return symbols[color][piece as keyof typeof symbols.w] || piece;
};
