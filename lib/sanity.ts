// lib/sanity.ts
import imageUrlBuilder from '@sanity/image-url';
import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: 'rpufi5bg',       // ✅ Your Sanity project ID
  dataset: 'production',       // ✅ Your dataset name
  apiVersion: '2023-06-06',    // ✅ Set an API version
  useCdn: true,
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}
