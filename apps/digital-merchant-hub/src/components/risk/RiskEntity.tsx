import React from 'react';

// Defines the detailed structure of a single risk entity
interface RiskEntityData {
  id: string;
  title: string;
  description: string;
  probability: 'High' | 'Medium' | 'Low';
  impact: 'High' | 'Medium' | 'Low';
  owner: string; // The person or team responsible for the risk
  mitigation: string; // A description of the mitigation strategy
  relatedControls: string[]; // IDs of controls that help mitigate this risk
}

// Mock data for a single, detailed risk entity
const riskEntity: RiskEntityData = {
  id: 'risk-001',
  title: 'Unauthorized Access to Customer PII',
  description: 'A malicious actor could potentially gain access to sensitive customer Personally Identifiable Information (PII) through an unpatched vulnerability or stolen credentials.',
  probability: 'Low',
  impact: 'High',
  owner: 'security-team@example.com',
  mitigation: 'Implement multi-factor authentication for all internal admin panels. Enforce strict password policies. Conduct regular vulnerability scanning and penetration testing.',
  relatedControls: ['control-ac-1', 'control-au-1', 'control-de-1'],
};

/**
 * @description Displays the detailed view of a single risk entity.
 * This includes probability, impact, mitigation strategy, and ownership.
 */
const RiskEntity: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{riskEntity.title}</h2>
          <p className="text-sm text-gray-500">Owner: {riskEntity.owner}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">Probability: <span className="font-normal">{riskEntity.probability}</span></p>
          <p className="text-sm font-semibold">Impact: <span className="font-normal">{riskEntity.impact}</span></p>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold text-lg">Description</h3>
        <p className="text-sm text-gray-600">{riskEntity.description}</p>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold text-lg">Mitigation Strategy</h3>
        <p className="text-sm text-gray-600">{riskEntity.mitigation}</p>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold text-lg">Related Controls</h3>
        <div className="flex space-x-2">
          {riskEntity.relatedControls.map(controlId => (
            <span key={controlId} className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {controlId}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiskEntity;
