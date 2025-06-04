import { sanity } from '@/lib/sanity'
import groq from 'groq'

type Article = {
  _id: string
  title: string
  slug: { current: string }
  publishedAt: string
}

export default async function HomePage() {
  const query = groq`*[_type == "article" && defined(slug.current)] | order(publishedAt desc)[0...10] {
    _id,
    title,
    slug,
    publishedAt
  }`

  const articles: Article[] = await sanity.fetch(query)

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Latest Articles</h1>
      <ul>
        {articles.map((article) => (
          <li key={article._id} className="mb-2">
            <a href={`/articles/${article.slug.current}`} className="text-blue-600 underline">
              {article.title}
            </a>
          </li>
        ))}
      </ul>
    </main>
  )
}
