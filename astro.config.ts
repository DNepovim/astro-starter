// @ts-check
import { resolve } from 'path'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'
import swup, { Theme } from '@swup/astro'
import tailwindcss from '@tailwindcss/vite'
import { imageService } from '@unpic/astro/service'
import icon from 'astro-icon'
import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'

import { envConfig } from './env.config.ts'

const { SITE_URL } = loadEnv('', process.cwd(), '')

export default defineConfig({
  env: envConfig,
  site: SITE_URL ?? 'http://localhost:4321',
  integrations: [
    mdx(),
    sitemap({
      lastmod: new Date(),
    }),
    icon(),
    swup({
      theme: Theme.fade,
    }),
  ],

  vite: {
    // @ts-expect-error vite versions incompatibility
    plugins: [...tailwindcss()],
    resolve: {
      alias: {
        '@': resolve('./src'),
      },
    },
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'cs'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),

  image: {
    service: imageService({
      placeholder: 'lqip',
    }),
  },
})
