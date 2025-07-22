'use client';

import { useState, useEffect } from 'react';

export default function SimpleLanguageIndicator() {
  const [currentPath, setCurrentPath] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('English');

  useEffect(() => {
    const path = window.location.pathname;
    setCurrentPath(path);

    // Simple language detection
    const segments = path.split('/');
    const langCode = segments[1];
    
    const languageMap: Record<string, string> = {
      'tr': 'Turkish (Türkçe)',
      'pl': 'Polish (Polski)', 
      'es': 'Spanish (Español)',
      'pt': 'Portuguese (Português)',
      'vi': 'Vietnamese (Tiếng Việt)',
      'ja': 'Japanese (日本語)',
      'ko': 'Korean (한국어)',
      'fr': 'French (Français)'
    };

    setDetectedLanguage(languageMap[langCode] || 'English');
  }, []);

  return (
    <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-3 mb-6">
      <div className="text-yellow-500 font-semibold text-sm">
        🌐 Language Detection Demo
      </div>
      <div className="text-white text-xs mt-1">
        URL: {currentPath || 'Loading...'} 
      </div>
      <div className="text-white text-xs">
        Detected Language: {detectedLanguage}
      </div>
    </div>
  );
} 