import React from 'react';
import { Play, RotateCcw, Download, Upload, Settings, Pause } from 'lucide-react';
import type { GameState, GameSettings } from '../types/chess';

interface GameControlsProps {
  gameState: GameState;
  settings: GameSettings;
  onNewGame: () => void;
  onUndo: () => void;
  onExportPGN: () => void;
  onImportPGN: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSettingsChange: (settings: GameSettings) => void;
  showSettings: boolean;
  onShowSettings: (show: boolean) => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  settings,
  onNewGame,
  onUndo,
  onExportPGN,
  onImportPGN,
  onSettingsChange,
  showSettings,
  onShowSettings,
}) => {
  const canUndo = gameState.moveHistory.length > 0 && gameState.gameStatus === 'playing';

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-semibold text-white mb-4">Game Controls</h3>
      
      {/* Main Controls */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onNewGame}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Play size={16} />
          New Game
        </button>
        
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
        >
          <RotateCcw size={16} />
          Undo
        </button>
      </div>

      {/* PGN Controls */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-300">PGN</h4>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onExportPGN}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
          >
            <Download size={14} />
            Export
          </button>
          
          <label className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm">
            <Upload size={14} />
            Import
            <input
              type="file"
              accept=".pgn"
              onChange={onImportPGN}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Settings Toggle */}
      <button
        onClick={() => onShowSettings(!showSettings)}
        className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <Settings size={16} />
        Settings
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div className="space-y-4 border-t border-white/20 pt-4">
          <h4 className="text-sm font-medium text-gray-300">Game Settings</h4>
          
          {/* Game Mode */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Game Mode</label>
            <select
              value={settings.gameMode}
              onChange={(e) => onSettingsChange({
                ...settings,
                gameMode: e.target.value as any
              })}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
            >
              <option value="pvp">Player vs Player</option>
              <option value="ai">Player vs AI</option>
              <option value="online">Online (Coming Soon)</option>
            </select>
          </div>

          {/* AI Level */}
          {settings.gameMode === 'ai' && (
            <div>
              <label className="block text-sm text-gray-300 mb-2">AI Level</label>
              <select
                value={settings.aiLevel}
                onChange={(e) => onSettingsChange({
                  ...settings,
                  aiLevel: parseInt(e.target.value) as any
                })}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
              >
                <option value={1}>Beginner</option>
                <option value={2}>Easy</option>
                <option value={3}>Medium</option>
                <option value={4}>Hard</option>
                <option value={5}>Expert</option>
              </select>
            </div>
          )}

          {/* Time Control */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Time Control</label>
            <select
              value={settings.timeControl.type}
              onChange={(e) => {
                const type = e.target.value as any;
                let minutes = 0;
                let increment = 0;
                
                switch (type) {
                  case 'blitz':
                    minutes = 3;
                    increment = 2;
                    break;
                  case 'rapid':
                    minutes = 10;
                    increment = 0;
                    break;
                  case 'classical':
                    minutes = 30;
                    increment = 0;
                    break;
                }
                
                onSettingsChange({
                  ...settings,
                  timeControl: { type, minutes, increment }
                });
              }}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
            >
              <option value="unlimited">Unlimited</option>
              <option value="blitz">Blitz (3+2)</option>
              <option value="rapid">Rapid (10+0)</option>
              <option value="classical">Classical (30+0)</option>
            </select>
          </div>

          {/* Player Orientation */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Board Orientation</label>
            <select
              value={settings.playerOrientation}
              onChange={(e) => onSettingsChange({
                ...settings,
                playerOrientation: e.target.value as any
              })}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
            >
              <option value="white">White</option>
              <option value="black">Black</option>
            </select>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => onSettingsChange({
                ...settings,
                theme: e.target.value as any
              })}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">Sound Effects</label>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => onSettingsChange({
                ...settings,
                soundEnabled: e.target.checked
              })}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
