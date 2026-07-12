/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    // Include the RN package source so its classes aren't purged.
    "../../packages/react-native/src/**/*.{ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: { extend: {} },
  plugins: []
}
