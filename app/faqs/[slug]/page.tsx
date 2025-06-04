// app/faqs/[slug]/page.tsx – Detail view for individual FAQ with structured data
import { sanity } from '@/lib/sanity'
import groq from 'groq'
import { Metadata } from 'next'
import Script from 'next/script'

// Types
type FAQ = {
  title: string
  slug: { current: string }
  publishedAt: string
  updatedAt?: string
  body: string
  author?: { name: string }
  category?: { title: string }
  image?: { asset: { url: string } }
}

type Props = {
  params: { slug: string }
}

// Metadata generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const faq = await sanity.fetch(
    groq`*[_type == "faq" && slug.current == $slug][0]{
      title, slug, publishedAt, updatedAt, body, author->{name}, category->{title}
    }`,
    { slug: params.slug }
  )

  return {
    title: faq.title,
    description: faq.body.slice(0, 150) + '...',
    alternates: {
      canonical: `https://upsum.vercel.app/faqs/${faq.slug.current}`,
    },
    openGraph: {
      title: faq.title,
      description: faq.body.slice(0, 150) + '...',
      url: `https://upsum.vercel.app/faqs/${faq.slug.current}`,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: faq.title,
      description: faq.body.slice(0, 150) + '...',
    },
  }
}

// Page rendering
export default async function FAQDetailPage({ params }: Props) {
  const faq: FAQ = await sanity.fetch(
    groq`*[_type == "faq" && slug.current == $slug][0]{
      title, slug, publishedAt, updatedAt, body,
      author->{name}, category->{title}, image{asset->{url}}
    }`,
    { slug: params.slug }
  )

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Question',
    'name': faq.title,
    'acceptedAnswer': {
      '@type': 'Answer',
      'text': faq.body,
    },
    'author': faq.author?.name ? { '@type': 'Person', name: faq.author.name } : undefined,
    'datePublished': faq.publishedAt,
    'dateModified': faq.updatedAt || faq.publishedAt,
    'mainEntityOfPage': `https://upsum.vercel.app/faqs/${faq.slug.current}`
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{faq.title}</h1>
      <p className="text-sm text-gray-500 mb-2">
        {faq.category?.title} | {faq.author?.name} | {new Date(faq.publishedAt).toLocaleDateString()}
      </p>
      {faq.image?.asset?.url && (
        <img src={faq.image.asset.url} alt={faq.title} className="rounded mb-4" />
      )}
      <div className="prose prose-lg" dangerouslySetInnerHTML={{ __html: faq.body }} />

      <Script
        id="faq-detail-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </main>
  )
}
