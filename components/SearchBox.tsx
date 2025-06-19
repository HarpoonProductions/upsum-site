// components/SearchBox.tsx - Reusable search component for all pages

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface FAQ {
  _id: string;
  question: string;
  slug: { current: string };
  summaryForAI?: string;
}

interface SearchBoxProps {
  faqs: FAQ[];
  onSuggestQuestion: (questionText?: string) => void;
  theme?: 'blue' | 'orange';
  placeholder?: string;
}

export default function SearchBox({ 
  faqs, 
  onSuggestQuestion, 
  theme = 'blue',
  placeholder = "Search existing questions..."
}: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const themeColors = {
    blue: {
      accent: 'blue',
      ring: 'focus:ring-blue-500',
      border: 'focus:border-blue-500',
      text: 'text-blue-600',
      bg: 'bg-blue-50',
      hover: 'hover:bg-blue-50'
    },
    orange: {
      accent: 'orange', 
      ring: 'focus:ring-orange-500',
      border: 'focus:border-orange-500',
      text: 'text-orange-600',
      bg: 'bg-orange-50',
      hover: 'hover:bg-orange-50'
    }
  };

  const colors = themeColors[theme];

  // Search logic with null safety
  const searchResults = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    
    const searchTerm = query.toLowerCase();
    
    // Filter out FAQs with null/invalid slugs BEFORE searching
    const validFaqs = faqs.filter(faq => 
      faq && 
      faq.slug && 
      faq.slug.current && 
      faq.question
    );
    
    return validFaqs.filter(faq => 
      faq.question.toLowerCase().includes(searchTerm) ||
      faq.summaryForAI?.toLowerCase().includes(searchTerm)
    ).slice(0, 5); // Show max 5 results
  }, [query, faqs]);

  // Highlight search terms
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm || !text) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.toLowerCase() 
        ? <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
        : part
    );
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          className={`w-full pl-12 pr-4 py-4 text-lg border border-slate-300 rounded-xl ${colors.ring} ${colors.border} bg-white shadow-lg transition-all duration-200`}
          placeholder={placeholder}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <svg className="h-5 w-5 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-96 overflow-y-auto">
          {searchResults.length > 0 ? (
            <>
              {/* Results Header */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-700">
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              {/* Results List - with additional safety check */}
              <div className="py-2">
                {searchResults
                  .filter(faq => faq && faq.slug && faq.slug.current && faq.question) // Double safety check
                  .map((faq) => (
                  <Link
                    key={faq._id}
                    href={`/faqs/${faq.slug.current}`}
                    className={`block px-4 py-3 ${colors.hover} transition-colors duration-150`}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery('');
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 ${colors.bg} rounded-full mt-2 flex-shrink-0`}></div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-slate-800 leading-snug mb-1">
                          {highlightText(faq.question, query.trim())}
                        </h4>
                        {faq.summaryForAI && (
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {highlightText(faq.summaryForAI, query.trim())}
                          </p>
                        )}
                      </div>
                      <svg className={`w-4 h-4 ${colors.text} flex-shrink-0 mt-1`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            /* No Results */
            <div className="px-4 py-8 text-center">
              <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <svg className={`w-6 h-6 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.347 0-4.518.641-6.397 1.759" />
                </svg>
              </div>
              <h4 className="font-medium text-slate-800 mb-2">No results found</h4>
              <p className="text-sm text-slate-600 mb-4">
                We couldn't find any FAQs matching "{query}"
              </p>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSuggestQuestion(query);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 bg-${colors.accent}-600 hover:bg-${colors.accent}-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Suggest this question
              </button>
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