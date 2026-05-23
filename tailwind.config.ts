import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Ensure these custom classes are never purged
    'text-gold', 'bg-gold', 'border-gold',
    'text-gold-light', 'bg-gold-light',
    'text-ivory', 'bg-ivory',
    'bg-obsidian', 'text-obsidian',
    'animate-fade-in', 'animate-fade-up',
    'stagger-1','stagger-2','stagger-3','stagger-4','stagger-5','stagger-6',
    'skeleton', 'img-zoom', 'card-hover',
    'btn-primary', 'btn-outline',
    'input-dark', 'nav-link', 'font-display',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
      },
      colors: {
        obsidian: '#0A0A0F',
        ivory: '#F5F2EC',
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8D5A3',
          dark: '#A07830',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        shimmer: 'shimmer 2s infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
export default config
