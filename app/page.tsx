// Updated app/page.tsx - Homepage with hero section and correct footer

import groq from 'groq'
import { client } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

export default async function HomePage() {
  const query = groq`*[_type == "faq" && defined(slug.current)] | order(publishedAt desc, _createdAt desc)[0...10] {
    _id,
    question,
    slug,
    summaryForAI,
    keywords,
    category->{
      title
    },
    image {
      asset -> {
        url
      },
      alt
    },
    publishedAt
  }`

  const faqs = await client.fetch(query)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Website and Organization Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": "https://upffaqs.com/#website",
            "url": "https://upffaqs.com",
            "name": "UPF FAQs",
            "description": "Quick answers to your ultra-processed food questions",
            "inLanguage": "en-US",
            "publisher": {
              "@type": "Organization",
              "@id": "https://upffaqs.com/#organization",
              "name": "Harpoon Productions Ltd",
              "alternateName": "UPF FAQs",
              "logo": {
                "@type": "ImageObject",
                "url": "https://upffaqs.com/upf-logo.png"
              }
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://upffaqs.com/?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://upffaqs.com/#organization",
            "name": "Harpoon Productions Ltd",
            "alternateName": "UPF FAQs",
            "url": "https://upffaqs.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://upffaqs.com/upf-logo.png"
            },
            "description": "Quick answers to your ultra-processed food questions",
            "foundingDate": "2025",
            "sameAs": []
          })
        }}
      />

      {/* FAQPage Schema for the collection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "@id": "https://upffaqs.com/#faqpage",
            "url": "https://upffaqs.com",
            "name": "UPF FAQs - Ultra-Processed Food Questions & Answers",
            "description": "Find answers to frequently asked questions about ultra-processed foods, health effects, and alternatives",
            "inLanguage": "en-US",
            "isPartOf": {
              "@type": "WebSite",
              "@id": "https://upffaqs.com/#website"
            },
            "mainEntity": faqs.slice(0, 5).map((faq: any) => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.summaryForAI || "Detailed answer available on the page.",
                "url": `https://upffaqs.com/faqs/${faq.slug.current}`
              }
            }))
          })
        }}
      />

      {/* Hero Section - NEW! Matching the FAQ page style */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        {/* Background gradient - matching your orange/red theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-red-600"></div>
        
        {/* Optional: Add a subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI0Ii8+PC9nPjwvZz48L3N2Zz4=')] bg-repeat"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            UPF FAQs
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto leading-relaxed">
            Quick answers to your ultra-processed food questions
          </p>
          
          {/* Optional: Add a subtle badge */}
          <div className="mt-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              Your trusted UPF resource
            </span>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <div className="container mx-auto px-4 py-16" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {faqs.map((faq: any, index: number) => {
            const imageUrl = faq.image?.asset?.url
              ? urlFor(faq.image).width(500).height(300).fit('crop').url()
              : '/fallback.jpg'

            return (
              <article
                key={faq._id}
                className="group relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                {/* Clickable Image Container with Overlay */}
                <Link
                  href={`/faqs/${faq.slug.current}`}
                  className="block relative overflow-hidden group"
                >
                  <div className="relative h-64 md:h-72 overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={faq.image?.alt || faq.question}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    
                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Text overlay */}
                    <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                      {/* Timestamp */}
                      <div className="mb-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          UPF Question
                        </span>
                      </div>
                      
                      {/* Question Title */}
                      <h2 className="text-xl md:text-2xl font-bold text-white leading-tight group-hover:text-orange-200 transition-colors duration-300">
                        {faq.question}
                      </h2>
                    </div>
                    
                    {/* Hover indicator */}
                    <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* Content Section */}
                <div className="p-6 md:p-8">
                  {/* Summary */}
                  {faq.summaryForAI && (
                    <p className="text-slate-600 leading-relaxed line-clamp-3 mb-6">
                      {faq.summaryForAI}
                    </p>
                  )}

                  {/* Read More Link */}
                  <Link
                    href={`/faqs/${faq.slug.current}`}
                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold text-sm group/link transition-colors duration-200"
                  >
                    Read full answer
                    <svg 
                      className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>

                {/* Subtle border effect */}
                <div className="absolute inset-0 rounded-3xl ring-1 ring-slate-200/50 group-hover:ring-orange-300/50 transition-colors duration-300 pointer-events-none" />
              </article>
            )
          })}
        </div>

        {/* Empty state */}
        {faqs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No UPF FAQs found</h3>
            <p className="text-slate-500">Check back later for new questions and answers about ultra-processed foods!</p>
          </div>
        )}
      </div>

      {/* Footer with "Powered by Upsum" - FIXED! */}
      <footer className="bg-orange-50 border-t border-orange-200 py-6">
        <div className="container mx-auto px-4 text-center" style={{ maxWidth: '1600px' }}>
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <span>Powered by</span>
            <span className="font-semibold text-orange-600">Upsum</span>
          </div>
        </div>
      </footer>
    </div>
  )
}