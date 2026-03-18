// @ts-check
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import { resolve } from "path";
import swup, { Theme } from "@swup/astro";

import { envConfig } from "./env.config.ts";

import icon from "astro-icon";
import { imageService } from "@unpic/astro/service";

const { SITE_URL } = loadEnv("", process.cwd(), "");

export default defineConfig({
  env: envConfig,
  site: SITE_URL ?? "http://localhost:4321",
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
        "@": resolve("./src"),
      },
    },
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },

  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),

  image: {
    service: imageService({
      placeholder: "lqip",
    }),
  },
});
