import React from 'react';
import Link from 'next/link';

interface DynamicLegalPageProps {
  title: string;
  content: string;
  lastUpdated: string;
}

export default function DynamicLegalPage({ title, content, lastUpdated }: DynamicLegalPageProps) {
  return (
    <>
      <main className="min-h-screen bg-[#343541] text-white py-12">
        <div className="mx-auto w-[90%] md:w-[95%] max-w-[800px]">
          <div className="mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-[#68D08B] hover:text-[#5bc47d] transition-colors duration-200 mb-6"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Back to Home
            </Link>
            
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            <p className="text-[#a4a5b0] text-lg">
              Last updated: {new Date(lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div 
            className="legal-content-wrapper"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .legal-content-wrapper h2 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            margin-top: 2rem;
            color: white;
          }
          
          .legal-content-wrapper h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            margin-top: 1.5rem;
            color: #68D08B;
          }
          
          .legal-content-wrapper p {
            margin-bottom: 1rem;
            line-height: 1.6;
            color: #a4a5b0;
          }
          
          .legal-content-wrapper ul, .legal-content-wrapper ol {
            margin-bottom: 1rem;
            padding-left: 1.5rem;
          }
          
          .legal-content-wrapper li {
            margin-bottom: 0.5rem;
            color: #a4a5b0;
          }
          
          .legal-content-wrapper strong {
            color: white;
            font-weight: 600;
          }
          
          .legal-content-wrapper a {
            color: #68D08B;
            text-decoration: none;
            transition: color 0.2s;
          }
          
          .legal-content-wrapper a:hover {
            color: #5bc47d;
          }
          
          .legal-content-wrapper .section {
            background: #2c2f3a;
            border-radius: 0.75rem;
            padding: 1.5rem;
            border: 1px solid #404055;
            margin-bottom: 2rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
        `
      }} />
    </>
  );
} 