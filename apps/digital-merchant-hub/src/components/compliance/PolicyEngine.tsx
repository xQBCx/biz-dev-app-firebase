import React from 'react';

// Defines the structure for a machine-readable policy
interface Policy {
  id: string;
  version: number;
  name: string;
  description: string;
  content: string; // The policy content itself, e.g., in a specific DSL or as JSON
  createdAt: string;
  author: string;
}

// Mock data for versioned policies
const policies: Policy[] = [
  {
    id: 'policy-data-retention-v2',
    version: 2,
    name: 'Global Data Retention Policy',
    description: 'Specifies the duration for which different types of data must be stored.',
    content: `{
      "rules": [
        { "dataType": "user_pii", "retentionDays": 365, "on_delete": "anonymize" },
        { "dataType": "system_logs", "retentionDays": 90, "on_delete": "delete_raw" }
      ]
    }`,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    author: 'compliance-officer@example.com',
  },
  {
    id: 'policy-data-retention-v1',
    version: 1,
    name: 'Global Data Retention Policy',
    description: 'Initial data retention policy.',
    content: `{
      "rules": [
        { "dataType": "user_pii", "retentionDays": 730 },
        { "dataType": "system_logs", "retentionDays": 30 }
      ]
    }`,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    author: 'legal@example.com',
  },
];

/**
 * @description Manages versioned, machine-readable policies.
 * This provides a central place to view and manage policy-as-code artifacts.
 */
const PolicyEngine: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-4">Policy-as-Code Engine</h2>
      <p className="text-sm text-gray-500 mb-4">Versioned, machine-readable policies that can be enforced automatically.</p>
      <div className="space-y-4">
        {policies.map((policy) => (
          <div key={policy.id} className="p-4 border rounded-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{policy.name}</h3>
                <span className="text-xs text-gray-500">Version {policy.version} by {policy.author}</span>
              </div>
              <span className="text-sm text-gray-600">{new Date(policy.createdAt).toLocaleDateString()}</span>
            </div>
            <pre className="bg-gray-800 text-white p-3 rounded mt-2 text-sm text-wrap">{policy.content}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PolicyEngine;
