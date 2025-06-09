// app/faqs/[slug]/page.tsx

import { client } from '@/lib/sanity'
import { groq } from 'next-sanity'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'

const query = groq`*[_type == "article"] | order(publishedAt desc)[0...10] {
  _id,
  title,
  slug,
  summary,
  image {
    asset-> {
      url
    }
  }
}`

// 🚨 NEW CHANGE: Cast the entire props object to 'any'
export default async function FaqPage({ params }: any) {
  // We still explicitly type 'slug' for safety inside the function
  const { slug } = params as { slug: string };

  const faq = await client.fetch(query, { slug })

  if (!faq) {
    return <div>FAQ not found</div>
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">{faq.question}</h1>

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

      <div className="prose">
        <PortableText value={faq.answer} />
      </div>
    </div>
  )
}