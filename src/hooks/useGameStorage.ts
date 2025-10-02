import { useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';

interface GameData {
  fen: string;
  moveHistory: string[];
  gameMode: 'pvp' | 'ai';
  aiLevel: number;
  timestamp: number;
}

export const useGameStorage = () => {
  const STORAGE_KEY = 'chess-game-save';

  const saveGame = useCallback((
    chess: Chess,
    moveHistory: string[],
    gameMode: 'pvp' | 'ai',
    aiLevel: number
  ) => {
    const gameData: GameData = {
      fen: chess.fen(),
      moveHistory,
      gameMode,
      aiLevel,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameData));
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }, []);

  const loadGame = useCallback((): GameData | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;

      const gameData: GameData = JSON.parse(saved);
      
      // Validate the data
      if (!gameData.fen || !Array.isArray(gameData.moveHistory)) {
        return null;
      }

      // Check if save is not too old (24 hours)
      const dayInMs = 24 * 60 * 60 * 1000;
      if (Date.now() - gameData.timestamp > dayInMs) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return gameData;
    } catch (error) {
      console.error('Failed to load game:', error);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }, []);

  const clearSavedGame = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const hasSavedGame = useCallback((): boolean => {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }, []);

  return {
    saveGame,
    loadGame,
    clearSavedGame,
    hasSavedGame,
  };
};
