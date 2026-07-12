/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    // Include the RN package source so its classes aren't purged.
    "../../packages/react-native/src/**/*.{ts,tsx}"
  ],
  presets: [
    require("nativewind/preset"),
    require("../../packages/react-native/preset.js")
  ],
  theme: { extend: {} },
  plugins: []
}
