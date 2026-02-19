# Indian Restaurant Week - CMS Strategy Document

**Date:** January 8, 2026
**Project:** indianrestaurantweeksf.com
**Purpose:** Technical planning for content management, comments moderation, and email subscription features

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Requirements Overview](#requirements-overview)
3. [CMS Options Evaluation](#cms-options-evaluation)
4. [Comments System Options](#comments-system-options)
5. [Email Subscription Integration](#email-subscription-integration)
6. [Recommended Architecture](#recommended-architecture)
7. [Unified Admin Panel Design](#unified-admin-panel-design)
8. [Database Schema](#database-schema)
9. [Implementation Effort Estimate](#implementation-effort-estimate)
10. [Decision Summary](#decision-summary)

---

## Current State Analysis

### Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | Astro 5.x (static site generator) |
| Styling | Tailwind CSS 4.x |
| Hosting | Netlify |
| Forms | Netlify Forms |
| Output Mode | Static |
| Data | Static JSON (`/public/data/restaurants.json`) |

### Existing Features

- Press page with contact form (Netlify Forms)
- Restaurant data served from static JSON
- Chef profiles and popup modals
- Interactive map with Mapbox
- Image carousels with Swiper

---

## Requirements Overview

### Feature Requirements Matrix

| Feature | Complexity | Update Frequency | Needs Auth | Priority |
|---------|-----------|------------------|------------|----------|
| News/Media Articles | Medium | Weekly/Monthly | Admin only | High |
| Press Assets/Fact Sheets | Low | Rare | Admin only | Medium |
| Contact Form | Already done | N/A | No | Done |
| Comments with Moderation | High | Frequent | Admin + Public | High |
| Email Subscription | Medium | Ongoing | Admin only | Future |

### Detailed Requirements

#### 1. Press Room
- Contact form (currently Netlify Forms) ✅
- Downloadable assets management
- Fact sheets (to be added later)
- Potential integration with admin dashboard

#### 2. News/Media Posts
- CMS-driven content
- Support for rich text/markdown
- Image uploads
- Draft/publish workflow
- Author attribution

#### 3. Comments System
- Public submission form
- Admin review before publishing
- Approve/reject/delete functionality
- Protected admin dashboard with login

#### 4. Email Subscription (Future)
- Email collection form
- Subscriber management
- Newsletter sending capability
- Unsubscribe handling

---

## CMS Options Evaluation

### Option 1: Decap CMS (Git-Based)

**What it is:** Free, open-source, Git-based CMS (formerly Netlify CMS)

| Pros | Cons |
|------|------|
| Zero hosting cost | Not ideal for user-generated content |
| Content stored as Markdown/JSON in repo | Git-based = commits for every change |
| Built-in admin UI at `/admin` | Limited to static content only |
| Native Netlify Identity integration | Cannot handle comments/subscribers |
| Perfect for Astro's content collections | |

**Best for:** News articles, press releases, fact sheets, downloadable assets

**Setup Effort:** ~2-4 hours

**Verdict:** Good for content only, but creates split admin experience

---

### Option 2: Full Custom Backend

**What it is:** Node.js/Express backend with database

| Pros | Cons |
|------|------|
| Total control | 2-4 weeks development time |
| Custom features possible | Ongoing maintenance burden |
| | Hosting costs (~$7-20/mo minimum) |
| | Overkill for this scale |

**Verdict:** Not recommended - unnecessary complexity

---

### Option 3: Headless CMS (Self-Hosted)

Options: Strapi, Directus, Payload CMS

| CMS | Where to Host | Cost | Notes |
|-----|---------------|------|-------|
| **Payload CMS** | AWS/Railway | Free (self-host) | Modern, TypeScript, great DX |
| **Strapi** | AWS/Railway | Free (self-host) | Popular, mature |
| **Directus** | AWS/Railway | Free (self-host) | Very flexible, SQL-based |

**Pros:** Full admin UI out of the box, user roles, media library
**Cons:** Need to host the CMS backend (~$5-15/mo)

**Verdict:** Good option if willing to manage additional hosting

---

### Option 4: Supabase + Custom Admin (Recommended)

**What it is:** PostgreSQL database with built-in auth + custom admin pages

| Pros | Cons |
|------|------|
| Generous free tier | More initial development |
| Built-in auth for admin | Need to build admin UI |
| Real-time updates possible | |
| Single unified experience | |
| Handles all requirements | |

**Verdict:** Best balance of flexibility, cost, and control

---

## Comments System Options

### Architecture Overview

```
User submits comment → Database (status: pending)
                              ↓
Admin dashboard → Reviews → Approves (status: approved)
                              ↓
Frontend fetches → Only approved comments shown
```

### Option A: Supabase (Recommended)

**What:** PostgreSQL database with built-in auth and Row Level Security

| Aspect | Details |
|--------|---------|
| Free Tier | 500MB DB, 50K monthly active users |
| Auth | Built-in, supports email/password |
| Real-time | WebSocket subscriptions available |
| SDK | Easy REST/JavaScript SDK |
| Cost | Free tier likely sufficient; $25/mo if scaling |

### Option B: AWS (Lambda + DynamoDB)

| Aspect | Details |
|--------|---------|
| Control | Full ownership |
| Cost | Pay-per-use (~<$5/mo) |
| Effort | ~1-2 weeks development |
| Maintenance | More moving parts |

**Best if:** Complete ownership required and AWS expertise available

### Option C: Netlify Functions + FaunaDB

| Aspect | Details |
|--------|---------|
| Ecosystem | Stays within Netlify |
| Free Tier | FaunaDB has generous limits |
| Learning Curve | FQL query language |

---

## Email Subscription Integration

### Approach A: Dedicated Email Service (Simpler)

Use services like Mailchimp, ConvertKit, Buttondown, or Beehiiv:

| Aspect | Handled by Service |
|--------|-------------------|
| Email collection | ✓ Embed form |
| Storage | ✓ Their database |
| Sending newsletters | ✓ Built-in editor |
| Unsubscribe/compliance | ✓ Automatic |
| Analytics | ✓ Open rates, clicks |

**Impact on setup:** Zero - completely separate from CMS
**Cost:** Free tiers available (Mailchimp: 500 contacts, Buttondown: 100 subscribers)

### Approach B: Integrated with Supabase (More Control)

```
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE                             │
│  ├── comments (table)                                   │
│  ├── subscribers (table)                                │
│  │     ├── email                                        │
│  │     ├── subscribed_at                                │
│  │     ├── status (active/unsubscribed)                 │
│  │     └── preferences (optional)                       │
│  └── Admin dashboard manages both                       │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              EMAIL SENDING SERVICE                      │
│  Option 1: Resend (modern, great DX, 3K emails/mo free)│
│  Option 2: AWS SES (you have AWS, ~$0.10/1000 emails)  │
│  Option 3: SendGrid (100 emails/day free)              │
└─────────────────────────────────────────────────────────┘
```

| If you want... | Use... |
|----------------|--------|
| Quick setup, occasional newsletters | Mailchimp/Buttondown (separate) |
| Unified admin, full control | Supabase + Resend (integrated) |
| Maximum cost savings at scale | Supabase + AWS SES |

---

## Recommended Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CONTENT LAYER                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                      SUPABASE                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  articles        │  comments       │  subscribers   │   │
│  │  ├── title       │  ├── name       │  ├── email     │   │
│  │  ├── content     │  ├── message    │  ├── status    │   │
│  │  ├── status      │  ├── status     │  └── source    │   │
│  │  └── author      │  └── created_at │                │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                    Supabase Auth                            │
│                    (Admin Login)                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                     NETLIFY                                 │
│  ├── Static hosting (Astro)                                │
│  ├── Forms (press inquiries) - existing                    │
│  └── Edge functions (optional)                             │
├─────────────────────────────────────────────────────────────┤
│                  EMAIL SERVICE                              │
│  Resend / AWS SES (for newsletters when ready)             │
└─────────────────────────────────────────────────────────────┘
```

### Cost Analysis

| Component | Service | Monthly Cost |
|-----------|---------|--------------|
| Database + Auth | Supabase Free Tier | $0 |
| Hosting | Netlify Free Tier | $0 |
| Forms | Netlify Forms | $0 (100 submissions/mo) |
| Email (future) | Resend Free Tier | $0 (3K emails/mo) |
| **Total** | | **$0/month** |

---

## Unified Admin Panel Design

### URL Structure

```
https://indianrestaurantweeksf.com/admin
├── /admin/login          → Supabase Auth
├── /admin/articles       → News article CRUD (rich text editor)
├── /admin/comments       → Moderation queue (approve/reject/delete)
├── /admin/subscribers    → Email list management (view/export/delete)
└── /admin/settings       → Site settings (optional)
```

### File Structure (Astro)

```
src/pages/admin/
├── index.astro          → Dashboard overview
├── login.astro          → Login form
├── articles/
│   ├── index.astro      → List all articles
│   ├── new.astro        → Create article
│   └── [id].astro       → Edit article
├── comments.astro       → Moderation queue
└── subscribers.astro    → Email list
```

### Admin Panel Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│  IRW Admin                              👤 Admin ▼   [Logout]    │
├────────────┬─────────────────────────────────────────────────────┤
│            │                                                     │
│  📊 Dashboard   │  Welcome back!                                 │
│            │                                                     │
│  📰 Articles    │  ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│     • All       │  │ 12      │ │ 5       │ │ 847     │           │
│     • Drafts    │  │Articles │ │Pending  │ │Subs     │           │
│     • New       │  └─────────┘ └─────────┘ └─────────┘           │
│            │                                                     │
│  💬 Comments    │  Recent Activity                               │
│     • Pending(5)│  ─────────────────────────────                 │
│     • Approved  │  • New comment awaiting approval               │
│     • Rejected  │  • "Chef Spotlight" article published          │
│            │  • 23 new subscribers this week                     │
│  📧 Subscribers │                                                │
│     • All       │                                                │
│     • Export    │                                                │
│            │                                                     │
│  ⚙️ Settings    │                                                │
│            │                                                     │
└────────────┴─────────────────────────────────────────────────────┘
```

### Admin UI Technology Options

| Tool | Type | Cost | Setup Effort |
|------|------|------|--------------|
| **Custom Astro pages** | DIY | Free | ~20-30 hrs |
| **Refine** | React framework | Free | ~8-12 hrs |
| **Appsmith** | Low-code builder | Free tier | ~6-10 hrs |
| **Retool** | Low-code builder | $10/mo | ~4-6 hrs |

**Recommendation:** Custom Astro pages for full control and brand consistency

### Rich Text Editor Options

For the article editor, recommended options:

| Editor | License | Features |
|--------|---------|----------|
| **Tiptap** | Free (MIT) | Modern, extensible, great DX |
| **Editor.js** | Free (Apache) | Block-based, clean output |
| **Quill** | Free (BSD) | Simple, lightweight |

---

## Database Schema

### Supabase Tables

```sql
-- =============================================
-- ARTICLES TABLE
-- =============================================
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image VARCHAR(500),
    author VARCHAR(100),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- COMMENTS TABLE
-- =============================================
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    source VARCHAR(100), -- which page the comment came from
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id)
);

-- =============================================
-- SUBSCRIBERS TABLE
-- =============================================
CREATE TABLE subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    source VARCHAR(100), -- homepage, press-page, etc.
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Articles: Public can read published, admin can do everything
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published articles" ON articles
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can do everything" ON articles
    FOR ALL USING (auth.role() = 'authenticated');

-- Comments: Public can insert, admin can do everything
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved comments" ON comments
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Anyone can submit comments" ON comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage comments" ON comments
    FOR ALL USING (auth.role() = 'authenticated');

-- Subscribers: Only admin access
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access subscribers" ON subscribers
    FOR ALL USING (auth.role() = 'authenticated');
```

### Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    articles     │     │    comments     │     │   subscribers   │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ title           │     │ name            │     │ email (UNIQUE)  │
│ slug (UNIQUE)   │     │ email           │     │ status          │
│ content         │     │ message         │     │ source          │
│ excerpt         │     │ status          │     │ subscribed_at   │
│ featured_image  │     │ source          │     │ unsubscribed_at │
│ author          │     │ created_at      │     └─────────────────┘
│ status          │     │ reviewed_at     │
│ published_at    │     │ reviewed_by(FK) │───────┐
│ created_at      │     └─────────────────┘       │
│ updated_at      │                               │
└─────────────────┘                               │
                                                  ▼
                                    ┌─────────────────┐
                                    │   auth.users    │
                                    │   (Supabase)    │
                                    ├─────────────────┤
                                    │ id (PK)         │
                                    │ email           │
                                    │ role            │
                                    └─────────────────┘
```

---

## Implementation Effort Estimate

### Phase 1: Foundation (Week 1)

| Task | Hours | Notes |
|------|-------|-------|
| Supabase project setup | 1 | Create project, configure |
| Database tables creation | 1-2 | Run SQL schema |
| Supabase Auth configuration | 1-2 | Enable email auth |
| Row Level Security policies | 1 | Security rules |
| **Subtotal** | **4-6 hrs** | |

### Phase 2: Admin Dashboard (Week 1-2)

| Task | Hours | Notes |
|------|-------|-------|
| Admin layout component | 2-3 | Sidebar, header, navigation |
| Login/logout flow | 2-3 | Supabase Auth integration |
| Dashboard overview page | 2-3 | Stats, recent activity |
| **Subtotal** | **6-9 hrs** | |

### Phase 3: Articles Management (Week 2)

| Task | Hours | Notes |
|------|-------|-------|
| Articles list page | 2-3 | Table with filters |
| Article editor (create/edit) | 5-6 | Rich text editor (Tiptap) |
| Image upload | 2-3 | Supabase Storage |
| Draft/publish workflow | 1-2 | Status management |
| **Subtotal** | **10-14 hrs** | |

### Phase 4: Comments Moderation (Week 2-3)

| Task | Hours | Notes |
|------|-------|-------|
| Comments queue page | 3-4 | Pending/approved/rejected tabs |
| Approve/reject actions | 1-2 | Quick actions |
| Public comment form | 2-3 | Frontend integration |
| **Subtotal** | **6-9 hrs** | |

### Phase 5: Subscribers (Week 3)

| Task | Hours | Notes |
|------|-------|-------|
| Subscribers list page | 2-3 | Table with search |
| Export functionality | 1-2 | CSV download |
| Subscription form | 1-2 | Frontend integration |
| **Subtotal** | **4-7 hrs** | |

### Phase 6: Public Pages (Week 3)

| Task | Hours | Notes |
|------|-------|-------|
| News listing page | 2-3 | Grid of articles |
| Individual article page | 2-3 | Dynamic routing |
| Comments display | 1-2 | Show approved comments |
| **Subtotal** | **5-8 hrs** | |

### Total Estimate

| Phase | Hours |
|-------|-------|
| Foundation | 4-6 |
| Admin Dashboard | 6-9 |
| Articles Management | 10-14 |
| Comments Moderation | 6-9 |
| Subscribers | 4-7 |
| Public Pages | 5-8 |
| **Total** | **35-53 hrs** |

**Realistic Timeline:** 2-3 weeks (part-time) or 1 week (full-time)

---

## Decision Summary

### Recommended Stack

| Component | Chosen Solution | Reason |
|-----------|-----------------|--------|
| Database | Supabase | Free tier, built-in auth, real-time |
| Admin Auth | Supabase Auth | Integrated, secure |
| Admin UI | Custom Astro pages | Brand consistency, full control |
| Rich Text | Tiptap | Modern, extensible, free |
| Email (future) | Resend | Great DX, generous free tier |
| Hosting | Netlify | Already in use, free tier |

### What This Approach Provides

✅ Single unified admin panel at `/admin`
✅ Non-technical editors can manage content
✅ Comment moderation workflow
✅ Email subscription management
✅ Professional, branded experience
✅ $0/month hosting cost
✅ Scales with your needs
✅ Full control over data

### Trade-offs

⚠️ More upfront development than using separate tools
⚠️ Need to maintain custom admin code
⚠️ No built-in media library (use Supabase Storage)

### Alternative Considered

If development time is critical, consider:
- **Payload CMS** hosted on Railway (~$5/mo) for full-featured admin out of the box
- **Refine** framework to speed up admin UI development

---

## Next Steps

1. **Create Supabase account** and new project
2. **Set up database schema** using provided SQL
3. **Configure authentication** for admin users
4. **Build admin dashboard** starting with layout and auth
5. **Implement features** in order: Articles → Comments → Subscribers
6. **Create public-facing pages** for news and comments
7. **Test thoroughly** before deploying to production

---

## Appendix: Useful Resources

### Supabase
- Documentation: https://supabase.com/docs
- JavaScript Client: https://supabase.com/docs/reference/javascript

### Tiptap Editor
- Documentation: https://tiptap.dev/docs
- Examples: https://tiptap.dev/examples

### Astro
- Documentation: https://docs.astro.build
- Content Collections: https://docs.astro.build/en/guides/content-collections/

### Resend (Email)
- Documentation: https://resend.com/docs

---

*Document prepared for Indian Restaurant Week project planning.*
