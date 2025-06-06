import { client } from '@/lib/sanity'
import groq from 'groq'
import Image from 'next/image'
import Link from 'next/link'

const query = groq`
  *[_type == "faq"] | order(publishedAt desc)[0...6] {
    _id,
    question,
    slug,
    publishedAt,
    image {
      asset->{
        url
      }
    }
  }
`

export default async function HomePreviewPage() {
  const faqs = await client.fetch(query)

  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2">Welcome to Upsum</h1>
        <p className="text-lg text-gray-600">Credible answers to big questions</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Latest FAQs</h2>
        <ul className="space-y-6">
          {faqs.map((faq: any) => (
            <li key={faq._id} className="border-b pb-4">
              <Link href={`/faqs/${faq.slug.current}`}>
                <h3 className="text-xl font-bold text-blue-600 hover:underline">{faq.question}</h3>
              </Link>
              {faq.image?.asset?.url && (
                <Image
                  src={faq.image.asset.url}
                  alt={faq.question}
                  width={600}
                  height={340}
                  className="rounded mt-2"
                />
              )}
              <p className="text-sm text-gray-500">
                Published {new Date(faq.publishedAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
