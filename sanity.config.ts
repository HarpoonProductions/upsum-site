import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'
import customStructure from './schemaTypes/structure'
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash'

export default defineConfig({
  name: 'upf-studio',
  title: 'UPF FAQs Studio',

  projectId: 'rpufi5bg',
  dataset: 'upf-foods',

  plugins: [
    deskTool({
      structure: customStructure,
    }),
    visionTool(),
    unsplashImageAsset(),
  ],

  schema: {
    types: schemaTypes,
  },
})
