import React from 'react';

// Defines the structure for a vulnerability report from a bug bounty program
interface BountyReport {
  id: string;
  source: 'HackerOne' | 'Bugcrowd' | 'Manual';
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
  title: string;
  reportedBy: string;
  status: 'New' | 'Triaged' | 'Resolved';
  bountyAmount?: number;
}

// Mock data from a bug bounty program integration
const bountyReports: BountyReport[] = [
  {
    id: 'h1-report-12345',
    source: 'HackerOne',
    severity: 'High',
    title: 'Insecure Direct Object Reference (IDOR) in /api/v1/documents',
    reportedBy: 'security-researcher-1',
    status: 'Triaged',
    bountyAmount: 2500,
  },
  {
    id: 'bc-report-67890',
    source: 'Bugcrowd',
    severity: 'Medium',
    title: 'Missing Rate Limiting on Login Endpoint',
    reportedBy: 'security-researcher-2',
    status: 'New',
  },
  {
    id: 'manual-report-001',
    source: 'Manual',
    severity: 'Informational',
    title: 'Disclosure of server version in HTTP headers',
    reportedBy: 'internal-auditor',
    status: 'Resolved',
  },
];

/**
 * @description Integrates with a bug bounty program to display externally reported vulnerabilities.
 */
const BugBounty: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-4">Bug Bounty Program Feed</h2>
      <div className="divide-y divide-gray-200">
        {bountyReports.map((report) => (
          <div key={report.id} className="py-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">{report.title}</h3>
              <span className="text-sm font-bold">{report.severity}</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Reported by {report.reportedBy} via {report.source} | Status: {report.status}
            </div>
            {report.bountyAmount && (
              <div className="text-sm text-green-600 font-semibold mt-1">Bounty: ${report.bountyAmount}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BugBounty;
