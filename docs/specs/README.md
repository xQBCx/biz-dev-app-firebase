# Feature Specifications & Test Plans

This directory contains Product Requirement Documents (PRDs) and test plans for all Biz Dev App features.

## Structure

```
docs/specs/
├── README.md                    # This file
├── <feature>.md                 # Feature specification (PRD)
├── <feature>.plan.md            # Test plan for feature
└── template.md                  # Template for new specs
```

## Specification Format

Each feature spec includes:

1. **Intent** - What value does this deliver and to whom?
2. **Happy Path** - Step-by-step user journey
3. **Acceptance Criteria** - Testable requirements (AC1, AC2, etc.)
4. **Edge Cases** - Error scenarios, failures, conflicts
5. **Technical Notes** - Implementation details

## Test Plan Format

Each test plan includes:

1. **Test Scope** - What is being tested
2. **Test Environment** - URLs, configs, prerequisites
3. **Test Data Setup** - Required accounts, data, configurations
4. **Test Cases** - Detailed TC1, TC2, etc. with steps
5. **Success Criteria** - What defines passing tests
6. **Failure Reporting** - What to capture on failures

## Existing Specs

### ✅ Completed
- [Auth & Onboarding](./auth-onboarding.md) - Authentication flows
  - Test Plan: [auth-onboarding.plan.md](./auth-onboarding.plan.md)
  - Tests: `tests/e2e/auth.spec.ts`

- [Billing & Subscriptions](./billing-stripe.md) - Stripe integration
  - Test Plan: [billing-stripe.plan.md](./billing-stripe.plan.md)
  - Tests: `tests/e2e/billing.spec.ts`

- [SmartLink Property Intake](./smartlink-intake.md) - CSV bulk property upload
  - Test Plan: [smartlink-intake.plan.md](./smartlink-intake.plan.md)
  - Tests: `tests/e2e/smartlink-intake.spec.ts`

### 🚧 In Progress
- CRM Contact Management (next)
- SineLabs Lead Flow
- Microsite Generator

### 📋 Planned
- Dashboard & Analytics
- User Profile Management
- Admin Panel
- Notifications System
- Activity Logging
- File Uploads & Storage

## Creating New Specs

1. Copy `template.md` to `<feature-name>.md`
2. Fill in all sections based on feature requirements
3. Create corresponding test plan: `<feature-name>.plan.md`
4. Write Playwright tests in `tests/e2e/<feature-name>.spec.ts`
5. Update this README with the new spec

## Linking Specs to Code

Use `@intent` comments in code to reference specs:

```typescript
/**
 * @intent auth-onboarding.md#AC1
 * Verify user credentials and establish session
 */
async function signIn(email: string, password: string) {
  // ...
}
```

## Intent-Driven Development

Every feature should answer:
- **Why** does this exist? (Intent)
- **What** does it do? (Happy Path)
- **How** do we know it works? (Acceptance Criteria)
- **What** can go wrong? (Edge Cases)

## Review Process

1. Feature request → Create spec
2. Spec review → Approve intent & AC
3. Create test plan → Define test cases
4. Implementation → Write code
5. Testing → Run Playwright tests
6. Deployment → All critical tests must pass

## Maintenance

- Update specs when features change
- Keep test plans in sync with specs
- Archive deprecated features
- Link to related specs in PRs

## Questions?

If a feature lacks a spec:
1. Check if it's implemented (search codebase)
2. If yes, reverse-engineer a spec from code
3. If no, create spec before implementation
4. Update this README

## Tools

- **Spec Writer**: AI agent that generates specs from feature descriptions
- **Test Generator**: Creates Playwright tests from test plans
- **Coverage Checker**: Verifies all ACs have corresponding tests
