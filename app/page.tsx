'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanityImage'
import Head from 'next/head'

const fallbackImage = '/fallback.jpg'

interface Faq {
  _id: string
  question: string
  slug: {
    current: string
  }
  summaryForAI: string
  tags?: string[]
  image?: {
    asset?: {
      _id: string
      url: string
    }
  }
}

async function fetchFaqs(): Promise<Faq[]> {
  const res = await fetch('/api/faqs')
  return res.json()
}

export default function HomePage() {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  useEffect(() => {
    fetchFaqs().then(setFaqs)
  }, [])

  const filteredFaqs = selectedTag
    ? faqs.filter((faq) => faq.tags?.includes(selectedTag))
    : faqs

  const popularTags = ['UPF', 'Health', 'Nutrition', 'Policy']

  return (
    <>
      <Head>
        <title>Upsum – Questions that explain the news</title>
        <meta
          name="description"
          content="A platform for explaining the news through structured questions and answers."
        />
        <link rel="canonical" href="https://upsum-site.vercel.app/" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://upsum-site.vercel.app/" />
        <meta property="og:title" content="Upsum – Questions that explain the news" />
        <meta
          property="og:description"
          content="A platform for explaining the news through structured questions and answers."
        />
        <meta property="og:image" content="https://upsum-site.vercel.app/og-image.jpg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Upsum – Questions that explain the news" />
        <meta
          name="twitter:description"
          content="A platform for explaining the news through structured questions and answers."
        />
        <meta name="twitter:image" content="https://upsum-site.vercel.app/og-image.jpg" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: filteredFaqs.slice(0, 10).map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.summaryForAI,
              },
            })),
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Upsum",
            url: "https://upsum-site.vercel.app/",
            logo: "https://upsum-site.vercel.app/logo.png",
            sameAs: [
              "https://twitter.com/[your-handle]",
              "https://www.linkedin.com/company/[your-page]",
            ],
            founder: {
              "@type": "Person",
              name: "Giles Wilson",
            },
          })}
        </script>
      </Head>

      <div className="min-h-screen flex flex-col justify-between bg-gray-100">
        <main className="w-full py-10 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">Upsum</h1>
            <p className="text-center text-gray-600 text-lg mb-10">
              A platform for explaining the news through structured questions and answers.
            </p>

            {/* Popular Tags */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`text-sm font-medium px-3 py-1 rounded-full transition ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>

            <div className="flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {filteredFaqs.map((faq) => (
                  <Link
                    href={`/faqs/${faq.slug.current}`}
                    key={faq._id}
                    className="bg-white p-4 rounded-lg shadow hover:shadow-md transition duration-200"
                  >
                    <div className="w-full h-48 relative mb-4">
                      <Image
                        src={
                          faq.image?.asset?.url
                            ? urlFor(faq.image).width(800).height(400).url()
                            : fallbackImage
                        }
                        alt={faq.question}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">{faq.question}</h2>
                    <p className="text-sm text-gray-700">{faq.summaryForAI}</p>
                  </Link>
                ))}
              </div>
            </div>
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
