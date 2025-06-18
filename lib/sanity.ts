import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const sanity = createClient({
  projectId: 'rpufi5bg',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-06-01',
})

export const client = sanity

const builder = imageUrlBuilder(sanity)
export const urlFor = (source: any) => builder.image(source)