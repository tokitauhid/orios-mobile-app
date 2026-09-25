export interface ColorPalette {
  bg: string;
  text: string;
  border: string;
  pill: string;
  dot: string;
}

export const colorPalettes: Record<string, ColorPalette> = {
  indigo: {
    bg: 'rgba(99, 102, 241, 0.12)',
    text: '#818cf8',
    border: 'rgba(99, 102, 241, 0.25)',
    pill: '#6366f1',
    dot: '#6366f1',
  },
  emerald: {
    bg: 'rgba(16, 185, 129, 0.12)',
    text: '#34d399',
    border: 'rgba(16, 185, 129, 0.25)',
    pill: '#10b981',
    dot: '#10b981',
  },
  amber: {
    bg: 'rgba(245, 158, 11, 0.12)',
    text: '#fbbf24',
    border: 'rgba(245, 158, 11, 0.25)',
    pill: '#f59e0b',
    dot: '#f59e0b',
  },
  violet: {
    bg: 'rgba(139, 92, 246, 0.12)',
    text: '#a78bfa',
    border: 'rgba(139, 92, 246, 0.25)',
    pill: '#8b5cf6',
    dot: '#8b5cf6',
  },
  rose: {
    bg: 'rgba(244, 63, 94, 0.12)',
    text: '#fb7185',
    border: 'rgba(244, 63, 94, 0.25)',
    pill: '#f43f5e',
    dot: '#f43f5e',
  },
  cyan: {
    bg: 'rgba(6, 182, 212, 0.12)',
    text: '#22d3ee',
    border: 'rgba(6, 182, 212, 0.25)',
    pill: '#06b6d4',
    dot: '#06b6d4',
  },
};

export const defaultPalette: ColorPalette = {
  bg: 'rgba(161, 161, 170, 0.12)',
  text: '#a1a1aa',
  border: 'rgba(161, 161, 170, 0.25)',
  pill: '#71717a',
  dot: '#71717a',
};

export function getPalette(colorName?: string): ColorPalette {
  if (!colorName) return defaultPalette;
  const key = colorName.toLowerCase();
  return colorPalettes[key] || defaultPalette;
}
