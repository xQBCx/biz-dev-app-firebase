# Biz Dev App

**The Amazon of Business Development Tools** - A comprehensive platform for verified business owners to launch, manage, and scale their businesses with AI-powered tools and automation.

## 🚀 Features

- **BD-ID™ Verified Identity**: One-time biometric verification for global business authentication
- **Business Entity Creation**: Automated LLC, S-Corp, C-Corp formation with AI tax optimization
- **Platform Launchpad**: $5 activation across 60+ platforms with automated profile creation
- **Business Directory**: Searchable global database with Secretary of State integration
- **Social Network**: Verified business owners only with real-time networking
- **Funding Hub**: AI-matched funding options (SBA loans, grants, investors)
- **Enterprise Tools**: CRM, marketing, analytics, invoicing, ERP integration
- **AI Agents**: Biz (strategy) and Dev (execution) agents for business automation

## 🛠 Tech Stack

- React 18 + TypeScript + Vite
- Supabase (PostgreSQL, Auth, Realtime)
- Tailwind CSS + shadcn/ui
- React Router + React Query

## 📦 Database Schema

Core tables with Row Level Security:
- `profiles` - User information
- `user_roles` - Role-based access
- `businesses` - Business entities
- `funding_applications` - Funding tracking
- `posts` - Social network feed
- `connections` - Business network
- `post_likes` - Engagement tracking

## 🔐 Authentication

Email/password auth with auto-confirmed signups, session persistence, and role-based access control.

## 📱 Key Routes

- `/` - Landing page
- `/auth` - Sign in/up
- `/dashboard` - Main hub with AI agents
- `/create-entity` - Business formation wizard
- `/directory` - Business search
- `/social` - Network feed
- `/tools` - Tool marketplace
- `/funding` - Funding options

---

## Project info

**URL**: https://lovable.dev/projects/9eb4fb51-331f-4c3e-bbd2-12bd5e26ea30

## How to edit this code

**Use Lovable**: Visit the [Lovable Project](https://lovable.dev/projects/9eb4fb51-331f-4c3e-bbd2-12bd5e26ea30) and start prompting.

**Use your IDE**: Clone this repo and push changes.

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```

**Edit in GitHub**: Click "Edit" (pencil icon) on any file.

**GitHub Codespaces**: Click "Code" → "Codespaces" → "New codespace".

## Deployment

Open [Lovable](https://lovable.dev/projects/9eb4fb51-331f-4c3e-bbd2-12bd5e26ea30) and click Share → Publish.

## Custom Domain

Navigate to Project > Settings > Domains and click Connect Domain.

[Learn more](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

Built with ❤️ for entrepreneurs worldwide
