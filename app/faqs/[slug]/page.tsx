import { sanity } from '@/lib/sanity'
import groq from 'groq'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return {
    title: `FAQ: ${params.slug}`,
  }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const query = groq`*[_type == "faq" && slug.current == $slug][0]{
    _id,
    question,
    answer,
    publishedAt
  }`

  const faq = await sanity.fetch(query, { slug: params.slug })

  if (!faq) {
    notFound()
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">{faq.question}</h1>
      <p className="text-sm text-gray-500 mb-4">
        {new Date(faq.publishedAt).toLocaleDateString()}
      </p>
      <div>{/* TODO: render PortableText */}</div>
    </main>
  )
}
