import { sanity } from '@/lib/sanity'
import groq from 'groq'
import { Metadata } from 'next'

// Types
type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await sanity.fetch(
    groq`*[_type == "article" && slug.current == $slug][0]{
      title, slug, excerpt
    }`,
    { slug: params.slug }
  )

  return {
    title: article?.title || 'Article',
    description: article?.excerpt || 'An article on Upsum.',
  }
}

export default async function ArticleDetailPage({ params }: Props) {
  const article = await sanity.fetch(
    groq`*[_type == "article" && slug.current == $slug][0]{
      title, slug, body
    }`,
    { slug: params.slug }
  )

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      <div className="prose prose-lg" dangerouslySetInnerHTML={{ __html: article.body }} />
    </main>
  )
}
