// Updated app/faqs/[slug]/page.tsx - Main Upsum Individual FAQ pages with Citation Box and Related FAQs

'use client'

import { client } from '@/lib/sanity'
import { groq } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { urlFor } from '@/lib/sanity'
import { useState, useEffect } from 'react'

interface Faq {
  _id: string
  question: string
  answer: any
  slug: { current: string }
  summaryForAI?: string
  keywords?: string[]
  category?: { title: string; slug: { current: string } }
  publishedAt?: string
  updatedAt?: string
  author?: { name: string }
  image?: {
    asset?: {
      _id: string
      url: string
    }
    alt?: string
  }
  tags?: string[]
  relatedFAQs?: Faq[]
}

// Updated query to include related FAQs data
const query = groq`*[_type == "faq" && slug.current == $slug][0] {
  _id,
  question,
  answer,
  slug,
  summaryForAI,
  keywords,
  category->{
    title,
    slug
  },
  publishedAt,
  updatedAt,
  author->{
    name
  },
  image {
    asset->{
      _id,
      url
    },
    alt
  },
  tags,
  "manualRelatedFAQs": relatedFAQs[]->{
    _id,
    question,
    slug,
    summaryForAI,
    keywords,
    category->{
      title,
      slug
    },
    image {
      asset->{ url }
    }
  },
  "allFAQs": *[_type == "faq" && _id != ^._id && defined(slug.current)]{
    _id,
    question,
    slug,
    summaryForAI,
    keywords,
    category->{
      title,
      slug
    },
    image {
      asset->{ url }
    }
  }
}`

// Citation Box Component
interface CitationBoxProps {
  question: string;
  url: string;
  siteName: string;
  publishedDate?: string;
  author?: string;
}

function CitationBox({ question, url, siteName, publishedDate, author }: CitationBoxProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  // Generate citation text
  const generateCitation = () => {
    const date = publishedDate ? new Date(publishedDate).toLocaleDateString() : new Date().toLocaleDateString();
    const authorText = author ? `${author}. ` : '';
    return `${authorText}"${question}." ${siteName}, ${date}. ${url}`;
  };

  // Modern clipboard copy with fallback
  const copyToClipboard = async (text: string) => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers or non-secure contexts
        return fallbackCopy(text);
      }
    } catch (err) {
      console.error('Clipboard API failed:', err);
      return fallbackCopy(text);
    }
  };

  // Fallback copy method using execCommand
  const fallbackCopy = (text: string): boolean => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const result = document.execCommand('copy');
      textArea.remove();
      return result;
    } catch (err) {
      console.error('Fallback copy failed:', err);
      return false;
    }
  };

  const handleCopyClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const citationText = generateCitation();
    const success = await copyToClipboard(citationText);
    
    if (success) {
      setCopied(true);
      setError(false);
      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div 
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 cursor-pointer select-none"
      onClick={handleCopyClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCopyClick(e as any);
        }
      }}
      aria-label="Click to copy citation"
    >
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          {copied ? (
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : error ? (
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-blue-900 text-lg">How to cite this page</h3>
            <div className="text-xs text-blue-600 font-medium">
              {copied ? '✓ Copied!' : error ? 'Failed to copy' : 'Click to copy'}
            </div>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            {generateCitation()}
          </p>
        </div>
      </div>
    </div>
  );
}

// Related FAQs Component
interface RelatedFAQsProps {
  currentFAQ: Faq;
  manualRelatedFAQs?: Faq[];
  allFAQs: Faq[];
  maxSuggestions?: number;
}

function RelatedFAQs({ currentFAQ, manualRelatedFAQs = [], allFAQs, maxSuggestions = 3 }: RelatedFAQsProps) {
  const [relatedFAQs, setRelatedFAQs] = useState<Faq[]>([]);

  useEffect(() => {
    // If manual related FAQs are set, use those
    if (manualRelatedFAQs.length > 0) {
      setRelatedFAQs(manualRelatedFAQs.slice(0, maxSuggestions));
      return;
    }

    // Otherwise, generate automatic suggestions
    const suggestions = generateAutomaticSuggestions();
    setRelatedFAQs(suggestions);
  }, [currentFAQ, manualRelatedFAQs, allFAQs, maxSuggestions]);

  const generateAutomaticSuggestions = (): Faq[] => {
    const currentKeywords = currentFAQ.keywords || currentFAQ.tags || [];
    const currentCategory = currentFAQ.category;
    
    // Filter out current FAQ
    const candidateFAQs = allFAQs.filter(faq => faq._id !== currentFAQ._id);
    
    // Score FAQs based on relevance
    const scoredFAQs = candidateFAQs.map(faq => ({
      faq,
      score: calculateRelevanceScore(faq, currentKeywords, currentCategory)
    }));

    // Sort by score and return top suggestions
    return scoredFAQs
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions)
      .map(item => item.faq);
  };

  const calculateRelevanceScore = (
    faq: Faq, 
    currentKeywords: string[], 
    currentCategory?: { title: string; slug: { current: string } }
  ): number => {
    let score = 0;

    // Category match (highest weight)
    if (currentCategory && faq.category?.slug.current === currentCategory.slug.current) {
      score += 10;
    }

    // Keyword matches
    const faqKeywords = faq.keywords || faq.tags || [];
    const matchingKeywords = currentKeywords.filter(keyword => 
      faqKeywords.some(faqKeyword => 
        faqKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(faqKeyword.toLowerCase())
      )
    );
    score += matchingKeywords.length * 3;

    // Question similarity (basic word matching)
    const currentWords = currentFAQ.question.toLowerCase().split(/\s+/);
    const faqWords = faq.question.toLowerCase().split(/\s+/);
    const commonWords = currentWords.filter(word => 
      word.length > 3 && faqWords.includes(word)
    );
    score += commonWords.length;

    return score;
  };

  if (relatedFAQs.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold text-slate-800 mb-4">Related Questions</h3>
        <p className="text-slate-600 text-lg">Explore more topics that might interest you</p>
      </div>

      {/* Desktop: 3 cards in a row */}
      <div className="hidden md:grid md:grid-cols-3 gap-8">
        {relatedFAQs.map((faq) => (
          <RelatedFAQCard key={faq._id} faq={faq} />
        ))}
      </div>

      {/* Mobile: Horizontal scrolling carousel */}
      <div className="md:hidden">
        <div className="flex space-x-4 overflow-x-auto pb-4" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
          {relatedFAQs.map((faq) => (
            <div key={faq._id} className="flex-shrink-0 w-80">
              <RelatedFAQCard faq={faq} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RelatedFAQCard({ faq }: { faq: Faq }) {
  const imageUrl = faq.image?.asset?.url
    ? urlFor(faq.image).width(500).height(300).fit('crop').url()
    : '/fallback.jpg';

  return (
    <Link
      href={`/faqs/${faq.slug.current}`}
      className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden block h-full"
    >
      {/* Image with overlay - matching existing style */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={imageUrl}
          alt={faq.question}
          fill
          className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
        />
        
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Text overlay */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <div className="mb-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              Related
            </span>
          </div>
          <h4 className="text-lg font-bold text-white leading-tight group-hover:text-blue-200 transition-colors duration-300">
            {faq.question}
          </h4>
        </div>
        
        {/* Hover indicator */}
        <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        {faq.summaryForAI && (
          <p className="text-slate-600 leading-relaxed line-clamp-3 mb-4 flex-1">
            {faq.summaryForAI}
          </p>
        )}
        <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors duration-200 mt-auto">
          Read answer
          <svg className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params
  const faq: Faq | null = await client.fetch(query, { slug })
  const faqUrl = `https://upsum.info/faqs/${slug}`

  if (!faq) {
    return {
      title: 'FAQ not found – Upsum',
      description: 'The requested FAQ could not be found.',
    }
  }

  return {
    title: `${faq.question} – Upsum`,
    description: faq.summaryForAI || `Find the answer to: ${faq.question}. Quick, accurate answers from Upsum.`,
    keywords: faq.tags?.join(', '),
    alternates: {
      canonical: faqUrl,
    },
    openGraph: {
      title: `${faq.question} – Upsum`,
      description: faq.summaryForAI || `Find the answer to: ${faq.question}`,
      url: faqUrl,
      siteName: 'Upsum',
      images: faq.image?.asset?.url ? [faq.image.asset.url] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${faq.question} – Upsum`,
      description: faq.summaryForAI || `Find the answer to: ${faq.question}`,
      images: faq.image?.asset?.url ? [faq.image.asset.url] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function FaqPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const faq: Faq = await client.fetch(query, { slug })
  if (!faq) return notFound()
  
  const faqUrl = `https://upsum.info/faqs/${slug}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Enhanced JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "QAPage",
            "@id": faqUrl,
            "url": faqUrl,
            "name": faq.question,
            "description": faq.summaryForAI || `Find the answer to: ${faq.question}`,
            "inLanguage": "en-US",
            "datePublished": faq.publishedAt || new Date().toISOString(),
            "dateModified": faq.updatedAt || new Date().toISOString(),
            "isPartOf": {
              "@type": "WebSite",
              "@id": "https://upsum.info/#website",
              "url": "https://upsum.info",
              "name": "Upsum",
              "description": "Quick answers to your questions",
              "publisher": {
                "@type": "Organization",
                "@id": "https://upsum.info/#organization",
                "name": "Harpoon Productions Ltd",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://upsum.info/upsum.png"
                }
              }
            },
            "mainEntity": {
              "@type": "Question",
              "@id": `${faqUrl}#question`,
              "name": faq.question,
              "text": faq.question,
              "answerCount": 1,
              "acceptedAnswer": {
                "@type": "Answer",
                "@id": `${faqUrl}#answer`,
                "text": faq.summaryForAI || "Detailed answer provided on the page.",
                "dateCreated": faq.publishedAt || new Date().toISOString(),
                "upvoteCount": 0,
                "author": {
                  "@type": "Organization",
                  "@id": "https://upsum.info/#organization",
                  "name": "Upsum"
                }
              }
            },
            "author": {
              "@type": "Organization",
              "@id": "https://upsum.info/#organization",
              "name": "Upsum"
            },
            "publisher": {
              "@type": "Organization",
              "@id": "https://upsum.info/#organization",
              "name": "Harpoon Productions Ltd",
              "logo": {
                "@type": "ImageObject",
                "url": "https://upsum.info/upsum.png"
              }
            },
            ...(faq.image?.asset?.url && {
              "primaryImageOfPage": {
                "@type": "ImageObject",
                "url": faq.image.asset.url,
                "caption": faq.image.alt || faq.question
              }
            }),
            ...(faq.tags?.length && {
              "keywords": faq.tags.join(", "),
              "about": faq.tags.map(tag => ({
                "@type": "Thing",
                "name": tag
              }))
            })
          })
        }}
      />

      {/* Organization Schema for Brand Recognition */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://upsum.info/#organization",
            "name": "Harpoon Productions Ltd",
            "alternateName": "Upsum",
            "url": "https://upsum.info",
            "logo": {
              "@type": "ImageObject",
              "url": "https://upsum.info/upsum.png"
            },
            "description": "Quick answers to your questions through structured Q&A content",
            "foundingDate": "2025",
            "sameAs": []
          })
        }}
      />

      {/* BreadcrumbList for Navigation Context */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
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
                "name": "FAQ",
                "item": faqUrl
              }
            ]
          })
        }}
      />

      {/* Header Section - Matching Homepage with PNG logo */}
      <div className="pt-16 pb-8 px-4">
        <div className="container mx-auto text-center" style={{ maxWidth: '1600px' }}>
          <Link href="/" className="inline-block">
            <Image
              src="/upsum.png"
              alt="Upsum"
              width={400}
              height={120}
              className="mx-auto mb-4"
            />
          </Link>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Quick answers to your questions
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="container mx-auto px-4 mb-8" style={{ maxWidth: '1600px' }}>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors duration-200 group text-sm font-medium"
        >
          <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to all FAQs
        </Link>
      </div>

      {/* Main Content Card */}
      <main className="container mx-auto px-4 pb-16" style={{ maxWidth: '1600px' }}>
        <article className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden mb-12">
          {/* Hero Image with Question Overlay */}
          {faq.image?.asset?.url && (
            <div className="relative h-80 md:h-96 overflow-hidden">
              <Image
                src={faq.image?.asset?.url ? urlFor(faq.image).width(1200).height(600).fit('crop').url() : '/fallback.jpg'}
                alt={faq.image.alt || faq.question}
                fill
                className="object-cover"
              />
              
              {/* Dark gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Question overlay */}
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                <div className="mb-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    Question & Answer
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight max-w-4xl">
                  {faq.question}
                </h2>
              </div>
            </div>
          )}

          {/* Content Section */}
          <div className="p-8 md:p-12">
            {/* If no image, show question as heading */}
            {!faq.image?.asset?.url && (
              <div className="mb-8">
                <div className="mb-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-slate-700 text-sm font-medium">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    Question & Answer
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
                  {faq.question}
                </h2>
              </div>
            )}

            {/* Answer Content */}
            <div className="prose prose-lg prose-slate max-w-none mb-12">
              <PortableText value={faq.answer} />
            </div>

            {/* Updated Citation Box with Click-to-Copy */}
            <CitationBox
              question={faq.question}
              url={faqUrl}
              siteName="Upsum"
              publishedDate={faq.publishedAt}
              author={faq.author?.name}
            />
          </div>
        </article>

        {/* Smart Related Questions */}
        <RelatedFAQs
          currentFAQ={faq}
          manualRelatedFAQs={faq.manualRelatedFAQs}
          allFAQs={faq.allFAQs || []}
          maxSuggestions={3}
        />
      </main>

      {/* Footer with "Powered by Upsum" - New consistent style */}
      <footer className="bg-blue-50 border-t border-blue-200 py-6">
        <div className="container mx-auto px-4 text-center" style={{ maxWidth: '1600px' }}>
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
  )
}
//repush//