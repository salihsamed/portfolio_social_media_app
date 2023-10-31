/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'signupBackground': "url('/src/bg_images/signupBackground.jpg')"     
      }

    },
  },
  plugins: [],
  darkMode: 'class'
}

