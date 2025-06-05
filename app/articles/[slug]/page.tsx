import { sanity } from '@/lib/sanity'
import groq from 'groq'

type Article = {
  _id: string
  title: string
  slug: { current: string }
  publishedAt: string
  body: any // Optional: if you're using portable text
}

export default async function Page({ params }: { params: { slug: string } }) {
  const query = groq`*[_type == "article" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    publishedAt,
    body
  }`

  const article: Article = await sanity.fetch(query, { slug: params.slug })

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
      <p className="text-sm text-gray-500">{article.publishedAt}</p>
      {/* Render body or content here */}
    </main>
  )
}
