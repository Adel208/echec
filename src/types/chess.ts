import { Chess } from 'chess.js';
import type { Square, PieceSymbol, Color } from 'chess.js';

export interface GameState {
  chess: Chess;
  gameMode: GameMode;
  currentPlayer: Color;
  gameStatus: GameStatus;
  selectedSquare: Square | null;
  legalMoves: Square[];
  lastMove: { from: Square; to: Square } | null;
  moveHistory: string[];
  capturedPieces: { white: PieceSymbol[]; black: PieceSymbol[] };
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
}

export type GameMode = 'pvp' | 'ai' | 'online';
export type GameStatus = 'waiting' | 'playing' | 'paused' | 'finished';
export type AILevel = 1 | 2 | 3 | 4 | 5;
export type PlayerColor = 'white' | 'black';

export interface GameSettings {
  gameMode: GameMode;
  aiLevel: AILevel;
  timeControl: TimeControl;
  playerOrientation: Color;
  theme: 'light' | 'dark';
  soundEnabled: boolean;
}

export interface TimeControl {
  type: 'unlimited' | 'blitz' | 'rapid' | 'classical';
  minutes: number;
  increment: number; // seconds per move
}

export interface Timer {
  white: number; // milliseconds remaining
  black: number; // milliseconds remaining
  isRunning: boolean;
  activePlayer: Color;
}

export interface MoveData {
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
  san: string;
  timestamp: number;
}

export interface GameResult {
  winner: Color | 'draw';
  reason: 'checkmate' | 'stalemate' | 'timeout' | 'resignation' | 'draw-agreement' | 'insufficient-material';
  moves: MoveData[];
  pgn: string;
  duration: number; // in milliseconds
}

export interface PiecePosition {
  square: Square;
  piece: {
    type: PieceSymbol;
    color: Color;
  };
}

export interface SquareHighlight {
  square: Square;
  type: 'selected' | 'legal-move' | 'legal-capture' | 'last-move' | 'check';
}

export interface PromotionChoice {
  square: Square;
  pieces: PieceSymbol[];
  onSelect: (piece: PieceSymbol) => void;
  onCancel: () => void;
}
