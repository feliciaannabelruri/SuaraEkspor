export const SUPPORTED_LANGUAGES = {
  id: { name: 'Bahasa Indonesia', whisperCode: 'id', nativeName: 'Bahasa Indonesia' },
  jv: { name: 'Javanese', whisperCode: 'jw', nativeName: 'Basa Jawa' },
  su: { name: 'Sundanese', whisperCode: 'su', nativeName: 'Basa Sunda' },
  btk: { name: 'Batak', whisperCode: 'id', nativeName: 'Hata Batak' },
} as const;

export const TARGET_BUYER_LANGUAGES = [
  { code: 'en', name: 'English', flag: 'EN' },
  { code: 'zh', name: 'Chinese (Simplified)', flag: 'ZH' },
  { code: 'ar', name: 'Arabic', flag: 'AR' },
  { code: 'ja', name: 'Japanese', flag: 'JA' },
  { code: 'de', name: 'German', flag: 'DE' },
  { code: 'fr', name: 'French', flag: 'FR' },
] as const;

export type SellerLanguageCode = keyof typeof SUPPORTED_LANGUAGES;