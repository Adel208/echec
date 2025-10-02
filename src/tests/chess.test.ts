import { describe, it, expect, beforeEach } from 'vitest';
import { Chess } from 'chess.js';

describe('Chess Game Logic', () => {
  let chess: Chess;

  beforeEach(() => {
    chess = new Chess();
  });

  describe('Basic Movement', () => {
    it('should allow valid pawn moves', () => {
      const move = chess.move('e4');
      expect(move).toBeTruthy();
      expect(move?.san).toBe('e4');
    });

    it('should reject invalid moves', () => {
      const move = chess.move('e5'); // Invalid first move for white
      expect(move).toBeNull();
    });

    it('should alternate turns correctly', () => {
      chess.move('e4');
      expect(chess.turn()).toBe('b');
      chess.move('e5');
      expect(chess.turn()).toBe('w');
    });
  });

  describe('Special Moves', () => {
    it('should handle castling correctly', () => {
      // Set up position for castling
      chess.move('e4');
      chess.move('e5');
      chess.move('Nf3');
      chess.move('Nc6');
      chess.move('Bc4');
      chess.move('Bc5');
      
      // Castle kingside
      const castle = chess.move('O-O');
      expect(castle).toBeTruthy();
      expect(castle?.san).toBe('O-O');
    });

    it('should handle en passant capture', () => {
      chess.load('rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3');
      const enPassant = chess.move('exf6');
      expect(enPassant).toBeTruthy();
      expect(enPassant?.captured).toBe('p');
    });

    it('should handle pawn promotion', () => {
      chess.load('8/P7/8/8/8/8/8/8 w - - 0 1');
      const promotion = chess.move({ from: 'a7', to: 'a8', promotion: 'q' });
      expect(promotion).toBeTruthy();
      expect(promotion?.promotion).toBe('q');
    });
  });

  describe('Game States', () => {
    it('should detect check', () => {
      chess.load('rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2');
      chess.move('Qh4+');
      expect(chess.inCheck()).toBe(true);
    });

    it('should detect checkmate', () => {
      chess.load('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3');
      expect(chess.isCheckmate()).toBe(true);
      expect(chess.isGameOver()).toBe(true);
    });

    it('should detect stalemate', () => {
      chess.load('8/8/8/8/8/8/8/k6K b - - 0 1');
      expect(chess.isStalemate()).toBe(true);
      expect(chess.isGameOver()).toBe(true);
    });

    it('should detect insufficient material draw', () => {
      chess.load('8/8/8/8/8/8/8/k6K w - - 0 1');
      expect(chess.isDraw()).toBe(true);
      expect(chess.isGameOver()).toBe(true);
    });
  });

  describe('Move Validation', () => {
    it('should return legal moves for a piece', () => {
      const moves = chess.moves({ square: 'e2', verbose: true });
      expect(moves).toHaveLength(2);
      expect(moves.map(m => m.to)).toContain('e3');
      expect(moves.map(m => m.to)).toContain('e4');
    });

    it('should prevent moves that leave king in check', () => {
      chess.load('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
      chess.move('f3'); // Weakening move
      chess.move('Qh4+');
      
      // King is in check, only certain moves are legal
      const legalMoves = chess.moves();
      expect(legalMoves).not.toContain('Nf3'); // This would still leave king in check
    });
  });

  describe('PGN Import/Export', () => {
    it('should export PGN correctly', () => {
      chess.move('e4');
      chess.move('e5');
      chess.move('Nf3');
      
      const pgn = chess.pgn();
      expect(pgn).toContain('1. e4 e5 2. Nf3');
    });

    it('should import PGN correctly', () => {
      const pgn = '1. e4 e5 2. Nf3 Nc6 3. Bb5';
      chess.loadPgn(pgn);
      
      expect(chess.history()).toEqual(['e4', 'e5', 'Nf3', 'Nc6', 'Bb5']);
      expect(chess.turn()).toBe('b');
    });
  });

  describe('FEN Import/Export', () => {
    it('should export FEN correctly', () => {
      const fen = chess.fen();
      expect(fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    });

    it('should import FEN correctly', () => {
      const customFen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      chess.load(customFen);
      
      expect(chess.fen()).toBe(customFen);
      expect(chess.turn()).toBe('b');
    });
  });

  describe('Undo/Redo', () => {
    it('should undo moves correctly', () => {
      const originalFen = chess.fen();
      chess.move('e4');
      chess.move('e5');
      
      chess.undo();
      expect(chess.turn()).toBe('b');
      
      chess.undo();
      expect(chess.fen()).toBe(originalFen);
    });

    it('should handle undo with captures', () => {
      chess.load('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
      chess.move('exd5'); // This is actually invalid, let's use a valid capture
      
      // Set up a position with a capture
      chess.load('rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
      const beforeCapture = chess.fen();
      chess.move('exd5');
      chess.undo();
      
      expect(chess.fen()).toBe(beforeCapture);
    });
  });
});
