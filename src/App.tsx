import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import AnalysisReport from './components/AnalysisReport';
import { analyzeConfig } from './utils/configAnalyzer';
import { AnalysisReport as AnalysisReportType } from './types';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

function App() {
  const [report, setReport] = useState<AnalysisReportType | null>(null);

  const handleFileSelect = (content: string) => {
    const analysisResult = analyzeConfig(content);
    setReport(analysisResult);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Firewall Configuration Analyzer
            </h1>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Upload your firewall configuration file to analyze security vulnerabilities and rule conflicts
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <FileUpload onFileSelect={handleFileSelect} />
          {report && <AnalysisReport report={report} />}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            Analyze your firewall configurations with confidence
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;