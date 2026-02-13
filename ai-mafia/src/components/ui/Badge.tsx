import React from 'react';
import { useTheme } from '../themes/ThemeProvider';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  size?: 'sm' | 'md';
}

export function Badge({ children, color, size = 'sm' }: BadgeProps) {
  const { colors, theme } = useTheme();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        fontSize: size === 'sm' ? '11px' : '13px',
        borderRadius: '100px',
        background: color ? `${color}22` : `${colors.accent}22`,
        color: color || colors.accent,
        border: `1px solid ${color ? `${color}33` : `${colors.accent}33`}`,
        fontWeight: 500,
        fontFamily: theme.fontFamily,
      }}
    >
      {children}
    </span>
  );
}
