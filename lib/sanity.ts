import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: 'rpufi5bg',
  dataset: 'production',
  apiVersion: '2023-01-01',
  useCdn: true,
})
