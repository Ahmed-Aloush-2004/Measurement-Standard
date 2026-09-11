export const Colors = {
  navy: '#2B2D5C',
  teal: '#25B7A9',
  bg: '#F8FAFC',
  text: '#2B2D5C',
  muted: '#64748B',
  lightGray: '#F1F5F9',
  border: '#E5E7EB',
};

const PALETTE = [
  { icon: '#25B7A9', label: '#2B2D5C' },
  { icon: '#6366F1', label: '#4338CA' },
  { icon: '#F59E0B', label: '#B45309' },
  { icon: '#EF4444', label: '#B91C1C' },
  { icon: '#8B5CF6', label: '#6D28D9' },
  { icon: '#EC4899', label: '#BE185D' },
  { icon: '#14B8A6', label: '#0F766E' },
  { icon: '#3B82F6', label: '#1D4ED8' },
];

export function paletteFor(index: number) {
  return PALETTE[index % PALETTE.length];
}
