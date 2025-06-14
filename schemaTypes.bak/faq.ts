import { defineType, defineField } from 'sanity'

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: Rule => Rule.required().max(200)
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'question',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'array',
      of: [{ type: 'block' }],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'summaryForAI',
      title: 'Summary for AI and Snippets',
      type: 'text',
      description: 'A concise 1–2 sentence answer for use in AI responses and featured snippets.'
    }),
    defineField({
      name: 'alternateQuestions',
      title: 'Alternate Phrasings',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Other common ways this question might be asked.'
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords/Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Tags for automatic related FAQ suggestions and SEO. Use consistent keywords across related FAQs.',
      options: {
        layout: 'tags'
      },
      validation: Rule => Rule.max(8).warning('Consider using fewer than 8 keywords for better focus')
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'relatedFAQs',
      title: 'Related FAQs (Manual Override)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'faq' }] }],
      description: 'Manually select related FAQs. When set, these override automatic suggestions from keywords/category.',
      validation: Rule => Rule.max(3).warning('Maximum 3 related FAQs recommended for best UX')
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    }),
    defineField({
      name: 'updatedAt',
      title: 'Last Updated',
      type: 'datetime'
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }]
    }),
    defineField({
      name: 'image',
      title: 'Featured Image (Optional)',
      type: 'image',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Describe the image for screen readers and SEO',
          validation: Rule => Rule.custom((alt, context) => {
            const parent = context.parent as {asset?: any}
            if (parent?.asset && !alt) {
              return 'Alt text is required when an image is selected'
            }
            return true
          })
        }
      ]
    }),
    defineField({
      name: 'schemaMarkup',
      title: 'Custom Schema Markup (JSON-LD)',
      type: 'text',
      description: 'Optionally override the auto-generated FAQ schema with your own JSON-LD.'
    })
  ],
  preview: {
    select: {
      title: 'question',
      subtitle: 'summaryForAI',
      media: 'image',
      category: 'category.title'
    },
    prepare({title, subtitle, category}) {
      return {
        title,
        subtitle: category ? `${category}: ${subtitle || ''}` : subtitle,
      }
    }
  }
})
