# THE WHEEL: WIREFRAME COLLECTION

This document contains wireframes for key interfaces of The Wheel platform, providing a visual representation of how users will interact with the system. These wireframes are designed to illustrate the layout, functionality, and user flow of critical components.

## Table of Contents

1. [Mode Switcher Interface](#1-mode-switcher-interface)
2. [Dashboard - Founder Mode](#2-dashboard---founder-mode)
3. [Multi-Domain Progress Tracker](#3-multi-domain-progress-tracker)
4. [Knowledge Hub Interface](#4-knowledge-hub-interface)
5. [Template Customization](#5-template-customization)
6. [AI Cofounder Interface](#6-ai-cofounder-interface)
7. [Tech Hub Interface](#7-tech-hub-interface)
8. [Community Platform](#8-community-platform)
9. [Marketplace Interface](#9-marketplace-interface)
10. [Mobile Responsive Views](#10-mobile-responsive-views)

---

## 1. Mode Switcher Interface

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│  │  FOUNDER    │ │   ADVISOR   │ │   INVESTOR  │         │
│  │             │ │             │ │             │         │
│  │  [ACTIVE]   │ │             │ │             │         │
│  └─────────────┘ └─────────────┘ └─────────────┘         │
│                                                          │
│  ┌─────────────────────────────────────────────────┐     │
│  │                                                 │     │
│  │  Recent Activity in Founder Mode                │     │
│  │                                                 │     │
│  │  • Updated fundraising deck (10m ago)           │     │
│  │  • Completed standup (1h ago)                   │     │
│  │  • Added 3 tasks to Product domain (2h ago)     │     │
│  │                                                 │     │
│  └─────────────────────────────────────────────────┘     │
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐        │
│  │                     │  │                     │        │
│  │   Mode Settings     │  │   Add New Mode      │        │
│  │                     │  │                     │        │
│  └─────────────────────┘  └─────────────────────┘        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

The Mode Switcher allows users to transition between different professional roles while maintaining context. 
- Top tabs allow quick switching between modes
- Recent activity panel shows context from the selected mode
- UI elements adaptively change based on active mode
- Settings button provides access to mode customization
- Add New Mode button for creating additional personas

---

## 2. Dashboard - Founder Mode

```
┌──────────────────────────────────────────────────────────┐
│ THE WHEEL                  [Search]     [User: Founder▼] │
├────────┬─────────────────────────────────────────────────┤
│        │                                                 │
│        │ FOUNDER DASHBOARD                   April 26    │
│        │                                                 │
│        │ ┌───────────────┐ ┌───────────────┐             │
│ MODES  │ │               │ │               │             │
│  •F    │ │ Daily Standup │ │  Progress     │             │
│  •A    │ │               │ │   Tracker     │             │
│  •I    │ │ [Needs Input] │ │   68% Done    │             │
│        │ │               │ │               │             │
│ NAV    │ └───────────────┘ └───────────────┘             │
│        │                                                 │
│ •HOME  │ ┌───────────────┐ ┌───────────────┐             │
│ •TASKS │ │               │ │               │             │
│ •DOCS  │ │ AI Cofounder  │ │  Knowledge    │             │
│ •COMM  │ │               │ │   Hub         │             │
│ •IDEAS │ │ 2 Suggestions │ │   New Legal   │             │
│ •MRKT  │ │               │ │   Templates   │             │
│        │ └───────────────┘ └───────────────┘             │
│ TOOLS  │                                                 │
│        │ YOUR FOCUS TODAY:                               │
│ •TECH  │ ┌─────────────────────────────────────────────┐ │
│ •AI    │ │ 1. Complete payment integration (Product)   │ │
│ •HUB   │ │ 2. Review investor deck (Fundraising)       │ │
│ •SETUP │ │ 3. Prepare for user testing (Product)       │ │
│        │ └─────────────────────────────────────────────┘ │
│        │                                                 │
│        │ ┌──────────────────┐ ┌──────────────────┐       │
│        │ │                  │ │                  │       │
│        │ │ Team Activity    │ │ Marketplace      │       │
│        │ │                  │ │                  │       │
│        │ └──────────────────┘ └──────────────────┘       │
├────────┴─────────────────────────────────────────────────┤
│ © 2025 The Wheel • Privacy • Terms • Help                │
└──────────────────────────────────────────────────────────┘
```

The Founder Dashboard serves as the central hub for platform activities.
- Left sidebar provides navigation and mode switching
- Dashboard widgets show key information at a glance
- Focus section highlights AI-prioritized tasks across domains
- Content adapts based on user progress and immediate needs
- Widget-based design allows for customization

---

## 3. Multi-Domain Progress Tracker

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  PROGRESS TRACKER                                        │
│                                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │ PRODUCT │ │ FUNDING │ │  TEAM   │ │  LEGAL  │   ...   │
│  │   68%   │ │   42%   │ │   25%   │ │   80%   │         │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
│                                                          │
│  ┌─────────────────────────────────────────────────┐     │
│  │                                                 │     │
│  │  PRODUCT: Prototype Stage                       │     │
│  │  ◼◼◼◼◼◼◼◼◼◼◼◼◼◼◼◻◻◻◻◻◻ 68%                    │     │
│  │                                                 │     │
│  │  Next Milestone: User Testing                   │     │
│  │                                                 │     │
│  │  Active Tasks:                                  │     │
│  │  ☐ Implement user authentication (due: 3d)      │     │
│  │  ☐ Design testing protocol (due: 1d)            │     │
│  │  ☐ Fix payment integration (due: 2d)            │     │
│  │                                                 │     │
│  │  AI Suggests: Prioritize payment integration    │     │
│  │  since it's blocking user testing milestone     │     │
│  │                                                 │     │
│  └─────────────────────────────────────────────────┘     │
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐        │
│  │                     │  │                     │        │
│  │ Add Task +          │  │ Weekly Progress ▾   │        │
│  │                     │  │                     │        │
│  └─────────────────────┘  └─────────────────────┘        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

The Progress Tracker helps founders visualize and manage progress across multiple startup domains.
- Domain tabs show completion percentages at a glance
- Progress bars visualize stage progression
- Task lists show upcoming work with deadlines
- AI suggestions highlight critical path activities
- Add Task button for quick entry of new items
- Weekly Progress report for trend analysis

---

## 4. Knowledge Hub Interface

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  KNOWLEDGE HUB                                           │
│                                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │  LEGAL  │ │ FINANCE │ │   GTM   │ │  TEAM   │   ...   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
│                                                          │
│  ┌───────────────────────────────────────────────────┐   │
│  │ LEGAL Resources                          Filter ▾  │   │
│  │                                                   │   │
│  │ ┌───────────────────┐ ┌───────────────────┐      │   │
│  │ │                   │ │                   │      │   │
│  │ │ SAFE Financing    │ │ Privacy Policy    │      │   │
│  │ │ Template          │ │ Template          │      │   │
│  │ │                   │ │                   │      │   │
│  │ │ ★★★★☆ (28)        │ │ ★★★★★ (42)        │      │   │
│  │ └───────────────────┘ └───────────────────┘      │   │
│  │                                                   │   │
│  │ ┌───────────────────┐ ┌───────────────────┐      │   │
│  │ │                   │ │                   │      │   │
│  │ │ IP Protection     │ │ Employee Offer    │      │   │
│  │ │ Guide             │ │ Letters           │      │   │
│  │ │                   │ │                   │      │   │
│  │ │ ★★★★☆ (15)        │ │ ★★★★☆ (31)        │      │   │
│  │ └───────────────────┘ └───────────────────┘      │   │
│  │                                                   │   │
│  │ Recommended for you:                              │   │
│  │ » Founder Vesting Agreement (based on your stage) │   │
│  └───────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐        │
│  │                     │  │                     │        │
│  │ Contribute Resource │  │   My Documents      │        │
│  │                     │  │                     │        │
│  └─────────────────────┘  └─────────────────────┘        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

The Knowledge Hub provides structured access to domain-specific resources and templates.
- Domain tabs organize resources by functional area
- Resource cards show ratings and popularity
- Recommendations section uses AI to suggest relevant resources
- Filter allows narrowing by resource type, stage, etc.
- Contribute button enables community knowledge sharing
- My Documents section for accessing personalized content

---

## 5. Template Customization

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  TEMPLATE CUSTOMIZATION: Privacy Policy                  │
│                                                          │
│  ┌───────────────────────────┐ ┌───────────────────────┐ │
│  │ Template Questions        │ │ Document Preview      │ │
│  │                           │ │                       │ │
│  │ Company Name:             │ │ PRIVACY POLICY        │ │
│  │ [TechFuture Inc.        ] │ │                       │ │
│  │                           │ │ 1. INTRODUCTION       │ │
│  │ Website URL:              │ │                       │ │
│  │ [techfuture.co          ] │ │ TechFuture Inc.       │ │
│  │                           │ │ ("Company", "we", "us"│ │
│  │ Data Collected:           │ │ or "our") operates   │ │
│  │ [x] Personal Information  │ │ techfuture.co (the   │ │
│  │ [x] Usage Data            │ │ "Website"). This page│ │
│  │ [ ] Location Data         │ │ informs you of our   │ │
│  │ [ ] Cookies               │ │ policies regarding   │ │
│  │                           │ │ the collection, use  │ │
│  │ Sharing with Third Parties│ │ and disclosure of    │ │
│  │ [ ] Analytics Providers   │ │ Personal Information │ │
│  │ [ ] Service Providers     │ │ when you use our     │ │
│  │ [ ] Marketing Partners    │ │ Service...           │ │
│  │                           │ │                       │ │
│  │ GDPR Compliance Needed:   │ │ 2. DATA COLLECTION   │ │
│  │ (•) Yes  ( ) No           │ │                       │ │
│  │                           │ │ We collect Usage Data│ │
│  │ CCPA Compliance Needed:   │ │ and Personal Info... │ │
│  │ (•) Yes  ( ) No           │ │                       │ │
│  │                           │ │                       │ │
│  └───────────────────────────┘ └───────────────────────┘ │
│                                                          │
│  AI Suggestions:                                         │
│  » Consider adding Cookie Policy for GDPR compliance     │
│  » Add Data Retention section for completeness           │
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐        │
│  │                     │  │                     │        │
│  │   Save Draft        │  │  Export Document    │        │
│  │                     │  │                     │        │
│  └─────────────────────┘  └─────────────────────┘        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

The Template Customization interface allows users to create legal and business documents.
- Left panel contains customization fields with smart defaults
- Right panel shows real-time document preview
- AI suggestions provide guidance on improvements
- Save Draft preserves work in progress
- Export Document generates final versions in multiple formats
- Smart form adapts based on user selections

---

## 6. AI Cofounder Interface

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  AI COFOUNDER                                            │
│                                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │ STANDUP │ │ DOCUMENT│ │ STRATEGY│ │ HISTORY │         │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
│                                                          │
│  ┌───────────────────────────────────────────────────┐   │
│  │ Daily Standup                                     │   │
│  │                                                   │   │
│  │ What did you accomplish yesterday?                │   │
│  │ [Completed user authentication API and started    ]   │
│  │ [designing the testing protocol for next week's   ]   │
│  │ [user testing session                             ]   │
│  │                                                   │   │
│  │ What are you working on today?                    │   │
│  │ [Finishing the testing protocol and fixing        ]   │
│  │ [the payment integration issue we found           ]   │
│  │                                                   │   │
│  │ Any blockers?                                     │   │
│  │ [API keys for payment processor are delayed       ]   │
│  │                                                   │   │
│  │                                                   │   │
│  │ ┌─────────────────────┐                           │   │
│  │ │    Submit Standup   │                           │   │
│  │ └─────────────────────┘                           │   │
│  └───────────────────────────────────────────────────┘   │
│                                                          │
│  Previous Standups ▾                AI Settings ▾        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

The AI Cofounder provides strategic guidance and operational support.
- Tab navigation for different AI assistance modes
- Daily standup interface shown here with input fields
- Submit button sends data for AI analysis
- Previous Standups dropdown shows historical entries
- AI Settings allows customization of AI behavior
- Other tabs provide document collaboration and strategic planning

---

## 7. Tech Hub Interface

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  TECH HUB                                                │
│                                                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐            │
│  │ STACK REC  │ │ STARTER    │ │ DEPLOY     │            │
│  └────────────┘ └────────────┘ └────────────┘            │
│                                                          │
│  ┌───────────────────────────────────────────────────┐   │
│  │ Tech Stack Recommender                            │   │
│  │                                                   │   │
│  │ Project Requirements:                             │   │
│  │                                                   │   │
│  │ Type of Application:                              │   │
│  │ (•) Web App  ( ) Mobile App  ( ) Desktop App      │   │
│  │                                                   │   │
│  │ Team Experience:                                  │   │
│  │ (•) JavaScript  ( ) Python  ( ) Ruby  ( ) Go      │   │
│  │                                                   │   │
│  │ Priorities (rank 1-3):                            │   │
│  │ [2] Development speed                             │   │
│  │ [1] Scalability                                   │   │
│  │ [3] Community support                             │   │
│  │                                                   │   │
│  │ Expected User Base:                               │   │
│  │ ( ) <100  (•) 100-10K  ( ) >10K                   │   │
│  │                                                   │   │
│  │ ┌─────────────────────────┐                       │   │
│  │ │   Generate Recommendations   │                  │   │
│  │ └─────────────────────────┘                       │   │
│  └───────────────────────────────────────────────────┘   │
│                                                          │
│  Previous Recommendations ▾       Templates ▾            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

The Tech Hub provides technical guidance and starter resources.
- Tab navigation for tech assistance modes
- Requirements form with smart defaults based on company profile
- Priority ranking for recommendation customization
- Generate Recommendations button for AI analysis
- Previous Recommendations dropdown for historical access
- Templates provides quick access to starter codebases

---

## 8. Community Platform

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  COMMUNITY                                               │
│                                                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐            │
│  │ DISCUSSIONS│ │ GROUPS     │ │ EVENTS     │            │
│  └────────────┘ └────────────┘ └────────────┘            │
│                                                          │
│  ┌───────────────────────────────────────────────────┐   │
│  │ Groups                                    Filter ▾│   │
│  │                                                   │   │
│  │ YOUR GROUPS:                                      │   │
│  │ ┌───────────────────┐ ┌───────────────────┐      │   │
│  │ │                   │ │                   │      │   │
│  │ │ SaaS Founders     │ │ YC W25 Batch      │      │   │
│  │ │ 328 members       │ │ 62 members        │      │   │
│  │ │ 12 new posts      │ │ 5 new posts       │      │   │
│  │ │                   │ │                   │      │   │
│  │ └───────────────────┘ └───────────────────┘      │   │
│  │                                                   │   │
│  │ SUGGESTED GROUPS:                                 │   │
│  │ ┌───────────────────┐ ┌───────────────────┐      │   │
│  │ │                   │ │                   │      │   │
│  │ │ B2B Marketing     │ │ Founder Wellness  │      │   │
│  │ │ 531 members       │ │ 246 members       │      │   │
│  │ │ Suggested: Similar │ │ Suggested: Your  │      │   │
│  │ │ to your interests  │ │ recent searches   │      │   │
│  │ │                   │ │                   │      │   │
│  │ └───────────────────┘ └───────────────────┘      │   │
│  │                                                   │   │
│  │ UPCOMING GROUP EVENTS:                            │   │
│  │ » SaaS Metrics Workshop (Tomorrow, 2pm ET)        │   │
│  │ » Founder Mental Health Panel (Friday, 12pm ET)   │   │
│  └───────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐        │
│  │                     │  │                     │        │
│  │    Find Peers       │  │   Create Group      │        │
│  │                     │  │                     │        │
│  └─────────────────────┘  └─────────────────────┘        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

The Community Platform connects founders with meaningful peer relationships.
- Tab navigation for community features
- Your Groups section shows joined communities
- Suggested Groups uses AI to recommend relevant connections
- Upcoming Events shows scheduled activities
- Find Peers button for matching with individual founders
- Create Group button for establishing new communities
- Filter option for narrowing by industry, stage, etc.

---

## 9. Marketplace Interface

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  MARKETPLACE                                             │
│                                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│  │  PROVIDERS  │ │  MY RFPS    │ │  PROJECTS   │         │
│  └─────────────┘ └─────────────┘ └─────────────┘         │
│                                                          │
│  ┌───────────────────────────────────────────────────┐   │
│  │ Find Service Providers             Filter ▾ Sort ▾│   │
│  │                                                   │   │
│  │ Categories:                                       │   │
│  │ ┌─────┐ ┌─────────┐ ┌──────┐ ┌──────┐ ┌────────┐ │   │
│  │ │Legal│ │Marketing│ │Design│ │Finance│ │Product │ │   │
│  │ └─────┘ └─────────┘ └──────┘ └──────┘ └────────┘ │   │
│  │                                                   │   │
│  │ ┌───────────────────────────────────────────────┐ │   │
│  │ │                                               │ │   │
│  │ │ ★★★★★ Stellar Legal Services                   │ │   │
│  │ │ Early-stage startup specialists               │ │   │
│  │ │ Services: Incorporation, IP, Fundraising      │ │   │
│  │ │ 24 founders recommend this provider           │ │   │
│  │ │                                               │ │   │
│  │ └───────────────────────────────────────────────┘ │   │
│  │                                                   │   │
│  │ ┌───────────────────────────────────────────────┐ │   │
│  │ │                                               │ │   │
│  │ │ ★★★★☆ Growth Marketing Partners               │ │   │
│  │ │ B2B SaaS acquisition experts                  │ │   │
│  │ │ Services: Digital Marketing, Analytics, SEO    │ │   │
│  │ │ 36 founders recommend this provider           │ │   │
│  │ │                                               │ │   │
│  │ └───────────────────────────────────────────────┘ │   │
│  └───────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐        │
│  │                     │  │                     │        │
│  │     Create RFP      │  │    My Services      │        │
│  │                     │  │                     │        │
│  └─────────────────────┘  └─────────────────────┘        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

The Marketplace connects founders with vetted service providers.
- Tab navigation for marketplace functions
- Category filters for quick navigation
- Provider cards with ratings and specialties
- Create RFP button for requesting services
- My Services button for accessing active engagements
- Filter and Sort controls for refining results
- Recommendation counts show community validation

---

## 10. Mobile Responsive Views

### Mobile Dashboard View

```
┌─────────────────────────┐
│ THE WHEEL        [≡][F]│
├─────────────────────────┤
│                         │
│ FOUNDER DASHBOARD       │
│                         │
│ ┌─────────────────────┐ │
│ │                     │ │
│ │   Daily Standup     │ │
│ │                     │ │
│ │    [Needs Input]    │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │                     │ │
│ │  Progress Tracker   │ │
│ │                     │ │
│ │      68% Done       │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ FOCUS TODAY:            │
│ • Complete payment      │
│   integration           │
│ • Review investor deck  │
│                         │
│ ┌─────────────────────┐ │
│ │                     │ │
│ │    AI Cofounder     │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

### Mobile Mode Switcher

```
┌─────────────────────────┐
│ MODE SWITCHER     [×]   │
├─────────────────────────┤
│                         │
│ ┌─────────────────────┐ │
│ │     FOUNDER         │ │
│ │     [ACTIVE]        │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │     ADVISOR         │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │     INVESTOR        │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ Recent Activity:        │
│ • Updated deck (10m)    │
│ • Completed standup (1h)│
│                         │
│ ┌─────────────────────┐ │
│ │   Mode Settings     │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │   Add New Mode      │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

The mobile views maintain the core functionality while adapting to smaller screens.
- Stacked card layout replaces grid layout
- Hamburger menu provides access to navigation  
- Mode switcher accessed via icon in header
- Focus on essential information with ability to drill down
- Touch-friendly button sizes and spacing
- Progressive disclosure of complex features
