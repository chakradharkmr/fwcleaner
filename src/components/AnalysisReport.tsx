import React from 'react';
import { AnalysisReport } from '../types';
import { ExclamationTriangleIcon, DocumentDuplicateIcon, ShieldCheckIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

interface AnalysisReportProps {
  report: AnalysisReport;
}

export default function AnalysisReport({ report }: AnalysisReportProps) {
  const severityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-500 bg-orange-50';
      case 'medium': return 'text-yellow-500 bg-yellow-50';
      default: return 'text-blue-500 bg-blue-50';
    }
  };

  const severityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <ShieldCheckIcon className="w-6 h-6 mr-2 text-indigo-500" />
            Security Analysis Results
          </h2>
          <span className="text-sm text-gray-500">
            Total Rules Analyzed: {report.totalRules}
          </span>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-orange-500" />
            Vulnerabilities ({report.vulnerabilities.length})
          </h3>
          <div className="space-y-4">
            {report.vulnerabilities.map((vuln) => (
              <div 
                key={vuln.id} 
                className={`border rounded-lg p-4 ${severityColor(vuln.severity)} bg-opacity-10`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2">{severityIcon(vuln.severity)}</span>
                    <h3 className="font-medium">{vuln.type}</h3>
                  </div>
                  <span className={`${severityColor(vuln.severity)} px-3 py-1 rounded-full text-sm font-medium`}>
                    {vuln.severity.toUpperCase()}
                  </span>
                </div>
                {vuln.configLine && (
                  <div className="mt-2 bg-gray-800 text-gray-200 p-2 rounded font-mono text-sm flex items-center">
                    <CodeBracketIcon className="w-4 h-4 mr-2" />
                    <code>{vuln.configLine}</code>
                  </div>
                )}
                <p className="text-gray-600 mt-2">{vuln.description}</p>
                <div className="mt-3 bg-white bg-opacity-50 p-3 rounded">
                  <p className="text-gray-800">
                    <strong>Recommendation:</strong> {vuln.recommendation}
                  </p>
                  {vuln.line && (
                    <p className="text-sm text-gray-500 mt-1">Line: {vuln.line}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <DocumentDuplicateIcon className="w-5 h-5 mr-2 text-blue-500" />
            Rule Analysis ({report.duplicateRules.length} conflicts)
          </h3>
          <div className="space-y-4">
            {report.duplicateRules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-4 bg-blue-50 bg-opacity-30">
                {rule.configLine && (
                  <div className="mb-3 bg-gray-800 text-gray-200 p-2 rounded font-mono text-sm flex items-center">
                    <CodeBracketIcon className="w-4 h-4 mr-2" />
                    <code>{rule.configLine}</code>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><strong>Source:</strong> {rule.source}</p>
                    <p><strong>Destination:</strong> {rule.destination}</p>
                  </div>
                  <div>
                    <p><strong>Port:</strong> {rule.port}</p>
                    <p><strong>Action:</strong> {rule.action}</p>
                    <p><strong>Protocol:</strong> {rule.protocol}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}