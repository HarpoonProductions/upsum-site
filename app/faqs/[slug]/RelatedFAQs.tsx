// app/faqs/[slug]/RelatedFAQs.tsx - Client component for related FAQs

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

interface FAQ {
  _id: string;
  question: string;
  slug: { current: string };
  summaryForAI?: string;
  keywords?: string[];
  category?: { title: string; slug: { current: string } };
  image?: {
    asset?: {
      url: string;
    }
  };
}

interface RelatedFAQsProps {
  currentFAQ: FAQ;
  manualRelatedFAQs?: FAQ[];
  allFAQs: FAQ[];
  maxSuggestions?: number;
}

export default function RelatedFAQs({ currentFAQ, manualRelatedFAQs = [], allFAQs, maxSuggestions = 3 }: RelatedFAQsProps) {
  const [relatedFAQs, setRelatedFAQs] = useState<FAQ[]>([]);

  useEffect(() => {
    try {
      // Debug logging
      console.log('RelatedFAQs useEffect triggered');
      console.log('currentFAQ:', currentFAQ);
      console.log('manualRelatedFAQs:', manualRelatedFAQs);
      console.log('allFAQs length:', allFAQs?.length || 0);

      // Ensure we have valid data
      if (!currentFAQ || !currentFAQ.question) {
        console.log('Invalid currentFAQ, setting empty array');
        setRelatedFAQs([]);
        return;
      }

      // If manual related FAQs are set, use those (with null checks)
      if (manualRelatedFAQs && manualRelatedFAQs.length > 0) {
        const validManualFAQs = manualRelatedFAQs.filter(faq => {
          const isValid = faq && 
            faq.slug && 
            faq.slug.current && 
            faq.question;
          if (!isValid) {
            console.log('Filtering out invalid manual FAQ:', faq);
          }
          return isValid;
        });
        console.log('Using manual FAQs:', validManualFAQs.length);
        setRelatedFAQs(validManualFAQs.slice(0, maxSuggestions));
        return;
      }

      // Otherwise, generate automatic suggestions
      console.log('Generating automatic suggestions');
      const suggestions = generateAutomaticSuggestions();
      console.log('Generated suggestions:', suggestions.length);
      setRelatedFAQs(suggestions);
    } catch (error) {
      console.error('Error in RelatedFAQs useEffect:', error);
      setRelatedFAQs([]);
    }
  }, [currentFAQ, manualRelatedFAQs, allFAQs, maxSuggestions]);

  const generateAutomaticSuggestions = (): FAQ[] => {
    try {
      console.log('Starting generateAutomaticSuggestions');
      
      if (!currentFAQ || !allFAQs || allFAQs.length === 0) {
        console.log('No current FAQ or allFAQs data');
        return [];
      }

      const currentKeywords = currentFAQ.keywords || [];
      const currentCategory = currentFAQ.category;
      
      console.log('Current keywords:', currentKeywords);
      console.log('Current category:', currentCategory);
      
      // Filter out current FAQ and FAQs with invalid slugs
      const candidateFAQs = allFAQs.filter(faq => {
        const isValid = faq && 
          faq._id !== currentFAQ._id && 
          faq.slug && 
          faq.slug.current && 
          faq.question;
        
        if (!isValid && faq) {
          console.log('Filtering out invalid FAQ:', {
            id: faq._id,
            hasSlug: !!faq.slug,
            hasSlugCurrent: !!(faq.slug && faq.slug.current),
            hasQuestion: !!faq.question
          });
        }
        
        return isValid;
      });
      
      console.log('Candidate FAQs after filtering:', candidateFAQs.length);
      
      // Score FAQs based on relevance
      const scoredFAQs = candidateFAQs.map(faq => ({
        faq,
        score: calculateRelevanceScore(faq, currentKeywords, currentCategory)
      }));

      console.log('Scored FAQs:', scoredFAQs.map(s => ({ question: s.faq.question, score: s.score })));

      // Sort by score and return top suggestions
      const result = scoredFAQs
        .sort((a, b) => b.score - a.score)
        .slice(0, maxSuggestions)
        .map(item => item.faq);
        
      console.log('Final suggestions:', result.map(f => f.question));
      return result;
    } catch (error) {
      console.error('Error in generateAutomaticSuggestions:', error);
      return [];
    }
  };

  const calculateRelevanceScore = (
    faq: FAQ, 
    currentKeywords: string[], 
    currentCategory?: { title: string; slug: { current: string } }
  ): number => {
    let score = 0;

    // Category match (highest weight) - Fixed null check
    if (currentCategory && 
        currentCategory.slug && 
        currentCategory.slug.current && 
        faq.category && 
        faq.category.slug && 
        faq.category.slug.current &&
        faq.category.slug.current === currentCategory.slug.current) {
      score += 10;
    }

    // Keyword matches
    const faqKeywords = faq.keywords || [];
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
    console.log('No related FAQs to display');
    return null;
  }

  console.log('Rendering related FAQs:', relatedFAQs.length);

  return (
    <section>
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold text-slate-800 mb-4">Related Questions</h3>
        <p className="text-slate-600 text-lg">Explore more topics that might interest you</p>
      </div>

      {/* Desktop: 3 cards in a row */}
      <div className="hidden md:grid md:grid-cols-3 gap-8">
        {relatedFAQs.filter(faq => faq && faq.slug && faq.slug.current).map((faq) => (
          <RelatedFAQCard key={faq._id} faq={faq} />
        ))}
      </div>

      {/* Mobile: Horizontal scrolling carousel */}
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

function RelatedFAQCard({ faq }: { faq: FAQ }) {
  // Add safety checks for the faq object
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