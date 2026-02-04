-- Insert OWASP API Security Top 10 controls
INSERT INTO public.compliance_checks (framework, control_id, control_name, status, notes)
VALUES 
  ('OWASP API', 'API1', 'Broken Object Level Authorization', 'not_started', 'Verify authorization for object-level access in all endpoints'),
  ('OWASP API', 'API2', 'Broken Authentication', 'not_started', 'Review authentication mechanisms for stateless attacks'),
  ('OWASP API', 'API3', 'Broken Object Property Level Authorization', 'not_started', 'Validate property-level access controls'),
  ('OWASP API', 'API4', 'Unrestricted Resource Consumption', 'not_started', 'Implement rate limiting and quota management'),
  ('OWASP API', 'API5', 'Broken Function Level Authorization', 'not_started', 'Verify function-level access for stateful attacks'),
  ('OWASP API', 'API6', 'Unrestricted Access to Sensitive Business Flows', 'not_started', 'Protect sensitive workflows from abuse'),
  ('OWASP API', 'API7', 'Server Side Request Forgery', 'not_started', 'Validate and sanitize URL inputs'),
  ('OWASP API', 'API8', 'Security Misconfiguration', 'not_started', 'Review security headers and configurations'),
  ('OWASP API', 'API9', 'Improper Inventory Management', 'not_started', 'Maintain API inventory, identify shadow/zombie endpoints'),
  ('OWASP API', 'API10', 'Unsafe Consumption of APIs', 'not_started', 'Validate third-party API responses');

-- Insert OWASP Business Logic Abuse Top 10 controls
INSERT INTO public.compliance_checks (framework, control_id, control_name, status, notes)
VALUES 
  ('OWASP BLA', 'BLA1', 'Action Limit Overrun', 'not_started', 'Enforce action limits and rate controls'),
  ('OWASP BLA', 'BLA2', 'Concurrent Workflow Order Bypass', 'not_started', 'Validate sequential workflow requirements'),
  ('OWASP BLA', 'BLA3', 'Object State Manipulation', 'not_started', 'Protect object state integrity'),
  ('OWASP BLA', 'BLA4', 'Malicious Logic Loop', 'not_started', 'Detect and prevent infinite loops'),
  ('OWASP BLA', 'BLA5', 'Artifact Lifetime Exploitation', 'not_started', 'Manage token and session lifetimes'),
  ('OWASP BLA', 'BLA6', 'Missing Transition Validation', 'not_started', 'Validate state transitions'),
  ('OWASP BLA', 'BLA7', 'Resource Quota Violation', 'not_started', 'Enforce resource quotas'),
  ('OWASP BLA', 'BLA8', 'Internal State Disclosure', 'not_started', 'Prevent internal state leakage'),
  ('OWASP BLA', 'BLA9', 'Broken Access Control', 'not_started', 'Comprehensive access control review'),
  ('OWASP BLA', 'BLA10', 'Shadow Function Abuse', 'not_started', 'Audit undocumented functions');

-- Insert Agentic AI Governance controls
INSERT INTO public.compliance_checks (framework, control_id, control_name, status, notes)
VALUES 
  ('AGENTIC AI', 'AAI1', 'Agent Identity & Authentication', 'not_started', 'Robust identity management for AI agents'),
  ('AGENTIC AI', 'AAI2', 'Agency Level Definition', 'not_started', 'Define permitted autonomy levels per environment'),
  ('AGENTIC AI', 'AAI3', 'Guardrails Implementation', 'not_started', 'Implement strict operational guardrails'),
  ('AGENTIC AI', 'AAI4', 'Human-in-the-Loop Controls', 'not_started', 'Define decision points requiring human approval'),
  ('AGENTIC AI', 'AAI5', 'Prompt Injection Protection', 'not_started', 'Protect against prompt injection attacks'),
  ('AGENTIC AI', 'AAI6', 'Multi-Agent Orchestration', 'not_started', 'Secure inter-agent communication'),
  ('AGENTIC AI', 'AAI7', 'Action Audit Logging', 'not_started', 'Log all autonomous actions for review'),
  ('AGENTIC AI', 'AAI8', 'Liability & Accountability', 'not_started', 'Define legal accountability for agent actions'),
  ('AGENTIC AI', 'AAI9', 'Data Privacy Compliance', 'not_started', 'Ensure agents respect data privacy'),
  ('AGENTIC AI', 'AAI10', 'Rollback & Recovery', 'not_started', 'Enable reversal of agent actions');

-- Insert FIPS 140-3 controls
INSERT INTO public.compliance_checks (framework, control_id, control_name, status, notes)
VALUES 
  ('FIPS 140-3', 'FIPS1', 'Cryptographic Module Specification', 'not_started', 'Define cryptographic boundary'),
  ('FIPS 140-3', 'FIPS2', 'Module Interfaces', 'not_started', 'Secure all module interfaces'),
  ('FIPS 140-3', 'FIPS3', 'Roles and Services', 'not_started', 'Define operator roles and services'),
  ('FIPS 140-3', 'FIPS4', 'Software/Firmware Security', 'not_started', 'Validate software integrity'),
  ('FIPS 140-3', 'FIPS5', 'Operational Environment', 'not_started', 'Secure operational environment'),
  ('FIPS 140-3', 'FIPS6', 'Physical Security', 'not_started', 'Physical tamper protection'),
  ('FIPS 140-3', 'FIPS7', 'Non-Invasive Security', 'not_started', 'Side-channel attack resistance'),
  ('FIPS 140-3', 'FIPS8', 'Key Management', 'not_started', 'Secure key lifecycle management'),
  ('FIPS 140-3', 'FIPS9', 'Self-Tests', 'not_started', 'Implement cryptographic self-tests'),
  ('FIPS 140-3', 'FIPS10', 'Life-Cycle Assurance', 'not_started', 'Secure development lifecycle')
ON CONFLICT DO NOTHING;