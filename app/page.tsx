// app/page.tsx - Complete Upsum Homepage with FIXED LAYOUT

'use client'

import groq from 'groq'
import { client } from '@/lib/sanity'
import { upfClient, uniClient } from '@/lib/sanity-network'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import { useState, useEffect, useMemo } from 'react'

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
}

interface NetworkFAQ extends FAQ {
  site: 'upsum' | 'upf' | 'uni';
  siteUrl: string;
  siteName: string;
  themeColor: string;
}

interface SearchBoxProps {
  faqs: FAQ[];
  onSuggestQuestion: (question?: string) => void;
  theme?: 'blue' | 'orange' | 'purple';
}

// Search Component - Blue themed for main Upsum
const SearchBox = ({ faqs, onSuggestQuestion, theme = 'blue' }: SearchBoxProps) => {
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
    },
    purple: {
      accent: 'purple',
      ring: 'focus:ring-purple-500',
      border: 'focus:border-purple-500',
      text: 'text-purple-600',
      bg: 'bg-purple-50',
      hover: 'hover:bg-purple-50'
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
          placeholder="Search existing questions..."
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
                We couldn&apos;t find any FAQs matching &quot;{query}&quot;
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
};

// Suggest Question Modal Component
const SuggestQuestionModal = ({ isOpen, onClose, theme = 'blue', siteName = 'Upsum', siteUrl = 'https://upsum.info', prefillQuestion = '' }: {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'blue' | 'orange' | 'purple';
  siteName?: string;
  siteUrl?: string;
  prefillQuestion?: string;
}) => {
  const [formData, setFormData] = useState({
    question: '',
    email: '',
    context: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [rateLimitError, setRateLimitError] = useState('');

  // Pre-fill question when modal opens
  useEffect(() => {
    if (isOpen && prefillQuestion) {
      setFormData(prev => ({
        ...prev,
        question: prefillQuestion
      }));
    }
  }, [isOpen, prefillQuestion]);

  const themeColors = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      button: 'bg-blue-600 hover:bg-blue-700',
      text: 'text-blue-600'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      button: 'bg-orange-600 hover:bg-orange-700',
      text: 'text-orange-600'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      button: 'bg-purple-600 hover:bg-purple-700',
      text: 'text-purple-600'
    }
  };

  const colors = themeColors[theme];

  // Check rate limiting
  const checkRateLimit = () => {
    const lastSubmission = localStorage.getItem('lastQuestionSubmission');
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (lastSubmission && (now - parseInt(lastSubmission)) < oneDay) {
      const timeLeft = oneDay - (now - parseInt(lastSubmission));
      const hoursLeft = Math.ceil(timeLeft / (60 * 60 * 1000));
      return `Please wait ${hoursLeft} hours before suggesting another question.`;
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    const rateLimitMsg = checkRateLimit();
    if (rateLimitMsg) {
      setRateLimitError(rateLimitMsg);
      return;
    }

    // Validate inputs
    if (!formData.question.trim() || formData.question.length > 500) {
      return;
    }
    if (!formData.email.trim()) {
      return;
    }
    if (formData.context.length > 1000) {
      return;
    }

    setIsSubmitting(true);
    setRateLimitError('');

    // Create mailto link with clear site identification
    const subject = encodeURIComponent(`New Question Suggestion for ${siteName}`);
    const body = encodeURIComponent(`
Question: ${formData.question.trim()}

Additional Context: ${formData.context.trim() || 'None provided'}

User Email: ${formData.email.trim()}

---
Submitted from: ${siteName}
Site URL: ${siteUrl}
Timestamp: ${new Date().toISOString()}
    `);
    
    window.location.href = `mailto:studio@harpoon.productions?subject=${subject}&body=${body}`;
    
    // Set rate limiting
    localStorage.setItem('lastQuestionSubmission', Date.now().toString());
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Close modal after 2.5 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
      setFormData({ question: '', email: '', context: '' });
      setRateLimitError('');
    }, 2500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`${colors.bg} ${colors.border} border-b px-6 py-4 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Suggest a Question</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            Help us improve by suggesting questions you&apos;d like answered
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <svg className={`w-8 h-8 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Thank you!</h3>
              <p className="text-slate-600">Your question suggestion has been sent. We&apos;ll review it and may add it to our FAQ collection.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Rate limit error */}
              {rateLimitError && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-800 text-sm">{rateLimitError}</p>
                </div>
              )}

              {/* Question Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Question *
                </label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="What would you like to know?"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.question.length}/500 characters
                </p>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Required for spam prevention and follow-up
                </p>
              </div>

              {/* Context Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Additional Context (optional)
                </label>
                <textarea
                  name="context"
                  value={formData.context}
                  onChange={handleChange}
                  rows={2}
                  maxLength={1000}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Any background info that might help us provide a better answer..."
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.context.length}/1000 characters
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!formData.question.trim() || !formData.email.trim() || isSubmitting || !!rateLimitError}
                  className={`flex-1 px-4 py-2 ${colors.button} text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Suggestion'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Network FAQ Card Component - FIXED VERSION
const NetworkFAQCard = ({ faq }: { faq: NetworkFAQ }) => {
  // Fixed image URL handling for cross-dataset images
  const getImageUrl = () => {
    if (!faq.image?.asset?.url) {
      return '/fallback.jpg';
    }
    // Use raw URL to avoid cross-dataset issues
    return faq.image.asset.url;
  };

  const imageUrl = getImageUrl();

  const themeConfig = {
    upf: {
      badge: 'From UPF FAQs',
      badgeColor: 'bg-orange-500/20 text-orange-700 border-orange-200',
      linkColor: 'text-orange-600 hover:text-orange-700',
      gradientOverlay: 'from-orange-500/20',
      badgeIcon: '🥪'
    },
    uni: {
      badge: 'From Going To Uni FAQs',
      badgeColor: 'bg-purple-500/20 text-purple-700 border-purple-200',
      linkColor: 'text-purple-600 hover:text-purple-700',
      gradientOverlay: 'from-purple-500/20',
      badgeIcon: '🎓'
    },
    upsum: {
      badge: 'From Upsum',
      badgeColor: 'bg-blue-500/20 text-blue-700 border-blue-200',
      linkColor: 'text-blue-600 hover:text-blue-700',
      gradientOverlay: 'from-blue-500/20',
      badgeIcon: '💡'
    }
  };

  const config = themeConfig[faq.site];

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* External Site Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${config.badgeColor}`}>
          <span>{config.badgeIcon}</span>
          {config.badge}
        </span>
      </div>

      {/* External Link Indicator */}
      <div className="absolute top-3 right-3 z-10">
        <div className="w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>

      {/* Image and Content */}
      <a
        href={`${faq.siteUrl}/faqs/${faq.slug.current}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {/* Image with Error Handling */}
        <div className="relative h-48 overflow-hidden bg-slate-100">
          <Image
            src={imageUrl}
            alt={faq.image?.alt || faq.question}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent ${config.gradientOverlay}`} />
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-semibold text-slate-800 leading-snug mb-2 line-clamp-2 group-hover:text-slate-900 transition-colors duration-200">
            {faq.question}
          </h3>
          
          {faq.summaryForAI && (
            <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4">
              {faq.summaryForAI}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1 text-sm font-medium ${config.linkColor} transition-colors duration-200`}>
              Read full answer
              <svg className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
            <span className="text-xs text-slate-400">
              {faq.siteName}
            </span>
          </div>
        </div>
      </a>
    </article>
  );
};

export default function HomePage() {
  const [upsumFaqs, setUpsumFaqs] = useState<FAQ[]>([]);
  const [networkFaqs, setNetworkFaqs] = useState<NetworkFAQ[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefillQuestion, setPrefillQuestion] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllFaqs = async () => {
      try {
        // Query for main Upsum FAQs (6 most recent)
        const upsumQuery = groq`*[
          _type == "faq" && 
          defined(slug.current) && 
          defined(question) && 
          slug.current != null && 
          question != null
        ] | order(_createdAt desc)[0...6] {
          _id,
          question,
          slug,
          summaryForAI,
          image {
            asset -> { url },
            alt
          }
        }`;
        
        // Query for network FAQs (3 from each external site)
        const networkQuery = groq`*[
          _type == "faq" && 
          defined(slug.current) && 
          defined(question) && 
          slug.current != null && 
          question != null
        ] | order(_createdAt desc)[0...3] {
          _id,
          question,
          slug,
          summaryForAI,
          image {
            asset -> { url },
            alt
          },
          publishedAt
        }`;

        // Fetch all sites with graceful error handling
        const [upsumResult, upfResult, uniResult] = await Promise.allSettled([
          client.fetch(upsumQuery),
          upfClient.fetch(networkQuery),
          uniClient.fetch(networkQuery)
        ]);

        // Process main Upsum FAQs
        const upsumFaqsData = upsumResult.status === 'fulfilled' ? upsumResult.value : [];
        setUpsumFaqs(upsumFaqsData.filter((faq: any) => faq && faq._id && faq.question && faq.slug && faq.slug.current));

        // Process network FAQs
        const networkFaqsData: NetworkFAQ[] = [];

        // Add UPF FAQs if available
        if (upfResult.status === 'fulfilled' && upfResult.value) {
          const upfFaqs = upfResult.value.filter((faq: any) => faq && faq._id && faq.question && faq.slug && faq.slug.current)
            .map((faq: any) => ({
              ...faq,
              site: 'upf' as const,
              siteUrl: 'https://upffaqs.com',
              siteName: 'UPF FAQs',
              themeColor: 'orange'
            }));
          networkFaqsData.push(...upfFaqs);
        }

        // Add Uni FAQs if available
        if (uniResult.status === 'fulfilled' && uniResult.value) {
          const uniFaqs = uniResult.value.filter((faq: any) => faq && faq._id && faq.question && faq.slug && faq.slug.current)
            .map((faq: any) => ({
              ...faq,
              site: 'uni' as const,
              siteUrl: 'https://goingtounifaqs.com',
              siteName: 'Going To Uni FAQs',
              themeColor: 'purple'
            }));
          networkFaqsData.push(...uniFaqs);
        }

        setNetworkFaqs(networkFaqsData);
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching FAQs:', error);
        setLoading(false);
      }
    };

    fetchAllFaqs();
  }, []);

  const handleSuggestQuestion = (questionText = '') => {
    setPrefillQuestion(questionText);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Enhanced Structured Data for Network Hub */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": "https://upsum.info/#website",
            "url": "https://upsum.info",
            "name": "Upsum - The FAQ Network Hub",
            "description": "Quick answers to your questions through our network of specialized FAQ sites",
            "inLanguage": "en-US",
            "publisher": {
              "@type": "Organization",
              "@id": "https://upsum.info/#organization",
              "name": "Harpoon Productions Ltd",
              "alternateName": "Upsum",
              "logo": {
                "@type": "ImageObject",
                "url": "https://upsum.info/upsum.png"
              }
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://upsum.info/?q={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "isPartOf": {
              "@type": "WebSite",
              "name": "Upsum Network",
              "alternateName": "The Upsum FAQ Network"
            }
          })
        }}
      />

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
            "sameAs": [],
            "owns": [
              {
                "@type": "WebSite",
                "name": "UPF FAQs",
                "url": "https://upffaqs.com",
                "description": "Ultra-processed food questions and answers"
              },
              {
                "@type": "WebSite", 
                "name": "Going To Uni FAQs",
                "url": "https://goingtounifaqs.com",
                "description": "University and college questions and answers"
              }
            ]
          })
        }}
      />

      {/* Header Section with Search and Suggest Question */}
      <div className="pt-16 pb-12 px-4">
        <div className="mx-auto text-center" style={{ maxWidth: '1600px' }}>
          <Link href="/" className="inline-block">
            <Image
              src="/upsum.png"
              alt="Upsum"
              width={400}
              height={120}
              className="mx-auto mb-6"
            />
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            The FAQ Network Hub
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-8">
            Quick answers across our specialized FAQ sites
          </p>
          
          {/* Search Box */}
          <div className="mb-8">
            <SearchBox 
              faqs={upsumFaqs}
              onSuggestQuestion={handleSuggestQuestion}
              theme="blue"
            />
          </div>

          {/* Suggest Question CTA */}
          <div className="flex items-center justify-center gap-4">
            <div className="h-px bg-slate-300 flex-1 max-w-24"></div>
            <span className="text-slate-500 text-sm">or</span>
            <div className="h-px bg-slate-300 flex-1 max-w-24"></div>
          </div>
          
          <button
            onClick={() => handleSuggestQuestion()}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Suggest a Question
          </button>
          <p className="text-slate-500 text-sm mt-3">
            Can&apos;t find what you&apos;re looking for? Let us know!
          </p>
        </div>
      </div>

      {/* Main Upsum FAQs Section */}
      <div className="mx-auto px-4 pb-12" style={{ maxWidth: '1600px' }}>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Latest from Upsum</h2>
          <p className="text-slate-600">Our newest questions and answers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {upsumFaqs
            .filter(faq => faq && faq.slug && faq.slug.current && faq.question) // Safety filter
            .map((faq, index) => {
            const imageUrl = faq.image?.asset?.url
              ? urlFor(faq.image).width(500).height(300).fit('crop').url()
              : '/fallback.jpg'

            return (
              <article
                key={faq._id}
                className={`group relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                  index === 0 ? 'md:col-span-2 xl:col-span-1' : ''
                }`}
              >
                {/* Clickable Image Container with Overlay */}
                <Link
                  href={`/faqs/${faq.slug.current}`}
                  className="block relative overflow-hidden group"
                >
                  <div className="relative h-64 md:h-72 overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={faq.question}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    
                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Text overlay */}
                    <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                      {/* Timestamp */}
                      <div className="mb-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          Latest
                        </span>
                      </div>
                      
                      {/* Question Title */}
                      <h2 className="text-xl md:text-2xl font-bold text-white leading-tight group-hover:text-blue-200 transition-colors duration-300">
                        {faq.question}
                      </h2>
                    </div>
                    
                    {/* Hover indicator */}
                    <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* Content Section */}
                <div className="p-6 md:p-8">
                  {/* Summary */}
                  {faq.summaryForAI && (
                    <p className="text-slate-600 leading-relaxed line-clamp-3 mb-6">
                      {faq.summaryForAI}
                    </p>
                  )}

                  {/* Read More Link */}
                  <Link
                    href={`/faqs/${faq.slug.current}`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm group/link transition-colors duration-200"
                  >
                    Read full answer
                    <svg 
                      className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>

                {/* Subtle border effect */}
                <div className="absolute inset-0 rounded-3xl ring-1 ring-slate-200/50 group-hover:ring-blue-300/50 transition-colors duration-300 pointer-events-none" />
              </article>
            )
          })}
        </div>

        {/* Browse All FAQs Link */}
        <div className="text-center mt-12 mb-16">
          <Link
            href="/faqs"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-blue-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group shadow-sm hover:shadow-md"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors duration-200">
                Browse All Upsum FAQs
              </h3>
              <p className="text-sm text-slate-600">
                Explore our complete question archive
              </p>
            </div>
            <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-all duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Empty state for main FAQs */}
        {upsumFaqs.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No questions yet</h3>
            <p className="text-slate-600 mb-6">Be the first to suggest a question!</p>
            <button
              onClick={() => handleSuggestQuestion()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Suggest a Question
            </button>
          </div>
        )}
      </div>

      {/* Network FAQs Section */}
      {networkFaqs.length > 0 && (
        <div className="bg-slate-50 py-16">
          <div className="mx-auto px-4" style={{ maxWidth: '1600px' }}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Latest from the Upsum Network</h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                Discover answers from our specialized FAQ sites
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {networkFaqs.map((faq) => (
                <NetworkFAQCard key={`${faq.site}-${faq._id}`} faq={faq} />
              ))}
            </div>

            {/* Network Sites Links */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <a
                href="https://upffaqs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-orange-200 hover:border-orange-300"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
                  🥪
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 group-hover:text-orange-600 transition-colors duration-200">
                    UPF FAQs
                  </h3>
                  <p className="text-sm text-slate-600">Ultra-processed food questions</p>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>

              <a
                href="https://goingtounifaqs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-purple-200 hover:border-purple-300"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                  🎓
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 group-hover:text-purple-600 transition-colors duration-200">
                    Going To Uni FAQs
                  </h3>
                  <p className="text-sm text-slate-600">University & college questions</p>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-purple-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Loading state for network FAQs */}
      {loading && (
        <div className="bg-slate-50 py-16">
          <div className="mx-auto px-4 text-center" style={{ maxWidth: '1600px' }}>
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading network content...</p>
          </div>
        </div>
      )}

      {/* Footer with "Powered by Upsum" */}
      <footer className="bg-blue-50 border-t border-blue-200 py-6">
        <div className="mx-auto px-4 text-center" style={{ maxWidth: '1600px' }}>
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

      {/* Suggest Question Modal */}
      <SuggestQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        theme="blue"
        siteName="Upsum"
        siteUrl="https://upsum.info"
        prefillQuestion={prefillQuestion}
      />
    </div>
  )
}
//push

