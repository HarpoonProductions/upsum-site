import { sanity } from '@/lib/sanity'
import groq from 'groq'

type Props = {
  params: {
    slug: string
  }
}

export default async function ArticlePage({ params }: Props) {
  const query = groq`*[_type == "article" && slug.current == $slug][0] {
    _id,
    title,
    body
  }`

  const article = await sanity.fetch(query, { slug: params.slug })

  if (!article) {
    return <div>Article not found</div>
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
      <div>{article.body}</div>
    </main>
  )
}
