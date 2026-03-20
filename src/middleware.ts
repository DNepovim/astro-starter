import { defineMiddleware } from 'astro:middleware'
import { setLocale } from '@/paraglide/runtime'

export const onRequest = defineMiddleware((context, next) => {
  setLocale((context.currentLocale ?? 'en') as 'en' | 'cs')
  return next()
})
