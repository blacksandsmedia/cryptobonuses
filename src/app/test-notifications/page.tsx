'use client';

import { useState } from 'react';

export default function TestNotificationsPage() {
  const [status, setStatus] = useState<string>('');
  const [debugData, setDebugData] = useState<any>(null);

  const testAPI = async (endpoint: string, options: any = {}) => {
    try {
      setStatus(`Testing ${endpoint}...`);
      const response = await fetch(endpoint, options);
      const data = await response.json();
      
      setStatus(`✅ ${endpoint} - Status: ${response.status}`);
      setDebugData(data);
      
      return data;
    } catch (error) {
      setStatus(`❌ ${endpoint} - Error: ${error.message}`);
      setDebugData({ error: error.message });
      throw error;
    }
  };

  const runTests = async () => {
    try {
      // Test 1: Check debug endpoint
      await testAPI('/api/debug/notifications');
      
      // Test 2: Check recent claims
      await testAPI('/api/recent-claims');
      
      // Test 3: Create a test tracking entry
      const casinos = await testAPI('/api/casinos');
      if (casinos.length > 0) {
        const casino = casinos[0];
        if (casino.bonusId && casino.casinoId) {
          await testAPI('/api/tracking', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              casinoId: casino.casinoId,
              bonusId: casino.bonusId,
              actionType: 'code_copy'
            })
          });
        }
      }
      
      // Test 4: Check recent claims again
      await testAPI('/api/recent-claims');
      
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  const createTestEntry = async () => {
    try {
      setStatus('Creating test tracking entry...');
      await testAPI('/api/debug/notifications?test=create');
      setStatus('✅ Test entry created');
    } catch (error) {
      setStatus(`❌ Failed to create test entry: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#343541] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔔 Notification System Test</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={runTests}
            className="bg-[#68D08B] text-[#343541] px-6 py-3 rounded-lg font-semibold hover:bg-[#5abc7a] transition-colors"
          >
            🧪 Run Full Test Suite
          </button>
          
          <button
            onClick={createTestEntry}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors ml-4"
          >
            ➕ Create Test Entry
          </button>
          
          <button
            onClick={() => testAPI('/api/recent-claims')}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors ml-4"
          >
            📊 Check Recent Claims
          </button>
        </div>

        <div className="bg-[#2c2f3a] p-6 rounded-xl mb-6">
          <h2 className="text-xl font-semibold mb-4">📱 Status</h2>
          <p className="text-[#68D08B] font-mono">{status || 'Ready to test...'}</p>
        </div>

        {debugData && (
          <div className="bg-[#2c2f3a] p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">🔍 Debug Data</h2>
            <pre className="text-sm text-gray-300 overflow-auto max-h-96 bg-black p-4 rounded">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-[#2c2f3a] p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">📋 Instructions</h2>
          <ol className="space-y-2 text-gray-300">
            <li><strong>1.</strong> Run the full test suite to check all APIs</li>
            <li><strong>2.</strong> Create a test entry to simulate an offer click</li>
            <li><strong>3.</strong> Check browser console for detailed logs</li>
            <li><strong>4.</strong> Notifications should appear in bottom-left corner</li>
            <li><strong>5.</strong> Check the debug data for API responses</li>
          </ol>
        </div>

        <div className="mt-6 bg-yellow-500/20 border border-yellow-500 p-4 rounded-lg">
          <p className="text-yellow-300">
            <strong>🚨 Production Testing:</strong> This page helps debug notification issues in production. 
            Check browser console and Network tab for detailed information.
          </p>
        </div>
      </div>
    </div>
  );
} 