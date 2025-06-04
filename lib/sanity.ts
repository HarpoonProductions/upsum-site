import { createClient } from '@sanity/client'

export const sanity = createClient({
  projectId: 'rpufi5bg', // Replace this!
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-06-01',
})
