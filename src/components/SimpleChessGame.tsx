import React from 'react';
import { useSimpleChess } from '../hooks/useSimpleChess';
import { SimpleChessBoard } from './SimpleChessBoard';

export const SimpleChessGame: React.FC = () => {
  const { chess, selectedSquare, gameStatus, selectSquare, getLegalMoves, newGame, undoMove } = useSimpleChess();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Chess Game
          </h1>
          <p className="text-gray-300">
            {gameStatus === 'finished' 
              ? chess.isCheckmate() 
                ? `${chess.turn() === 'w' ? 'Black' : 'White'} wins!`
                : 'Game ended'
              : `${chess.turn() === 'w' ? 'White' : 'Black'} to move`
            }
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Chess Board */}
          <div className="flex-1 flex justify-center">
            <SimpleChessBoard
              chess={chess}
              selectedSquare={selectedSquare}
              onSquareClick={selectSquare}
              getLegalMoves={getLegalMoves}
            />
          </div>

          {/* Controls */}
          <div className="w-full lg:w-64 bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Controls</h3>
            
            <div className="space-y-3">
              <button
                onClick={newGame}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                New Game
              </button>
              
              <button
                onClick={undoMove}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Undo Move
              </button>
            </div>

            {/* Game Info */}
            <div className="mt-6 space-y-3">
              <div className="text-white">
                <div className="text-sm text-gray-300 mb-2">Move History</div>
                <div className="max-h-32 overflow-y-auto text-sm">
                  {chess.history().length === 0 ? (
                    <p className="text-gray-400">No moves yet</p>
                  ) : (
                    chess.history().map((move, index) => (
                      <div key={index} className="text-white">
                        {Math.ceil((index + 1) / 2)}.{index % 2 === 0 ? '' : '..'} {move}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {chess.inCheck() && (
                <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-3">
                  <div className="text-red-200 font-medium">
                    Check!
                  </div>
                </div>
              )}

              {gameStatus === 'finished' && (
                <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-3">
                  <div className="text-yellow-200 font-medium">
                    Game Over
                  </div>
                  <div className="text-yellow-100 text-sm">
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
    </div>
  );
};
