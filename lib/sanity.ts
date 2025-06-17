import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: 'rpufi5bg',
  dataset: 'upf-foods',
  useCdn: true,
  apiVersion: '2024-06-01',
})

// Export for legacy compatibility
export const sanity = client

// Image URL builder
const builder = imageUrlBuilder(client)
export const urlFor = (source: any) => builder.image(source)
