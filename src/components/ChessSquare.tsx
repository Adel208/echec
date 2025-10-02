import React from 'react';
import type { Square } from 'chess.js';
import { clsx } from 'clsx';

interface ChessSquareProps {
  square: Square;
  isLight: boolean;
  highlight: 'selected' | 'legal-move' | 'legal-capture' | 'last-move' | 'check' | null;
  onClick: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const ChessSquare: React.FC<ChessSquareProps> = ({
  square,
  isLight,
  highlight,
  onClick,
  disabled = false,
  children,
}) => {
  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={clsx(
        'chess-square',
        {
          'light': isLight,
          'dark': !isLight,
          'highlighted': highlight === 'selected',
          'last-move': highlight === 'last-move',
          'legal-move': highlight === 'legal-move',
          'legal-capture': highlight === 'legal-capture',
          'ring-2 ring-red-500 ring-inset': highlight === 'check',
          'cursor-pointer': !disabled,
          'cursor-not-allowed opacity-50': disabled,
        }
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={`Square ${square}${highlight ? ` (${highlight})` : ''}`}
      data-square={square}
    >
      {children}
    </div>
  );
};
