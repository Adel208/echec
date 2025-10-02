import { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import type { Square, PieceSymbol, Color } from 'chess.js';
import type { GameState, GameSettings, Timer } from '../types/chess';

const DEFAULT_SETTINGS: GameSettings = {
  gameMode: 'pvp',
  aiLevel: 3,
  timeControl: { type: 'unlimited', minutes: 0, increment: 0 },
  playerOrientation: 'w',
  theme: 'light',
  soundEnabled: true,
};

export const useChessGame = (initialSettings: Partial<GameSettings> = {}) => {
  const [settings, setSettings] = useState<GameSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });

  const [gameState, setGameState] = useState<GameState>(() => {
    const chess = new Chess();
    return {
      chess,
      gameMode: settings.gameMode,
      currentPlayer: chess.turn(),
      gameStatus: 'waiting',
      selectedSquare: null,
      legalMoves: [],
      lastMove: null,
      moveHistory: [],
      capturedPieces: { white: [], black: [] },
      isCheck: chess.inCheck(),
      isCheckmate: chess.isCheckmate(),
      isStalemate: chess.isStalemate(),
      isDraw: chess.isDraw(),
    };
  });

  const [timer, setTimer] = useState<Timer>(() => ({
    white: settings.timeControl.minutes * 60 * 1000,
    black: settings.timeControl.minutes * 60 * 1000,
    isRunning: false,
    activePlayer: 'w',
  }));

  // Save game state to localStorage
  const saveGame = useCallback(() => {
    const gameData = {
      fen: gameState.chess.fen(),
      moveHistory: gameState.moveHistory,
      settings,
      timer,
    };
    localStorage.setItem('chess-game', JSON.stringify(gameData));
  }, [gameState.chess, gameState.moveHistory, settings, timer]);

  // Load game state from localStorage
  const loadGame = useCallback(() => {
    const savedGame = localStorage.getItem('chess-game');
    if (savedGame) {
      try {
        const gameData = JSON.parse(savedGame);
        const chess = new Chess(gameData.fen);
        
        setGameState(prev => ({
          ...prev,
          chess,
          moveHistory: gameData.moveHistory || [],
          currentPlayer: chess.turn(),
          isCheck: chess.inCheck(),
          isCheckmate: chess.isCheckmate(),
          isStalemate: chess.isStalemate(),
          isDraw: chess.isDraw(),
        }));
        
        if (gameData.settings) {
          setSettings(gameData.settings);
        }
        
        if (gameData.timer) {
          setTimer(gameData.timer);
        }
        
        return true;
      } catch (error) {
        console.error('Failed to load saved game:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Start new game
  const startNewGame = useCallback(() => {
    const chess = new Chess();
    setGameState(prev => ({
      ...prev,
      chess,
      currentPlayer: chess.turn(),
      gameStatus: 'playing',
      selectedSquare: null,
      legalMoves: [],
      lastMove: null,
      moveHistory: [],
      capturedPieces: { white: [], black: [] },
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      isDraw: false,
    }));

    setTimer({
      white: settings.timeControl.minutes * 60 * 1000,
      black: settings.timeControl.minutes * 60 * 1000,
      isRunning: settings.timeControl.type !== 'unlimited',
      activePlayer: 'w',
    });

    localStorage.removeItem('chess-game');
  }, [settings.timeControl]);

  // Select square
  const selectSquare = useCallback((square: Square) => {
    setGameState(prev => {
      const { chess, selectedSquare } = prev;
      
      // If no square is selected, select this square if it has a piece of the current player
      if (!selectedSquare) {
        const piece = chess.get(square);
        if (piece && piece.color === chess.turn()) {
          const moves = chess.moves({ square, verbose: true });
          return {
            ...prev,
            selectedSquare: square,
            legalMoves: moves.map(move => move.to),
          };
        }
        return prev;
      }

      // If the same square is selected, deselect it
      if (selectedSquare === square) {
        return {
          ...prev,
          selectedSquare: null,
          legalMoves: [],
        };
      }

      // If a different square is selected, try to make a move
      const piece = chess.get(selectedSquare);
      if (piece && piece.color === chess.turn()) {
        const moves = chess.moves({ square: selectedSquare, verbose: true });
        const targetMove = moves.find(move => move.to === square);
        
        if (targetMove) {
          // Make the move
          return makeMove(selectedSquare, square);
        } else {
          // Select new square if it has a piece of the current player
          const newPiece = chess.get(square);
          if (newPiece && newPiece.color === chess.turn()) {
            const newMoves = chess.moves({ square, verbose: true });
            return {
              ...prev,
              selectedSquare: square,
              legalMoves: newMoves.map(move => move.to),
            };
          }
        }
      }

      // Deselect if no valid move
      return {
        ...prev,
        selectedSquare: null,
        legalMoves: [],
      };
    });
  }, []);

  // Make move
  const makeMove = useCallback((from: Square, to: Square, promotion?: PieceSymbol) => {
    setGameState(prev => {
      const { chess } = prev;
      
      try {
        const moveOptions: any = { from, to };
        if (promotion) {
          moveOptions.promotion = promotion;
        }

        const move = chess.move(moveOptions);
        if (!move) return prev;

        // Update captured pieces
        const newCapturedPieces = { ...prev.capturedPieces };
        if (move.captured) {
          const capturedColor = move.color === 'w' ? 'black' : 'white';
          newCapturedPieces[capturedColor].push(move.captured as PieceSymbol);
        }

        const newState = {
          ...prev,
          chess: new Chess(chess.fen()),
          currentPlayer: chess.turn(),
          selectedSquare: null,
          legalMoves: [],
          lastMove: { from, to },
          moveHistory: [...prev.moveHistory, move.san],
          capturedPieces: newCapturedPieces,
          isCheck: chess.inCheck(),
          isCheckmate: chess.isCheckmate(),
          isStalemate: chess.isStalemate(),
          isDraw: chess.isDraw(),
        };

        // Update game status
        if (chess.isCheckmate() || chess.isStalemate() || chess.isDraw()) {
          newState.gameStatus = 'finished';
        }

        return newState;
      } catch (error) {
        console.error('Invalid move:', error);
        return prev;
      }
    });

    // Update timer
    if (settings.timeControl.type !== 'unlimited') {
      setTimer(prev => ({
        ...prev,
        activePlayer: prev.activePlayer === 'white' ? 'black' : 'white',
        [prev.activePlayer]: prev[prev.activePlayer] + (settings.timeControl.increment * 1000),
      }));
    }
  }, [settings.timeControl]);

  // Undo last move
  const undoMove = useCallback(() => {
    setGameState(prev => {
      const { chess } = prev;
      const undoResult = chess.undo();
      
      if (undoResult) {
        // Update captured pieces
        const newCapturedPieces = { ...prev.capturedPieces };
        if (undoResult.captured) {
          const capturedColor = undoResult.color === 'w' ? 'black' : 'white';
          const pieceIndex = newCapturedPieces[capturedColor].indexOf(undoResult.captured as PieceSymbol);
          if (pieceIndex > -1) {
            newCapturedPieces[capturedColor].splice(pieceIndex, 1);
          }
        }

        return {
          ...prev,
          chess: new Chess(chess.fen()),
          currentPlayer: chess.turn(),
          selectedSquare: null,
          legalMoves: [],
          lastMove: null,
          moveHistory: prev.moveHistory.slice(0, -1),
          capturedPieces: newCapturedPieces,
          isCheck: chess.inCheck(),
          isCheckmate: chess.isCheckmate(),
          isStalemate: chess.isStalemate(),
          isDraw: chess.isDraw(),
          gameStatus: 'playing',
        };
      }
      
      return prev;
    });
  }, []);

  // Get PGN
  const getPGN = useCallback(() => {
    return gameState.chess.pgn();
  }, [gameState.chess]);

  // Load PGN
  const loadPGN = useCallback((pgn: string) => {
    try {
      const chess = new Chess();
      chess.loadPgn(pgn);
      
      setGameState(prev => ({
        ...prev,
        chess,
        currentPlayer: chess.turn(),
        selectedSquare: null,
        legalMoves: [],
        lastMove: null,
        moveHistory: chess.history(),
        isCheck: chess.inCheck(),
        isCheckmate: chess.isCheckmate(),
        isStalemate: chess.isStalemate(),
        isDraw: chess.isDraw(),
        gameStatus: chess.isGameOver() ? 'finished' : 'playing',
      }));
      
      return true;
    } catch (error) {
      console.error('Failed to load PGN:', error);
      return false;
    }
  }, []);

  // Auto-save game state
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && gameState.moveHistory.length > 0) {
      saveGame();
    }
  }, [gameState.moveHistory, saveGame]);

  return {
    gameState,
    settings,
    timer,
    setSettings,
    startNewGame,
    loadGame,
    selectSquare,
    makeMove,
    undoMove,
    getPGN,
    loadPGN,
    saveGame,
  };
};
