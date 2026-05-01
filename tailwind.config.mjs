/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#f0f7ee',
          100: '#d8edcf',
          200: '#b3d9a2',
          300: '#86be70',
          400: '#5fa046',
          500: '#478133',
          600: '#376627',
          700: '#2d5121',
          800: '#25401c',
          900: '#1e3317',
          950: '#121f0e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
