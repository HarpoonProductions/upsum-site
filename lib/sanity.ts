// lib/sanity.ts
import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: 'rpufi5bg',       // ✅ Your Sanity project ID
  dataset: 'production',       // ✅ Your dataset name
  apiVersion: '2023-06-06',    // ✅ Set an API version
  useCdn: true,
})
