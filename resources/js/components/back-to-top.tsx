import { ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function BackToTop() {
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show the button after the user scrolls down 300 pixels
            setShowBackToTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);

        // Cleanup the event listener when the component unmounts
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`fixed right-8 bottom-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white shadow-xl shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1 hover:bg-purple-700 hover:shadow-purple-500/50 focus:ring-4 focus:ring-purple-300 focus:outline-none ${
                showBackToTop
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-10 opacity-0'
            }`}
            aria-label="Back to top"
        >
            <ArrowUp size={24} />
        </button>
    );
}
