import type { APIRoute } from 'astro'

import PRODUCTION_ROBOTS_TXT from '@/configs/robots/production.robots.txt?raw'
import STAGING_ROBOTS_TXT from '@/configs/robots/staging.robots.txt?raw'

const SITEMAP_URL_PLACEHOLDER = '{{SITEMAP_URL}}'

const getSitemapUrl = (site: URL) => new URL('sitemap-index.xml', site).href

const injectSitemapUrl = (content: string, url: string) =>
  content.replace(SITEMAP_URL_PLACEHOLDER, url)

const ensureAstroSite = (site: URL | undefined) => {
  if (typeof site === 'undefined') {
    throw new Error(`Expected "site" to be defined in astro.config.*`)
  }
  return site
}

const isProd = import.meta.env.PROD

export const GET: APIRoute = ({ site }) => {
  const body = isProd
    ? injectSitemapUrl(PRODUCTION_ROBOTS_TXT, getSitemapUrl(ensureAstroSite(site)))
    : STAGING_ROBOTS_TXT

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
    },
  })
}
