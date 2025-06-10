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
    <div className="min-h-screen flex flex-col justify-between bg-gray-100">
      <main className="max-w-3xl mx-auto py-10 px-4">
        <Link href="/" className="text-blue-600 hover:underline text-sm mb-6 inline-block">
          ← Back to all FAQs
        </Link>

        <h1 className="text-3xl font-bold mb-4 text-gray-800">{faq.question}</h1>

        {faq.image?.asset?.url && (
          <div className="w-full h-64 relative mb-6">
            <Image
              src={faq.image.asset.url}
              alt={faq.image.alt || faq.question}
              fill
              className="object-cover rounded"
            />
          </div>
        )}

        {faq.answer && (
          <div className="prose prose-lg max-w-none text-gray-800">
            <PortableText value={faq.answer} />
          </div>
        )}
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
  )
}
