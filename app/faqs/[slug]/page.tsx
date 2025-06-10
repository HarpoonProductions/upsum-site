import { client } from '@/lib/sanity'
import { groq } from 'next-sanity'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import Link from 'next/link'

const query = groq`
  *[_type == "faq" && slug.current == $slug][0]{
    _id,
    question,
    answer,
    image {
      asset->{
        _id,
        url
      },
      alt
    }
  }
`

export default async function Page({ params }: any) {
  const faq = await client.fetch(query, { slug: params.slug })

  if (!faq) {
    return <div className="text-center py-20">FAQ not found</div>
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Link href="/" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
        ← Back to all FAQs
      </Link>

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

      {faq.answer && (
        <div className="prose">
          <PortableText value={faq.answer} />
        </div>
      )}
    </div>
  )
}
