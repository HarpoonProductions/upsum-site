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

interface FaqPageProps {
  params: { slug: string } | Promise<any>
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
  props: FaqPageProps,
  _parent?: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = (props.params as { slug: string })
  const faq: Faq = await client.fetch(query, { slug })
  const faqUrl = `https://upsum-site.vercel.app/faqs/${slug}`

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

export default async function FaqPage(props: FaqPageProps) {
  const { slug } = (props.params as { slug: string })
  const faq: Faq = await client.fetch(query, { slug })
  if (!faq) return notFound()
  const relatedFaqs: Faq[] = faq.tags?.length ? await client.fetch(relatedQuery, { tags: faq.tags }) : []
  const faqUrl = `https://upsum-site.vercel.app/faqs/${slug}`

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-100 py-10 px-4">
      <main className="max-w-3xl mx-auto w-full">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">Upsum</h1>
        <p className="text-center text-gray-600 text-lg mb-6">
          A platform for explaining the news through structured questions and answers.
        </p>

        <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm underline block mb-6">
          ← Back to all FAQs
        </Link>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">{faq.question}</h2>

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

        <div className="prose prose-lg mb-10">
          <PortableText value={faq.answer} />
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-12 text-sm">
          <h3 className="font-semibold text-blue-800 mb-2">How to cite this page</h3>
          <p>
            "{faq.question}." <em>Upsum</em>. Available at: <a href={faqUrl} className="underline text-blue-600">{faqUrl}</a>
          </p>
        </div>

        {relatedFaqs?.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-4">Related questions</h3>
            <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedFaqs.map((related) => (
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
            <div className="sm:hidden overflow-x-auto flex space-x-4">
              {relatedFaqs.map((related) => (
                <Link
                  key={related._id}
                  href={`/faqs/${related.slug.current}`}
                  className="min-w-[250px] bg-white rounded shadow hover:shadow-md p-4 transition block"
                >
                  <h4 className="text-md font-semibold mb-1">{related.question}</h4>
                  <p className="text-sm text-gray-600">{related.summaryForAI}</p>
                </Link>
              ))}
            </div>
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
