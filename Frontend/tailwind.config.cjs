/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Defined based on your specific request
        palette: {
          primary: "#434E78",     // Main Sidebar & Page Background
          secondary: "#607B8F",   // Buttons & Cards & Controls Box
          highlight: "#F7E396",   // Active states, Start Button, Glow
          accent: "#E97F4A",      // Hover states
        }
      },
      // Keeping your existing animations
      fontFamily: {
        handwriting: ['"Patrick Hand"', 'cursive'],
        sans: ['"Open Sans"', 'sans-serif'],
      },
      animation: {
        spotlight: "spotlight 2s ease .75s 1 forwards",
        'orb-float': "float 6s ease-in-out infinite",
        'orb-pulse-glow': "pulse-glow 2s infinite",
      },
      keyframes: {
        spotlight: {
          "0%": { opacity: 0, transform: "translate(-72%, -62%) scale(0.5)" },
          "100%": { opacity: 1, transform: "translate(-50%,-40%) scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px #F7E396", transform: "scale(1)" },
          "50%": { boxShadow: "0 0 50px #F7E396", transform: "scale(1.05)" },
        }
      },
    },
  },
  plugins: [],
}