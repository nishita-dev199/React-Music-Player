/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        "theme-teal": "#2d8a95",
        "theme-teal-dark": "#1f6a74",
        "theme-teal-deep": "#144e56",
        "theme-teal-light": "#3aa1ad",
        "theme-orange": "#e8412b",
        "theme-orange-dark": "#c9321e",
        "theme-orange-deep": "#962112",
        "theme-orange-light": "#f25843",
        "dark-bg": "#0d1b1e",
      },
    },
  },
  plugins: [],
};
