"use client";

import { useEffect, useState } from 'react';

interface SchemaValidatorProps {
  enabled?: boolean;
}

export default function SchemaValidator({ enabled = false }: SchemaValidatorProps) {
  const [schemas, setSchemas] = useState<any[]>([]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Extract all JSON-LD scripts from the page
    const extractSchemas = () => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      const foundSchemas: any[] = [];

      scripts.forEach((script, index) => {
        try {
          const content = script.textContent || script.innerHTML;
          const parsed = JSON.parse(content);
          foundSchemas.push({
            id: script.id || `schema-${index}`,
            type: parsed['@type'] || 'Unknown',
            content: parsed,
            valid: true
          });
        } catch (error) {
          foundSchemas.push({
            id: script.id || `schema-${index}`,
            type: 'Invalid',
            content: script.textContent,
            valid: false,
            error: error.message
          });
        }
      });

      setSchemas(foundSchemas);
    };

    // Extract schemas after a short delay to ensure all components have rendered
    const timer = setTimeout(extractSchemas, 1000);

    return () => clearTimeout(timer);
  }, [enabled]);

  if (!enabled || schemas.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg max-w-sm z-50 text-xs">
      <h3 className="font-bold mb-2">Schema Markup Validation</h3>
      <div className="space-y-2">
        {schemas.map((schema, index) => (
          <div key={index} className={`p-2 rounded ${schema.valid ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
            <div className="flex justify-between items-center">
              <span className="font-semibold">{schema.type}</span>
              <span className={`px-1 rounded text-xs ${schema.valid ? 'bg-green-600' : 'bg-red-600'}`}>
                {schema.valid ? '✓' : '✗'}
              </span>
            </div>
            {schema.id && <div className="text-gray-400">ID: {schema.id}</div>}
            {!schema.valid && <div className="text-red-300 text-xs">{schema.error}</div>}
            {schema.valid && (
              <details className="mt-1">
                <summary className="cursor-pointer text-gray-400">View Schema</summary>
                <pre className="text-xs mt-1 overflow-auto max-h-32 bg-gray-800 p-1 rounded">
                  {JSON.stringify(schema.content, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 text-gray-400">
        Total schemas: {schemas.length} | Valid: {schemas.filter(s => s.valid).length}
      </div>
    </div>
  );
} 