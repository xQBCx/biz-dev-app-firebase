import React, { useState, useEffect } from 'react';

// Defines the validation status for a control
interface ControlStatus {
  controlId: string;
  status: 'Passing' | 'Failing' | 'Warning';
  lastChecked: string;
  details: string;
}

// Mock data simulating real-time validation results
const initialValidationStatus: ControlStatus[] = [
  {
    controlId: 'control-ac-1',
    status: 'Passing',
    lastChecked: new Date().toISOString(),
    details: 'All production access granted through approved roles.',
  },
  {
    controlId: 'control-de-1',
    status: 'Passing',
    lastChecked: new Date().toISOString(),
    details: 'All customer data volumes are encrypted at rest.',
  },
  {
    controlId: 'control-au-1',
    status: 'Warning',
    lastChecked: new Date().toISOString(),
    details: 'Audit log retention policy is set to 85 days. Recommended: 90 days.',
  },
];

/**
 * @description Monitors compliance controls in real-time to provide continuous validation.
 * This component simulates live checks against defined system controls.
 */
const ContinuousValidation: React.FC = () => {
  const [statuses, setStatuses] = useState<ControlStatus[]>(initialValidationStatus);

  // Simulate real-time updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStatuses(prevStatuses => 
        prevStatuses.map(s => ({ ...s, lastChecked: new Date().toISOString() }))
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: ControlStatus['status']) => {
    switch (status) {
      case 'Passing': return 'text-green-600';
      case 'Failing': return 'text-red-600';
      case 'Warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-4">Continuous Validation Monitoring</h2>
      <div className="flow-root">
        <ul className="-my-4 divide-y divide-gray-200">
          {statuses.map((control) => (
            <li key={control.controlId} className="flex items-center py-4 space-x-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{control.controlId}</p>
                <p className="text-sm text-gray-500 truncate">{control.details}</p>
              </div>
              <div className={`inline-flex items-center text-base font-semibold ${getStatusColor(control.status)}`}>
                {control.status}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ContinuousValidation;
