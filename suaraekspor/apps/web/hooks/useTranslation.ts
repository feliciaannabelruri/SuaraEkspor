'use client';
import { useState, useEffect } from 'react';
import { TRANSLATIONS } from '../lib/translations';
import apiClient from '../lib/api-client';

const LANG_MAP: Record<string, string> = {
  en: 'English',
  de: 'German',
  ja: 'Japanese',
  ar: 'Arabic',
  zh: 'Chinese',
  id: 'Bahasa Indonesia'
};

const HARDCODED_LANGS = ['id', 'jv', 'su', 'btk', 'ban', 'min', 'bug', 'mad', 'bjn'];

/** Read user's language from localStorage synchronously (safe for SSR) */
function readStoredLang(overrideLang?: string): string {
  if (overrideLang) return overrideLang;
  if (typeof window === 'undefined') return 'id';
  try {
    const raw = localStorage.getItem('se_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.localLanguage) return parsed.localLanguage;
    }
  } catch {}
  return 'id';
}

/** Read cached translations from localStorage synchronously */
function readCachedTranslations(lang: string): Record<string, string> {
  if (typeof window === 'undefined') return {};
  if (HARDCODED_LANGS.includes(lang)) return {};
  try {
    const raw = localStorage.getItem(`se_translations_${lang}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export function useTranslation(overrideLang?: string) {
  // --- Hydration Safe State ---
  // We must start with the default 'id' state because the server (SSR) cannot read localStorage.
  // If we start with 'de' on the client synchronously, Next.js throws a Hydration Error.
  const [lang, setLang] = useState<string>('id');
  const [customTranslations, setCustomTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function load() {
      try {
        const userLang = readStoredLang(overrideLang);
        setLang(userLang);

        if (HARDCODED_LANGS.includes(userLang)) {
          // Regional / Indonesian languages — no AI translation needed
          setCustomTranslations({});
          return;
        }

        const cachedStr = localStorage.getItem(`se_translations_${userLang}`);
        let cached: Record<string, string> | null = null;
        if (cachedStr) {
          try { cached = JSON.parse(cachedStr); } catch {}
        }

        const baseKeysCount = Object.keys(TRANSLATIONS.id).length;
        const cachedKeysCount = cached ? Object.keys(cached).length : 0;

        if (cached && cachedKeysCount >= baseKeysCount) {
          // Cache is fresh — just apply it (may already be set from lazy init, but harmless)
          setCustomTranslations(cached);
        } else {
          // Cache is stale or missing — call Groq AI to (re)translate
          setLoading(true);
          const targetLangName = LANG_MAP[userLang] || userLang;
          apiClient.post('/users/translate-dictionary', {
            dictionary: TRANSLATIONS.id,
            targetLanguage: targetLangName
          }).then(res => {
            const translatedDict = res.data?.data || {};
            localStorage.setItem(`se_translations_${userLang}`, JSON.stringify(translatedDict));
            setCustomTranslations(translatedDict);
          }).catch(err => {
            console.error('Groq Translation failed, falling back to ID:', err);
          }).finally(() => {
            setLoading(false);
          });
        }
      } catch (err) {
        console.error('Error loading translations:', err);
      }
    }

    load();
    // Re-run when another tab changes localStorage (e.g. user changes language in profile)
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, [overrideLang]);

  const t = (key: string, replacements?: Record<string, string>): string => {
    const isHardcoded = HARDCODED_LANGS.includes(lang);
    let text = isHardcoded
      ? (TRANSLATIONS[lang]?.[key] || TRANSLATIONS['id']?.[key] || '')
      : (customTranslations[key] || TRANSLATIONS['id']?.[key] || '');

    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v || '');
      });
    }
    return text;
  };

  return { t, lang, loading };
}
