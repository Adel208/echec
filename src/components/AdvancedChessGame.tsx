import React, { useRef } from 'react';
import { useAdvancedChess } from '../hooks/useAdvancedChess';
import { SimpleChessBoard } from './SimpleChessBoard';
import { PromotionModal } from './PromotionModal';
import { Download, Upload, RotateCcw, Play, Clock, Trophy, History } from 'lucide-react';

export const AdvancedChessGame: React.FC = () => {
  const {
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
  } = useAdvancedChess();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportPGN = () => {
    const pgn = exportPGN();
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chess-game-${new Date().toISOString().split('T')[0]}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportPGN = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const pgn = e.target?.result as string;
        if (importPGN(pgn)) {
          alert('PGN imported successfully!');
        } else {
          alert('Failed to import PGN. Please check the format.');
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const gameResult = getGameResult();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Trophy className="text-yellow-400" size={40} />
            Advanced Chess Game
          </h1>
          <p className="text-gray-300 text-lg">
            {gameStatus === 'finished' && gameResult
              ? `${gameResult.result} - ${gameResult.reason}`
              : `${chess.turn() === 'w' ? 'White' : 'Black'} to move`
            }
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Game Status & Info */}
          <div className="lg:col-span-1 order-2 lg:order-1 space-y-6">
            {/* Game Status */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Clock size={20} />
                Game Status
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Turn:</span>
                  <span className="text-white font-medium">
                    {chess.turn() === 'w' ? 'White' : 'Black'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Move:</span>
                  <span className="text-white font-medium">
                    {Math.ceil(moveHistory.length / 2)}
                  </span>
                </div>

                {chess.inCheck() && (
                  <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-3">
                    <div className="text-red-200 font-medium flex items-center gap-2">
                      ⚠️ Check!
                    </div>
                  </div>
                )}

                {gameStatus === 'finished' && gameResult && (
                  <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-3">
                    <div className="text-yellow-200 font-medium">
                      🏆 {gameResult.result}
                    </div>
                    <div className="text-yellow-100 text-sm">
                      {gameResult.reason}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Move History */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <History size={20} />
                Move History
              </h3>
              
              <div className="max-h-64 overflow-y-auto">
                {moveHistory.length === 0 ? (
                  <p className="text-gray-400 text-sm">No moves yet</p>
                ) : (
                  <div className="space-y-1">
                    {moveHistory.map((move, index) => {
                      const moveNumber = Math.ceil((index + 1) / 2);
                      const isWhiteMove = index % 2 === 0;
                      
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm hover:bg-white/5 rounded px-2 py-1"
                        >
                          {isWhiteMove && (
                            <span className="text-gray-400 w-8 text-right">
                              {moveNumber}.
                            </span>
                          )}
                          {!isWhiteMove && <span className="w-8"></span>}
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
          </div>

          {/* Chess Board */}
          <div className="lg:col-span-2 order-1 lg:order-2 flex justify-center">
            <SimpleChessBoard
              chess={chess}
              selectedSquare={selectedSquare}
              onSquareClick={selectSquare}
              getLegalMoves={getLegalMoves}
            />
          </div>

          {/* Controls */}
          <div className="lg:col-span-1 order-3 space-y-6">
            {/* Game Controls */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Game Controls</h3>
              
              <div className="space-y-3">
                <button
                  onClick={newGame}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                >
                  <Play size={18} />
                  New Game
                </button>
                
                <button
                  onClick={undoMove}
                  disabled={moveHistory.length === 0 && !promotionState.isPromoting}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors font-medium"
                >
                  <RotateCcw size={18} />
                  Undo Move
                </button>
              </div>
            </div>

            {/* PGN Controls */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">PGN Import/Export</h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleExportPGN}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                >
                  <Download size={18} />
                  Export PGN
                </button>
                
                <label className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors cursor-pointer font-medium">
                  <Upload size={18} />
                  Import PGN
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pgn"
                    onChange={handleImportPGN}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Game Statistics */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Statistics</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Moves:</span>
                  <span className="text-white">{moveHistory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Game Status:</span>
                  <span className="text-white capitalize">{gameStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Current FEN:</span>
                  <span className="text-white text-xs break-all">
                    {chess.fen().split(' ')[0]}...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Promotion Modal */}
        {promotionState.isPromoting && (
          <PromotionModal
            color={promotionState.color}
            onSelect={handlePromotion}
            onCancel={cancelPromotion}
          />
        )}
      </div>
    </div>
  );
};
