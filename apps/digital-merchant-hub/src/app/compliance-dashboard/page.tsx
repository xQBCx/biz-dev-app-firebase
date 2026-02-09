import React from 'react';
import ComplianceEngine from '@/components/compliance/ComplianceEngine';
import FrameworkRegistry from '@/components/compliance/FrameworkRegistry';
import ControlDefinitions from '@/components/compliance/ControlDefinitions';
import EvidenceEmitter from '@/components/compliance/EvidenceEmitter';
import ContinuousValidation from '@/components/compliance/ContinuousValidation';
import PolicyEngine from '@/components/compliance/PolicyEngine';
import PolicyEnforcement from '@/components/compliance/PolicyEnforcement';
import RiskRegister from '@/components/risk/RiskRegister';
import RiskEntity from '@/components/risk/RiskEntity';
import RemediationWorkflow from '@/components/risk/RemediationWorkflow';
import RedTeamWorkspace from '@/components/security/RedTeamWorkspace';
import AttackScenarios from '@/components/security/AttackScenarios';
import AdversarialAgents from '@/components/security/AdversarialAgents';
import BugBounty from '@/components/integrations/BugBounty';
import StaticAnalysis from '@/components/integrations/StaticAnalysis';
import ThreatIntel from '@/components/integrations/ThreatIntel';

const ComplianceDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Platform Compliance & Security Dashboard</h1>
        <p className="text-lg text-gray-600">A unified, real-time view of the platform's security and compliance posture.</p>
      </header>

      <main className="space-y-8">
        {/* Core Architecture */}
        <section>
          <h2 className="text-3xl font-semibold mb-4 border-b pb-2">Core Compliance Architecture</h2>
          <ComplianceEngine />
          <FrameworkRegistry />
          <ControlDefinitions />
          <EvidenceEmitter />
          <ContinuousValidation />
        </section>

        {/* Policy-as-Code */}
        <section>
          <h2 className="text-3xl font-semibold mb-4 border-b pb-2">Policy-as-Code</h2>
          <PolicyEngine />
          <PolicyEnforcement />
        </section>

        {/* Risk Management */}
        <section>
          <h2 className="text-3xl font-semibold mb-4 border-b pb-2">Risk Management</h2>
          <RiskRegister />
          <RiskEntity />
          <RemediationWorkflow />
        </section>

        {/* Security Testing */}
        <section>
          <h2 className="text-3xl font-semibold mb-4 border-b pb-2">Security Testing</h2>
          <RedTeamWorkspace />
          <AttackScenarios />
          <AdversarialAgents />
        </section>

        {/* External Integrations */}
        <section>
          <h2 className="text-3xl font-semibold mb-4 border-b pb-2">External Integrations</h2>
          <BugBounty />
          <StaticAnalysis />
          <ThreatIntel />
        </section>
      </main>
    </div>
  );
};

export default ComplianceDashboardPage;
