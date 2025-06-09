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
    <div className="bg-gray-50 min-h-screen py-8 px-4 font-sans">
      <h1 className="text-3xl font-bold text-center mb-10">Upsum FAQs</h1>
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
            <div
              key={faq._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-4 flex flex-col"
            >
              <Link href={`/faqs/${faq.slug.current}`}>
                <Image
                  src={imageUrl}
                  alt={faq.question}
                  width={400}
                  height={250}
                  className="rounded-lg object-cover mb-3"
                />
              </Link>
              <Link href={`/faqs/${faq.slug.current}`}>
                <h2 className="text-xl font-semibold text-gray-800 hover:underline">
                  {faq.question}
                </h2>
              </Link>
              {faq.summaryForAI && (
                <p className="text-gray-600 text-sm mt-2 line-clamp-4">{faq.summaryForAI}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
