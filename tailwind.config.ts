import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b0b0f',
        surface: '#181821',
        'surface-2': '#23232f',
        accent: '#e50914',
        'accent-hover': '#f6121d',
        muted: '#a8b0be',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Pretendard', 'Apple SD Gothic Neo', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
