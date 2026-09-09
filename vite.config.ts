import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Only GitHub Pages needs a subpath (it serves this repo at
// /Hall-of-dank-memes/); Render serves the static site from its own
// domain root, so it builds with the default base of "/". The GitHub
// Actions workflow (.github/workflows/deploy.yml) sets BASE_PATH; Render
// leaves it unset.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
})
