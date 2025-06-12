import groq from 'groq'
import { client } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

export default async function HomePage() {
  const query = groq`*[_type == "faq" && defined(slug.current)] | order(_createdAt desc)[0...10] {
    _id,
    question,
    slug,
    summaryForAI,
    image {
      asset -> {
        url
      }
    }
  }`

  const faqs = await client.fetch(query)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header Section */}
      <div className="pt-16 pb-8 px-4">
        <div className="max-w-8xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-4">
            Upsum
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Quick answers to your questions
          </p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-8xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 lg:gap-12">
          {faqs.map((faq: any, index: number) => {
            const imageUrl = faq.image?.asset?.url
              ? urlFor(faq.image).width(500).height(300).fit('crop').url()
              : '/fallback.jpg'

            return (
              <article
                key={faq._id}
                className={`group relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                  index === 0 ? 'md:col-span-2 xl:col-span-1' : ''
                }`}
              >
                {/* Clickable Image Container with Overlay */}
                <Link
                  href={`/faqs/${faq.slug.current}`}
                  className="block relative overflow-hidden group"
                >
                  <div className="relative h-72 md:h-80 overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={faq.question}
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
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          Latest
                        </span>
                      </div>
                      
                      {/* Question Title */}
                      <h2 className="text-xl md:text-2xl font-bold text-white leading-tight group-hover:text-blue-200 transition-colors duration-300">
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
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm group/link transition-colors duration-200"
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
                <div className="absolute inset-0 rounded-3xl ring-1 ring-slate-200/50 group-hover:ring-blue-300/50 transition-colors duration-300 pointer-events-none" />
              </article>
            )
          })}
        </div>

        {/* Empty state */}
        {faqs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No FAQs found</h3>
            <p className="text-slate-500">Check back later for new questions and answers!</p>
          </div>
        )}
      </div>
    </div>
  )
}