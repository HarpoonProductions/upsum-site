// app/faqs/[slug]/CitationBox.tsx - Client component for citation copying with null safety

'use client'

import { useState } from 'react'

interface CitationBoxProps {
  question: string;
  url: string;
  siteName: string;
  publishedDate?: string;
  author?: string;
}

export default function CitationBox({ question, url, siteName, publishedDate, author }: CitationBoxProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  // Safety check for props
  if (!question || !url || !siteName) {
    console.warn('CitationBox: Missing required props');
    return null;
  }

  // Generate citation text
  const generateCitation = () => {
    try {
      const date = publishedDate ? new Date(publishedDate).toLocaleDateString() : new Date().toLocaleDateString();
      const authorText = author ? `${author}. ` : '';
      return `${authorText}"${question}." ${siteName}, ${date}. ${url}`;
    } catch (err) {
      console.error('Error generating citation:', err);
      return `"${question}." ${siteName}. ${url}`;
    }
  };

  // Modern clipboard copy with fallback
  const copyToClipboard = async (text: string) => {
    try {
      // Try modern Clipboard API first
      if (navigator?.clipboard && window?.isSecureContext) {
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
    
    try {
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
    } catch (err) {
      console.error('Error in handleCopyClick:', err);
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