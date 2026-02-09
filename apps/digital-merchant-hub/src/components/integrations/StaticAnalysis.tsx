import React from 'react';

// Defines the structure for a finding from a static analysis tool
interface StaticAnalysisFinding {
  id: string;
  tool: 'Snyk' | 'Veracode' | 'Dependabot';
  severity: 'High' | 'Medium' | 'Low';
  type: 'Vulnerability' | 'Code Smell' | 'License Issue';
  filePath: string;
  lineNumber: number;
  description: string;
}

// Mock data from a static analysis tool integration
const staticAnalysisFindings: StaticAnalysisFinding[] = [
  {
    id: 'snyk-finding-1',
    tool: 'Snyk',
    severity: 'High',
    type: 'Vulnerability',
    filePath: 'packages/utils/src/auth.ts',
    lineNumber: 42,
    description: 'Regular Expression Denial of Service (ReDoS) in `jsonwebtoken` package.',
  },
  {
    id: 'dependabot-finding-2',
    tool: 'Dependabot',
    severity: 'Medium',
    type: 'Vulnerability',
    filePath: 'apps/digital-merchant-hub/package.json',
    lineNumber: 18,
    description: 'Prototype Pollution in `lodash` < 4.17.21.',
  },
  {
    id: 'veracode-finding-3',
    tool: 'Veracode',
    severity: 'Low',
    type: 'Code Smell',
    filePath: 'src/components/compliance/PolicyEngine.tsx',
    lineNumber: 91,
    description: 'Hardcoded IP address in a configuration string.',
  },
];

/**
 * @description Integrates with static analysis tools to display code vulnerabilities.
 */
const StaticAnalysis: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-4">Static Analysis Results</h2>
      <div className="space-y-4">
        {staticAnalysisFindings.map((finding) => (
          <div key={finding.id} className="p-3 border rounded-md font-mono text-sm">
            <div className="flex justify-between items-center">
              <span className="font-bold">{finding.description}</span>
              <span className="text-xs font-semibold">{finding.severity}</span>
            </div>
            <div className="text-gray-500 mt-1">
              {finding.tool} found a {finding.type.toLowerCase()} in <span className="font-semibold">{finding.filePath}:{finding.lineNumber}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaticAnalysis;
