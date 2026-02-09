import React from 'react';

// Defines the structure for a single compliance control
interface ControlDefinition {
  id: string;
  name: string;
  description: string;
  frameworkIds: string[]; // Maps control to one or more frameworks (e.g., ['soc2', 'iso27001'])
}

// A list of control definitions mapped to platform behaviors
const controlDefinitions: ControlDefinition[] = [
  {
    id: 'control-ac-1',
    name: 'Access Control',
    description: 'System access is limited to authorized users, processes acting on behalf of authorized users, or devices (including other systems).'
    frameworkIds: ['soc2', 'iso27001', 'gdpr'],
  },
  {
    id: 'control-de-1',
    name: 'Data Encryption',
    description: 'Sensitive data is encrypted in transit and at rest using industry-standard cryptographic protocols.',
    frameworkIds: ['soc2', 'gdpr'],
  },
  {
    id: 'control-au-1',
    name: 'Audit Logging',
    description: 'Actions that can be uniquely traced to an individual are logged, monitored, and retained.',
    frameworkIds: ['soc2', 'iso27001'],
  },
  // More control definitions can be added here
];

/**
 * @description Manages and displays the definitions for compliance controls.
 * These controls are the specific rules and procedures that map to compliance frameworks.
 */
const ControlDefinitions: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-4">Control Definitions</h2>
      <div className="space-y-4">
        {controlDefinitions.map((control) => (
          <div key={control.id} className="p-4 border rounded-md">
            <h3 className="font-semibold text-lg">{control.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{control.description}</p>
            <div className="mt-2">
              <span className="text-xs font-bold">Frameworks: </span>
              {control.frameworkIds.map(id => (
                 <span key={id} className="inline-block bg-gray-200 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
                  {id.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ControlDefinitions;
