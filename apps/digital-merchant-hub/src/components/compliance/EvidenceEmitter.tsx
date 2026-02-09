import React from 'react';

// Defines the structure for a piece of compliance evidence
interface Evidence {
  id: string;
  controlId: string; // The control this evidence supports (e.g., 'control-ac-1')
  title: string;
  source: string; // e.g., 'AWS CloudTrail Log', 'GitHub PR #123', 'Okta Access Policy'
  timestamp: string;
  data: Record<string, unknown>; // The actual evidence data (e.g., log entry, config JSON)
}

// Mock data for automatically generated evidence
const evidence: Evidence[] = [
  {
    id: 'ev-001',
    controlId: 'control-ac-1',
    title: "Admin User Login Success",
    source: "Supabase Auth Logs",
    timestamp: new Date().toISOString(),
    data: { userId: 'admin@example.com', ip: '192.168.1.1' },
  },
  {
    id: 'ev-002',
    controlId: 'control-de-1',
    title: "Database Encryption Enabled",
    source: "AWS RDS Configuration Snapshot",
    timestamp: new Date().toISOString(),
    data: { parameter: 'storage_encrypted', value: 'true' },
  },
  {
    id: 'ev-003',
    controlId: 'control-au-1',
    title: "User Deletion Logged",
    source: "Application Audit Trail",
    timestamp: new Date().toISOString(),
    data: { actor: 'admin@example.com', action: 'delete_user', target: 'user@example.com' },
  },
];

/**
 * @description Generates and displays evidence that proves compliance controls are being met.
 * This component simulates the collection of logs, configs, and access records.
 */
const EvidenceEmitter: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-4">Evidence Emitter</h2>
      <p className="text-sm text-gray-500 mb-4">Automatically generating proof from system logs, configurations, and access history.</p>
      <div className="space-y-4">
        {evidence.map((item) => (
          <div key={item.id} className="p-4 border rounded-md font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm">{item.title}</span>
              <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Control: {item.controlId}
              </span>
            </div>
            <div className="mt-2">
              <p><span className="font-semibold">Source:</span> {item.source}</p>
              <p><span className="font-semibold">Timestamp:</span> {item.timestamp}</p>
            </div>
            <pre className="bg-gray-100 p-2 rounded mt-2 text-wrap">{JSON.stringify(item.data, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvidenceEmitter;
