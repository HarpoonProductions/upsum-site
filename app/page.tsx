import groq from 'groq'
import { client } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import fallbackImage from '@/public/fallback.jpg'

export default async function HomePage() {
  const query = groq`*[_type == "faq" && defined(slug.current)] | order(publishedAt desc)[0...10] {
    _id,
    question,
    slug,
    publishedAt,
    summary,
    image {
      asset -> {
        url
      }
    }
  }`

  const faqs = await client.fetch(query)

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {faqs.length === 0 && (
          <p className="text-center text-red-600 font-bold col-span-full">
            No FAQs found. Check your Sanity content.
          </p>
        )}
        {faqs.map((faq: any) => {
          const imageUrl = faq.image?.asset?.url
            ? urlFor(faq.image).width(400).height(250).fit('crop').url()
            : fallbackImage

          return (
            <Link
              href={`/faqs/${faq.slug.current}`}
              key={faq._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-4 flex flex-col"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-800">{faq.question}</h2>
              {faq.summary && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-4">{faq.summary}</p>
              )}
              <div className="relative w-full h-48 mt-auto">
                <Image
                  src={imageUrl}
                  alt={faq.question}
                  fill
                  className="rounded-lg object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
