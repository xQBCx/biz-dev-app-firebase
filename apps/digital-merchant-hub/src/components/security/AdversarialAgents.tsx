import React from 'react';

// Defines the structure for an adversarial agent
interface AdversarialAgent {
  id: string;
  name: string;
  status: 'Idle' | 'Running' | 'Disabled';
  description: string;
  assignedScenarios: string[]; // IDs of scenarios the agent can execute
}

// Mock data for automated adversarial agents
const adversarialAgents: AdversarialAgent[] = [
  {
    id: 'agent-xss-scanner',
    name: 'XSS Polyglot Injector',
    status: 'Idle',
    description: 'An automated agent that injects a wide variety of XSS payloads into input fields across the application.',
    assignedScenarios: ['scenario-002'],
  },
  {
    id: 'agent-s3-scanner',
    name: 'S3 Bucket Auditor',
    status: 'Running',
    description: 'Continuously scans all S3 buckets in the AWS account for public access and misconfigurations.',
    assignedScenarios: ['scenario-003'],
  },
  {
    id: 'agent-sqli-scanner',
    name: 'SQLi Probe',
    status: 'Disabled',
    description: 'An agent designed to test for common SQL injection vulnerabilities. Currently disabled for maintenance.',
    assignedScenarios: ['scenario-001'],
  },
];

/**
 * @description Manages automated security testing agents (adversarial agents).
 * These agents can be configured to run attack scenarios automatically.
 */
const AdversarialAgents: React.FC = () => {
  const getStatusColor = (status: AdversarialAgent['status']) => {
    if (status === 'Running') return 'text-green-600';
    if (status === 'Disabled') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-4">Adversarial Agents</h2>
      <div className="space-y-4">
        {adversarialAgents.map((agent) => (
          <div key={agent.id} className="p-4 border rounded-md">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">{agent.name}</h3>
              <span className={`text-sm font-semibold ${getStatusColor(agent.status)}`}>{agent.status}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{agent.description}</p>
            <div className="mt-2">
              <span className="text-xs font-bold">Scenarios: </span>
              {agent.assignedScenarios.join(', ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdversarialAgents;
