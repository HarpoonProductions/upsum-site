// app/articles/[slug]/page.tsx
import { sanity } from '@/lib/sanity'
import groq from 'groq'
import { Metadata } from 'next'
import Script from 'next/script'

type Article = {
  title: string
  slug: { current: string }
  publishedAt: string
  updatedAt?: string
  body: string
  author?: { name: string }
  category?: { title: string }
  image?: { asset: { url: string } }
}

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await sanity.fetch(
    groq`*[_type == "article" && slug.current == $slug][0]{
      title, slug, publishedAt, updatedAt, body, author->{name}, category->{title}
    }`,
    { slug: params.slug }
  )

  return {
    title: article.title,
    description: article.body.slice(0, 150) + '...',
    alternates: {
      canonical: `https://upsum.vercel.app/articles/${article.slug.current}`,
    },
    openGraph: {
      title: article.title,
      description: article.body.slice(0, 150) + '...',
      url: `https://upsum.vercel.app/articles/${article.slug.current}`,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: article.title,
      description: article.body.slice(0, 150) + '...',
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const article: Article = await sanity.fetch(
    groq`*[_type == "article" && slug.current == $slug][0]{
      title, slug, publishedAt, updatedAt, body,
      author->{name}, category->{title}, image{asset->{url}}
    }`,
    { slug: params.slug }
  )

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': article.title,
    'articleBody': article.body,
    'author': article.author?.name ? { '@type': 'Person', name: article.author.name } : undefined,
    'datePublished': article.publishedAt,
    'dateModified': article.updatedAt || article.publishedAt,
    'mainEntityOfPage': `https://upsum.vercel.app/articles/${article.slug.current}`
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      <p className="text-sm text-gray-500 mb-2">
        {article.category?.title} | {article.author?.name} | {new Date(article.publishedAt).toLocaleDateString()}
      </p>
      {article.image?.asset?.url && (
        <img src={article.image.asset.url} alt={article.title} className="rounded mb-4" />
      )}
      <div className="prose prose-lg" dangerouslySetInnerHTML={{ __html: article.body }} />

      <Script
        id="article-detail-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </main>
  )
}
