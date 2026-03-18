import { readdirSync } from 'fs'
import { join } from 'path'
import { defineCollection, z } from 'astro:content'
import { cldAssetsLoader } from 'astro-cloudinary/loaders'
import { glob } from 'astro/loaders'

const events = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/events' }),
  schema: z.object({
    startDate: z.date(),
    endDate: z.date(),
    cover: z.string(),
    claim: z.string().optional(),
    externalLink: z.string().optional(),
    performers: z
      .array(
        z.object({
          name: z.string(),
          url: z.string().url().optional(),
          genre: z.string().optional(),
          foundingDate: z.date().optional(),
          location: z.string().optional(),
          logo: z.string().optional(),
          email: z.string().email().optional(),
          member: z
            .array(z.object({ name: z.string(), jobTitle: z.string().optional() }))
            .optional(),
        }),
      )
      .optional(),
    images: z.array(z.string()).optional(),
    schedule: z
      .array(z.object({ name: z.string(), startDate: z.date(), location: z.string() }))
      .optional(),
  }),
})

const eventsDir = join(process.cwd(), 'src/content/events')

const eventIds = readdirSync(eventsDir)
  .filter((f) => f.endsWith('.mdx'))
  .map((f) => f.replace('.mdx', ''))
  .slice(0, -1)

const galleryCollections = Object.fromEntries(
  eventIds.map((id) => [
    `gallery${id}`,
    defineCollection({
      loader: cldAssetsLoader({
        limit: 500,
        folder: id,
        tags: true,
      }),
    }),
  ]),
)

export const collections = { events, ...galleryCollections }
