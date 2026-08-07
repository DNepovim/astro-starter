import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import sharp from 'sharp'

type LqipSource = string | ImageMetadata

type LqipOptions = {
  /** Width of the generated placeholder in pixels. Height follows the aspect ratio. */
  width?: number
  /** WebP quality of the generated placeholder, 1–100. */
  quality?: number
}

const DEFAULT_WIDTH = 20
const DEFAULT_QUALITY = 20

/** 1×1 transparent WebP, used when a source cannot be read so a build never fails on it. */
const EMPTY_LQIP =
  'data:image/webp;base64,UklGRkAAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAIAAAAAAFZQOCAYAAAAMAEAnQEqAQABAAzAziWkAANwAP7sZwAA'

const cache = new Map<string, Promise<string>>()

const toPath = (source: LqipSource): string =>
  typeof source === 'string' ? source : source.src

/** Turns a dev-only `/@fs/…?query` src or a `/public` path into a readable file path. */
const toFilePath = (path: string): string => {
  const [pathname = ''] = path.split('?')
  if (pathname.startsWith('/@fs')) return pathname.slice('/@fs'.length)
  if (pathname.startsWith('/')) return resolve(process.cwd(), 'public', `.${pathname}`)
  return resolve(process.cwd(), pathname)
}

const readSource = async (path: string): Promise<Buffer> => {
  if (!/^https?:\/\//.test(path)) return readFile(toFilePath(path))

  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${path}: ${String(response.status)} ${response.statusText}`,
    )
  }
  return Buffer.from(await response.arrayBuffer())
}

const createLqip = async (
  path: string,
  width: number,
  quality: number,
): Promise<string> => {
  const buffer = await sharp(await readSource(path))
    .resize(width)
    .webp({ quality })
    .toBuffer()
  return `data:image/webp;base64,${buffer.toString('base64')}`
}

/**
 * Builds a low quality image placeholder (LQIP) as an inlineable data URI.
 *
 * Accepts an `astro:assets` import, a project-relative path (`src/images/cover.jpg`),
 * a `public/` path (`/images/cover.jpg`) or a remote URL. Results are cached per
 * source and per options, so the same image is only processed once per build.
 */
export const getLqip = async (
  source: LqipSource,
  { width = DEFAULT_WIDTH, quality = DEFAULT_QUALITY }: LqipOptions = {},
): Promise<string> => {
  const path = toPath(source)
  const key = `${path}|${String(width)}|${String(quality)}`

  const cached = cache.get(key)
  if (cached) return cached

  const lqip = createLqip(path, width, quality).catch((error: unknown) => {
    console.warn(`[lqip] Could not create a placeholder for ${path}:`, error)
    return EMPTY_LQIP
  })
  cache.set(key, lqip)
  return lqip
}

/**
 * Same as {@link getLqip}, but returns the inline CSS that shows the placeholder
 * behind an image until the real one has loaded.
 */
export const getLqipStyle = async (
  source: LqipSource,
  options?: LqipOptions,
): Promise<string> => {
  const lqip = await getLqip(source, options)
  return `background-image:url(${lqip});background-size:cover;background-position:center`
}
