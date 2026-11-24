/** @type {import('tailwindcss').Config} */
export default {
  content: { relative: true, files: ['./index.html', './src/**/*.{js,jsx}'] },
  theme: {
    extend: {
      colors: {
        ivory: '#F8F4EC',
        calendula: '#E58A35',
        marigold: '#F2B13B',
        botanical: '#243D2D',
        champagne: '#C8A56A',
        beige: '#E9DDCB',
        charcoal: '#191A17',
      },
      fontFamily: {
        display: ['"Bodoni Moda"', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      letterSpacing: { luxe: '0.32em', wideish: '0.18em' },
      transitionTimingFunction: { silk: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    },
  },
  plugins: [],
}
