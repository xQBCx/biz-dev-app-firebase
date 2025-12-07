# Unity Meridian: Instincts Layer Documentation

## Overview

The Instincts Layer is a unified event tracking and user profiling system that captures every meaningful action across the Biz Dev App platform. This data powers:

- **User Embeddings**: Numeric representations of user behavior patterns
- **Personalization**: AI-driven recommendations for workflows, agents, and opportunities
- **Analytics**: Deep insights into user engagement across all modules
- **Graph Intelligence**: Relationship mapping between users, entities, and actions

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Components                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ useInstincts│  │ InstinctsProvider│  │ Module Pages   │  │
│  │    Hook     │◄─┤   (Auto Tracking)  │◄─┤ (Manual Track) │  │
│  └──────┬──────┘  └─────────────────┘  └─────────────────┘  │
└─────────┼───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
│  ┌─────────────────┐     ┌───────────────────────┐          │
│  │ instincts_events│────►│ instincts_user_stats  │          │
│  │  (Raw Events)   │     │  (Aggregated Metrics) │          │
│  └─────────────────┘     └───────────────────────┘          │
│         ▲                         │                          │
│         │                         ▼                          │
│  ┌──────┴──────────────────────────────────────────┐        │
│  │          Trigger: update_instincts_user_stats    │        │
│  └─────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Event Categories

| Category | Description | Example Actions |
|----------|-------------|-----------------|
| `navigation` | Page views, route changes | `page_viewed`, `tab_switched` |
| `interaction` | UI actions | `button_clicked`, `form_submitted` |
| `transaction` | Financial events | `deal_closed`, `payment_completed` |
| `communication` | Messages, calls, emails | `email_outbound`, `call_inbound` |
| `content` | Document/media actions | `document_uploaded`, `content_shared` |
| `workflow` | Task/process actions | `task_created`, `task_completed` |
| `search` | Search and filtering | `search_performed`, `filter_applied` |
| `integration` | External tool usage | `integration_synced`, `api_called` |
| `system` | Auth, errors | `session_started`, `error_occurred` |

## Platform Modules

All modules from the platform are tracked:
- `dashboard`, `crm`, `tasks`, `calendar`, `messages`
- `marketplace`, `ai_gift_cards`, `iplaunch`, `portfolio`
- `xbuilderx`, `xodiak`, `grid_os`, `true_odds`
- `erp`, `social`, `website_builder`, `ecosystem`, `admin`

## Usage

### Automatic Tracking (InstinctsProvider)

The `InstinctsProvider` component wraps authenticated routes and automatically tracks:
- Session start/end
- Page views on every route change

```tsx
// Already integrated in App.tsx
<InstinctsProvider>
  <SidebarProvider>
    {/* App content */}
  </SidebarProvider>
</InstinctsProvider>
```

### Manual Tracking (useInstincts hook)

For specific actions within components:

```tsx
import { useInstincts } from '@/hooks/useInstincts';

function MyComponent() {
  const { 
    trackEntityCreated,
    trackEntityUpdated,
    trackEntityDeleted,
    trackClick,
    trackSearch,
    trackFormSubmit,
    trackTransaction,
    trackCommunication,
    trackContent,
    trackIntegration,
    trackError,
    emit 
  } = useInstincts();

  // Track entity creation
  const handleCreate = async (data) => {
    const result = await createEntity(data);
    trackEntityCreated('tasks', result.id, data.name, data.value);
  };

  // Track entity update
  const handleUpdate = async (id, changes) => {
    await updateEntity(id, changes);
    trackEntityUpdated('tasks', id, entity.name, changes);
  };

  // Track button clicks
  const handleButtonClick = () => {
    trackClick('crm', 'export_contacts_button', { count: 50 });
  };

  // Track search
  const handleSearch = (query, results) => {
    trackSearch('marketplace', query, results.length);
  };

  // Track transactions
  const handlePayment = (amount) => {
    trackTransaction('ai_gift_cards', 'payment_completed', amount, 'USD', {
      product_type: 'gift_card'
    });
  };

  // Custom event with full control
  const handleCustomAction = () => {
    emit({
      category: 'workflow',
      module: 'crm',
      action: 'deal_stage_changed',
      entityType: 'deal',
      entityId: deal.id,
      entityName: deal.name,
      valueAmount: deal.value,
      context: {
        old_stage: 'proposal',
        new_stage: 'negotiation'
      }
    });
  };
}
```

## Database Schema

### instincts_events

The main events table captures every action:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | User who performed action |
| `session_id` | UUID | Browser session ID |
| `created_at` | TIMESTAMPTZ | When event occurred |
| `category` | ENUM | Event category |
| `module` | ENUM | Platform module |
| `action` | TEXT | Specific action name |
| `entity_type` | TEXT | Type of entity (task, deal, etc.) |
| `entity_id` | UUID | ID of entity acted upon |
| `entity_name` | TEXT | Human-readable entity name |
| `value_amount` | NUMERIC | Dollar value if applicable |
| `duration_ms` | INTEGER | Time spent on action |
| `context` | JSONB | Rich contextual data |
| `source_url` | TEXT | Page URL |
| `device_type` | TEXT | desktop/mobile/tablet |
| `related_user_ids` | UUID[] | Other users involved |
| `related_entity_ids` | UUID[] | Related entities (for graphs) |

### instincts_user_stats

Automatically aggregated user statistics (updated via trigger):

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID | User ID (unique) |
| `navigation_count` | INTEGER | Total page views |
| `interaction_count` | INTEGER | Total UI interactions |
| `transaction_count` | INTEGER | Total transactions |
| `total_transaction_value` | NUMERIC | Sum of all transaction values |
| `module_engagement` | JSONB | Engagement by module |
| `peak_hours` | INTEGER[] | Most active hours |
| `preferred_modules` | TEXT[] | Most used modules |
| `first_event_at` | TIMESTAMPTZ | First recorded event |
| `last_event_at` | TIMESTAMPTZ | Most recent event |

## Best Practices

### 1. Action Naming Convention

Use consistent naming:
- `{entity}_created` → `task_created`, `deal_created`
- `{entity}_updated` → `contact_updated`
- `{entity}_deleted` → `document_deleted`
- `{entity}_completed` → `task_completed`

### 2. Context Data

Include relevant context but avoid sensitive data:

```tsx
// Good
context: {
  deal_stage: 'negotiation',
  contact_count: 5,
  has_documents: true
}

// Avoid
context: {
  email: 'user@example.com',  // PII
  password: '...',            // Never!
}
```

### 3. Value Tracking

Always track monetary values when applicable:

```tsx
trackEntityCreated('deals', deal.id, deal.name, deal.value); // Include amount
trackTransaction('marketplace', 'commission_earned', 150.00, 'USD');
```

### 4. Graph Connections

Include related entities for future graph analysis:

```tsx
emit({
  category: 'communication',
  module: 'crm',
  action: 'meeting_scheduled',
  relatedUserIds: [contact.user_id, coHost.id],
  relatedEntityIds: [deal.id, company.id]
});
```

## Instrumented Pages

The following pages have instrumentation integrated:

| Page | Module | Tracking |
|------|--------|----------|
| Dashboard | `dashboard` | Page views, quick actions |
| CRM | `crm` | Entity CRUD, tab changes |
| Tasks | `tasks` | Task create/update/complete |
| Calendar | `calendar` | Meeting creation |
| Messages | `messages` | Email/SMS sending |
| Clients | `clients` | Client CRUD, workspace switching |
| Social | `social` | Post creation, likes |
| Portfolio | `portfolio` | Company/product management |
| Marketplace | `marketplace` | Listing views |
| AI Gift Cards | `ai_gift_cards` | Purchases |
| XBuilderx Dashboard | `xbuilderx` | Opportunity views |
| Franchises | `franchises` | Search, views |
| Integrations | `integrations` | Connection status |

## Future Roadmap

1. **User Embeddings Pipeline**: ML pipeline to generate embeddings from events
2. **Real-time Recommendations**: Agent and workflow suggestions based on behavior
3. **Graph Neural Networks**: Analyze relationship patterns
4. **Personal Corporation Dashboard**: User-facing insights and P&L views
5. **Expert Behavior Learning**: Imitation learning from top performers

## Security & Privacy

- All events are scoped to authenticated users via RLS
- Users can only view their own events
- Sensitive data should never be included in event context
- Future: User controls for data usage preferences
