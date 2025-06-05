import { sanity } from '@/lib/sanity'
import groq from 'groq'
import { notFound } from 'next/navigation'

export default async function Page({
  params,
}: {
  params: { slug: string }
}) {
  const query = groq`*[_type == "faq" && slug.current == $slug][0]{
    _id,
    question,
    answer,
    publishedAt
  }`

  const faq = await sanity.fetch(query, { slug: params.slug })

  if (!faq) {
    notFound()
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">{faq.question}</h1>
      <div className="prose">{faq.answer}</div>
    </main>
  )
}
