import React from 'react';

// Defines the structure for a risk entity in the register
interface RiskSummary {
  id: string;
  title: string;
  status: 'Active' | 'Mitigated' | 'Accepted';
  probability: 'High' | 'Medium' | 'Low';
  impact: 'High' | 'Medium' | 'Low';
}

// Mock data for the risk register, representing risks as graph entities
const riskRegister: RiskSummary[] = [
  {
    id: 'risk-001',
    title: 'Unauthorized Access to Customer PII',
    status: 'Active',
    probability: 'Low',
    impact: 'High',
  },
  {
    id: 'risk-002',
    title: 'Data Loss from Database Failure',
    status: 'Mitigated',
    probability: 'Low',
    impact: 'Medium',
  },
  {
    id: 'risk-003',
    title: 'Service Outage During Peak Hours',
    status: 'Active',
    probability: 'Medium',
    impact: 'High',
  },
  {
    id: 'risk-004',
    title: 'Third-Party API Deprecation',
    status: 'Accepted',
    probability: 'High',
    impact: 'Low',
  },
];

/**
 * @description A register that displays all identified risks to the platform.
 * Risks are treated as graph entities that can be linked to controls and mitigations.
 */
const RiskRegister: React.FC = () => {
  const getImpactColor = (impact: RiskSummary['impact']) => {
    if (impact === 'High') return 'bg-red-500';
    if (impact === 'Medium') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-4">Risk Register</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {riskRegister.map((risk) => (
            <tr key={risk.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{risk.title}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{risk.status}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{risk.probability}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`h-2.5 w-2.5 rounded-full inline-block mr-2 ${getImpactColor(risk.impact)}`}></span>
                {risk.impact}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RiskRegister;
