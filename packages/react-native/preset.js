// nativewind preset for @better-auth-ui/react-native.
// Consumers add: presets: [require("nativewind/preset"), require("@better-auth-ui/react-native/preset")]
// and load the token defaults from "@better-auth-ui/react-native/theme.css" (or copy them).
const v = (name) => `rgb(var(${name}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Semantic tokens backed by CSS variables so consumers can re-theme
        // (esp. `accent`) and dark mode flips via the `.dark` class.
        accent: v("--bau-accent"),
        "accent-foreground": v("--bau-accent-foreground"),
        surface: v("--bau-surface"),
        "surface-secondary": v("--bau-surface-secondary"),
        foreground: v("--bau-foreground"),
        muted: v("--bau-muted"),
        danger: v("--bau-danger"),
        "danger-foreground": v("--bau-danger-foreground"),
        border: v("--bau-border")
      }
    }
  }
}
