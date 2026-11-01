/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '.theme-night'],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: 'var(--bg-primary)',
          card: 'var(--bg-card)',
          hover: 'var(--bg-card-hover)',
          border: 'var(--border-card)',
          text: 'var(--text-primary)',
          muted: 'var(--text-secondary)',
          dim: 'var(--text-muted)',
          orange: 'var(--color-orange)',
          gold: 'var(--color-gold)',
          purple: 'var(--color-purple)',
          emerald: 'var(--color-emerald)',
          crimson: 'var(--color-crimson)',
        }
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        silkscreen: ['Silkscreen', 'monospace'],
        serif: ['Cinzel', 'serif'],
        sans: ['Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
