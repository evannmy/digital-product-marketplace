import { createInertiaApp } from '@inertiajs/react';
import axios from 'axios';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import Toaster from '@/components/toaster';
import { initializeTheme } from '@/hooks/use-appearance';

// const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const currentLang = localStorage.getItem('language') || 'en';
axios.defaults.headers.common['X-Locale'] = currentLang;

createInertiaApp({
    // title: (title) => (title ? `${title} - ${appName}` : appName),
    title: (title) => title,
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
                {/* --- ADDED: Placed at the absolute root --- */}
                <Toaster />
            </StrictMode>,
        );
    },
    progress: {
        color: '#9333ea', // Soko Purple!
    },
});

// This will set light / dark mode on load...
initializeTheme();
