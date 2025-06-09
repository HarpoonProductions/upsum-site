import groq from 'groq'
import { client } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import fallbackImage from '@/public/fallback.jpg'

export default async function HomePage() {
  const query = groq`*[_type == "article" && defined(slug.current)] | order(publishedAt desc)[0...10] {
    _id,
    title,
    slug,
    publishedAt,
    summary,
    image {
      asset -> {
        url
      }
    }
  }`

  const articles = await client.fetch(query)

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article: any) => {
          const imageUrl = article.image?.asset?.url
            ? urlFor(article.image).width(400).height(250).fit('crop').url()
            : fallbackImage

          return (
            <Link
              href={`/articles/${article.slug.current}`}
              key={article._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-4 flex flex-col"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-800">{article.title}</h2>
              {article.summary && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-4">{article.summary}</p>
              )}
              <div className="relative w-full h-48 mt-auto">
                <Image
                  src={imageUrl}
                  alt={article.title}
                  fill
                  className="rounded-lg object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
