import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * GitHub Pages base path.
 *  - Project site  (https://USER.github.io/mission-23/) -> '/mission-23/'  (default)
 *  - User site / custom domain (https://USER.github.io/ or https://my-domain.com/) -> '/'
 * The deploy workflow sets BASE_PATH automatically from the repository name.
 */
const base = process.env.BASE_PATH || '/mission-23/';

/** Absolute site URL used for Open Graph link previews (set by the workflow). */
const siteUrl = process.env.SITE_URL ? process.env.SITE_URL.replace(/\/?$/, '/') : base;

export default defineConfig({
  base,
  plugins: [
    react(),
    {
      name: 'mission23-site-url',
      transformIndexHtml(html) {
        return html.replace(/__SITE_URL__/g, siteUrl);
      },
    },
  ],
  build: {
    target: ['es2019', 'safari14'],
    assetsInlineLimit: 4096,
  },
});
