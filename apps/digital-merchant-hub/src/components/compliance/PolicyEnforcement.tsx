import React from 'react';

// Defines the structure for a log of a policy enforcement action
interface EnforcementLog {
  id: string;
  policyId: string;
  policyVersion: number;
  timestamp: string;
  action: 'Blocked' | 'Allowed' | 'Alerted';
  target: string; // The workflow or resource the policy was applied to
  details: string;
}

// Mock data for policy enforcement logs
const enforcementLogs: EnforcementLog[] = [
  {
    id: 'log-001',
    policyId: 'policy-data-retention-v2',
    policyVersion: 2,
    timestamp: new Date().toISOString(),
    action: 'Blocked',
    target: 'Workflow: delete-user-account',
    details: 'Attempted to hard-delete user PII before 365-day retention period.',
  },
  {
    id: 'log-002',
    policyId: 'policy-access-control-v1',
    policyVersion: 1,
    timestamp: new Date().toISOString(),
    action: 'Alerted',
    target: 'Permission: read-system-logs',
    details: 'A non-admin user was granted temporary read access to system logs.',
  },
  {
    id: 'log-003',
    policyId: 'policy-data-retention-v2',
    policyVersion: 2,
    timestamp: new Date().toISOString(),
    action: 'Allowed',
    target: 'Workflow: anonymize-old-data',
    details: 'Scheduled job anonymized 1,234 records older than 365 days.',
  },
];

/**
 * @description Links policies to workflows and permissions, and logs enforcement actions.
 * This component shows how policies are actively enforced within the system.
 */
const PolicyEnforcement: React.FC = () => {
  const getActionColor = (action: EnforcementLog['action']) => {
    switch (action) {
      case 'Blocked': return 'bg-red-100 text-red-800';
      case 'Allowed': return 'bg-green-100 text-green-800';
      case 'Alerted': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-4">Policy Enforcement Logs</h2>
      <div className="space-y-3">
        {enforcementLogs.map((log) => (
          <div key={log.id} className="p-3 border rounded-md text-sm">
            <div className="flex justify-between items-center">
              <p className="font-semibold">{log.target}</p>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                {log.action}
              </span>
            </div>
            <p className="text-gray-600 mt-1">{log.details}</p>
            <p className="text-xs text-gray-400 mt-2">
              Policy: {log.policyId} (v{log.policyVersion}) @ {new Date(log.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PolicyEnforcement;
