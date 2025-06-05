import { type Metadata } from 'next'
import { sanity } from '@/lib/sanity'
import groq from 'groq'
import { notFound } from 'next/navigation'

type Props = {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Article: ${params.slug}`,
  }
}

export default async function Page({ params }: Props) {
  const query = groq`*[_type == "article" && slug.current == $slug][0]{
    _id,
    title,
    body,
    publishedAt
  }`

  const article = await sanity.fetch(query, { slug: params.slug })

  if (!article) {
    notFound()
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
      <p className="text-sm text-gray-500 mb-4">
        {new Date(article.publishedAt).toLocaleDateString()}
      </p>
      <div>{/* TODO: render PortableText */}</div>
    </main>
  )
}
