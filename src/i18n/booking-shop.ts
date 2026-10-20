import type { BookingServiceKey } from '../features/booking/catalog'

export type ShopItemCopy = { title: string; blurb: string; highlights?: string[] }

export type BookingShopCopy = {
  packageHeading: string
  addonsHeading: string
  addonsHint: string
  recommended: string
  fromLabel: string
  runningTotal: string
  packageLabel: string
  addonsSummary: string
  packages: Record<BookingServiceKey, Record<string, ShopItemCopy>>
  addons: Record<BookingServiceKey, Record<string, ShopItemCopy>>
}

export const bookingShopDe: BookingShopCopy = {
  packageHeading: 'Paket wählen',
  addonsHeading: 'Extras (optional)',
  addonsHint: 'Mehrere Extras möglich — Preis aktualisiert sich sofort.',
  recommended: 'Empfohlen',
  fromLabel: 'ab',
  runningTotal: 'Zwischensumme',
  packageLabel: 'Paket',
  addonsSummary: 'Extras',
  packages: {
    general: {
      kickoff: {
        title: 'Kickoff',
        blurb: 'Kurzberatung & nächster Schritt',
        highlights: ['Kurzberatung', 'Nächster Schritt klar', 'Digitales Briefing'],
      },
      briefing: {
        title: 'Briefing',
        blurb: 'Ziele, Scope und Empfehlung',
        highlights: ['Ziele & Scope', 'Empfehlung dokumentiert', 'Digitales Briefing'],
      },
      roadmap: {
        title: 'Roadmap',
        blurb: 'Priorisierte Projekt-Roadmap',
        highlights: ['Priorisierte Roadmap', 'Meilensteine skizziert', 'Digitales Briefing'],
      },
    },
    'web-hosting': {
      shared: {
        title: 'Shared',
        blurb: 'Schlanke Sites & CMS',
        highlights: ['Setup für schlanke Sites', 'CMS-geeignete Basis', 'SSL & Backup-Grundlage', 'Digitales Briefing'],
      },
      vps: {
        title: 'VPS',
        blurb: 'Mehr Leistung & Kontrolle',
        highlights: ['Mehr Ressourcen', 'Mehr Kontrolle', 'Betrieb & Härtung Start', 'Digitales Briefing'],
      },
      care: {
        title: 'Care',
        blurb: 'Wartung mit Stunden-Deckel (Hosting separat)',
        highlights: [
          'Updates & Backups',
          'Sicherheits-Checks',
          'Bis ca. 1 Std. Support / Monat',
          'Hosting/Domain nicht inklusive',
          'Orientierungspreis — Konditionen im Briefing',
        ],
      },
      'care-pro': {
        title: 'Care Pro',
        blurb: 'Mehr Pflege & schnellere Antwort',
        highlights: [
          'Alles aus Care',
          'Bis ca. 2 Std. Support / Monat',
          'Kleine Inhaltsänderungen',
          'Hosting/Domain nicht inklusive',
          'Orientierungspreis — Konditionen im Briefing',
        ],
      },
      dedicated: {
        title: 'Dedicated',
        blurb: 'Hohe Last & Isolation',
        highlights: ['Höhere Lastfähigkeit', 'Isolation & Kontrolle', 'Individuelles Setup', 'Angebot zur Feinabstimmung'],
      },
    },
    'mobile-app': {
      mvp: {
        title: 'MVP',
        blurb: 'Kernfunktionen zum Testen',
        highlights: ['Kernfunktionen', 'UX-Konzept Start', 'Validierung vor Launch', 'Digitales Briefing'],
      },
      launch: {
        title: 'Launch',
        blurb: 'Store-ready Basis',
        highlights: ['Store-ready Grundlage', 'UI & Assets Start', 'API-Anbindung skizziert', 'Angebot zur Feinabstimmung'],
      },
      scale: {
        title: 'Scale',
        blurb: 'Erweitertes Produkt-Setup',
        highlights: ['Erweitertes Setup', 'Mehr Integrationen', 'Wachstums-Scope', 'Angebot zur Feinabstimmung'],
      },
    },
    'web-development': {
      landing: {
        title: 'Landing',
        blurb: 'Eine starke Einstiegsseite',
        highlights: ['Eine Einstiegsseite', 'Responsive & schnell', 'Kontakt- / Lead-Form', 'DSGVO-Grundlage', 'Digitales Briefing'],
      },
      business: {
        title: 'Business',
        blurb: 'Mehrseitige Firmenwebsite',
        highlights: ['Mehrseitige Struktur', 'CMS-fähige Basis', 'Tech-SEO Grundlagen', 'Analytics-Start', 'Digitales Briefing'],
      },
      custom: {
        title: 'Custom',
        blurb: 'Individuelle Web-App',
        highlights: ['Individueller Scope', 'App- / Datenmodell Start', 'Schnittstellen möglich', 'Angebot zur Feinabstimmung'],
      },
    },
    'e-commerce': {
      starter: {
        title: 'Starter',
        blurb: 'Shop-Grundsetup',
        highlights: ['Shop-Grundsetup', 'Katalogstruktur Start', 'Checkout-Basis', 'Rechtstexte-Hinweis', 'Digitales Briefing'],
      },
      growth: {
        title: 'Growth',
        blurb: 'Checkout & Conversion',
        highlights: ['Checkout & Zahlungen', 'Conversion-Fokus', 'Produktstruktur', 'Versandregeln Start', 'Digitales Briefing'],
      },
      scale: {
        title: 'Scale',
        blurb: 'Erweiterter Shop-Stack',
        highlights: ['Erweiterter Stack', 'Versand & Regeln', 'Wachstums-Scope', 'Angebot zur Feinabstimmung'],
      },
    },
    'digital-marketing': {
      audit: {
        title: 'Audit',
        blurb: 'Status & Quick Wins',
        highlights: ['Status-Check', 'Quick Wins', 'Priorisierte Empfehlungen', 'Digitales Briefing'],
      },
      campaign: {
        title: 'Campaign',
        blurb: 'Kampagnen-Startpaket',
        highlights: ['Kampagnen-Start', 'Konten & Tracking Start', 'Content-Grundlage', 'Digitales Briefing'],
      },
      sea: {
        title: 'SEA Start',
        blurb: 'Leichte Google-Ads-Betreuung (Stunden-Deckel)',
        highlights: [
          'Begrenzte Optimierungsstunden / Monat',
          'Kampagnen-Check & Reporting',
          'Conversion-Fokus',
          'Werbebudget separat (Kunde zahlt Google)',
          'Kein Full-Service wie große SEA-Retainers',
        ],
      },
      'seo-pflege': {
        title: 'SEO Pflege',
        blurb: 'Monatliche SEO-Betreuung',
        highlights: [
          '1 Inhalt neu/überarbeitet / Monat',
          'Technische Basis-Checks',
          'Google-Unternehmensprofil Pflege',
          'Monatsbericht',
          'Orientierungspreis — Scope im Briefing',
        ],
      },
      social: {
        title: 'Social',
        blurb: 'Facebook & Instagram Betreuung',
        highlights: [
          'Posts & Community-Reaktion',
          'Agenturhonorar monatlich',
          'Optional: Ads-Budget separat',
          'Mindestlaufzeit im Briefing klären',
          'Orientierungspreis',
        ],
      },
      retainer: {
        title: 'Retainer',
        blurb: 'Laufende Performance',
        highlights: ['SEO & Content-Fokus', 'Laufende Betreuung', 'Reporting-Start', 'Monatliche Abrechnung'],
      },
    },
    'offline-marketing': {
      print: {
        title: 'Print',
        blurb: 'Druckmedien-Konzept (Startbetrag)',
        highlights: ['Druckmedien-Konzept', 'Visuelle Richtung', 'Produktion/Druck separat', 'Digitales Briefing'],
      },
      campaign: {
        title: 'Kampagne',
        blurb: 'Offline-Kampagne vor Ort',
        highlights: ['Kampagnen-Konzept', 'Medienmix skizziert', 'Umsetzung vor Ort', 'Angebot zur Feinabstimmung'],
      },
      event: {
        title: 'Event',
        blurb: 'Event-Auftritt & Produktion',
        highlights: ['Event-Auftritt', 'Produktion & Montage', 'Markenpräsenz vor Ort', 'Angebot zur Feinabstimmung'],
      },
    },
  },
  addons: {
    general: {
      priority: { title: 'Priorität', blurb: 'Schnellere Rückmeldung' },
      competitor: { title: 'Wettbewerbs-Check', blurb: 'Kurzanalyse Mitbewerber' },
    },
    'web-hosting': {
      migration: { title: 'Migration', blurb: 'Umzug vom alten Hoster' },
      'ssl-backup': { title: 'SSL + Backup-Plus', blurb: 'Erweiterte Absicherung' },
      monitoring: { title: 'Monitoring', blurb: 'Verfügbarkeits-Überwachung' },
    },
    'mobile-app': {
      'ui-kit': { title: 'UI-Kit', blurb: 'Design-System Basis' },
      'store-assets': { title: 'Store Assets', blurb: 'Icons & Screenshots' },
      'api-extra': { title: 'API Extra', blurb: 'Zusätzliche Schnittstelle' },
    },
    'web-development': {
      cms: { title: 'CMS', blurb: 'Inhalte selbst pflegen' },
      'seo-tech': { title: 'Tech-SEO', blurb: 'Grundlagen für Suche' },
      forms: { title: 'Formulare', blurb: 'Kontakt & Lead-Flows' },
    },
    'e-commerce': {
      payments: { title: 'Zahlungen', blurb: 'Payment-Anbindung' },
      catalog: { title: 'Katalog', blurb: 'Produktstruktur Setup' },
      shipping: { title: 'Versand', blurb: 'Versandregeln & Zonen' },
    },
    'digital-marketing': {
      'ads-setup': { title: 'Ads Setup', blurb: 'Konten & Tracking' },
      'content-pack': { title: 'Content Pack', blurb: 'Starttexte & Assets' },
      reporting: { title: 'Reporting', blurb: 'KPI-Dashboard Start' },
    },
    'offline-marketing': {
      design: { title: 'Design', blurb: 'Visuelles Konzept' },
      'print-prod': { title: 'Druckproduktion', blurb: 'Produktion & Abstimmung' },
      install: { title: 'Montage', blurb: 'Aufbau vor Ort' },
    },
  },
}

export const bookingShopEn: BookingShopCopy = {
  packageHeading: 'Choose a package',
  addonsHeading: 'Add-ons (optional)',
  addonsHint: 'Pick any extras — the total updates instantly.',
  recommended: 'Recommended',
  fromLabel: 'from',
  runningTotal: 'Subtotal',
  packageLabel: 'Package',
  addonsSummary: 'Add-ons',
  packages: {
    general: {
      kickoff: {
        title: 'Kickoff',
        blurb: 'Short consult & next step',
        highlights: ['Short consult', 'Clear next step', 'Digital briefing'],
      },
      briefing: {
        title: 'Briefing',
        blurb: 'Goals, scope & recommendation',
        highlights: ['Goals & scope', 'Documented recommendation', 'Digital briefing'],
      },
      roadmap: {
        title: 'Roadmap',
        blurb: 'Prioritised project roadmap',
        highlights: ['Prioritised roadmap', 'Milestones sketched', 'Digital briefing'],
      },
    },
    'web-hosting': {
      shared: {
        title: 'Shared',
        blurb: 'Lean sites & CMS',
        highlights: ['Setup for lean sites', 'CMS-ready base', 'SSL & backup basics', 'Digital briefing'],
      },
      vps: {
        title: 'VPS',
        blurb: 'More power & control',
        highlights: ['More resources', 'More control', 'Ops & hardening start', 'Digital briefing'],
      },
      care: {
        title: 'Care',
        blurb: 'Maintenance with hour cap (hosting separate)',
        highlights: [
          'Updates & backups',
          'Security checks',
          'Up to ~1 h support / month',
          'Hosting/domain not included',
          'Orientation price — terms in briefing',
        ],
      },
      'care-pro': {
        title: 'Care Pro',
        blurb: 'More care & faster replies',
        highlights: [
          'Everything in Care',
          'Up to ~2 h support / month',
          'Small content edits',
          'Hosting/domain not included',
          'Orientation price — terms in briefing',
        ],
      },
      dedicated: {
        title: 'Dedicated',
        blurb: 'High load & isolation',
        highlights: ['Higher load capacity', 'Isolation & control', 'Custom setup', 'Quote for fine-tuning'],
      },
    },
    'mobile-app': {
      mvp: {
        title: 'MVP',
        blurb: 'Core features to validate',
        highlights: ['Core features', 'UX concept start', 'Validate before launch', 'Digital briefing'],
      },
      launch: {
        title: 'Launch',
        blurb: 'Store-ready foundation',
        highlights: ['Store-ready foundation', 'UI & assets start', 'API wiring sketched', 'Quote for fine-tuning'],
      },
      scale: {
        title: 'Scale',
        blurb: 'Expanded product setup',
        highlights: ['Expanded setup', 'More integrations', 'Growth scope', 'Quote for fine-tuning'],
      },
    },
    'web-development': {
      landing: {
        title: 'Landing',
        blurb: 'One strong entry page',
        highlights: ['One entry page', 'Responsive & fast', 'Contact / lead form', 'GDPR foundations', 'Digital briefing'],
      },
      business: {
        title: 'Business',
        blurb: 'Multi-page company site',
        highlights: ['Multi-page structure', 'CMS-ready base', 'Tech-SEO foundations', 'Analytics start', 'Digital briefing'],
      },
      custom: {
        title: 'Custom',
        blurb: 'Tailored web app',
        highlights: ['Custom scope', 'App / data model start', 'Integrations possible', 'Quote for fine-tuning'],
      },
    },
    'e-commerce': {
      starter: {
        title: 'Starter',
        blurb: 'Shop foundation',
        highlights: ['Shop foundation', 'Catalogue structure start', 'Checkout base', 'Legal-text guidance', 'Digital briefing'],
      },
      growth: {
        title: 'Growth',
        blurb: 'Checkout & conversion',
        highlights: ['Checkout & payments', 'Conversion focus', 'Product structure', 'Shipping rules start', 'Digital briefing'],
      },
      scale: {
        title: 'Scale',
        blurb: 'Extended shop stack',
        highlights: ['Extended stack', 'Shipping & rules', 'Growth scope', 'Quote for fine-tuning'],
      },
    },
    'digital-marketing': {
      audit: {
        title: 'Audit',
        blurb: 'Status & quick wins',
        highlights: ['Status check', 'Quick wins', 'Prioritised recommendations', 'Digital briefing'],
      },
      campaign: {
        title: 'Campaign',
        blurb: 'Campaign start pack',
        highlights: ['Campaign kickoff', 'Accounts & tracking start', 'Content foundation', 'Digital briefing'],
      },
      sea: {
        title: 'SEA Start',
        blurb: 'Light Google Ads care (hour-capped)',
        highlights: [
          'Limited optimisation hours / month',
          'Campaign check & reporting',
          'Conversion focus',
          'Ad spend separate (client pays Google)',
          'Not full-service SEA retainers',
        ],
      },
      'seo-pflege': {
        title: 'SEO Care',
        blurb: 'Monthly SEO retainership',
        highlights: [
          '1 new/updated piece of content / month',
          'Technical baseline checks',
          'Google Business Profile care',
          'Monthly report',
          'Orientation price — scope in briefing',
        ],
      },
      social: {
        title: 'Social',
        blurb: 'Facebook & Instagram care',
        highlights: [
          'Posts & community replies',
          'Monthly agency fee',
          'Optional: ads budget separate',
          'Minimum term clarified in briefing',
          'Orientation price',
        ],
      },
      retainer: {
        title: 'Retainer',
        blurb: 'Ongoing performance',
        highlights: ['SEO & content focus', 'Ongoing care', 'Reporting start', 'Billed monthly'],
      },
    },
    'offline-marketing': {
      print: {
        title: 'Print',
        blurb: 'Print media concept (start amount)',
        highlights: ['Print media concept', 'Visual direction', 'Print/production separate', 'Digital briefing'],
      },
      campaign: {
        title: 'Campaign',
        blurb: 'Offline campaign on-site',
        highlights: ['Campaign concept', 'Media mix sketched', 'On-site execution', 'Quote for fine-tuning'],
      },
      event: {
        title: 'Event',
        blurb: 'Event presence & production',
        highlights: ['Event presence', 'Production & install', 'On-site brand presence', 'Quote for fine-tuning'],
      },
    },
  },
  addons: {
    general: {
      priority: { title: 'Priority', blurb: 'Faster follow-up' },
      competitor: { title: 'Competitor check', blurb: 'Short rival scan' },
    },
    'web-hosting': {
      migration: { title: 'Migration', blurb: 'Move from old host' },
      'ssl-backup': { title: 'SSL + Backup Plus', blurb: 'Extra protection' },
      monitoring: { title: 'Monitoring', blurb: 'Uptime watching' },
    },
    'mobile-app': {
      'ui-kit': { title: 'UI kit', blurb: 'Design-system starter' },
      'store-assets': { title: 'Store assets', blurb: 'Icons & screenshots' },
      'api-extra': { title: 'API extra', blurb: 'Additional integration' },
    },
    'web-development': {
      cms: { title: 'CMS', blurb: 'Edit content yourself' },
      'seo-tech': { title: 'Tech SEO', blurb: 'Search foundations' },
      forms: { title: 'Forms', blurb: 'Contact & lead flows' },
    },
    'e-commerce': {
      payments: { title: 'Payments', blurb: 'Payment connection' },
      catalog: { title: 'Catalogue', blurb: 'Product structure setup' },
      shipping: { title: 'Shipping', blurb: 'Rules & zones' },
    },
    'digital-marketing': {
      'ads-setup': { title: 'Ads setup', blurb: 'Accounts & tracking' },
      'content-pack': { title: 'Content pack', blurb: 'Starter copy & assets' },
      reporting: { title: 'Reporting', blurb: 'KPI dashboard start' },
    },
    'offline-marketing': {
      design: { title: 'Design', blurb: 'Visual concept' },
      'print-prod': { title: 'Print production', blurb: 'Production & alignment' },
      install: { title: 'Install', blurb: 'On-site setup' },
    },
  },
}

export const bookingShopAr: BookingShopCopy = {
  packageHeading: 'اختاروا الباقة',
  addonsHeading: 'إضافات (اختياري)',
  addonsHint: 'يمكن اختيار عدة إضافات — يتحدث المجموع فوراً.',
  recommended: 'موصى به',
  fromLabel: 'من',
  runningTotal: 'المجموع الفرعي',
  packageLabel: 'الباقة',
  addonsSummary: 'الإضافات',
  packages: {
    general: {
      kickoff: {
        title: 'انطلاقة',
        blurb: 'استشارة قصيرة والخطوة التالية',
        highlights: ['استشارة قصيرة', 'خطوة تالية واضحة', 'إحاطة رقمية'],
      },
      briefing: {
        title: 'إحاطة',
        blurb: 'أهداف ونطاق وتوصية',
        highlights: ['أهداف ونطاق', 'توصية موثّقة', 'إحاطة رقمية'],
      },
      roadmap: {
        title: 'خارطة طريق',
        blurb: 'أولويات المشروع',
        highlights: ['خارطة أولويات', 'معالم مرسومة', 'إحاطة رقمية'],
      },
    },
    'web-hosting': {
      shared: {
        title: 'مشترك',
        blurb: 'مواقع خفيفة وCMS',
        highlights: ['إعداد لمواقع خفيفة', 'أساس مناسب لـ CMS', 'SSL ونسخ احتياطي أساسي', 'إحاطة رقمية'],
      },
      vps: {
        title: 'VPS',
        blurb: 'أداء وتحكم أكبر',
        highlights: ['موارد أكبر', 'تحكم أكثر', 'بداية تشغيل وتأمين', 'إحاطة رقمية'],
      },
      care: {
        title: 'رعاية',
        blurb: 'صيانة بحد ساعات (الاستضافة منفصلة)',
        highlights: [
          'تحديثات ونسخ احتياطي',
          'فحوصات أمان',
          'حتى ساعة دعم تقريباً / شهر',
          'الاستضافة/النطاق غير مشمولة',
          'سعر توجيهي — الشروط في الإحاطة',
        ],
      },
      'care-pro': {
        title: 'رعاية برو',
        blurb: 'رعاية أكثر ورد أسرع',
        highlights: [
          'كل ما في Care',
          'حتى ساعتين دعم تقريباً / شهر',
          'تعديلات محتوى صغيرة',
          'الاستضافة/النطاق غير مشمولة',
          'سعر توجيهي — الشروط في الإحاطة',
        ],
      },
      dedicated: {
        title: 'مخصص',
        blurb: 'حمل عالٍ وعزل',
        highlights: ['قدرة حمل أعلى', 'عزل وتحكم', 'إعداد مخصص', 'عرض سعر للضبط'],
      },
    },
    'mobile-app': {
      mvp: {
        title: 'MVP',
        blurb: 'وظائف أساسية للتجربة',
        highlights: ['وظائف أساسية', 'بداية مفهوم UX', 'تحقق قبل الإطلاق', 'إحاطة رقمية'],
      },
      launch: {
        title: 'إطلاق',
        blurb: 'أساس جاهز للمتاجر',
        highlights: ['أساس جاهز للمتاجر', 'بداية واجهة وأصول', 'تخطيط ربط API', 'عرض سعر للضبط'],
      },
      scale: {
        title: 'توسّع',
        blurb: 'إعداد منتج أوسع',
        highlights: ['إعداد موسّع', 'تكاملات أكثر', 'نطاق نمو', 'عرض سعر للضبط'],
      },
    },
    'web-development': {
      landing: {
        title: 'صفحة هبوط',
        blurb: 'صفحة دخول قوية',
        highlights: ['صفحة دخول واحدة', 'متجاوب وسريع', 'نموذج تواصل / عملاء', 'أساس GDPR', 'إحاطة رقمية'],
      },
      business: {
        title: 'أعمال',
        blurb: 'موقع شركة متعدد الصفحات',
        highlights: ['هيكل متعدد الصفحات', 'أساس جاهز لـ CMS', 'أساسيات SEO تقني', 'بداية التحليلات', 'إحاطة رقمية'],
      },
      custom: {
        title: 'مخصص',
        blurb: 'تطبيق ويب حسب الطلب',
        highlights: ['نطاق مخصص', 'بداية نموذج التطبيق / البيانات', 'تكاملات ممكنة', 'عرض سعر للضبط'],
      },
    },
    'e-commerce': {
      starter: {
        title: 'بداية',
        blurb: 'أساس المتجر',
        highlights: ['أساس المتجر', 'بداية هيكل الكتالوج', 'أساس الدفع', 'إرشاد النصوص القانونية', 'إحاطة رقمية'],
      },
      growth: {
        title: 'نمو',
        blurb: 'دفع وتحويل',
        highlights: ['دفع ومدفوعات', 'تركيز التحويل', 'هيكل المنتجات', 'بداية قواعد الشحن', 'إحاطة رقمية'],
      },
      scale: {
        title: 'توسّع',
        blurb: 'حزمة متجر أوسع',
        highlights: ['حزمة أوسع', 'شحن وقواعد', 'نطاق نمو', 'عرض سعر للضبط'],
      },
    },
    'digital-marketing': {
      audit: {
        title: 'تدقيق',
        blurb: 'وضع حالي وفرص سريعة',
        highlights: ['فحص الوضع', 'فرص سريعة', 'توصيات مرتّبة', 'إحاطة رقمية'],
      },
      campaign: {
        title: 'حملة',
        blurb: 'حزمة بدء الحملة',
        highlights: ['انطلاق الحملة', 'بداية حسابات وتتبع', 'أساس المحتوى', 'إحاطة رقمية'],
      },
      sea: {
        title: 'SEA Start',
        blurb: 'رعاية Google Ads خفيفة (بحد ساعات)',
        highlights: [
          'ساعات تحسين محدودة / شهر',
          'فحص حملات وتقارير',
          'تركيز التحويل',
          'ميزانية الإعلان منفصلة (يدفعها العميل لـ Google)',
          'ليست رعاية SEA كاملة مثل الوكالات الكبيرة',
        ],
      },
      'seo-pflege': {
        title: 'رعاية SEO',
        blurb: 'اشتراك SEO شهري',
        highlights: [
          'محتوى واحد جديد/محدّث / شهر',
          'فحوصات تقنية أساسية',
          'رعاية ملف Google للأعمال',
          'تقرير شهري',
          'سعر توجيهي — النطاق في الإحاطة',
        ],
      },
      social: {
        title: 'سوشيال',
        blurb: 'رعاية Facebook و Instagram',
        highlights: [
          'منشورات وردود المجتمع',
          'أتعاب وكالة شهرية',
          'اختياري: ميزانية إعلانات منفصلة',
          'الحد الأدنى للعقد يُوضح في الإحاطة',
          'سعر توجيهي',
        ],
      },
      retainer: {
        title: 'اشتراك',
        blurb: 'أداء مستمر',
        highlights: ['تركيز SEO ومحتوى', 'رعاية مستمرة', 'بداية التقارير', 'فوترة شهرية'],
      },
    },
    'offline-marketing': {
      print: {
        title: 'طباعة',
        blurb: 'مفهوم مواد مطبوعة (مبلغ بداية)',
        highlights: ['مفهوم مواد مطبوعة', 'اتجاه بصري', 'الطباعة/الإنتاج منفصل', 'إحاطة رقمية'],
      },
      campaign: {
        title: 'حملة',
        blurb: 'حملة ميدانية',
        highlights: ['مفهوم الحملة', 'مزيج إعلامي مرسوم', 'تنفيذ ميداني', 'عرض سعر للضبط'],
      },
      event: {
        title: 'فعالية',
        blurb: 'حضور وإنتاج للفعالية',
        highlights: ['حضور الفعالية', 'إنتاج وتركيب', 'حضور العلامة ميدانياً', 'عرض سعر للضبط'],
      },
    },
  },
  addons: {
    general: {
      priority: { title: 'أولوية', blurb: 'رد أسرع' },
      competitor: { title: 'منافسة', blurb: 'مسح سريع للمنافسين' },
    },
    'web-hosting': {
      migration: { title: 'ترحيل', blurb: 'نقل من الاستضافة القديمة' },
      'ssl-backup': { title: 'SSL + نسخ احتياطي', blurb: 'حماية إضافية' },
      monitoring: { title: 'مراقبة', blurb: 'مراقبة التوفّر' },
    },
    'mobile-app': {
      'ui-kit': { title: 'واجهة', blurb: 'أساس نظام التصميم' },
      'store-assets': { title: 'أصول المتجر', blurb: 'أيقونات ولقطات' },
      'api-extra': { title: 'API إضافي', blurb: 'تكامل إضافي' },
    },
    'web-development': {
      cms: { title: 'CMS', blurb: 'تحرير المحتوى ذاتياً' },
      'seo-tech': { title: 'SEO تقني', blurb: 'أساسيات البحث' },
      forms: { title: 'نماذج', blurb: 'تواصل ومسار عملاء' },
    },
    'e-commerce': {
      payments: { title: 'مدفوعات', blurb: 'ربط الدفع' },
      catalog: { title: 'كتالوج', blurb: 'هيكل المنتجات' },
      shipping: { title: 'شحن', blurb: 'قواعد ومناطق' },
    },
    'digital-marketing': {
      'ads-setup': { title: 'إعداد إعلانات', blurb: 'حسابات وتتبع' },
      'content-pack': { title: 'حزمة محتوى', blurb: 'نصوص وأصول للبداية' },
      reporting: { title: 'تقارير', blurb: 'بدء لوحة مؤشرات' },
    },
    'offline-marketing': {
      design: { title: 'تصميم', blurb: 'مفهوم بصري' },
      'print-prod': { title: 'إنتاج طباعة', blurb: 'إنتاج وتنسيق' },
      install: { title: 'تركيب', blurb: 'تركيب في الموقع' },
    },
  },
}
