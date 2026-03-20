import type { CollectionEntry } from 'astro:content'
import type { Event, Offer, Person, Place, PostalAddress, WithContext } from 'schema-dts'

type Performer = NonNullable<CollectionEntry<'events'>['data']['performers']>[number]
type Member = NonNullable<Performer['member']>[number]
type ScheduleItem = NonNullable<CollectionEntry<'events'>['data']['schedule']>[number]

type PostalAddressArgs = {
  streetAddress: string
  addressLocality: string
  postalCode: string
  addressCountry: string
}

type PlaceArgs = {
  name: string
  address: PostalAddressArgs
}

type OrganizerArgs = {
  name: string
  email: string
  url: URL
}

type OfferArgs = {
  price: number
  priceCurrency: string
  name: string
  description?: string
}

const buildPostalAddressSchema = (args: PostalAddressArgs): PostalAddress => ({
  '@type': 'PostalAddress',
  ...args,
})

const buildPlaceSchema = (args: PlaceArgs): Place => ({
  '@type': 'Place',
  name: args.name,
  address: buildPostalAddressSchema(args.address),
})

const buildPersonSchema = (member: Member): Person => ({
  '@type': 'Person',
  ...member,
})

const buildOrganizerSchema = (args: OrganizerArgs): Person => ({
  '@type': 'Person',
  name: args.name,
  url: new URL('/', args.url).href,
  email: args.email,
})

const buildOfferSchema = (args: OfferArgs): Offer => ({
  '@type': 'Offer',
  ...args,
  availability: 'https://schema.org/InStock',
})

const buildSubEventSchema = (item: ScheduleItem): Event => ({
  '@type': 'Event',
  name: item.name,
  startDate: item.startDate.toISOString(),
  location: item.location,
})

const buildPerformerSchema = (performer: Performer): Person => ({
  '@type': 'Person',
  name: performer.name,
  url: performer.url,
  member: (performer.member ?? []).map(buildPersonSchema),
})

export const buildEventSchema = (
  post: CollectionEntry<'events'>,
  editionNumber: number,
  url: URL,
): WithContext<Event> => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: `Edition ${String(editionNumber)} — My Site`,
  startDate: post.data.startDate.toISOString(),
  endDate: post.data.endDate.toISOString(),
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  url: url.href,
  location: buildPlaceSchema({
    name: 'Your Venue Name',
    address: {
      streetAddress: '123 Main St',
      addressLocality: 'Your City',
      postalCode: '00000',
      addressCountry: 'US',
    },
  }),
  image: post.data.images,
  ...(post.data.claim && { description: post.data.claim }),
  ...(post.data.performers && {
    performer: post.data.performers.map(buildPerformerSchema),
  }),
  offers: buildOfferSchema({
    name: 'General Admission',
    price: 0,
    priceCurrency: 'USD',
    description: 'Free entry — donations welcome.',
  }),
  ...(post.data.schedule && {
    subEvent: post.data.schedule.map(buildSubEventSchema),
  }),
  ...(post.data.externalLink && { sameAs: post.data.externalLink }),
  organizer: buildOrganizerSchema({
    name: 'Your Name',
    email: 'hello@example.com',
    url,
  }),
})
