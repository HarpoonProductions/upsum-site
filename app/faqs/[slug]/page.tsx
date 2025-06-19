// Updated app/faqs/[slug]/page.tsx - Server component with client components imported

import { client } from '@/lib/sanity'
import { groq } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { urlFor } from '@/lib/sanity'
import CitationBox from './CitationBox'
import RelatedFAQs from './RelatedFAQs'

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
  manualRelatedFAQs?: Faq[]
  allFAQs?: Faq[]
  searchFAQs?: Faq[]
}

// Updated query to include related FAQs data with null checks and search data
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
  "manualRelatedFAQs": relatedFAQs[defined(slug.current) && defined(question)]->{
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
  "allFAQs": *[_type == "faq" && _id != ^._id && defined(slug.current) && defined(question)]{
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
  "searchFAQs": *[_type == "faq" && defined(slug.current) && defined(question)]{
    _id,
    question,
    slug,
    summaryForAI
  }
}`

// Citation Box Component (embedded)
function CitationBox({ question, url, siteName, publishedDate, author }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const generateCitation = () => {
    const date = publishedDate ? new Date(publishedDate).toLocaleDateString() : new Date().toLocaleDateString();
    const authorText = author ? `${author}. ` : '';
    return `${authorText}"${question}." ${siteName}, ${date}. ${url}`;
  };

  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        return fallbackCopy(text);
      }
    } catch (err) {
      console.error('Clipboard API failed:', err);
      return fallbackCopy(text);
    }
  };

  const fallbackCopy = (text) => {
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

  const handleCopyClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const citationText = generateCitation();
    const success = await copyToClipboard(citationText);
    
    if (success) {
      setCopied(true);
      setError(false);
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
          handleCopyClick(e);
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

// Related FAQs Component (embedded)
function RelatedFAQs({ currentFAQ, manualRelatedFAQs = [], allFAQs, maxSuggestions = 3 }) {
  const [relatedFAQs, setRelatedFAQs] = useState([]);

  useEffect(() => {
    try {
      if (!currentFAQ || !currentFAQ.question) {
        setRelatedFAQs([]);
        return;
      }

      if (manualRelatedFAQs && manualRelatedFAQs.length > 0) {
        const validManualFAQs = manualRelatedFAQs.filter(faq => 
          faq && 
          faq.slug && 
          faq.slug.current && 
          faq.question
        );
        setRelatedFAQs(validManualFAQs.slice(0, maxSuggestions));
        return;
      }

      const suggestions = generateAutomaticSuggestions();
      setRelatedFAQs(suggestions);
    } catch (error) {
      console.error('Error in RelatedFAQs useEffect:', error);
      setRelatedFAQs([]);
    }
  }, [currentFAQ, manualRelatedFAQs, allFAQs, maxSuggestions]);

  const generateAutomaticSuggestions = () => {
    try {
      if (!currentFAQ || !allFAQs || allFAQs.length === 0) {
        return [];
      }

      const currentKeywords = currentFAQ.keywords || [];
      const currentCategory = currentFAQ.category;
      
      const candidateFAQs = allFAQs.filter(faq => {
        const isValid = faq && 
          faq._id !== currentFAQ._id && 
          faq.slug && 
          faq.slug.current && 
          faq.question;
        return isValid;
      });
      
      const scoredFAQs = candidateFAQs.map(faq => ({
        faq,
        score: calculateRelevanceScore(faq, currentKeywords, currentCategory)
      }));

      return scoredFAQs
        .sort((a, b) => b.score - a.score)
        .slice(0, maxSuggestions)
        .map(item => item.faq);
    } catch (error) {
      console.error('Error in generateAutomaticSuggestions:', error);
      return [];
    }
  };

  const calculateRelevanceScore = (faq, currentKeywords, currentCategory) => {
    let score = 0;

    if (currentCategory && faq.category?.slug.current === currentCategory.slug.current) {
      score += 10;
    }

    const faqKeywords = faq.keywords || [];
    const matchingKeywords = currentKeywords.filter(keyword => 
      faqKeywords.some(faqKeyword => 
        faqKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(faqKeyword.toLowerCase())
      )
    );
    score += matchingKeywords.length * 3;

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

      <div className="hidden md:grid md:grid-cols-3 gap-8">
        {relatedFAQs.filter(faq => faq && faq.slug && faq.slug.current).map((faq) => (
          <RelatedFAQCard key={faq._id} faq={faq} />
        ))}
      </div>

      <div className="md:hidden">
        <div className="flex space-x-4 overflow-x-auto pb-4" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
          {relatedFAQs.filter(faq => faq && faq.slug && faq.slug.current).map((faq) => (
            <div key={faq._id} className="flex-shrink-0 w-80">
              <RelatedFAQCard faq={faq} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RelatedFAQCard({ faq }) {
  if (!faq || !faq.slug || !faq.slug.current || !faq.question) {
    return null;
  }

  const imageUrl = faq.image?.asset?.url
    ? urlFor(faq.image).width(500).height(300).fit('crop').url()
    : '/fallback.jpg';

  return (
    <Link
      href={`/faqs/${faq.slug.current}`}
      className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden block h-full"
    >
      <div className="relative h-64 overflow-hidden">
        <Image
          src={imageUrl}
          alt={faq.question}
          fill
          className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
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
        
        <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>

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

// Search Component (embedded)
function FAQPageSearch({ searchFAQs }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const searchResults = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    
    const searchTerm = query.toLowerCase();
    
    const validFaqs = searchFAQs.filter(faq => 
      faq && 
      faq.slug && 
      faq.slug.current && 
      faq.question
    );
    
    return validFaqs.filter(faq => 
      faq.question.toLowerCase().includes(searchTerm) ||
      faq.summaryForAI?.toLowerCase().includes(searchTerm)
    ).slice(0, 5);
  }, [query, searchFAQs]);

  const highlightText = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.toLowerCase() 
        ? <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
        : part
    );
  };

  return (
    <div className="relative max-w-xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
          placeholder="Search other questions..."
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg className="h-4 w-4 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-80 overflow-y-auto">
          {searchResults.length > 0 ? (
            <>
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-700">
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="py-1">
                {searchResults
                  .filter(faq => faq && faq.slug && faq.slug.current && faq.question)
                  .map((faq) => (
                  <Link
                    key={faq._id}
                    href={`/faqs/${faq.slug.current}`}
                    className="block px-4 py-2 hover:bg-blue-50 transition-colors duration-150"
                    onClick={() => {
                      setIsOpen(false);
                      setQuery('');
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-100 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-slate-800 leading-snug mb-1 text-sm">
                          {highlightText(faq.question, query.trim())}
                        </h4>
                        {faq.summaryForAI && (
                          <p className="text-xs text-slate-600 line-clamp-2">
                            {highlightText(faq.summaryForAI, query.trim())}
                          </p>
                        )}
                      </div>
                      <svg className="w-3 h-3 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="px-4 py-6 text-center">
              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.347 0-4.518.641-6.397 1.759" />
                </svg>
              </div>
              <h4 className="font-medium text-slate-800 mb-1 text-sm">No results found</h4>
              <p className="text-xs text-slate-600">
                No FAQs match "{query}"
              </p>
            </div>
          )}
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
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

  // Add safety checks for the FAQ data
  const safeManualRelatedFAQs = (faq.manualRelatedFAQs || []).filter(relatedFaq => 
    relatedFaq && 
    relatedFaq.slug && 
    relatedFaq.slug.current && 
    relatedFaq.question
  );

  const safeAllFAQs = (faq.allFAQs || []).filter(allFaq => 
    allFaq && 
    allFaq.slug && 
    allFaq.slug.current && 
    allFaq.question
  );

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
          <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-8">
            Quick answers to your questions
          </p>
          
          {/* Search Box */}
          <div className="mb-6">
            <FAQPageSearch searchFAQs={faq.searchFAQs || []} />
          </div>
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
          manualRelatedFAQs={safeManualRelatedFAQs}
          allFAQs={safeAllFAQs}
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