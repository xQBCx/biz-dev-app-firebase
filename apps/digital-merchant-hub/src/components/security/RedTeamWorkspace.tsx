import React from 'react';

// Defines the structure for a finding from a red team exercise
interface RedTeamFinding {
  id: string;
  status: 'Open' | 'Remediating' | 'Closed';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  discoveredAt: string;
}

// Mock data for a red team workspace
const redTeamFindings: RedTeamFinding[] = [
  {
    id: 'rt-finding-001',
    status: 'Remediating',
    severity: 'High',
    title: 'Stored XSS in User Profile Page',
    description: 'User-supplied input on the profile page is not properly sanitized, allowing for the execution of arbitrary JavaScript.',
    discoveredAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'rt-finding-002',
    status: 'Open',
    severity: 'Medium',
    title: 'Information Leakage via Error Messages',
    description: 'Verbose error messages in the API response reveal internal system paths and configurations.',
    discoveredAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'rt-finding-003',
    status: 'Closed',
    severity: 'Low',
    title: 'Missing Security Headers',
    description: 'The web application is missing recommended security headers like CSP and HSTS.',
    discoveredAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

/**
 * @description A workspace for internal penetration testing (red team) activities.
 * It tracks findings, their severity, and remediation status.
 */
const RedTeamWorkspace: React.FC = () => {
  const getSeverityColor = (severity: RedTeamFinding['severity']) => {
    if (severity === 'Critical') return 'border-red-700';
    if (severity === 'High') return 'border-red-500';
    if (severity === 'Medium') return 'border-yellow-500';
    return 'border-gray-400';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-4">Red Team Workspace</h2>
      <p className="text-sm text-gray-500 mb-4">Tracking findings from internal security assessments and penetration tests.</p>
      <div className="space-y-4">
        {redTeamFindings.map((finding) => (
          <div key={finding.id} className={`p-4 border-l-4 rounded-r-md bg-gray-50 ${getSeverityColor(finding.severity)}`}>
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">{finding.title}</h3>
              <span className="text-sm font-bold">{finding.severity}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{finding.description}</p>
            <div className="text-xs text-gray-400 mt-2">
              Discovered: {new Date(finding.discoveredAt).toLocaleDateString()} | Status: {finding.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RedTeamWorkspace;
