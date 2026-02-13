import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { useTheme } from '../themes/ThemeProvider';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export function Button({
  children, variant = 'primary', size = 'md', icon, className = '', ...props
}: ButtonProps) {
  const { colors, theme } = useTheme();

  const baseStyle: React.CSSProperties = {
    borderRadius: theme.borderRadius,
    fontFamily: theme.fontFamily,
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    opacity: props.disabled ? 0.5 : 1,
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '6px 12px', fontSize: '13px' },
    md: { padding: '10px 20px', fontSize: '15px' },
    lg: { padding: '14px 28px', fontSize: '17px' },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: colors.accent,
      color: colors.accentText,
    },
    secondary: {
      background: colors.bgSecondary,
      color: colors.textPrimary,
      border: `1px solid ${colors.border}`,
    },
    danger: {
      background: colors.danger,
      color: '#fff',
    },
    ghost: {
      background: 'transparent',
      color: colors.textSecondary,
    },
  };

  return (
    <motion.button
      whileHover={props.disabled ? {} : { scale: 1.02 }}
      whileTap={props.disabled ? {} : { scale: 0.98 }}
      style={{
        ...baseStyle,
        ...sizeStyles[size],
        ...variantStyles[variant],
      }}
      className={className}
      {...props}
    >
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </motion.button>
  );
}
