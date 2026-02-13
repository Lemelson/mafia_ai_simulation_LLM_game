import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../themes/ThemeProvider';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = '600px' }: ModalProps) {
  const { colors, theme } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: colors.bgCard,
              borderRadius: theme.borderRadius,
              border: `1px solid ${colors.border}`,
              boxShadow: colors.shadow,
              maxWidth,
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
          >
            {title && (
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: `1px solid ${colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <h2 style={{ margin: 0, fontSize: '20px', color: colors.textPrimary }}>
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.textMuted,
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '0 4px',
                  }}
                >
                  ✕
                </button>
              </div>
            )}
            <div style={{ padding: '24px' }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
