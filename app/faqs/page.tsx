// app/faqs/page.tsx - All Upsum FAQs Page

'use client'

import groq from 'groq'
import { client } from '@/lib/sanity'
import { urlFor } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

// Type definitions
interface FAQ {
  _id: string;
  question: string;
  slug: { current: string };
  summaryForAI?: string;
  keywords?: string[];
  category?: { title: string };
  image?: {
    asset?: {
      url: string;
    };
    alt?: string;
  };
  publishedAt?: string;
  _createdAt?: string;
}

interface SearchBoxProps {
  faqs: FAQ[];
  onFilterChange: (filteredFaqs: FAQ[]) => void;
}

// Search and Filter Component
const SearchAndFilter = ({ faqs, onFilterChange }: SearchBoxProps) => {
  const [query, setQuery] = useState('');

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (!searchQuery.trim()) {
      onFilterChange(faqs);
      return;
    }

    const searchTerm = searchQuery.toLowerCase();
    const filtered = faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchTerm) ||
      faq.summaryForAI?.toLowerCase().includes(searchTerm) ||
      faq.keywords?.some(keyword => keyword.toLowerCase().includes(searchTerm))
    );
    
    onFilterChange(filtered);
  };

  return (
    <div className="mb-8">
      <div className="relative max-w-md mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
          placeholder="Search all FAQs..."
        />
        {query && (
          <button
            onClick={() => handleSearch('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <svg className="h-5 w-5 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// FAQ Card Component
const FAQCard = ({ faq }: { faq: FAQ }) => {
  const imageUrl = faq.image?.asset?.url
    ? urlFor(faq.image).width(400).height(250).fit('crop').url()
    : '/fallback.jpg';

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <Link
        href={`/faqs/${faq.slug.current}`}
        className="block"
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-slate-100">
          <Image
            src={imageUrl}
            alt={faq.image?.alt || faq.question}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          
          {/* Hover indicator */}
          <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-semibold text-slate-800 leading-snug mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
            {faq.question}
          </h3>
          
          {faq.summaryForAI && (
            <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4">
              {faq.summaryForAI}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
              Read answer
              <svg className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
            
            {faq.category && (
              <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                {faq.category.title}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
};

export default function AllFAQsPage() {
  const [allFaqs, setAllFaqs] = useState<FAQ[]>([]);
  const [displayedFaqs, setDisplayedFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllFaqs = async () => {
      try {
        const query = groq`*[
          _type == "faq" && 
          defined(slug.current) && 
          defined(question) && 
          slug.current != null && 
          question != null
        ] | order(_createdAt desc) {
          _id,
          question,
          slug,
          summaryForAI,
          keywords,
          category -> { title },
          image {
            asset -> { url },
            alt
          },
          publishedAt,
          _createdAt
        }`;

        const faqs = await client.fetch(query);
        const validFaqs = faqs.filter((faq: any) => 
          faq && faq._id && faq.question && faq.slug && faq.slug.current
        );
        
        setAllFaqs(validFaqs);
        setDisplayedFaqs(validFaqs);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        setError('Failed to load FAQs. Please try again later.');
        setLoading(false);
      }
    };

    fetchAllFaqs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading all FAQs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Error Loading FAQs</h2>
            <p className="text-slate-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "All Upsum FAQs",
            "description": "Complete collection of frequently asked questions and answers on Upsum",
            "url": "https://upsum.info/faqs",
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": allFaqs.length,
              "itemListElement": allFaqs.slice(0, 10).map((faq, index) => ({
                "@type": "Question",
                "position": index + 1,
                "name": faq.question,
                "url": `https://upsum.info/faqs/${faq.slug.current}`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.summaryForAI || faq.question
                }
              }))
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://upsum.info"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "All FAQs",
                  "item": "https://upsum.info/faqs"
                }
              ]
            }
          })
        }}
      />

      {/* Header */}
      <div className="pt-16 pb-8 px-4">
        <div className="container mx-auto text-center" style={{ maxWidth: '1200px' }}>
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center justify-center gap-2 text-sm text-slate-600">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li className="text-slate-800 font-medium">All FAQs</li>
            </ol>
          </nav>

          {/* Logo */}
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/upsum.png"
              alt="Upsum"
              width={300}
              height={90}
              className="mx-auto"
            />
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            All Upsum FAQs
          </h1>
          <p className="text-slate-600 text-lg mb-2">
            Browse our complete collection of {allFaqs.length} questions and answers
          </p>
          {displayedFaqs.length !== allFaqs.length && (
            <p className="text-slate-500 text-sm">
              Showing {displayedFaqs.length} filtered results
            </p>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="container mx-auto px-4 mb-8" style={{ maxWidth: '1200px' }}>
        <SearchAndFilter faqs={allFaqs} onFilterChange={setDisplayedFaqs} />
      </div>

      {/* FAQs Grid */}
      <div className="container mx-auto px-4 pb-16" style={{ maxWidth: '1200px' }}>
        {displayedFaqs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedFaqs.map((faq) => (
              <FAQCard key={faq._id} faq={faq} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No FAQs found</h3>
            <p className="text-slate-600 mb-6">
              {allFaqs.length === 0 
                ? "No FAQs have been published yet."
                : "Try adjusting your search terms."
              }
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Homepage
            </Link>
          </div>
        )}
      </div>

      {/* Back to Top Button */}
      {displayedFaqs.length > 12 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          aria-label="Back to top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      {/* Footer */}
      <footer className="bg-blue-50 border-t border-blue-200 py-6 mt-16">
        <div className="container mx-auto px-4 text-center" style={{ maxWidth: '1200px' }}>
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mb-2">
            <span>Powered by</span>
            <Image
              src="/upsum.png"
              alt="Upsum"
              width={60}
              height={24}
              className="opacity-70"
            />
          </div>
          <p className="text-xs text-blue-400">
            Upsum is a trademark of{' '}
            <a 
              href="https://harpoon.productions" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors duration-200"
            >
              Harpoon Productions
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}