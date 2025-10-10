module.exports = {
  // Fix PostCSS plugin shape: Next.js requires plugin names as strings or object keys, not require() functions.
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
