'use client'

import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import fallbackImage from '@/public/fallback.jpg'

export default function ArticleList({ articles }: { articles: any[] }) {
  return (
    <ul className="space-y-4">
      {articles.map((article) => {
        const imageUrl = article.image?.asset?.url
          ? urlFor(article.image).width(100).height(100).fit('crop').url()
          : fallbackImage

        return (
          <li key={article._id}>
            <Link href={`/articles/${article.slug.current}`}>
              <div className="flex items-center space-x-4 hover:bg-gray-50 p-3 rounded transition">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover rounded"
                    sizes="96px"
                  />
                </div>
                <div>
                  <div className="text-blue-600 underline text-lg font-medium">
                    {article.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(article.publishedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
