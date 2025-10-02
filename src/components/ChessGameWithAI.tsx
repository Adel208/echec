import React, { useRef, useState, useEffect } from 'react';
import { useAdvancedChess } from '../hooks/useAdvancedChess';
import { useSimpleAI } from '../hooks/useSimpleAI';
import { SimpleChessBoard } from './SimpleChessBoard';
import { PromotionModal } from './PromotionModal';
import { Download, Upload, RotateCcw, Play, Clock, Trophy, History, Bot, User, Settings } from 'lucide-react';

type GameMode = 'pvp' | 'ai';
type AILevel = 1 | 2 | 3 | 4 | 5;

export const ChessGameWithAI: React.FC = () => {
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

  const { getAIMove } = useSimpleAI();
  
  const [gameMode, setGameMode] = useState<GameMode>('pvp');
  const [aiLevel, setAILevel] = useState<AILevel>(3);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI move logic
  useEffect(() => {
    if (gameMode === 'ai' && chess.turn() === 'b' && gameStatus === 'playing' && !promotionState.isPromoting) {
      setIsAIThinking(true);
      
      // Add delay to simulate thinking
      const timeout = setTimeout(() => {
        const aiMove = getAIMove(chess, aiLevel);
        if (aiMove) {
          try {
            chess.move({
              from: aiMove.from,
              to: aiMove.to,
              promotion: aiMove.promotion as any,
            });
            // Force re-render by updating move history
            setIsAIThinking(false);
          } catch (error) {
            console.error('AI move failed:', error);
            setIsAIThinking(false);
          }
        } else {
          setIsAIThinking(false);
        }
      }, Math.random() * 1000 + 500); // 0.5-1.5 seconds

      return () => clearTimeout(timeout);
    }
  }, [chess, gameMode, aiLevel, gameStatus, promotionState.isPromoting, getAIMove, moveHistory.length]);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNewGame = () => {
    newGame();
    setIsAIThinking(false);
  };

  const gameResult = getGameResult();
  const currentPlayerName = chess.turn() === 'w' ? 'White' : 'Black';
  const isPlayerTurn = gameMode === 'pvp' || chess.turn() === 'w';

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Trophy className="text-yellow-400" size={40} />
            Chess Game with AI
          </h1>
          <p className="text-gray-300 text-lg">
            {gameStatus === 'finished' && gameResult
              ? `${gameResult.result} - ${gameResult.reason}`
              : isAIThinking
              ? '🤖 AI is thinking...'
              : `${currentPlayerName} to move ${gameMode === 'ai' && chess.turn() === 'b' ? '(AI)' : ''}`
            }
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Game Status & Info */}
          <div className="lg:col-span-1 order-2 lg:order-1 space-y-6">
            {/* Game Mode & Settings */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Settings size={20} />
                Game Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Game Mode</label>
                  <select
                    value={gameMode}
                    onChange={(e) => setGameMode(e.target.value as GameMode)}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="pvp">Player vs Player</option>
                    <option value="ai">Player vs AI</option>
                  </select>
                </div>

                {gameMode === 'ai' && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">AI Difficulty</label>
                    <select
                      value={aiLevel}
                      onChange={(e) => setAILevel(parseInt(e.target.value) as AILevel)}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                    >
                      <option value={1}>Beginner (Random)</option>
                      <option value={2}>Easy</option>
                      <option value={3}>Medium</option>
                      <option value={4}>Hard</option>
                      <option value={5}>Expert</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Game Status */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Clock size={20} />
                Game Status
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Mode:</span>
                  <span className="text-white font-medium flex items-center gap-1">
                    {gameMode === 'pvp' ? (
                      <>
                        <User size={16} />
                        vs
                        <User size={16} />
                      </>
                    ) : (
                      <>
                        <User size={16} />
                        vs
                        <Bot size={16} />
                      </>
                    )}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Turn:</span>
                  <span className="text-white font-medium">
                    {currentPlayerName}
                    {gameMode === 'ai' && chess.turn() === 'b' && ' (AI)'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Move:</span>
                  <span className="text-white font-medium">
                    {Math.ceil(moveHistory.length / 2)}
                  </span>
                </div>

                {isAIThinking && (
                  <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-3">
                    <div className="text-blue-200 font-medium flex items-center gap-2">
                      <Bot size={16} className="animate-pulse" />
                      AI is thinking...
                    </div>
                  </div>
                )}

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
              onSquareClick={isPlayerTurn && !isAIThinking ? selectSquare : () => {}}
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
                  onClick={handleNewGame}
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
                {gameMode === 'ai' && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">AI Level:</span>
                    <span className="text-white">{aiLevel}/5</span>
                  </div>
                )}
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
