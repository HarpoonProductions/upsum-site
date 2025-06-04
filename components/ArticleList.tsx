'use client'

export default function ArticleList({ articles }: { articles: any[] }) {
  return (
    <ul>
      {articles.map((article) => (
        <li key={article._id} className="mb-2">
          <a href={`/articles/${article.slug.current}`} className="text-blue-600 underline">
            {article.title}
          </a>
        </li>
      ))}
    </ul>
  )
}
