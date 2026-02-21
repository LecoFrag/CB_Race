/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'cyber-red': '#dc2626',
                'cyber-orange': '#f97316',
                'cyber-dark': '#0a0a0a',
                'cyber-panel': '#111111',
                'cyber-border': '#7f1d1d',
                'cyber-glow': '#ef4444',
            },
            fontFamily: {
                'mono': ['JetBrains Mono', 'Courier New', 'monospace'],
                'display': ['Rajdhani', 'Impact', 'sans-serif'],
            },
            animation: {
                'pulse-red': 'pulseRed 1.5s ease-in-out infinite',
                'flicker': 'flicker 3s linear infinite',
                'scanline': 'scanline 8s linear infinite',
                'glitch': 'glitch 0.5s steps(2, end) infinite',
            },
            keyframes: {
                pulseRed: {
                    '0%, 100%': { boxShadow: '0 0 8px #ef444480', borderColor: '#ef4444' },
                    '50%': { boxShadow: '0 0 24px #ef4444, 0 0 48px #ef444460', borderColor: '#fca5a5' },
                },
                flicker: {
                    '0%, 100%': { opacity: '1' },
                    '92%': { opacity: '1' },
                    '93%': { opacity: '0.7' },
                    '94%': { opacity: '1' },
                    '96%': { opacity: '0.8' },
                    '97%': { opacity: '1' },
                },
                scanline: {
                    '0%': { backgroundPosition: '0 0' },
                    '100%': { backgroundPosition: '0 100%' },
                },
            },
            backgroundImage: {
                'scanlines': 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
            },
        },
    },
    plugins: [],
}
