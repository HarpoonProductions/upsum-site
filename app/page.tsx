import { client } from '@/lib/sanity'
import { groq } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'

interface Faq {
  _id: string
  question: string
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

const query = groq`*[_type == "faq"] | order(publishedAt desc)[0...6] {
  _id,
  question,
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

export const metadata = {
  title: 'Upsum – Structured answers to timely questions',
  description: 'Explore structured, accessible answers to important questions about food, health, and the news.',
  openGraph: {
    title: 'Upsum – Structured answers to timely questions',
    description: 'Explore structured, accessible answers to important questions about food, health, and the news.',
    url: 'https://upsum-site.vercel.app/',
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: 'https://upsum-site.vercel.app/',
  },
}

export default async function HomePage() {
  const faqs: Faq[] = await client.fetch(query)

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-100 py-10 px-4">
      <main className="max-w-5xl mx-auto w-full">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">Upsum</h1>
        <p className="text-center text-gray-600 text-lg mb-10">
          A platform for explaining the news through structured questions and answers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {faqs.map((faq) => (
            <Link
              key={faq._id}
              href={`/faqs/${faq.slug.current}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg p-6 transition block"
            >
              {faq.image?.asset?.url && (
                <Image
                  src={faq.image.asset.url}
                  alt={faq.image.alt || faq.question}
                  width={600}
                  height={340}
                  className="rounded mb-4"
                />
              )}
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{faq.question}</h2>
              <p className="text-gray-600 text-sm">{faq.summaryForAI}</p>
            </Link>
          ))}
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
  )
}
