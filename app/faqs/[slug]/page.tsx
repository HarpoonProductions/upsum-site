import { sanity } from '@/lib/sanity'
import groq from 'groq'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

type FAQ = {
  _id: string
  question: string
  answer: any
  publishedAt: string
}

type PageProps = {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `FAQ: ${params.slug}`,
  }
}

export default async function Page({ params }: PageProps) {
  const query = groq`*[_type == "faq" && slug.current == $slug][0]{
    _id,
    question,
    answer,
    publishedAt
  }`

  const faq: FAQ | null = await sanity.fetch(query, { slug: params.slug })

  if (!faq) {
    notFound()
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">{faq.question}</h1>
      <p className="text-sm text-gray-500 mb-4">
        {new Date(faq.publishedAt).toLocaleDateString()}
      </p>
      <div>{/* TODO: render PortableText answer */}</div>
    </main>
  )
}
