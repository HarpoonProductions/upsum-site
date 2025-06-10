// app/page.tsx

import Head from 'next/head'; // Still useful for <head> tags
import Link from 'next/link';
import { client } from '../lib/sanity'; // Adjust this path if your Sanity client is elsewhere

// Define the FAQ type
interface FAQ {
  _id: string;
  question: string;
  answer: string;
  slug: {
    current: string;
  };
}

// Sanity query to fetch all published FAQs
const faqQuery = `*[_type == "faq" && defined(slug.current)] | order(_createdAt asc) {
  _id,
  question,
  answer,
  slug,
}`;

// Data fetching in App Router happens directly in the component (as a Server Component)
async function getFaqs(): Promise<FAQ[]> {
  // Next.js automatically caches data fetched in Server Components.
  // To revalidate, you can use `revalidate` option in fetch or tag data.
  // For Sanity, you'd typically manage revalidation via Sanity webhooks or
  // by setting a `next.revalidate` option in a `fetch` call if you were
  // fetching from an API endpoint directly.
  // For direct client.fetch, Next.js treats it as static by default on build.
  // If you need more frequent revalidation without a webhook, consider a revalidation tag:
  // const faqs = await client.fetch(faqQuery, {}, { next: { tags: ['faqs'], revalidate: 60 } }); // Example revalidate every 60 seconds
  const faqs = await client.fetch(faqQuery);
  return faqs;
}

export default async function Home() {
  const faqs = await getFaqs(); // Call the async data fetching function

  return (
    <div className="min-h-screen flex flex-col">
      {/* Head component for metadata (still valid in App Router) */}
      <Head>
        <title>Upsum Project - Simple Answers</title>
        <meta name="description" content="Simple answers for the modern internet." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Main content area with full-width grey background */}
      <main className="flex-grow bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-4xl mx-auto"> {/* Max width for content within the grey background */}
          <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h1>

          <div className="space-y-8">
            {faqs.map((faq: FAQ) => (
              <div key={faq._id} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                  <Link href={`/faq/${faq.slug.current}`} className="hover:text-blue-600 transition-colors duration-200">
                    {faq.question}
                  </Link>
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {/* You might want to truncate the answer here or show a summary */}
                  {faq.answer && faq.answer.length > 150 ? `${faq.answer.substring(0, 150)}...` : faq.answer}
                </p>
                {faq.answer && faq.answer.length > 150 && (
                  <Link href={`/faq/${faq.slug.current}`} className="text-blue-500 hover:text-blue-600 font-medium mt-2 inline-block">
                    Read more
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-4xl mx-auto text-center text-sm">
          <p>
            This website is part of the Upsum project, which aims to provide simple answers for the modern internet where search and AI makes stuff up that it doesn&apos;t know. It&apos;s brought to you by Harpoon Productions. To learn more about our project, go to{' '}
            <a href="https://Upsum.News" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
              Upsum.News
            </a>
            . Upsum is a trademark of Harpoon Productions Ltd.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Optional: If you need to force dynamic rendering for some reason (less common for a static FAQ page)
// export const dynamic = 'force-dynamic'; // or 'force-static' (default for this setup)
// export const revalidate = 60; // Revalidate data every 60 seconds (useful for incremental static regeneration)