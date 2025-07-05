// tailwind.config.js
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'spider-move': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(8px)' },
        },
        'bubble-pop': {
          '0%':   { transform: 'scale(1)', opacity: '1' },
          '50%':  { transform: 'scale(1.4)', opacity: '0.8' },
          '100%': { transform: 'scale(0)', opacity: '0' },
        },
        'snail-crawl': {
          '0%':   { transform: 'translateX(0)' },
          '50%':  { transform: 'translateX(10px)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'spider-move': 'spider-move 3s ease-in-out infinite',
        'bubble-pop': 'bubble-pop 2s ease-in-out infinite',
        'snail-crawl': 'snail-crawl 8s ease-in-out infinite',
      },
    },
  },
  safelist: [
    'bg-[#E1C6F9]',
    'bg-[#AFEBFF]',
    'bg-[#CCF5B1]',
  ],
  plugins: [],
}
