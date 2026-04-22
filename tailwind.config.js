/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          plum:        '#614270',
          sage:        '#92998B',
          'light-sage':'#D1D9C5',
          'soft-blue': '#7D8DCC',
          green:       '#9ED663',
          yellow:      '#EADA69',
          teal:        '#63BD8F',
          orange:      '#FA9335',
        },
        // Legacy aliases kept so existing Tailwind classes don't break
        primary:   '#7D8DCC',
        secondary: '#614270',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'ui-serif', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
