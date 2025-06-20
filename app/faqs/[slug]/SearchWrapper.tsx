// app/faqs/[slug]/FAQPageSearch.tsx - Client component for search on FAQ pages with null safety

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface FAQ {
  _id: string;
  question: string;
  slug: { current: string };
  summaryForAI?: string;
}

interface FAQPageSearchProps {
  searchFAQs: FAQ[];
}

export default function FAQPageSearch({ searchFAQs }: FAQPageSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Search logic with comprehensive null safety
  const searchResults = useMemo(() => {
    try {
      if (!query.trim() || query.length < 2) return [];
      
      const searchTerm = query.toLowerCase();
      
      // Comprehensive safety checks for searchFAQs
      if (!Array.isArray(searchFAQs)) {
        console.warn('FAQPageSearch: searchFAQs is not an array:', searchFAQs);
        return [];
      }
      
      // Filter out FAQs with null/invalid slugs BEFORE searching
      const validFaqs = searchFAQs.filter((faq: any) => {
        const isValid = faq && 
          faq.slug && 
          faq.slug.current && 
          faq.question &&
          typeof faq.slug.current === 'string' &&
          typeof faq.question === 'string';
        
        if (!isValid && faq) {
          console.log('FAQPageSearch: Filtering out invalid FAQ:', {
            id: faq._id,
            hasSlug: !!faq.slug,
            hasSlugCurrent: !!(faq.slug && faq.slug.current),
            hasQuestion: !!faq.question,
            slugCurrentType: faq.slug ? typeof faq.slug.current : 'no slug',
            questionType: typeof faq.question
          });
        }
        
        return isValid;
      });
      
      console.log('FAQPageSearch: Valid FAQs for search:', validFaqs.length);
      
      return validFaqs.filter((faq: any) => {
        try {
          return faq.question.toLowerCase().includes(searchTerm) ||
            (faq.summaryForAI && faq.summaryForAI.toLowerCase().includes(searchTerm));
        } catch (error) {
          console.error('Error filtering FAQ:', error, faq);
          return false;
        }
      }).slice(0, 5); // Show max 5 results
    } catch (error) {
      console.error('Error in FAQPageSearch searchResults:', error);
      return [];
    }
  }, [query, searchFAQs]);

  // Highlight search terms with null safety
  const highlightText = (text: string, searchTerm: string) => {
    try {
      if (!searchTerm || !text || typeof text !== 'string') return text;
      
      const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
      return parts.map((part, index) => 
        part.toLowerCase() === searchTerm.toLowerCase() 
          ? <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
          : part
      );
    } catch (error) {
      console.error('Error highlighting text:', error);
      return text;
    }
  };

  return (
    <div className="relative max-w-xl mx-auto">
      {/* Search Input */}
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

      {/* Search Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-80 overflow-y-auto">
          {searchResults.length > 0 ? (
            <>
              {/* Results Header */}
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-700">
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              {/* Results List - with additional safety check */}
              <div className="py-1">
                {searchResults
                  .filter((faq: any) => {
                    // Triple safety check before rendering
                    const isValid = faq && 
                      faq.slug && 
                      faq.slug.current && 
                      faq.question &&
                      typeof faq.slug.current === 'string' &&
                      typeof faq.question === 'string';
                    
                    if (!isValid) {
                      console.warn('FAQPageSearch: Filtering out invalid result:', faq);
                    }
                    
                    return isValid;
                  })
                  .map((faq: any) => {
                    try {
                      return (
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
                      );
                    } catch (error) {
                      console.error('Error rendering search result:', error, faq);
                      return null;
                    }
                  })
                  .filter(Boolean) // Remove any null results
                }
              </div>
            </>
          ) : (
            /* No Results */
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

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}