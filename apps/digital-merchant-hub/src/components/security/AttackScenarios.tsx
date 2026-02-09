import React from 'react';

// Defines the structure for a single attack scenario
interface AttackScenario {
  id: string;
  name: string;
  category: 'Web' | 'Cloud' | 'Social' | 'Network';
  description: string;
  mitreAttackId?: string; // Optional mapping to MITRE ATT&CK framework
}

// A library of common attack patterns
const attackScenarios: AttackScenario[] = [
  {
    id: 'scenario-001',
    name: 'SQL Injection (SQLi)',
    category: 'Web',
    description: 'An attacker injects a malicious SQL query via an input field to manipulate the backend database.',
    mitreAttackId: 'T1505',
  },
  {
    id: 'scenario-002',
    name: 'Cross-Site Scripting (XSS) - Stored',
    category: 'Web',
    description: 'An attacker injects malicious scripts into a web application, which are then stored and served to other users.',
    mitreAttackId: 'T1059.007',
  },
  {
    id: 'scenario-003',
    name: 'S3 Bucket Misconfiguration',
    category: 'Cloud',
    description: 'An S3 bucket is unintentionally left publicly accessible, exposing sensitive data.',
    mitreAttackId: 'T1530',
  },
  {
    id: 'scenario-004',
    name: 'Phishing Campaign',
    category: 'Social',
    description: 'An attacker sends fraudulent emails to employees to trick them into revealing sensitive information.',
    mitreAttackId: 'T1566',
  },
];

/**
 * @description A library of pre-defined attack patterns for use in security testing.
 * These scenarios can be used by the red team or in automated security tests.
 */
const AttackScenarios: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-4">Attack Scenario Library</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {attackScenarios.map((scenario) => (
          <div key={scenario.id} className="p-4 border rounded-md">
            <h3 className="font-semibold text-lg">{scenario.name}</h3>
            <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold mt-1 px-2.5 py-0.5 rounded-full">
              Category: {scenario.category}
            </span>
            <p className="text-sm text-gray-600 mt-2">{scenario.description}</p>
            {scenario.mitreAttackId && (
              <a href={`https://attack.mitre.org/techniques/${scenario.mitreAttackId}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-2 inline-block">
                MITRE ATT&CK ID: {scenario.mitreAttackId}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttackScenarios;
