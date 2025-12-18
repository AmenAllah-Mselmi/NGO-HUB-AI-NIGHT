/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // make sure Tailwind scans your files
  ],
  theme: {
    extend: {
      colors: {
        Secondary: '##EDBE38',
        Primary: '##0097D7',
        Accent: '#56BDA3',
        navy: '#001F3F',
      },
      fontFamily: {
        myFont: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
