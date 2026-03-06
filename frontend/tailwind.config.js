/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                shield: {
                    50: '#f0f4ff',
                    100: '#e0e9ff',
                    200: '#c7d7fd',
                    300: '#a5bbfb',
                    400: '#8196f8',
                    500: '#6272f3',
                    600: '#4a52e7',
                    700: '#3d42d0',
                    800: '#3238a8',
                    900: '#2e3485',
                },
                surface: {
                    50: '#f8f9fc',
                    100: '#f1f3fa',
                    800: '#1a1d2e',
                    900: '#0f1118',
                    950: '#080a10',
                }
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-in': 'slideIn 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(4px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideIn: {
                    '0%': { opacity: '0', transform: 'translateX(-8px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
            },
        },
    },
    plugins: [],
}
