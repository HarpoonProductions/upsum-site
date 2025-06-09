// app/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/lib/sanity'
import { urlFor } from '@/lib/sanityImage'
import fallbackImage from '@/public/fallback.jpg'
import groq from 'groq'

export default async function HomePage() {
  const query = groq`
    *[_type == "faq"] | order(publishedAt desc)[0...6] {
      _id,
      question,
      slug,
      summaryForAI,
      image {
        asset->{
          _id,
          url
        }
      }
    }
  `

  const faqs = await client.fetch(query)

  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4 font-sans">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">UPSUM</h1>
        <p className="text-gray-500 mt-2">
          Unpacking complex topics, one FAQ at a time
        </p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {faqs.length === 0 && (
          <p className="text-center text-red-600 font-bold col-span-full">
            No FAQs found.
          </p>
        )}

        {faqs.map((faq: any) => {
          const imageUrl = faq.image?.asset?.url
            ? urlFor(faq.image).width(400).height(250).fit('crop').url()
            : fallbackImage

          return (
            <Link
              key={faq._id}
              href={`/faqs/${faq.slug.current}`}
              className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex flex-col"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-800">
                {faq.question}
              </h2>
              {faq.summaryForAI && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-4">
                  {faq.summaryForAI}
                </p>
              )}
              <div className="relative w-full h-48 mb-4">
                <Image
                  src={imageUrl}
                  alt={faq.question}
                  fill
                  className="rounded-lg object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <span className="mt-auto text-sm text-blue-600 font-medium hover:underline">
                Read full FAQ →
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
