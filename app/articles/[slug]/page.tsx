import { sanity } from '@/lib/sanity'
import groq from 'groq'
import { Metadata } from 'next'

type Article = {
  _id: string
  title: string
  slug: { current: string }
  publishedAt: string
  body: any // Add other fields as needed
}

type PageProps = {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: params.slug,
  }
}

export default async function Page({ params }: PageProps) {
  const query = groq`*[_type == "article" && slug.current == $slug][0] {
    _id,
    title,
    publishedAt,
    body
  }`

  const article: Article = await sanity.fetch(query, { slug: params.slug })

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
      <p className="text-sm text-gray-600 mb-6">{new Date(article.publishedAt).toLocaleDateString()}</p>
      <div>{/* Render body content here */}</div>
    </main>
  )
}
