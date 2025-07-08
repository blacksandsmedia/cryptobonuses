"use client";

import React, { useState, useEffect } from "react";

interface RichContentProps {
  content: string;
  type: 'about' | 'howToRedeem' | 'bonusDetails' | 'games' | 'terms' | 'faq';
  keyFeatures?: Array<{emoji: string, text: string}>;
  bonusCode?: string | null;
  casinoName?: string;
  affiliateLink?: string;
  codeTermLabel?: string;
  // New props for variable replacement
  casinoData?: {
    name: string;
    rating?: number;
    website?: string;
    foundedYear?: number;
    wageringRequirement?: string;
    minimumDeposit?: string;
    logo?: string;
    description?: string;
  };
  bonusData?: {
    title?: string;
    code?: string | null;
    value?: string;
    types?: string[];
  };
  analyticsData?: {
    timesClaimedToday?: number;
    timesClaimedWeekly?: number;
    timesClaimedTotal?: number;
    lastClaimed?: string;
  };
}

interface FAQItem {
  question: string;
  answer: string;
}

// Variable replacement function
function replaceVariables(
  text: string, 
  casinoData?: RichContentProps['casinoData'],
  bonusData?: RichContentProps['bonusData'],
  analyticsData?: RichContentProps['analyticsData']
): string {
  let processedText = text;
  
  // Get current date/time variables
  const now = new Date();
  const currentDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const currentMonth = now.toLocaleDateString('en-US', { month: 'long' });
  const currentYear = now.getFullYear().toString();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Casino variables
  if (casinoData) {
    processedText = processedText.replace(/\[name\]/gi, casinoData.name || '');
    processedText = processedText.replace(/\[casino_name\]/gi, casinoData.name || '');
    processedText = processedText.replace(/\[rating\]/gi, casinoData.rating ? Math.round(casinoData.rating).toString() : '0');
    processedText = processedText.replace(/\[rating_stars\]/gi, casinoData.rating ? '★'.repeat(Math.round(casinoData.rating)) : '');
    processedText = processedText.replace(/\[website\]/gi, casinoData.website || '');
    processedText = processedText.replace(/\[founded\]/gi, casinoData.foundedYear?.toString() || '');
    processedText = processedText.replace(/\[founded_year\]/gi, casinoData.foundedYear?.toString() || '');
    processedText = processedText.replace(/\[wagering\]/gi, casinoData.wageringRequirement || '');
    processedText = processedText.replace(/\[wagering_requirement\]/gi, casinoData.wageringRequirement || '');
    processedText = processedText.replace(/\[min_deposit\]/gi, casinoData.minimumDeposit || '');
    processedText = processedText.replace(/\[minimum_deposit\]/gi, casinoData.minimumDeposit || '');
  }
  
  // Bonus variables
  if (bonusData) {
    processedText = processedText.replace(/\[bonus\]/gi, bonusData.title || '');
    processedText = processedText.replace(/\[bonus_title\]/gi, bonusData.title || '');
    processedText = processedText.replace(/\[bonus_code\]/gi, bonusData.code || '');
    processedText = processedText.replace(/\[code\]/gi, bonusData.code || '');
    processedText = processedText.replace(/\[bonus_value\]/gi, bonusData.value || '');
    processedText = processedText.replace(/\[value\]/gi, bonusData.value || '');
    processedText = processedText.replace(/\[bonus_type\]/gi, bonusData.types?.[0] || '');
    processedText = processedText.replace(/\[bonus_types\]/gi, bonusData.types?.join(', ') || '');
  }
  
  // Analytics variables
  if (analyticsData) {
    processedText = processedText.replace(/\[times_claimed_today\]/gi, analyticsData.timesClaimedToday?.toString() || '0');
    processedText = processedText.replace(/\[times_claimed_weekly\]/gi, analyticsData.timesClaimedWeekly?.toString() || '0');
    processedText = processedText.replace(/\[times_claimed_total\]/gi, analyticsData.timesClaimedTotal?.toString() || '0');
    processedText = processedText.replace(/\[last_claimed\]/gi, analyticsData.lastClaimed || 'Never');
    processedText = processedText.replace(/\[claimed_today\]/gi, analyticsData.timesClaimedToday?.toString() || '0');
    processedText = processedText.replace(/\[claimed_this_week\]/gi, analyticsData.timesClaimedWeekly?.toString() || '0');
    processedText = processedText.replace(/\[total_claims\]/gi, analyticsData.timesClaimedTotal?.toString() || '0');
  }
  
  // Date/time variables
  processedText = processedText.replace(/\[current_date\]/gi, currentDate);
  processedText = processedText.replace(/\[current_month\]/gi, currentMonth);
  processedText = processedText.replace(/\[current_year\]/gi, currentYear);
  processedText = processedText.replace(/\[current_day\]/gi, currentDay);
  processedText = processedText.replace(/\[today\]/gi, currentDate);
  processedText = processedText.replace(/\[this_month\]/gi, currentMonth);
  processedText = processedText.replace(/\[this_year\]/gi, currentYear);
  
  // Dynamic content variables
  const peopleOnline = Math.floor(Math.random() * 150) + 50; // 50-200 people online
  const activeToday = Math.floor(Math.random() * 500) + 100; // 100-600 active today
  processedText = processedText.replace(/\[people_online\]/gi, peopleOnline.toString());
  processedText = processedText.replace(/\[active_today\]/gi, activeToday.toString());
  processedText = processedText.replace(/\[users_online\]/gi, peopleOnline.toString());
  processedText = processedText.replace(/\[online_now\]/gi, peopleOnline.toString());
  
  return processedText;
}

// Clickable bonus code component with copy feedback
const ClickableBonusCode = ({ code, displayText, onCopy }: { code: string; displayText: string; onCopy: (code: string) => void }) => {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    onCopy(code);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <span 
      className="text-[#68D08B] font-bold cursor-pointer hover:text-[#7ee095] transition-colors select-none"
      onClick={handleClick}
      title="Click to copy code"
    >
      {copied ? 'Copied!' : displayText}
    </span>
  );
};

// Function to detect and convert the specific promo code to clickable elements
const processSpecificCodeDetection = (text: string, bonusCode: string | null | undefined, onCodeCopy: (code: string) => void) => {
  // If no bonus code is provided, return text as-is
  if (!bonusCode || bonusCode.trim() === '') {
    return [text];
  }

  const parts: (string | React.ReactElement)[] = [];
  
  // Create a regex pattern for the specific bonus code (case-insensitive, whole word)
  const codePattern = new RegExp(`\\b${bonusCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
  let lastIndex = 0;
  let matchIndex = 0;
  
  const matches = Array.from(text.matchAll(codePattern));
  
  matches.forEach((match) => {
    const matchStart = match.index!;
    const matchedText = match[0];
    
    // Add text before the match
    if (matchStart > lastIndex) {
      parts.push(text.substring(lastIndex, matchStart));
    }
    
    // Add the clickable code with proper styling
    parts.push(
      <ClickableBonusCode
        key={`code-${matchIndex}-${matchedText}`}
        code={bonusCode}
        displayText={matchedText}
        onCopy={onCodeCopy}
      />
    );
    
    lastIndex = matchStart + matchedText.length;
    matchIndex++;
  });
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length > 1 ? parts : [text];
};

// Function to process descriptions with both links and codes
const processDescriptionWithLinks = (
  text: string, 
  onCodeCopy: (code: string) => void,
  casinoData?: RichContentProps['casinoData'],
  bonusData?: RichContentProps['bonusData'],
  analyticsData?: RichContentProps['analyticsData']
) => {
  // First, replace variables in the text
  const processedText = replaceVariables(text, casinoData, bonusData, analyticsData);
  
  // Then detect and process links
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: (string | React.ReactElement)[] = [];
  let lastIndex = 0;
  let partIndex = 0;
  
  const matches = Array.from(processedText.matchAll(linkPattern));
  
  matches.forEach((match) => {
    const linkText = match[1];
    const linkUrl = match[2];
    const matchStart = match.index!;
    
    // Add text before the link (process it for codes)
    if (matchStart > lastIndex) {
      const beforeText = processedText.substring(lastIndex, matchStart);
      const processedBefore = processSpecificCodeDetection(beforeText, bonusData?.code, onCodeCopy);
      if (Array.isArray(processedBefore)) {
        processedBefore.forEach((part, idx) => {
          parts.push(typeof part === 'string' ? part : React.cloneElement(part, { key: `before-${partIndex}-${idx}` }));
        });
      } else {
        parts.push(beforeText);
      }
    }
    
    // Add the link
    parts.push(
      <a 
        key={`link-${partIndex}`}
        href={linkUrl} 
        target="_blank" 
        rel="noopener noreferrer nofollow"
        className="text-[#68D08B] hover:text-[#7ee095] underline transition-colors"
      >
        {linkText}
      </a>
    );
    
    lastIndex = matchStart + match[0].length;
    partIndex++;
  });
  
  // Process remaining text for codes
  if (lastIndex < processedText.length) {
    const remainingText = processedText.substring(lastIndex);
    const processedRemaining = processSpecificCodeDetection(remainingText, bonusData?.code, onCodeCopy);
    if (Array.isArray(processedRemaining)) {
      processedRemaining.forEach((part, idx) => {
        parts.push(typeof part === 'string' ? part : React.cloneElement(part, { key: `remaining-${idx}` }));
      });
    } else {
      parts.push(remainingText);
    }
  }
  
  // If no links were found, just process for codes
  if (parts.length === 0) {
    return processSpecificCodeDetection(processedText, bonusData?.code, onCodeCopy);
  }
  
  return parts;
};

// Helper function to detect bullet points
const isBulletPoint = (line: string): boolean => {
  return /^[•\-\*\+→▸►‣⁃]\s+/.test(line.trim());
};

// Helper function to clean bullet point text
const cleanBulletText = (line: string): string => {
  return line.replace(/^[•\-\*\+→▸►‣⁃]\s*/, '').trim();
};

export default function RichContent({ 
  content, 
  type, 
  keyFeatures, 
  bonusCode, 
  casinoName, 
  affiliateLink, 
  codeTermLabel,
  casinoData,
  bonusData,
  analyticsData
}: RichContentProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  // Handle code copy with user feedback
  const handleCodeCopy = (code: string) => {
    console.log(`Promo code copied: ${code}`);
    // You could add analytics tracking here if needed
  };

  if (!content) {
    return <div className="text-[#a4a5b0]">No content available.</div>;
  }

  // Special handling for howToRedeem content - convert to numbered steps
  if (type === 'howToRedeem') {
    // Check if content is already in numbered list format (fallback content)
    const isNumberedList = /^\s*\d+\.\s/.test(content.trim());
    
    if (isNumberedList) {
      // For numbered list content, generate proper steps based on whether there's a bonus code
      const fallbackSteps = bonusCode ? [
        {
          title: 'Copy bonus code',
          description: casinoName ? `Click on the ${casinoName} code to copy it` : 'Click on the code to copy it'
        },
        {
          title: 'Visit the site',
          description: 'Open the casino website and sign up for an account with the code'
        },
        {
          title: 'Follow steps to unlock reward',
          description: 'Complete the registration and deposit process to receive your bonus'
        }
      ] : [
        {
          title: 'Redeem the bonus',
          description: casinoName ? `Click the ${casinoName} 'Get Bonus' button` : 'Click the \'Get Bonus\' button'
        },
        {
          title: 'Create an account',
          description: casinoName && affiliateLink 
            ? `Sign up on the [${casinoName} website](${affiliateLink})`
            : casinoName ? `Sign up on the ${casinoName} website` : 'Sign up on the casino website'
        },
        {
          title: 'Follow steps to unlock reward',
          description: casinoName ? `Complete the requirements to receive your ${casinoName} bonus` : 'Complete the requirements to receive your bonus'
        }
      ];
      
      // Render the fallback steps
      return (
        <div className="space-y-5 mt-6 mb-4">
          {fallbackSteps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="relative bg-[#2c2f3a] rounded-xl p-4 border border-[#404055]/50 transition-all duration-300 group-hover:border-[#68D08B]/30 group-hover:bg-[#2c2f3a]">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <span className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-[#68D08B] to-[#5cb574] text-[#1a1a1a] rounded-full flex items-center justify-center text-sm font-bold shadow-sm shadow-[#68D08B]/15 transition-all duration-300 group-hover:shadow-md group-hover:shadow-[#68D08B]/25 group-hover:scale-105 group-hover:from-[#7ee095] group-hover:to-[#68D08B] relative z-10">
                      {index + 1}
                    </span>
                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 w-9 h-9 bg-[#68D08B] rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-sm"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-0.5 leading-tight transition-colors duration-300 group-hover:text-[#68D08B]">
                      {step.title}
                    </h3>
                    <div className="text-[#a4a5b0] text-sm leading-relaxed transition-colors duration-300 group-hover:text-[#b5b6c1]">
                      {processDescriptionWithLinks(step.description, handleCodeCopy, casinoData, bonusData, analyticsData)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    // Split content by double newlines to get sections
    const sections = content.split('\n\n').filter(section => section.trim() !== '');
    
    const steps: Array<{title: string, description: string}> = [];
    
    // Parse each section to extract title and description
    for (const section of sections) {
      const lines = section.split('\n').filter(line => line.trim() !== '');
      if (lines.length >= 2) {
        // First line should be the title (with ** formatting)
        const titleLine = lines[0].trim().replace(/^\*\*/, '').replace(/\*\*$/, '');
        // Remaining lines are the description
        const description = lines.slice(1).join(' ').trim();
        
        if (titleLine && description) {
          steps.push({
            title: titleLine,
            description: description
          });
        }
      }
    }
    
    // Fallback to ensure we always have 3 steps with proper content
    if (steps.length < 3) {
      const fallbackSteps = [
        {
          title: bonusCode ? 'Copy bonus code' : 'Redeem the bonus',
          description: bonusCode 
            ? casinoName ? `Click on the ${casinoName} code to copy it` : 'Click on the code to copy it'
            : casinoName ? `Click the ${casinoName} 'Get Bonus' button` : 'Click the \'Get Bonus\' button'
        },
        {
          title: bonusCode ? 'Visit the site' : 'Create an account',
          description: bonusCode 
            ? 'Open the casino website and sign up for an account with the code'
            : casinoName && affiliateLink 
              ? `Sign up on the [${casinoName} website](${affiliateLink})`
              : casinoName ? `Sign up on the ${casinoName} website` : 'Sign up on the casino website'
        },
        {
          title: 'Follow steps to unlock reward',
          description: bonusCode 
            ? 'Complete the registration and deposit process to receive your bonus'
            : casinoName ? `Complete the requirements to receive your ${casinoName} bonus` : 'Complete the requirements to receive your bonus'
        }
      ];
      
      // Use parsed steps if available, otherwise use fallback
      for (let i = 0; i < 3; i++) {
        if (!steps[i]) {
          steps[i] = fallbackSteps[i];
        }
      }
    }
    
    // Render exactly 3 numbered steps
    return (
      <div className="space-y-5 mt-6 mb-4">
        {steps.slice(0, 3).map((step, index) => (
          <div key={index} className="relative group">
            <div className="relative bg-[#2c2f3a] rounded-xl p-4 border border-[#404055]/50 transition-all duration-300 group-hover:border-[#68D08B]/30 group-hover:bg-[#2c2f3a]">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <span className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-[#68D08B] to-[#5cb574] text-[#1a1a1a] rounded-full flex items-center justify-center text-sm font-bold shadow-sm shadow-[#68D08B]/15 transition-all duration-300 group-hover:shadow-md group-hover:shadow-[#68D08B]/25 group-hover:scale-105 group-hover:from-[#7ee095] group-hover:to-[#68D08B] relative z-10">
                    {index + 1}
                  </span>
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 w-9 h-9 bg-[#68D08B] rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-sm"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white mb-0.5 leading-tight transition-colors duration-300 group-hover:text-[#68D08B]">
                    {replaceVariables(step.title, casinoData, bonusData, analyticsData)}
                  </h3>
                  <div className="text-[#a4a5b0] text-sm leading-relaxed transition-colors duration-300 group-hover:text-[#b5b6c1]">
                    {processDescriptionWithLinks(step.description, handleCodeCopy, casinoData, bonusData, analyticsData)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Split content into lines for processing (for other content types)
  const lines = content.split('\n').filter(line => line.trim() !== '');

  return (
    <div className="space-y-4">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        
        // Handle FAQ sections with questions and answers
        if (type === 'faq') {
          if (trimmedLine.endsWith('?')) {
            // This is a question
            const isExpanded = expandedFaq === index;
            const answerIndex = index + 1;
            const hasAnswer = answerIndex < lines.length && !lines[answerIndex].trim().endsWith('?');
            
            return (
              <div key={index} className="border border-[#404055] rounded-xl overflow-hidden mb-3 transition-all duration-200 hover:border-[#68D08B]/30">
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : index)}
                  className="w-full px-5 py-4 text-left bg-gradient-to-r from-[#2c2f3a] to-[#262936] hover:from-[#2f3240] hover:to-[#29303e] transition-all duration-200 flex items-center justify-between group"
                >
                  <span className="font-medium text-white pr-4 transition-colors duration-200 group-hover:text-[#68D08B]">
                    {processDescriptionWithLinks(trimmedLine, handleCodeCopy, casinoData, bonusData, analyticsData)}
                  </span>
                  <svg
                    className={`w-5 h-5 text-[#68D08B] transition-all duration-200 group-hover:scale-110 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isExpanded && hasAnswer && (
                  <div className="px-5 py-4 bg-gradient-to-r from-[#1E1E27] to-[#1a1a23] border-t border-[#404055]/50">
                    <p className="text-[#a4a5b0] leading-relaxed">
                      {processDescriptionWithLinks(lines[answerIndex].trim(), handleCodeCopy, casinoData, bonusData, analyticsData)}
                    </p>
                  </div>
                )}
              </div>
            );
          } else if (index > 0 && lines[index - 1].trim().endsWith('?')) {
            // This is an answer, skip it as it's handled above
            return null;
          }
        }

        // Handle different line types for non-FAQ content
        if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
          // Bold headers
          const headerText = trimmedLine.slice(2, -2);
          return (
            <h3 key={index} className="text-xl font-semibold text-white mt-8 mb-4 leading-tight">
              {processDescriptionWithLinks(headerText, handleCodeCopy, casinoData, bonusData, analyticsData)}
            </h3>
          );
        } else if (trimmedLine.startsWith('###')) {
          // H3 headers
          const headerText = trimmedLine.slice(3).trim();
          return (
            <h3 key={index} className="text-lg font-semibold text-white mt-6 mb-3 leading-tight">
              {processDescriptionWithLinks(headerText, handleCodeCopy, casinoData, bonusData, analyticsData)}
            </h3>
          );
        } else if (trimmedLine.startsWith('##')) {
          // H2 headers  
          const headerText = trimmedLine.slice(2).trim();
          return (
            <h2 key={index} className="text-2xl font-bold text-white mt-10 mb-5 leading-tight">
              {processDescriptionWithLinks(headerText, handleCodeCopy, casinoData, bonusData, analyticsData)}
            </h2>
          );
        } else if (trimmedLine.match(/^[0-9]+\.\s/)) {
          // Numbered lists
          const text = trimmedLine.replace(/^[0-9]+\.\s/, '');
          const number = trimmedLine.match(/^([0-9]+)\./)?.[1];
          return (
            <div key={index} className="flex items-start gap-3 mb-4">
              <span className="flex-shrink-0 text-[#68D08B] font-bold text-base min-w-[1.5rem]">
                {number}.
              </span>
              <p className="text-[#a4a5b0] leading-relaxed flex-1">
                {processDescriptionWithLinks(text, handleCodeCopy, casinoData, bonusData, analyticsData)}
              </p>
            </div>
          );
        } else if (isBulletPoint(trimmedLine)) {
          // Bullet points
          const text = cleanBulletText(trimmedLine);
          return (
            <div key={index} className="flex items-start gap-3 mb-3">
              <span className="flex-shrink-0 w-2 h-2 bg-[#8b8c98] rounded-full mt-2.5 shadow-sm"></span>
              <p className="text-[#a4a5b0] leading-relaxed">
                {processDescriptionWithLinks(text, handleCodeCopy, casinoData, bonusData, analyticsData)}
              </p>
            </div>
          );
        } else {
          // Regular paragraphs
          return (
            <p key={index} className="text-[#a4a5b0] leading-relaxed mb-4">
              {processDescriptionWithLinks(trimmedLine, handleCodeCopy, casinoData, bonusData, analyticsData)}
            </p>
          );
        }
      })}

      {/* Key Features Section */}
      {type === 'about' && keyFeatures && keyFeatures.length > 0 && (
        <div className="mt-4 pt-2 border-t border-[#404055]/50">
          <h3 className="text-xl font-semibold text-white mb-6">Key Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-[#2c2f3a] rounded-xl border border-[#404055]/30 transition-all duration-200 hover:border-[#68D08B]/30 hover:bg-[#2c2f3a] group">
                <span className="text-2xl transition-transform duration-200 group-hover:scale-110">{feature.emoji}</span>
                <span className="text-[#a4a5b0] text-sm leading-relaxed transition-colors duration-200 group-hover:text-[#b5b6c1]">
                  {processDescriptionWithLinks(feature.text, handleCodeCopy, casinoData, bonusData, analyticsData)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 