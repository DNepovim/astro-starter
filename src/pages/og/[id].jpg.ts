import { getCollection, type CollectionEntry } from 'astro:content'
import { ImageResponse } from '@vercel/og'
import sharp from 'sharp'

export async function getStaticPaths() {
  const posts = await getCollection('events')
  const sorted = [...posts].sort((a, b) => a.id.localeCompare(b.id))
  return sorted.map((post, index) => ({
    params: { id: post.id },
    props: { post, editionNumber: index + 1 },
  }))
}

type Props = {
  post: CollectionEntry<'events'>
  editionNumber: number
}

type SatoriStyle = Record<string, string | number>

type SatoriNode = {
  type: string
  props: {
    tw?: string
    style?: SatoriStyle
    src?: string
    children?: SatoriNode | SatoriNode[] | string
  }
}

const fontCache: Record<string, ArrayBuffer> = {}

const loadGoogleFont = async (family: string, weight: number): Promise<ArrayBuffer> => {
  const key = `${family}-${weight}`
  if (fontCache[key]) return fontCache[key]!
  // Use an older UA to receive TTF format instead of WOFF2 (required by satori)
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`,
    { headers: { 'User-Agent': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)' } },
  ).then((r) => r.text())
  const url = /src:\s*url\(([^)]+)\)/.exec(css)?.[1]
  if (!url) throw new Error(`Font URL not found for ${family} ${weight}`)
  fontCache[key] = await fetch(url).then((r) => r.arrayBuffer())
  return fontCache[key]!
}

export async function GET({ props }: { props: Props }) {
  const { post, editionNumber } = props
  const [displayFont, bodyFont] = await Promise.all([
    loadGoogleFont('Playfair Display', 700),
    loadGoogleFont('Inter', 300),
  ])

  const coverUrl = post.data.cover.includes('/upload/')
    ? post.data.cover.replace('/upload/', '/upload/c_fill,w_1200,h_630,q_80,f_jpg/')
    : post.data.cover

  const element: SatoriNode = {
    type: 'div',
    props: {
      tw: 'flex w-full h-full relative',
      style: { border: '8px solid white', borderRadius: 16, overflow: 'hidden' },
      children: [
        {
          type: 'img',
          props: {
            src: coverUrl,
            tw: 'absolute inset-0 w-full h-full',
            style: { objectFit: 'cover' },
          },
        },
        {
          type: 'div',
          props: {
            tw: 'absolute inset-0',
            style: {
              background:
                'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
            },
          },
        },
        {
          type: 'div',
          props: {
            tw: 'absolute flex flex-col',
            style: { bottom: 28, left: 34 },
            children: [
              {
                type: 'span',
                props: {
                  style: {
                    fontFamily: 'Playfair Display',
                    fontSize: 88,
                    color: 'white',
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em',
                    textShadow: '0 2px 12px rgba(0,0,0,0.8)',
                  },
                  children: 'My Site',
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    fontFamily: 'Playfair Display',
                    fontSize: 52,
                    color: 'white',
                    lineHeight: 1.2,
                    textShadow: '0 2px 12px rgba(0,0,0,0.8)',
                  },
                  children: 'A recurring event',
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    fontFamily: 'Inter',
                    fontWeight: 300,
                    fontSize: 28,
                    color: 'white',
                    marginTop: 20,
                    letterSpacing: '0.02em',
                    textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                  },
                  children: `Edition ${String(editionNumber)},  ${post.data.startDate.toLocaleDateString('en-US')}`,
                },
              },
            ],
          },
        },
      ],
    },
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const png = await new ImageResponse(element as any, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Playfair Display', data: displayFont, style: 'normal', weight: 700 },
      { name: 'Inter', data: bodyFont, style: 'normal', weight: 300 },
    ],
  }).arrayBuffer()

  const jpeg = await sharp(Buffer.from(png)).jpeg({ quality: 85 }).toBuffer()

  return new Response(jpeg, {
    headers: { 'Content-Type': 'image/jpeg' },
  })
}
