import { useState, useEffect, useCallback } from 'react';

// 1. Import your JSON dictionaries
// Make sure this path correctly points to where you saved your JSON files!
import en from '../../../lang/en.json';
import id from '../../../lang/id.json';

// 2. Map them into a single object for easy access
const dictionaries: Record<string, Record<string, string>> = {
    en,
    id,
};

// 3. Smart Device Language Detection
const getDeviceLanguage = () => {
    if (typeof window === 'undefined') return 'en'; // Safe fallback for Server-Side Rendering (SSR)
    
    const stored = localStorage.getItem('language');

    if (stored) return stored;

    const browserLang = navigator.language || (navigator as any).userLanguage || 'en';

    return browserLang.toLowerCase().startsWith('id') ? 'id' : 'en';
};

export function useTranslation() {
    // Initialize state. We use 'en' as a safe default for the very first render/SSR, 
    // then immediately update it in useEffect.
    const [lang] = useState<string>(getDeviceLanguage());

    useEffect(() => {
        // Ensure localStorage is synced so Navbar and Backend can see it
        if (!localStorage.getItem('language')) {
            localStorage.setItem('language', lang);
        }
    }, [lang]);

    // 4. The Translation Function (The 't' function)
    const t = useCallback((key: string, replacements?: Record<string, string | number>) => {
        // Select the active dictionary, fallback to English if something goes wrong
        const dictionary = dictionaries[lang] || dictionaries['en'];
        
        // Find the translation. If it doesn't exist in the JSON, return the exact key as a fallback.
        let translation = dictionary[key] || key;

        // Optional Feature: Handle dynamic variables!
        // Example: t('Welcome back, :name', { name: 'Evan' }) -> "Welcome back, Evan"
        if (replacements) {
            Object.keys(replacements).forEach((replaceKey) => {
                translation = translation.replace(
                    new RegExp(`:${replaceKey}`, 'g'),
                    String(replacements[replaceKey])
                );
            });
        }

        return translation;
    }, [lang]);

    return { t, lang };
}