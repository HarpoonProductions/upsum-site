import { sanity } from '@/lib/sanity'
import groq from 'groq'

type Article = {
  _id: string
  title: string
  body: any
  publishedAt: string
}

export async function generateStaticParams() {
  const query = groq`*[_type == "article" && defined(slug.current)][]{
    "slug": slug.current
  }`
  const slugs = await sanity.fetch(query)
  return slugs.map((slug: { slug: string }) => ({ slug: slug.slug }))
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const query = groq`*[_type == "article" && slug.current == $slug][0]{
    _id,
    title,
    body,
    publishedAt
  }`

  const article: Article = await sanity.fetch(query, { slug: params.slug })

  return (
    <article className="p-8">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      <p className="text-sm text-gray-500 mb-6">{new Date(article.publishedAt).toDateString()}</p>
      <div>{JSON.stringify(article.body)}</div>
    </article>
  )
}
