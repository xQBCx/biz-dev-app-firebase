import React from 'react';

// Defines the structure for a compliance framework
interface Framework {
  id: string;
  name: string;
  description: string;
  version: string;
}

// A registry of common compliance frameworks
const frameworks: Framework[] = [
  {
    id: 'gdpr',
    name: 'General Data Protection Regulation (GDPR)',
    description: 'A regulation in EU law on data protection and privacy for all individuals within the European Union and the European Economic Area.',
    version: '1.0'
  },
  {
    id: 'soc2',
    name: 'Service Organization Control 2 (SOC 2)',
    description: 'A framework for managing customer data based on five trust service criteria: security, availability, processing integrity, confidentiality, and privacy.',
    version: 'Type II'
  },
  {
    id: 'iso27001',
    name: 'ISO/IEC 27001',
    description: 'An international standard on how to manage information security.',
    version: '2022'
  },
  // More frameworks can be added here
];

/**
 * @description Displays the list of supported compliance frameworks.
 * This component acts as a central repository for framework definitions.
 */
const FrameworkRegistry: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Compliance Framework Registry</h2>
      <div className="space-y-4">
        {frameworks.map((framework) => (
          <div key={framework.id} className="p-4 border rounded-md">
            <h3 className="font-semibold text-lg">{framework.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{framework.description}</p>
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mt-2 px-2.5 py-0.5 rounded-full">
              Version: {framework.version}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FrameworkRegistry;
