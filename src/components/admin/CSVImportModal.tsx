"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
  downloaded: number;
}

export default function CSVImportModal({ isOpen, onClose, onImportComplete }: CSVImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
      
      // Show preview of first few rows
      try {
        const content = await file.text();
        const rows = content.split('\n').slice(0, 5); // First 5 rows
        const preview = rows.map(row => row.split(',').map(col => col.trim().replace(/^"|"$/g, '')));
        setCsvPreview(preview);
        setShowPreview(true);
      } catch (error) {
        console.error("Error reading file:", error);
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Please select a CSV file");
      return;
    }

    setIsImporting(true);
    
    try {
      const formData = new FormData();
      formData.append('csvFile', selectedFile);

      const response = await fetch('/api/casinos/import-csv', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setImportResult(result.results);
        toast.success(result.message);
        onImportComplete();
      } else {
        console.error('Import failed:', result);
        if (response.status === 401) {
          toast.error("Authentication failed. Please refresh the page and try logging in again.");
        } else {
          toast.error(result.error || 'Import failed');
        }
        setImportResult({
          imported: 0,
          skipped: 0,
          errors: [result.error || `HTTP ${response.status}: Import failed`],
          downloaded: 0
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Import failed. Please check your connection and try again.");
      setImportResult({
        imported: 0,
        skipped: 0,
        errors: [`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        downloaded: 0
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportResult(null);
    setShowPreview(false);
    setCsvPreview([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#292932] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#404055]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Import Casinos from CSV</h2>
          <button
            onClick={handleClose}
            className="text-[#a7a9b4] hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* CSV Format Instructions */}
          <div className="bg-[#373946] p-4 rounded-lg border border-[#404055]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white font-semibold">Expected CSV Format</h3>
              <a
                href="/csv-templates/casinos-import-template.csv"
                download="casinos-import-template.csv"
                className="px-3 py-1 bg-[#68D08B] text-white text-sm rounded hover:bg-[#5abc7a] transition-colors"
              >
                Download Template
              </a>
            </div>
            <p className="text-[#a7a9b4] text-sm mb-3">
              Your CSV file should contain the following columns (header row required):
            </p>
            <ul className="text-[#a7a9b4] text-sm space-y-1">
              <li>• <strong>name</strong> (required) - Casino name</li>
              <li>• <strong>bonus</strong> (required) - Bonus description/value</li>
              <li>• <strong>promo code</strong> (optional) - Promotional code</li>
              <li>• <strong>logo</strong> (optional) - Logo URL or path</li>
              <li>• <strong>affiliate url</strong> (optional) - Affiliate link</li>
              <li>• <strong>website</strong> (optional) - Casino website URL</li>
              <li>• <strong>slug</strong> (optional) - URL slug (auto-generated from name if not provided)</li>
            </ul>
            <div className="mt-3 p-3 bg-[#2b2d36] rounded-lg">
              <div className="text-xs text-[#a7a9b4] font-mono mb-2">
                Example: name,bonus,promo code,logo,affiliate url,website,slug<br/>
                Casino XYZ,5 BTC + 200 FS,WELCOME,https://example.com/logo.png,https://example.com,https://casinoxyz.com,casino-xyz
              </div>
              <div className="text-xs text-blue-400 mt-2">
                <strong>🔄 Auto Image Download:</strong> If you provide HTTP/HTTPS URLs in the logo column, 
                the system will automatically download and save those images to our server, 
                so you can safely delete them from their original locations.
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-white font-medium mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 bg-[#1d1d25] border border-[#404055] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#68D08B]"
            />
          </div>

          {/* CSV Preview */}
          {showPreview && csvPreview.length > 0 && (
            <div className="bg-[#373946] p-4 rounded-lg border border-[#404055]">
              <h3 className="text-white font-semibold mb-2">Preview (First 5 rows)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#2b2d36]">
                      {csvPreview[0]?.map((header, index) => (
                        <th key={index} className="px-2 py-1 text-left text-[#a7a9b4] border border-[#404055]">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.slice(1).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-2 py-1 text-[#a7a9b4] border border-[#404055] truncate max-w-32">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Results */}
          {importResult && (
            <div className="bg-[#373946] p-4 rounded-lg border border-[#404055]">
              <h3 className="text-white font-semibold mb-2">Import Results</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#a7a9b4]">Successfully imported:</span>
                  <span className="text-green-400 font-medium">{importResult.imported}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a7a9b4]">Images downloaded:</span>
                  <span className="text-blue-400 font-medium">{importResult.downloaded}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a7a9b4]">Skipped:</span>
                  <span className="text-yellow-400 font-medium">{importResult.skipped}</span>
                </div>
                
                {importResult.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-red-400 font-medium mb-2">Errors:</h4>
                    <div className="bg-[#2b2d36] p-2 rounded max-h-32 overflow-y-auto">
                      {importResult.errors.map((error, index) => (
                        <div key={index} className="text-red-300 text-sm">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-[#373946] text-white rounded-md hover:bg-[#454655] transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
              className="px-4 py-2 bg-[#68D08B] text-white rounded-md hover:bg-[#5abc7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? "Importing..." : "Import CSV"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 