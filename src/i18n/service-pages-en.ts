import type { ServiceId, ServicePageCopy } from './types'

export const servicePagesEn: Record<ServiceId, ServicePageCopy> = {
  'web-hosting': {
    title: 'Web Hosting',
    metaTitle: 'Web Hosting Hamburg — BDITEC',
    metaDescription: 'Professional web hosting by BDITEC in Hamburg: shared, VPS and dedicated servers for websites, CMS and shops — including setup, migration, SSL, backups and support.',
    lead: 'Stable, secure and scalable hosting that fits your site and your growth.',
    body: [
      'Your website needs more than disk space. We design hosting so performance, security and availability are right from day one — for company sites, CMS platforms or online shops.',
      'Together we pick the right tier: shared hosting for lean sites, VPS for growing projects, or dedicated servers for demanding loads. Setup, hardening and monitoring are included.',
      'For relaunches or provider switches we handle migration — including DNS, SSL, backups and a clear go-live plan to keep downtime low.',
    ],
    highlights: [
      'Shared hosting, VPS and dedicated servers',
      'CMS and shop-ready configuration',
      'SSL, backups and security basics',
      'Migration, monitoring and ongoing support',
    ],
    audienceTitle: 'Who it is for',
    audience: 'Companies, agencies and shops that want reliable hosting with clear support — without day-to-day technical chaos.',
    processTitle: 'How we work',
    process: [
      {
        title: 'Needs & architecture',
        body: 'We clarify traffic, CMS, integrations and security needs in a short briefing.',
      },
      {
        title: 'Setup & hardening',
        body: 'Servers, domains, SSL and backups are configured and documented.',
      },
      {
        title: 'Migration & go-live',
        body: 'Content and systems move in a controlled way — with testing and a rollback option.',
      },
      {
        title: 'Operations & support',
        body: 'We stay reachable: updates, monitoring and fast help when issues arise.',
      },
    ],
    deliverablesTitle: 'What you get',
    deliverables: [
      'Production hosting environment with access credentials',
      'SSL certificate and backup concept',
      'Short documentation of key settings',
      'A contact for support and future upgrades',
    ],
    benefitsTitle: 'Why it matters',
    benefits: [
      {
        title: 'Fewer outages',
        body: 'Solid configuration and monitoring reduce risk before users notice.',
      },
      {
        title: 'Clear operations',
        body: 'Access, backups and workflows are documented so your team stays in control.',
      },
      {
        title: 'Room to grow',
        body: 'From shared to dedicated, we scale with your traffic and requirements.',
      },
    ],
    faqTitle: 'FAQ',
    faq: [
      {
        q: 'Which hosting do I need?',
        a: 'It depends on traffic, CMS, shop features and integrations. In a short call we recommend shared, VPS or dedicated — without over-engineering.',
      },
      {
        q: 'Can you replace my current provider?',
        a: 'Yes. We plan migration, DNS and SSL for a controlled switch with minimal interruption.',
      },
      {
        q: 'Are backups and SSL included?',
        a: 'SSL and a backup concept are part of setup. Scope and intervals match your risk and budget.',
      },
      {
        q: 'Do you offer ongoing support?',
        a: 'Yes — updates, incidents and extensions, with a clear BDITEC contact.',
      },
    ],
    trustTitle: 'Why BDITEC',
    trust: [
      'Personal support instead of ticket black holes',
      'Hosting aligned with web, shop and app work',
      'Based in Hamburg — reachable and accountable',
      'Documented handover for your team',
    ],
    closingTitle: 'Ready for reliable hosting?',
    closingBody: 'Tell us briefly about your project — we reply with a clear recommendation and next step.',
    imgAlt: 'Server aisle with magenta accent light — BDITEC Web Hosting',
  },
  'mobile-app': {
    title: 'Mobile App',
    metaTitle: 'Mobile App Development — BDITEC Hamburg',
    metaDescription: 'Mobile app development with BDITEC: iOS and cross-platform, UX, API integration and launch — from idea to store release.',
    lead: 'Mobile apps that deliver real value — and make your brand strong on the phone.',
    body: [
      'A good app solves a real problem. We start with goals, user flows and priorities — before the first line of code.',
      'Depending on the product we choose native iOS or cross-platform. UX, interfaces and backend integration work together so the app stays fast, stable and maintainable.',
      'From prototype to store release we guide you with milestones, reviews and a clear roadmap for after launch.',
    ],
    highlights: [
      'iOS and cross-platform development',
      'UX concept and interface design',
      'API and backend integration',
      'Launch support and ongoing iteration',
    ],
    audienceTitle: 'Who it is for',
    audience: 'Companies and product teams that need an app channel for customers, services or internal processes.',
    processTitle: 'How we work',
    process: [
      {
        title: 'Discovery & scope',
        body: 'Goals, audiences and MVP scope are defined — including the technical frame.',
      },
      {
        title: 'UX & design',
        body: 'Wireframes and screens make flows tangible before development.',
      },
      {
        title: 'Build & test',
        body: 'Iterative delivery with regular builds and quality checks.',
      },
      {
        title: 'Release & iterate',
        body: 'Store prep, launch and planned improvements from feedback.',
      },
    ],
    deliverablesTitle: 'What you get',
    deliverables: [
      'Concept and prioritised feature list',
      'Design of core app screens',
      'Working app builds (test and release)',
      'Handover with documentation and next steps',
    ],
    benefitsTitle: 'Why it matters',
    benefits: [
      {
        title: 'Value-first scope',
        body: 'We prioritise features by impact — not by a wish list for its own sake.',
      },
      {
        title: 'Clean UX',
        body: 'Clear flows reduce support load and improve adoption.',
      },
      {
        title: 'Launch-ready',
        body: 'From builds to store checklists — we stay with you through release and beyond.',
      },
    ],
    faqTitle: 'FAQ',
    faq: [
      {
        q: 'Native or cross-platform?',
        a: 'We recommend based on platforms, budget and features. Cross-platform often saves time; native iOS can fit special requirements.',
      },
      {
        q: 'Do I need a backend?',
        a: 'Many apps do. We plan APIs, auth and data — or connect your existing systems.',
      },
      {
        q: 'How long for an MVP?',
        a: 'It depends on scope. After discovery we give a realistic timeline with milestones.',
      },
      {
        q: 'Support after launch?',
        a: 'Yes — fixes, features and store updates within an agreed scope.',
      },
    ],
    trustTitle: 'Why BDITEC',
    trust: [
      'Product thinking, not just coding',
      'UX and engineering together',
      'Clear milestones and reviews',
      'Room to evolve after go-live',
    ],
    closingTitle: 'Ready to shape your app?',
    closingBody: 'Share audience and value proposition — we outline scope, effort and the smartest starting point.',
    imgAlt: 'Smartphone with app interface — BDITEC Mobile App',
  },
  'web-development': {
    title: 'Web Development',
    metaTitle: 'Web Development — BDITEC Hamburg',
    metaDescription: 'Web development by BDITEC: frontend, backend, CMS and APIs for fast, maintainable sites and web apps — from concept to operations.',
    lead: 'Web projects that are fast, maintainable and ready to grow.',
    body: [
      'Whether a marketing site or a custom web app: we build on clear architecture, modern standards and clean code quality.',
      'Frontend, backend and databases connect so content, forms, logins and integrations work reliably.',
      'After go-live your project stays manageable — with documentation, deployments and a team that thinks ahead.',
    ],
    highlights: [
      'Frontend and backend development',
      'CMS and custom solutions',
      'APIs and database integration',
      'Performance, SEO foundations and maintainability',
    ],
    audienceTitle: 'Who it is for',
    audience: 'Organisations that need a strong web presence or internal web software — without technical debt from day one.',
    processTitle: 'How we work',
    process: [
      {
        title: 'Requirements & concept',
        body: 'Content, features and technical constraints are captured in a structured way.',
      },
      {
        title: 'Design & prototype',
        body: 'Visual and interactive drafts create a shared foundation.',
      },
      {
        title: 'Build',
        body: 'Iterative development with reviews, tests and staging.',
      },
      {
        title: 'Launch & care',
        body: 'Go-live, monitoring and optional further development.',
      },
    ],
    deliverablesTitle: 'What you get',
    deliverables: [
      'Production web project',
      'Responsive delivery for desktop and mobile',
      'Admin/CMS access where planned',
      'Handover with short documentation',
    ],
    benefitsTitle: 'Why it matters',
    benefits: [
      {
        title: 'Technically clean',
        body: 'Maintainable code keeps long-term costs under control.',
      },
      {
        title: 'Visible progress',
        body: 'Prototypes and staging show movement before everything is live.',
      },
      {
        title: 'SEO-ready basics',
        body: 'Semantics, performance and meta foundations are part of delivery.',
      },
    ],
    faqTitle: 'FAQ',
    faq: [
      {
        q: 'CMS or custom build?',
        a: 'Both work. CMS fits editorial sites; custom stacks fit special processes and integrations.',
      },
      {
        q: 'Can you modernise an existing site?',
        a: 'Yes — relaunch, refactor or staged migration depending on risk and budget.',
      },
      {
        q: 'How do we collaborate?',
        a: 'Short cycles, transparent milestones and a dedicated BDITEC contact.',
      },
      {
        q: 'What do you need to start?',
        a: 'Goals, examples and rough content are enough for a first concept call.',
      },
    ],
    trustTitle: 'Why BDITEC',
    trust: [
      'Design, development and marketing aligned',
      'Clear communication in German and English',
      'Focus on performance and maintainability',
      'Support available after launch',
    ],
    closingTitle: 'Start your web project?',
    closingBody: 'Send a short brief and references — we reply with approach, timeline and recommendation.',
    imgAlt: 'Laptop with website and code — BDITEC Web Development',
  },
  'e-commerce': {
    title: 'E-Commerce',
    metaTitle: 'E-Commerce & Online Shop — BDITEC',
    metaDescription: 'E-commerce with BDITEC: shop setup, catalogue, checkout, payments and conversion optimisation for measurable online sales.',
    lead: 'Online shops that present products clearly — and make buying easy.',
    body: [
      'A strong shop combines catalogue clarity, trust and a smooth checkout. We shape structure, design and tech so customers find and finish fast.',
      'Payments, shipping logic, taxes and integrations are set up practically. Launch matters — measurable conversion afterwards matters more.',
      'With reporting and focused optimisation, catalogue and funnel keep improving while you sell.',
    ],
    highlights: [
      'Shop setup and catalogue structure',
      'Checkout and payment integration',
      'Conversion optimisation',
      'Care, reporting and growth',
    ],
    audienceTitle: 'Who it is for',
    audience: 'Brands and merchants who sell online or want a professional shop relaunch.',
    processTitle: 'How we work',
    process: [
      {
        title: 'Shop strategy',
        body: 'Catalogue, audiences and purchase paths are prioritised.',
      },
      {
        title: 'Build & connect',
        body: 'Catalogue, payments, shipping and legal basics are configured.',
      },
      {
        title: 'Test & launch',
        body: 'Order flows are checked — then a controlled go-live.',
      },
      {
        title: 'Optimise',
        body: 'Data shows friction — we improve with intent.',
      },
    ],
    deliverablesTitle: 'What you get',
    deliverables: [
      'Live shop with core features',
      'Product and category structure',
      'Payment and shipping setup',
      'Starter reporting and optimisation tips',
    ],
    benefitsTitle: 'Why it matters',
    benefits: [
      {
        title: 'Less checkout friction',
        body: 'Clear catalogue and checkout reduce abandonment.',
      },
      {
        title: 'Tech that sells',
        body: 'Payments, shipping and tracking work as one system.',
      },
      {
        title: 'Growth after launch',
        body: 'Optimisation from real order data — not guesswork.',
      },
    ],
    faqTitle: 'FAQ',
    faq: [
      {
        q: 'Which shop platform?',
        a: 'We choose by catalogue, integrations and operations — established platforms or tailored setups.',
      },
      {
        q: 'Can you import product data?',
        a: 'Yes when available: import, structure and quality checks are part of build.',
      },
      {
        q: 'Is legal advice included?',
        a: 'We set technical foundations. Legal copy and approvals stay with you or your counsel.',
      },
      {
        q: 'Can you improve an existing shop?',
        a: 'Yes — performance, UX, checkout and campaign connections.',
      },
    ],
    trustTitle: 'Why BDITEC',
    trust: [
      'Shop, hosting and marketing in one logic',
      'Practical scope instead of feature bloat',
      'Measurable optimisation after go-live',
      'Personal project ownership',
    ],
    closingTitle: 'Build or relaunch your shop?',
    closingBody: 'Share catalogue and goals — we propose platform, scope and a realistic launch plan.',
    imgAlt: 'Tablet with shop analytics — BDITEC E-Commerce',
  },
  'digital-marketing': {
    title: 'Digital Marketing',
    metaTitle: 'Digital Marketing — SEO, Ads & Social | BDITEC',
    metaDescription: 'Digital marketing with BDITEC Hamburg: SEO, content, social media and PPC/SEM — planned strategically and steered with metrics.',
    lead: 'Visibility and demand — with clear channels and measurable results.',
    body: [
      'We connect SEO, content, social and paid ads into a strategy that fits your goals — not every trend.',
      'Campaigns are planned, executed and steered with clear KPIs: reach, lead quality, cost and conversion.',
      'You get a marketing system you can run — with reporting that supports decisions instead of noise.',
    ],
    highlights: [
      'SEO and content',
      'Social media and paid ads',
      'PPC/SEM and performance marketing',
      'Tracking, funnel and reporting',
    ],
    audienceTitle: 'Who it is for',
    audience: 'Companies that want digital growth and treat marketing as an investable system — not chance.',
    processTitle: 'How we work',
    process: [
      {
        title: 'Analysis & goals',
        body: 'Market, channels and metrics align to your priorities.',
      },
      {
        title: 'Channel strategy',
        body: 'We pick the mix that can realistically work.',
      },
      {
        title: 'Execution',
        body: 'Campaigns, content and optimisation run in clear cycles.',
      },
      {
        title: 'Reporting & scale',
        body: 'Results are reviewed — budget follows what works.',
      },
    ],
    deliverablesTitle: 'What you get',
    deliverables: [
      'Channel and campaign plan',
      'Executed measures including creatives/copy as needed',
      'Tracking foundation',
      'Regular performance reporting',
    ],
    benefitsTitle: 'Why it matters',
    benefits: [
      {
        title: 'Connected channel mix',
        body: 'SEO, social and ads reinforce each other — not isolated tactics.',
      },
      {
        title: 'Measurable control',
        body: 'KPIs and reporting make budget choices transparent.',
      },
      {
        title: 'Content that converts',
        body: 'Copy and creatives follow intent and funnel — not vanity reach.',
      },
    ],
    faqTitle: 'FAQ',
    faq: [
      {
        q: 'SEO or paid first?',
        a: 'Often a balance: paid for speed, SEO for lasting visibility. We prioritise by goal and horizon.',
      },
      {
        q: 'How fast will I see results?',
        a: 'Paid can move quickly; SEO needs build time. We set expectations and milestones clearly.',
      },
      {
        q: 'Do I need tracking?',
        a: 'Yes for serious optimisation. We set a foundation and explain the metrics.',
      },
      {
        q: 'Can you work with our agency?',
        a: 'Gladly — we can own specialised parts or orchestrate the whole.',
      },
    ],
    trustTitle: 'Why BDITEC',
    trust: [
      'Marketing plus web/app under one roof',
      'No buzzword theatre — clear goals',
      'Transparent reports',
      'Hamburg-based personal support',
    ],
    closingTitle: 'Ready to grow demand?',
    closingBody: 'Share market and budget range — we propose a focused channel plan and first sprint.',
    imgAlt: 'Analytics dashboard with growth curves — BDITEC Digital Marketing',
  },
  'offline-marketing': {
    title: 'Offline Marketing',
    metaTitle: 'Offline Marketing — Print, Events & OOH | BDITEC',
    metaDescription: 'Offline marketing with BDITEC: print, events, out-of-home and installation — brand presence that works in the real world.',
    lead: 'Brand presence that works offline too — from print to events.',
    body: [
      'Digital channels matter — but physical touchpoints still decide. We plan offline work so design, production and impact fit together.',
      'From print and direct mail to events and out-of-home: message, format and delivery are planned as one — including installation when needed.',
      'You get a presence that fits the brand and stays visible in everyday life.',
    ],
    highlights: [
      'Print and direct marketing',
      'Events and promotion',
      'Out-of-home and media',
      'Production and installation',
    ],
    audienceTitle: 'Who it is for',
    audience: 'Brands and locations that need presence on site — trade shows, stores, campaigns or local visibility.',
    processTitle: 'How we work',
    process: [
      {
        title: 'Brief & idea',
        body: 'Goal, message and locations are defined clearly.',
      },
      {
        title: 'Design & production',
        body: 'Designs are finalised and prepared for production.',
      },
      {
        title: 'Delivery',
        body: 'Print, fabrication and setup are coordinated.',
      },
      {
        title: 'Acceptance',
        body: 'On site we check quality and finishing.',
      },
    ],
    deliverablesTitle: 'What you get',
    deliverables: [
      'Concept and motif/format proposals',
      'Print-ready files',
      'Coordinated production',
      'Installation or handover depending on project',
    ],
    benefitsTitle: 'Why it matters',
    benefits: [
      {
        title: 'Brand in space',
        body: 'Consistent motifs and formats strengthen recognition on site.',
      },
      {
        title: 'Production without chaos',
        body: 'Design, print and install run from one plan.',
      },
      {
        title: 'Online + offline',
        body: 'Campaigns can connect to your digital presence.',
      },
    ],
    faqTitle: 'FAQ',
    faq: [
      {
        q: 'Do you handle installation?',
        a: 'Yes, depending on the project — from delivery to on-site setup.',
      },
      {
        q: 'Can you follow existing brand guidelines?',
        a: 'Absolutely. We work within your CI and extend it when useful.',
      },
      {
        q: 'Which formats do you cover?',
        a: 'Print, displays, event materials and out-of-home — matched to goal and budget.',
      },
      {
        q: 'How fast can production run?',
        a: 'Depends on volume and technique. After briefing we give realistic dates.',
      },
    ],
    trustTitle: 'Why BDITEC',
    trust: [
      'Design and delivery connected',
      'Experience with local and event presence',
      'Quality through on-site acceptance',
      'One contact for the whole project',
    ],
    closingTitle: 'Need offline visibility?',
    closingBody: 'Tell us occasion, place and timing — we propose formats, schedule and a solid delivery offer.',
    imgAlt: 'City billboard at night — BDITEC Offline Marketing',
  },
}
