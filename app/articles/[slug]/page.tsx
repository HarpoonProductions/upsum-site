import { sanity } from '@/lib/sanity'
import groq from 'groq'
import { notFound } from 'next/navigation'

type Article = {
  _id: string
  title: string
  body: any
  publishedAt: string
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string }
}) {
  const query = groq`*[_type == "article" && slug.current == $slug][0]{
    _id,
    title,
    body,
    publishedAt
  }`

  const article: Article | null = await sanity.fetch(query, { slug: params.slug })

  if (!article) {
    notFound()
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
      <p className="text-gray-500 text-sm mb-4">{new Date(article.publishedAt).toLocaleDateString()}</p>
      <div>{/* TODO: Render article.body with PortableText later */}</div>
    </main>
  )
}
