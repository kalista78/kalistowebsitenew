// API URL for backend services
export const API_URL = 'http://localhost:3001';

// Admin emails
export const ADMIN_EMAILS = ['unalltaha@gmail.com', 'doganbozkurrt34@gmail.com'];

// Token tags for filtering
export const TOKEN_TAGS = {
  TRENDING: '💎 Trend',
  NEW: '🔥 Yeni Çıkanlar',
  CAT: '😺 Kedi Coinleri',
  DOG: '🐕 Köpek Coinleri',
  AI: '🤖 Yapay Zeka',
  MEME: '🎭 Meme Trendleri',
  GENERAL: '🌐 Genel',
  FEATURED: 'Öne çıkanlar'
} as const;

export type TokenTag = typeof TOKEN_TAGS[keyof typeof TOKEN_TAGS];

export const TOKEN_TAG_OPTIONS = [
  TOKEN_TAGS.TRENDING,
  TOKEN_TAGS.NEW,
  TOKEN_TAGS.CAT,
  TOKEN_TAGS.DOG,
  TOKEN_TAGS.AI,
  TOKEN_TAGS.MEME,
  TOKEN_TAGS.GENERAL,
  TOKEN_TAGS.FEATURED
];
