import React from 'react';

// Defines the structure for a remediation workflow step
interface RemediationStep {
  id: string;
  status: 'Todo' | 'In Progress' | 'Done';
  assignee: string;
  description: string;
  dueDate: string;
}

// Mock data for a remediation workflow linked to a specific risk
const remediationWorkflow = {
  riskId: 'risk-003',
  riskTitle: 'Service Outage During Peak Hours',
  steps: [
    {
      id: 'step-1',
      status: 'Done',
      assignee: 'eng-sre@example.com',
      description: 'Analyze root cause of last month\'s outage.',
      dueDate: '2023-10-15',
    },
    {
      id: 'step-2',
      status: 'In Progress',
      assignee: 'eng-sre@example.com',
      description: 'Implement and test redundant load balancers in the EU region.',
      dueDate: '2023-11-30',
    },
    {
      id: 'step-3',
      status: 'Todo',
      assignee: 'qa-team@example.com',
      description: 'Perform stress testing on the new infrastructure.',
      dueDate: '2023-12-10',
    },
  ] as RemediationStep[],
};

/**
 * @description Manages the workflow for remediating an identified risk.
 * Links risks to controls and incidents, and tracks remediation tasks.
 */
const RemediationWorkflow: React.FC = () => {
  const getStatusBadge = (status: RemediationStep['status']) => {
    if (status === 'Done') return 'bg-green-100 text-green-800';
    if (status === 'In Progress') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold">Remediation Workflow</h2>
      <p className="text-sm text-gray-500 mb-4">Tracking for: <span className="font-semibold">{remediationWorkflow.riskTitle}</span></p>
      
      <ol className="relative border-l border-gray-200">
        {remediationWorkflow.steps.map((step) => (
          <li key={step.id} className="mb-10 ml-6">
            <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
              {/* Icon can go here */}
            </span>
            <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">
              {step.description}
              <span className={`ml-3 text-sm font-medium mr-2 px-2.5 py-0.5 rounded ${getStatusBadge(step.status)}`}>
                {step.status}
              </span>
            </h3>
            <time className="block mb-2 text-sm font-normal leading-none text-gray-400">
              Due: {step.dueDate} | Assignee: {step.assignee}
            </time>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default RemediationWorkflow;
