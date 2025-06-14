import { createClient } from '@sanity/client'

export const sanity = createClient({
  projectId: 'rpufi5bg',
  dataset: 'upf-foods',
  useCdn: true,
  apiVersion: '2024-06-01',
})

export const client = sanity
