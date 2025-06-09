// 1. app/faqs/page.tsx – List of FAQs with structured data
import { client } from '@/lib/sanity'
import groq from 'groq'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import Script from 'next/script'

export const revalidate = 60 // ISR every 60s

const query = groq`
  *[_type == "faq"] | order(publishedAt desc)[0...20] {
    _id,
    title,
    slug,
    publishedAt,
    author->{name},
    category->{title},
    image
  }
`

export const metadata: Metadata = {
  title: 'FAQs | Upsum',
  description: 'Credible answers to common questions from the Upsum project.',
  keywords: ['FAQs', 'Upsum', 'questions', 'answers', 'explainers'],
  openGraph: {
    title: 'FAQs | Upsum',
    description: 'Credible answers to common questions from the Upsum project.',
    url: 'https://upsum.vercel.app/faqs',
    siteName: 'Upsum',
    type: 'website',
    images: [
      {
        url: 'https://upsum.vercel.app/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Upsum Logo'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQs | Upsum',
    description: 'Credible answers to common questions from the Upsum project.',
    site: '@upsumHQ',
    creator: '@upsumHQ'
  },
  alternates: {
    canonical: 'https://upsum.vercel.app/faqs'
  }
}

export default async function FAQListPage() {
  const faqs = await client.fetch(query)

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map((faq: any) => ({
      '@type': 'Question',
      'name': faq.title,
      'url': `https://upsum.vercel.app/faqs/${faq.slug.current}`,
      'datePublished': faq.publishedAt,
      'author': faq.author?.name ? { '@type': 'Person', 'name': faq.author.name } : undefined
    }))
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">FAQs</h1>
      <ul className="space-y-6">
        {faqs.map((faq: any) => (
          <li key={faq._id}>
            <Link href={`/faqs/${faq.slug.current}`}>
              <h2 className="text-xl font-semibold hover:underline">{faq.title}</h2>
            </Link>
            <p className="text-sm text-gray-500">
              {faq.category?.title} | {faq.author?.name} | {new Date(faq.publishedAt).toLocaleDateString()}
            </p>
            {faq.image && (
              <Image
                src={faq.image.asset.url}
                alt={faq.title}
                width={600}
                height={400}
                className="rounded mt-2"
              />
            )}
          </li>
        ))}
      </ul>
      <Script
        id="faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
    </main>
  )
}

