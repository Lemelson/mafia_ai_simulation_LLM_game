export interface ThemeColors {
  // Base
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  bgInput: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;

  // Accents
  accent: string;
  accentHover: string;
  accentText: string;

  // Game-specific
  tableDay: string;
  tableNight: string;
  tableBorder: string;
  chatBg: string;
  chatMessageBg: string;
  systemMessageBg: string;

  // Status
  danger: string;
  success: string;
  warning: string;

  // Shadows & effects
  glow: string;
  shadow: string;

  // Night overlay
  nightOverlay: string;
  dayOverlay: string;
}

export interface Theme {
  id: string;
  name: string;
  emoji: string;
  description: string;
  day: ThemeColors;
  night: ThemeColors;
  fontFamily: string;
  borderRadius: string;
  tableSurface: string; // CSS gradient or color for the table
}

export const THEMES: Theme[] = [
  // 1. Classic Noir
  {
    id: 'noir',
    name: 'Нуар',
    emoji: '🎬',
    description: 'Тёмный гангстерский стиль 20-х годов',
    fontFamily: "'Georgia', serif",
    borderRadius: '8px',
    tableSurface: 'radial-gradient(ellipse, #1a3a2a 0%, #0d1f16 100%)',
    day: {
      bgPrimary: '#1a1a2e',
      bgSecondary: '#16213e',
      bgCard: '#1a1a2e',
      bgInput: '#0f3460',
      textPrimary: '#e0c097',
      textSecondary: '#b8860b',
      textMuted: '#8b7355',
      border: '#b8860b33',
      accent: '#daa520',
      accentHover: '#ffd700',
      accentText: '#1a1a2e',
      tableDay: 'radial-gradient(ellipse, #2d4a3e 0%, #1a2f25 100%)',
      tableNight: 'radial-gradient(ellipse, #1a3a2a 0%, #0d1f16 100%)',
      tableBorder: '#b8860b55',
      chatBg: '#0f0f23',
      chatMessageBg: '#1a1a2e',
      systemMessageBg: '#16213e',
      danger: '#dc3545',
      success: '#28a745',
      warning: '#ffc107',
      glow: '#daa52066',
      shadow: '0 4px 20px rgba(0,0,0,0.5)',
      nightOverlay: 'rgba(5, 5, 20, 0.3)',
      dayOverlay: 'rgba(218, 165, 32, 0.05)',
    },
    night: {
      bgPrimary: '#0a0a1a',
      bgSecondary: '#0f0f28',
      bgCard: '#12122a',
      bgInput: '#0a1a3a',
      textPrimary: '#c0a070',
      textSecondary: '#8b7355',
      textMuted: '#5a4a35',
      border: '#8b735522',
      accent: '#b8860b',
      accentHover: '#daa520',
      accentText: '#0a0a1a',
      tableDay: 'radial-gradient(ellipse, #2d4a3e 0%, #1a2f25 100%)',
      tableNight: 'radial-gradient(ellipse, #0d1f16 0%, #050f0a 100%)',
      tableBorder: '#8b735533',
      chatBg: '#080818',
      chatMessageBg: '#12122a',
      systemMessageBg: '#0f0f28',
      danger: '#dc3545',
      success: '#28a745',
      warning: '#ffc107',
      glow: '#b8860b44',
      shadow: '0 4px 20px rgba(0,0,0,0.7)',
      nightOverlay: 'rgba(0, 0, 10, 0.5)',
      dayOverlay: 'rgba(218, 165, 32, 0.03)',
    },
  },

  // 2. Cyberpunk Neon
  {
    id: 'cyberpunk',
    name: 'Киберпанк',
    emoji: '🌃',
    description: 'Неоновые огни ночного города',
    fontFamily: "'Segoe UI', sans-serif",
    borderRadius: '4px',
    tableSurface: 'radial-gradient(ellipse, #1a0533 0%, #0d0019 100%)',
    day: {
      bgPrimary: '#0d0221',
      bgSecondary: '#150535',
      bgCard: '#1a0640',
      bgInput: '#200a4a',
      textPrimary: '#e0e0ff',
      textSecondary: '#00d4ff',
      textMuted: '#6b5b95',
      border: '#ff00ff33',
      accent: '#ff00ff',
      accentHover: '#ff44ff',
      accentText: '#ffffff',
      tableDay: 'radial-gradient(ellipse, #1a1040 0%, #0d0525 100%)',
      tableNight: 'radial-gradient(ellipse, #0d0019 0%, #050010 100%)',
      tableBorder: '#ff00ff44',
      chatBg: '#0a0118',
      chatMessageBg: '#150530',
      systemMessageBg: '#1a0640',
      danger: '#ff0055',
      success: '#00ff88',
      warning: '#ffaa00',
      glow: '#ff00ff55',
      shadow: '0 0 30px rgba(255, 0, 255, 0.2)',
      nightOverlay: 'rgba(13, 0, 25, 0.3)',
      dayOverlay: 'rgba(0, 212, 255, 0.05)',
    },
    night: {
      bgPrimary: '#050010',
      bgSecondary: '#0a001a',
      bgCard: '#0f0025',
      bgInput: '#15003a',
      textPrimary: '#c0c0ff',
      textSecondary: '#0099cc',
      textMuted: '#4a3a7a',
      border: '#ff00ff22',
      accent: '#cc00cc',
      accentHover: '#ff00ff',
      accentText: '#ffffff',
      tableDay: 'radial-gradient(ellipse, #1a1040 0%, #0d0525 100%)',
      tableNight: 'radial-gradient(ellipse, #050010 0%, #020008 100%)',
      tableBorder: '#cc00cc33',
      chatBg: '#030008',
      chatMessageBg: '#0a0020',
      systemMessageBg: '#0f0025',
      danger: '#ff0055',
      success: '#00ff88',
      warning: '#ffaa00',
      glow: '#cc00cc44',
      shadow: '0 0 30px rgba(200, 0, 200, 0.3)',
      nightOverlay: 'rgba(5, 0, 15, 0.5)',
      dayOverlay: 'rgba(0, 150, 255, 0.03)',
    },
  },

  // 3. Classic Mafia (Green Felt / Casino)
  {
    id: 'classic',
    name: 'Казино',
    emoji: '🎰',
    description: 'Классический зелёный стол, стиль казино',
    fontFamily: "'Verdana', sans-serif",
    borderRadius: '12px',
    tableSurface: 'radial-gradient(ellipse, #2d5a27 0%, #1a3a18 100%)',
    day: {
      bgPrimary: '#1c2833',
      bgSecondary: '#212f3d',
      bgCard: '#273746',
      bgInput: '#2e4053',
      textPrimary: '#ecf0f1',
      textSecondary: '#27ae60',
      textMuted: '#7f8c8d',
      border: '#27ae6033',
      accent: '#27ae60',
      accentHover: '#2ecc71',
      accentText: '#ffffff',
      tableDay: 'radial-gradient(ellipse, #35654d 0%, #1e3b2c 100%)',
      tableNight: 'radial-gradient(ellipse, #1a3a2a 0%, #0d1f16 100%)',
      tableBorder: '#27ae6044',
      chatBg: '#17202a',
      chatMessageBg: '#1c2833',
      systemMessageBg: '#212f3d',
      danger: '#e74c3c',
      success: '#2ecc71',
      warning: '#f39c12',
      glow: '#2ecc7155',
      shadow: '0 4px 15px rgba(0,0,0,0.4)',
      nightOverlay: 'rgba(10, 15, 20, 0.3)',
      dayOverlay: 'rgba(39, 174, 96, 0.05)',
    },
    night: {
      bgPrimary: '#0e1520',
      bgSecondary: '#131d2a',
      bgCard: '#182635',
      bgInput: '#1e3040',
      textPrimary: '#d5dbdb',
      textSecondary: '#1e8449',
      textMuted: '#5d6d7e',
      border: '#1e844922',
      accent: '#1e8449',
      accentHover: '#27ae60',
      accentText: '#ffffff',
      tableDay: 'radial-gradient(ellipse, #35654d 0%, #1e3b2c 100%)',
      tableNight: 'radial-gradient(ellipse, #0d1f16 0%, #060f0a 100%)',
      tableBorder: '#1e844933',
      chatBg: '#0a1018',
      chatMessageBg: '#0e1520',
      systemMessageBg: '#131d2a',
      danger: '#e74c3c',
      success: '#2ecc71',
      warning: '#f39c12',
      glow: '#1e844944',
      shadow: '0 4px 15px rgba(0,0,0,0.6)',
      nightOverlay: 'rgba(5, 8, 12, 0.5)',
      dayOverlay: 'rgba(30, 132, 73, 0.03)',
    },
  },

  // 4. Blood Red / Horror
  {
    id: 'horror',
    name: 'Хоррор',
    emoji: '🩸',
    description: 'Кровавый тёмный стиль, атмосфера ужаса',
    fontFamily: "'Palatino Linotype', serif",
    borderRadius: '2px',
    tableSurface: 'radial-gradient(ellipse, #2a0a0a 0%, #150505 100%)',
    day: {
      bgPrimary: '#1a0505',
      bgSecondary: '#200808',
      bgCard: '#2a0a0a',
      bgInput: '#350d0d',
      textPrimary: '#e8d5d5',
      textSecondary: '#cc3333',
      textMuted: '#8a5555',
      border: '#cc333333',
      accent: '#cc0000',
      accentHover: '#ff0000',
      accentText: '#ffffff',
      tableDay: 'radial-gradient(ellipse, #3a1515 0%, #200a0a 100%)',
      tableNight: 'radial-gradient(ellipse, #1a0505 0%, #0a0202 100%)',
      tableBorder: '#cc000044',
      chatBg: '#120303',
      chatMessageBg: '#1a0505',
      systemMessageBg: '#200808',
      danger: '#ff0000',
      success: '#00cc44',
      warning: '#ff8800',
      glow: '#cc000055',
      shadow: '0 4px 20px rgba(100,0,0,0.4)',
      nightOverlay: 'rgba(10, 0, 0, 0.3)',
      dayOverlay: 'rgba(204, 0, 0, 0.05)',
    },
    night: {
      bgPrimary: '#0a0202',
      bgSecondary: '#100303',
      bgCard: '#150505',
      bgInput: '#200808',
      textPrimary: '#c8b0b0',
      textSecondary: '#992222',
      textMuted: '#664040',
      border: '#99222222',
      accent: '#990000',
      accentHover: '#cc0000',
      accentText: '#ffffff',
      tableDay: 'radial-gradient(ellipse, #3a1515 0%, #200a0a 100%)',
      tableNight: 'radial-gradient(ellipse, #0a0202 0%, #050101 100%)',
      tableBorder: '#99000033',
      chatBg: '#080101',
      chatMessageBg: '#0a0202',
      systemMessageBg: '#100303',
      danger: '#ff0000',
      success: '#00cc44',
      warning: '#ff8800',
      glow: '#99000044',
      shadow: '0 4px 20px rgba(80,0,0,0.6)',
      nightOverlay: 'rgba(5, 0, 0, 0.5)',
      dayOverlay: 'rgba(153, 0, 0, 0.03)',
    },
  },

  // 5. Elegant Midnight Blue
  {
    id: 'midnight',
    name: 'Полночь',
    emoji: '🌙',
    description: 'Элегантный тёмно-синий, звёздная ночь',
    fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
    borderRadius: '16px',
    tableSurface: 'radial-gradient(ellipse, #1a2744 0%, #0e1a33 100%)',
    day: {
      bgPrimary: '#0f1729',
      bgSecondary: '#152038',
      bgCard: '#1a2744',
      bgInput: '#1f3050',
      textPrimary: '#e8eaf6',
      textSecondary: '#7c9cbf',
      textMuted: '#4a6380',
      border: '#7c9cbf22',
      accent: '#5c7cfa',
      accentHover: '#748ffc',
      accentText: '#ffffff',
      tableDay: 'radial-gradient(ellipse, #1e3355 0%, #142540 100%)',
      tableNight: 'radial-gradient(ellipse, #0e1a33 0%, #080f20 100%)',
      tableBorder: '#5c7cfa33',
      chatBg: '#0b1222',
      chatMessageBg: '#0f1729',
      systemMessageBg: '#152038',
      danger: '#ff6b6b',
      success: '#51cf66',
      warning: '#fcc419',
      glow: '#5c7cfa44',
      shadow: '0 4px 20px rgba(0,10,40,0.4)',
      nightOverlay: 'rgba(8, 12, 25, 0.3)',
      dayOverlay: 'rgba(92, 124, 250, 0.05)',
    },
    night: {
      bgPrimary: '#060b18',
      bgSecondary: '#0a1020',
      bgCard: '#0f1729',
      bgInput: '#152038',
      textPrimary: '#c8cce0',
      textSecondary: '#5a7a9a',
      textMuted: '#3a5070',
      border: '#5a7a9a18',
      accent: '#4263eb',
      accentHover: '#5c7cfa',
      accentText: '#ffffff',
      tableDay: 'radial-gradient(ellipse, #1e3355 0%, #142540 100%)',
      tableNight: 'radial-gradient(ellipse, #080f20 0%, #040810 100%)',
      tableBorder: '#4263eb22',
      chatBg: '#040810',
      chatMessageBg: '#060b18',
      systemMessageBg: '#0a1020',
      danger: '#ff6b6b',
      success: '#51cf66',
      warning: '#fcc419',
      glow: '#4263eb33',
      shadow: '0 4px 20px rgba(0,5,30,0.6)',
      nightOverlay: 'rgba(4, 6, 15, 0.5)',
      dayOverlay: 'rgba(66, 99, 235, 0.03)',
    },
  },
];

export function getThemeById(id: string): Theme {
  return THEMES.find(t => t.id === id) || THEMES[0];
}

export function getActiveColors(theme: Theme, isNight: boolean): ThemeColors {
  return isNight ? theme.night : theme.day;
}
