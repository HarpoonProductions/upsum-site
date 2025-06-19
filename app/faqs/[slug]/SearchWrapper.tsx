// Updated app/faqs/[slug]/page.tsx - Server component with client components imported

import { client } from '@/lib/sanity'
import { groq } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { urlFor } from '@/lib/sanity'
import CitationBox from './CitationBox'
import RelatedFAQs from './RelatedFAQs'

interface Faq {
  _id: string
  question: string
  answer: any
  slug: { current: string }
  summaryForAI?: string
  keywords?: string[]
  category?: { title: string; slug: { current: string } }
  publishedAt?: string
  updatedAt?: string
  author?: { name: string }
  image?: {
    asset?: {
      _id: string
      url: string
    }
    alt?: string
  }
  tags?: string[]
  manualRelatedFAQs?: Faq[]
  allFAQs?: Faq[]
  searchFAQs?: Faq[]
}

// Updated query to include related FAQs data with null checks and search data
const query = groq`*[_type == "faq" && slug.current == $slug][0] {
  _id,
  question,
  answer,
  slug,
  summaryForAI,
  keywords,
  category->{
    title,
    slug
  },
  publishedAt,
  updatedAt,
  author->{
    name
  },
  image {
    asset->{
      _id,
      url
    },
    alt
  },
  tags,
  "manualRelatedFAQs": relatedFAQs[defined(slug.current) && defined(question)]->{
    _id,
    question,
    slug,
    summaryForAI,
    keywords,
    category->{
      title,
      slug
    },
    image {
      asset->{ url }
    }
  },
  "allFAQs": *[_type == "faq" && _id != ^._id && defined(slug.current) && defined(question)]{
    _id,
    question,
    slug,
    summaryForAI,
    keywords,
    category->{
      title,
      slug
    },
    image {
      asset->{ url }
    }
  },
  "searchFAQs": *[_type == "faq" && defined(slug.current) && defined(question)]{
    _id,
    question,
    slug,
    summaryForAI
  }
}`

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params
  const faq: Faq | null = await client.fetch(query, { slug })
  const faqUrl = `https://upsum.info/faqs/${slug}`

  if (!faq) {
    return {
      title: 'FAQ not found – Upsum',
      description: 'The requested FAQ could not be found.',
    }
  }

  return {
    title: `${faq.question} – Upsum`,
    description: faq.summaryForAI || `Find the answer to: ${faq.question}. Quick, accurate answers from Upsum.`,
    keywords: faq.tags?.join(', '),
    alternates: {
      canonical: faqUrl,
    },
    openGraph: {
      title: `${faq.question} – Upsum`,
      description: faq.summaryForAI || `Find the answer to: ${faq.question}`,
      url: faqUrl,
      siteName: 'Upsum',
      images: faq.image?.asset?.url ? [faq.image.asset.url] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${faq.question} – Upsum`,
      description: faq.summaryForAI || `Find the answer to: ${faq.question}`,
      images: faq.image?.asset?.url ? [faq.image.asset.url] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function FaqPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const faq: Faq = await client.fetch(query, { slug })
  if (!faq) return notFound()
  
  const faqUrl = `https://upsum.info/faqs/${slug}`

  // Add safety checks for the FAQ data
  const safeManualRelatedFAQs = (faq.manualRelatedFAQs || []).filter(relatedFaq => 
    relatedFaq && 
    relatedFaq.slug && 
    relatedFaq.slug.current && 
    relatedFaq.question
  );

  const safeAllFAQs = (faq.allFAQs || []).filter(allFaq => 
    allFaq && 
    allFaq.slug && 
    allFaq.slug.current && 
    allFaq.question
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Enhanced JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "QAPage",
            "@id": faqUrl,
            "url": faqUrl,
            "name": faq.question,
            "description": faq.summaryForAI || `Find the answer to: ${faq.question}`,
            "inLanguage": "en-US",
            "datePublished": faq.publishedAt || new Date().toISOString(),
            "dateModified": faq.updatedAt || new Date().toISOString(),
            "isPartOf": {
              "@type": "WebSite",
              "@id": "https://upsum.info/#website",
              "url": "https://upsum.info",
              "name": "Upsum",
              "description": "Quick answers to your questions",
              "publisher": {
                "@type": "Organization",
                "@id": "https://upsum.info/#organization",
                "name": "Harpoon Productions Ltd",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://upsum.info/upsum.png"
                }
              }
            },
            "mainEntity": {
              "@type": "Question",
              "@id": `${faqUrl}#question`,
              "name": faq.question,
              "text": faq.question,
              "answerCount": 1,
              "acceptedAnswer": {
                "@type": "Answer",
                "@id": `${faqUrl}#answer`,
                "text": faq.summaryForAI || "Detailed answer provided on the page.",
                "dateCreated": faq.publishedAt || new Date().toISOString(),
                "upvoteCount": 0,
                "author": {
                  "@type": "Organization",
                  "@id": "https://upsum.info/#organization",
                  "name": "Upsum"
                }
              }
            },
            "author": {
              "@type": "Organization",
              "@id": "https://upsum.info/#organization",
              "name": "Upsum"
            },
            "publisher": {
              "@type": "Organization",
              "@id": "https://upsum.info/#organization",
              "name": "Harpoon Productions Ltd",
              "logo": {
                "@type": "ImageObject",
                "url": "https://upsum.info/upsum.png"
              }
            },
            ...(faq.image?.asset?.url && {
              "primaryImageOfPage": {
                "@type": "ImageObject",
                "url": faq.image.asset.url,
                "caption": faq.image.alt || faq.question
              }
            }),
            ...(faq.tags?.length && {
              "keywords": faq.tags.join(", "),
              "about": faq.tags.map(tag => ({
                "@type": "Thing",
                "name": tag
              }))
            })
          })
        }}
      />

      {/* Organization Schema for Brand Recognition */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://upsum.info/#organization",
            "name": "Harpoon Productions Ltd",
            "alternateName": "Upsum",
            "url": "https://upsum.info",
            "logo": {
              "@type": "ImageObject",
              "url": "https://upsum.info/upsum.png"
            },
            "description": "Quick answers to your questions through structured Q&A content",
            "foundingDate": "2025",
            "sameAs": []
          })
        }}
      />

      {/* BreadcrumbList for Navigation Context */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://upsum.info"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "FAQ",
                "item": faqUrl
              }
            ]
          })
        }}
      />

      {/* Header Section - Matching Homepage with PNG logo */}
      <div className="pt-16 pb-8 px-4">
        <div className="container mx-auto text-center" style={{ maxWidth: '1600px' }}>
          <Link href="/" className="inline-block">
            <Image
              src="/upsum.png"
              alt="Upsum"
              width={400}
              height={120}
              className="mx-auto mb-4"
            />
          </Link>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-8">
            Quick answers to your questions
          </p>
          
          {/* Search Box */}
          <div className="mb-6">
            <SearchWrapper searchFAQs={faq.searchFAQs || []} />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="container mx-auto px-4 mb-8" style={{ maxWidth: '1600px' }}>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors duration-200 group text-sm font-medium"
        >
          <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to all FAQs
        </Link>
      </div>

      {/* Main Content Card */}
      <main className="container mx-auto px-4 pb-16" style={{ maxWidth: '1600px' }}>
        <article className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden mb-12">
          {/* Hero Image with Question Overlay */}
          {faq.image?.asset?.url && (
            <div className="relative h-80 md:h-96 overflow-hidden">
              <Image
                src={faq.image?.asset?.url ? urlFor(faq.image).width(1200).height(600).fit('crop').url() : '/fallback.jpg'}
                alt={faq.image.alt || faq.question}
                fill
                className="object-cover"
              />
              
              {/* Dark gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Question overlay */}
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                <div className="mb-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    Question & Answer
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight max-w-4xl">
                  {faq.question}
                </h2>
              </div>
            </div>
          )}

          {/* Content Section */}
          <div className="p-8 md:p-12">
            {/* If no image, show question as heading */}
            {!faq.image?.asset?.url && (
              <div className="mb-8">
                <div className="mb-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-slate-700 text-sm font-medium">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    Question & Answer
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
                  {faq.question}
                </h2>
              </div>
            )}

            {/* Answer Content */}
            <div className="prose prose-lg prose-slate max-w-none mb-12">
              <PortableText value={faq.answer} />
            </div>

            {/* Updated Citation Box with Click-to-Copy */}
            <CitationBox
              question={faq.question}
              url={faqUrl}
              siteName="Upsum"
              publishedDate={faq.publishedAt}
              author={faq.author?.name}
            />
          </div>
        </article>

        {/* Smart Related Questions */}
        <RelatedFAQs
          currentFAQ={faq}
          manualRelatedFAQs={safeManualRelatedFAQs}
          allFAQs={safeAllFAQs}
          maxSuggestions={3}
        />
      </main>

      {/* Footer with "Powered by Upsum" - New consistent style */}
      <footer className="bg-blue-50 border-t border-blue-200 py-6">
        <div className="container mx-auto px-4 text-center" style={{ maxWidth: '1600px' }}>
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mb-2">
            <span>Powered by</span>
            <Image
              src="/upsum.png"
              alt="Upsum"
              width={60}
              height={24}
              className="opacity-70"
            />
          </div>
          <p className="text-xs text-blue-400">
            Upsum is a trademark of{' '}
            <a 
              href="https://harpoon.productions" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors duration-200"
            >
              Harpoon Productions
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
//repush//