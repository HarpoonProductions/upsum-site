import { client } from '@/lib/sanity'
import { groq } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'

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
  const faqUrl = `https://upsum-site.vercel.app/faqs/${slug}`

  if (!faq) {
    return {
      title: 'FAQ not found – Upsum',
      description: 'The requested FAQ could not be found.',
    }
  }

  return {
    title: `${faq.question} – Upsum`,
    description: faq.summaryForAI || 'A structured answer from Upsum',
    alternates: {
      canonical: faqUrl,
    },
    openGraph: {
      title: `${faq.question} – Upsum`,
      description: faq.summaryForAI || '',
      url: faqUrl,
      images: faq.image?.asset?.url ? [faq.image.asset.url] : [],
    },
    twitter: {
      card: 'summary_large_image',
    },
  }
}

export default async function FaqPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const faq: Faq = await client.fetch(query, { slug })
  if (!faq) return notFound()
  const relatedFaqs: Faq[] = faq.tags?.length ? await client.fetch(relatedQuery, { tags: faq.tags }) : []
  const faqUrl = `https://upsum-site.vercel.app/faqs/${slug}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <div className="pt-16 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Navigation */}
          <div className="mb-8">
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

          {/* Brand */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-4">
                Upsum
              </h1>
              <p className="text-slate-600 text-lg">
                Quick answers to your questions
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* Question Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Main Question */}
          <h2 className="text-2xl md:text-4xl font-bold leading-tight text-center">
            {faq.question}
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Featured Image */}
        {faq.image?.asset?.url && (
          <div className="mb-12 -mt-20 relative z-10">
            <div className="rounded-3xl overflow-hidden shadow-2xl bg-white p-2">
              <Image
                src={faq.image.asset.url}
                alt={faq.image.alt || faq.question}
                width={800}
                height={450}
                className="rounded-2xl w-full h-auto object-cover"
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <article className="bg-white rounded-3xl shadow-lg p-8 md:p-12 mb-12">
          <div className="prose prose-lg prose-slate max-w-none">
            <PortableText value={faq.answer} />
          </div>
        </article>

        {/* Citation Box */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-12">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2 text-lg">How to cite this page</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                "{faq.question}." <em className="font-medium">Upsum</em>. Available at:{' '}
                <a 
                  href={faqUrl} 
                  className="text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-2 transition-colors duration-200 break-all"
                >
                  {faqUrl}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Related Questions */}
        {relatedFaqs?.length > 0 && (
          <section className="mt-16">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-slate-800 mb-4">Related Questions</h3>
              <p className="text-slate-600 text-lg">Explore more topics that might interest you</p>
            </div>

            {/* Desktop Grid */}
            <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedFaqs.map((related, index) => (
                <Link
                  key={related._id}
                  href={`/faqs/${related.slug.current}`}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                  {related.image?.asset?.url && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={related.image.asset.url}
                        alt={related.question}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  )}
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-slate-800 mb-3 leading-tight group-hover:text-blue-600 transition-colors duration-200">
                      {related.question}
                    </h4>
                    {related.summaryForAI && (
                      <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                        {related.summaryForAI}
                      </p>
                    )}
                    <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors duration-200">
                      Read more
                      <svg className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile Horizontal Scroll */}
            <div className="sm:hidden">
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {relatedFaqs.map((related) => (
                  <Link
                    key={related._id}
                    href={`/faqs/${related.slug.current}`}
                    className="flex-shrink-0 w-72 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {related.image?.asset?.url && (
                      <div className="relative h-40 overflow-hidden">
                        <Image
                          src={related.image.asset.url}
                          alt={related.question}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <h4 className="text-lg font-semibold text-slate-800 mb-2 leading-tight">
                        {related.question}
                      </h4>
                      {related.summaryForAI && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {related.summaryForAI}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 mt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="mb-6">
              <h4 className="text-2xl font-bold text-white mb-2">Upsum</h4>
              <p className="text-lg">
                A platform for explaining the news through structured questions and answers
              </p>
            </div>
            <div className="border-t border-slate-800 pt-6">
              <p className="text-sm">
                Upsum is a trademark of <span className="font-medium text-white">Harpoon Productions Ltd.</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}