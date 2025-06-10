'use client'

import { client } from '@/lib/sanity'
import { groq } from 'next-sanity'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'

const query = groq`*[_type == "faq" && slug.current == $slug][0]{
  _id,
  question,
  answer,
  slug,
  tags,
  image {
    asset->{
      _id,
      url
    },
    alt
  }
}`

const relatedQuery = groq`*[_type == "faq" && references(^._id) == false && count((tags[])[@ in $tags]) > 0][0...3]{
  _id,
  question,
  slug,
  summaryForAI,
  image {
    asset->{
      url
    }
  }
}`

export default async function FaqPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const faq = await client.fetch(query, { slug })

  if (!faq) {
    return <div>FAQ not found</div>
  }

  const relatedFaqs = faq.tags?.length ? await client.fetch(relatedQuery, { tags: faq.tags }) : []

  const faqUrl = `https://upsum-site.vercel.app/faqs/${slug}`

  return (
    <>
      <Head>
        <title>{faq.question} – Upsum</title>
        <link rel="canonical" href={faqUrl} />
        <meta name="description" content={faq.summaryForAI || 'A structured answer from Upsum'} />

        {/* Open Graph / Twitter */}
        <meta property="og:title" content={`${faq.question} – Upsum`} />
        <meta property="og:description" content={faq.summaryForAI || ''} />
        <meta property="og:url" content={faqUrl} />
        {faq.image?.asset?.url && <meta property="og:image" content={faq.image.asset.url} />}

        <meta name="twitter:card" content="summary_large_image" />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [{
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: typeof faq.answer === 'string' ? faq.answer : '',
              },
            }],
            url: faqUrl
          })
        }} />
      </Head>

      <div className="min-h-screen flex flex-col justify-between bg-gray-100">
        <main className="w-full py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">Upsum</h1>
            <p className="text-center text-gray-600 text-lg mb-10">
              A platform for explaining the news through structured questions and answers.
            </p>

            <h2 className="text-2xl font-bold mb-4">{faq.question}</h2>

            {faq.image?.asset?.url && (
              <div className="mb-6">
                <Image
                  src={faq.image.asset.url}
                  alt={faq.image.alt || faq.question}
                  width={800}
                  height={450}
                  className="rounded"
                />
              </div>
            )}

            <div className="prose prose-lg mb-8">
              <PortableText value={faq.answer} />
            </div>

            {/* How to cite this page */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-10 text-sm">
              <h3 className="font-semibold text-blue-800 mb-2">How to cite this page</h3>
              <p>
                "{faq.question}." <em>Upsum</em>. Available at: <a href={faqUrl} className="underline text-blue-600">{faqUrl}</a>
              </p>
            </div>

            {/* Related FAQs */}
            {relatedFaqs?.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-4">Related questions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedFaqs.map((related: any) => (
                    <Link
                      key={related._id}
                      href={`/faqs/${related.slug.current}`}
                      className="bg-white rounded shadow hover:shadow-md p-4 transition block"
                    >
                      <h4 className="text-md font-semibold mb-1">{related.question}</h4>
                      <p className="text-sm text-gray-600">{related.summaryForAI}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="bg-gray-200 text-sm text-gray-700 px-4 py-6 mt-12 w-full">
          <div className="max-w-4xl mx-auto text-center">
            <p>
              <strong>Upsum</strong> is a platform for explaining the news through structured questions and answers.
            </p>
            <p className="mt-2">Upsum is a trademark of Harpoon Productions Ltd.</p>
          </div>
        </footer>
      </div>
    </>
  )
}
