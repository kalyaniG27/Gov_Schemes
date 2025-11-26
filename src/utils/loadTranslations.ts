import { Language } from '../types';

type FlatMap = Record<string, string>;

const FALLBACK_EN: FlatMap = {
  'nav.home': 'Home',
  'nav.schemes': 'Explore Schemes',
  'nav.eligibility': 'Check Eligibility',
  'nav.dashboard': 'Dashboard',
  'nav.login': 'Login',
  'nav.register': 'Register',
  'nav.profile': 'Profile',
  'nav.applications': 'Applications',
  'nav.saved': 'Saved Schemes',
  'nav.documents': 'Documents',
  'nav.logout': 'Logout',
  'admin.title': 'Admin',
  'admin.panel.title': 'Admin Panel',
};

function flattenTranslations(obj: any, prefix = ''): FlatMap {
  const out: FlatMap = {};
  if (obj == null) return out;
  if (typeof obj !== 'object') return { [prefix.replace(/\.$/, '')]: String(obj) };

  const keys = Object.keys(obj);
  const allStrings = keys.every(k => typeof obj[k] === 'string');
  if (allStrings && prefix === '') {
    return obj as FlatMap;
  }

  for (const k of keys) {
    const val = obj[k];
    const newPrefix = prefix ? `${prefix}.${k}` : k;
    if (val != null && typeof val === 'object') {
      Object.assign(out, flattenTranslations(val, newPrefix));
    } else {
      out[newPrefix] = String(val ?? '');
    }
  }
  return out;
}

async function translateText(text: string, targetLang: string): Promise<string> {
  try {
    // Use fetch against LibreTranslate public API (no API key required for the public instance)
    const resp = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: targetLang,
        format: 'text'
      })
    });

    if (!resp.ok) {
      throw new Error(`LibreTranslate responded ${resp.status}`);
    }
    const data = await resp.json();
    return data.translatedText ?? text;
  } catch (error) {
    console.error('Translation failed:', error);
    return text; // fallback to original text
  }
}

async function translateFlatMap(flatMap: FlatMap, targetLang: string): Promise<FlatMap> {
  // Translate all entries in parallel to improve speed; keep original value on error
  const entries = Object.entries(flatMap);
  const results = await Promise.all(entries.map(async ([key, value]) => {
    try {
      const t = await translateText(value, targetLang);
      return [key, t] as [string, string];
    } catch (e) {
      return [key, value] as [string, string];
    }
  }));

  const out: FlatMap = {};
  for (const [k, v] of results) out[k] = v;
  return out;
}

export const loadTranslations = async (language: Language): Promise<FlatMap> => {
  try {
    const resp = await fetch(`/locales/${language}/translation.json`);
    if (resp.ok) {
      const json = await resp.json();
      const flat = flattenTranslations(json);

      const aliases: Record<string, string> = {
        home: 'nav.home',
        exploreSchemes: 'nav.schemes',
        checkEligibility: 'nav.eligibility',
        admin: 'admin.title',
        adminPanel: 'admin.panel.title',
        adminLogin: 'nav.login',
        login: 'nav.login',
        register: 'nav.register',
        logout: 'nav.logout',
        dashboard: 'nav.dashboard',
      };

      for (const [src, dest] of Object.entries(aliases)) {
        if (flat[src] && !flat[dest]) {
          flat[dest] = flat[src];
        }

        // also support object-style: e.g. "admin": { "title": "..." }
        if ((json as any)[src] && !flat[dest]) {
          try {
            const possible = (json as any)[src];
            if (possible && typeof possible === 'object' && typeof possible.title === 'string') {
              flat[dest] = possible.title;
            }
          } catch (e) {
            // ignore
          }
        }
      }

      return flat;
    }
  } catch (e) {
    // fetch failed — fall through to fallback
  }

  // If local translation fails, use LibreTranslate API to translate FALLBACK_EN
  if (language !== 'en') {
    try {
      const translatedFallback = await translateFlatMap(FALLBACK_EN, language);
      return translatedFallback;
    } catch (error) {
      console.error('Failed to translate fallback:', error);
    }
  }

  return FALLBACK_EN;
};

export default loadTranslations;
