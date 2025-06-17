// Updated app/faqs/[slug]/page.tsx - Main Upsum Individual FAQ pages with consistent styling

import { client } from '@/lib/sanity'
import { groq } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { urlFor } from '@/lib/sanity'

interface Faq {
  _id: string
  question: string
  answer: any
  slug: { current: string }
  summaryForAI?: string
  image?: {
    asset?: {
      _id: string
      url: string
    }
    alt?: string
  }
  tags?: string[]
}

const query = groq`*[_type == "faq" && slug.current == $slug][0] {
  _id,
  question,
  answer,
  slug,
  summaryForAI,
  image {
    asset->{
      _id,
      url
    },
    alt
  },
  tags
}`

const relatedQuery = groq`*[_type == "faq" && references(^._id) == false && count((tags[])[@ in $tags]) > 0][0...3] {
  _id,
  question,
  slug,
  summaryForAI,
  image {
    asset->{ url }
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
      title: 'FAQ not found – UPF FAQs',
      description: 'The requested FAQ could not be found.',
    }
  }

  return {
    title: `${faq.question} – UPF FAQs`,
    description: faq.summaryForAI || `Find the answer to: ${faq.question}. Quick, accurate answers from Upsum.`,
    keywords: faq.tags?.join(', '),
    alternates: {
      canonical: faqUrl,
    },
    openGraph: {
      title: `${faq.question} – UPF FAQs`,
      description: faq.summaryForAI || `Find the answer to: ${faq.question}`,
      url: faqUrl,
      siteName: 'UPF FAQs',
      images: faq.image?.asset?.url ? [faq.image.asset.url] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${faq.question} – UPF FAQs`,
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
  const relatedFaqs: Faq[] = faq.tags?.length ? await client.fetch(relatedQuery, { tags: faq.tags }) : []
  const faqUrl = `https://upsum.info/faqs/${slug}`

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
            "datePublished": new Date().toISOString(),
            "dateModified": new Date().toISOString(),
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
                "dateCreated": new Date().toISOString(),
                "upvoteCount": 0,
                "author": {
                  "@type": "Organization",
                  "@id": "https://upsum.info/#organization",
                  "name": "Upsum"
                  "@id": "https://upffaqs.com/#organization",
                  "name": "UPF FAQs"
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
              "@id": "https://upffaqs.com/#organization",
              "name": "UPF FAQs"
            },
            "publisher": {
              "@type": "Organization",
              "@id": "https://upffaqs.com/#organization",
              "name": "Harpoon Productions Ltd",
              "logo": {
                "@type": "ImageObject",
                "url": "https://upffaqs.com/upffaqs.png"
>>>>>>> 096655c4310c00a2a916603769c74adb2b7e7a05
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
              src="/upffaqs.png"
              alt="UPF FAQs"
              width={400}
              height={120}
              className="mx-auto mb-4"
            />
          </Link>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Quick answers to your ultra-processed food questions
          </p>
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

            {/* Citation Box - Updated to blue theme */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-orange-900 mb-2 text-lg">How to cite this page</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    "{faq.question}." <em className="font-medium">Upsum</em>. Available at:{' '}
                    <a 
                      href={faqUrl} 
                      className="text-orange-600 hover:text-orange-700 underline decoration-2 underline-offset-2 transition-colors duration-200 break-all"
                    >
                      {faqUrl}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related Questions - Card Style */}
        {relatedFaqs?.length > 0 && (
          <section>
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-slate-800 mb-4">Related Questions</h3>
              <p className="text-slate-600 text-lg">Explore more topics that might interest you</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {relatedFaqs.map((related) => {
                const imageUrl = related.image?.asset?.url
                  ? urlFor(related.image).width(500).height(300).fit('crop').url()
                  : '/fallback.jpg'

                return (
                  <Link
                    key={related._id}
                    href={`/faqs/${related.slug.current}`}
                    className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden"
                  >
                    {/* Image with overlay - matching front page style */}
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={related.question}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
                      />
                      
                      {/* Dark gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Text overlay */}
                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <div className="mb-3">
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            Related
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-white leading-tight group-hover:text-orange-200 transition-colors duration-300">
                          {related.question}
                        </h4>
                      </div>
                      
                      {/* Hover indicator */}
                      <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {related.summaryForAI && (
                        <p className="text-slate-600 leading-relaxed line-clamp-3 mb-4">
                          {related.summaryForAI}
                        </p>
                      )}
                      <div className="flex items-center text-orange-600 text-sm font-medium group-hover:text-orange-700 transition-colors duration-200">
                        Read answer
                        <svg className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
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