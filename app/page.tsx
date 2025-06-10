import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/lib/sanity'
import { urlFor } from '@/lib/sanityImage'
import groq from 'groq'

const fallbackImage = '/fallback.jpg' // Ensure you have this in your /public folder

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
      <div className="flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
          {faqs.length === 0 && (
            <p className="text-center text-red-600 font-bold col-span-full">
              No FAQs found.
            </p>
          )}
          {faqs.map((faq) => (
            <Link
              href={`/articles/${faq.slug.current}`}
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
  )
}
