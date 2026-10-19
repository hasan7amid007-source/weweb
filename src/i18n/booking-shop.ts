import type { BookingServiceKey } from '../features/booking/catalog'

export type ShopItemCopy = { title: string; blurb: string }

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
      kickoff: { title: 'Kickoff', blurb: 'Kurzberatung & nächster Schritt' },
      briefing: { title: 'Briefing', blurb: 'Ziele, Scope und Empfehlung' },
      roadmap: { title: 'Roadmap', blurb: 'Priorisierte Projekt-Roadmap' },
    },
    'web-hosting': {
      shared: { title: 'Shared', blurb: 'Schlanke Sites & CMS' },
      vps: { title: 'VPS', blurb: 'Mehr Leistung & Kontrolle' },
      dedicated: { title: 'Dedicated', blurb: 'Hohe Last & Isolation' },
    },
    'mobile-app': {
      mvp: { title: 'MVP', blurb: 'Kernfunktionen zum Testen' },
      launch: { title: 'Launch', blurb: 'Store-ready Basis' },
      scale: { title: 'Scale', blurb: 'Erweitertes Produkt-Setup' },
    },
    'web-development': {
      landing: { title: 'Landing', blurb: 'Eine starke Einstiegsseite' },
      business: { title: 'Business', blurb: 'Mehrseitige Firmenwebsite' },
      custom: { title: 'Custom', blurb: 'Individuelle Web-App' },
    },
    'e-commerce': {
      starter: { title: 'Starter', blurb: 'Shop-Grundsetup' },
      growth: { title: 'Growth', blurb: 'Checkout & Conversion' },
      scale: { title: 'Scale', blurb: 'Erweiterter Shop-Stack' },
    },
    'digital-marketing': {
      audit: { title: 'Audit', blurb: 'Status & Quick Wins' },
      campaign: { title: 'Campaign', blurb: 'Kampagnen-Startpaket' },
      retainer: { title: 'Retainer', blurb: 'Laufende Performance' },
    },
    'offline-marketing': {
      print: { title: 'Print', blurb: 'Druckmedien-Konzept' },
      campaign: { title: 'Kampagne', blurb: 'Offline-Kampagne vor Ort' },
      event: { title: 'Event', blurb: 'Event-Auftritt & Produktion' },
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
      kickoff: { title: 'Kickoff', blurb: 'Short consult & next step' },
      briefing: { title: 'Briefing', blurb: 'Goals, scope & recommendation' },
      roadmap: { title: 'Roadmap', blurb: 'Prioritised project roadmap' },
    },
    'web-hosting': {
      shared: { title: 'Shared', blurb: 'Lean sites & CMS' },
      vps: { title: 'VPS', blurb: 'More power & control' },
      dedicated: { title: 'Dedicated', blurb: 'High load & isolation' },
    },
    'mobile-app': {
      mvp: { title: 'MVP', blurb: 'Core features to validate' },
      launch: { title: 'Launch', blurb: 'Store-ready foundation' },
      scale: { title: 'Scale', blurb: 'Expanded product setup' },
    },
    'web-development': {
      landing: { title: 'Landing', blurb: 'One strong entry page' },
      business: { title: 'Business', blurb: 'Multi-page company site' },
      custom: { title: 'Custom', blurb: 'Tailored web app' },
    },
    'e-commerce': {
      starter: { title: 'Starter', blurb: 'Shop foundation' },
      growth: { title: 'Growth', blurb: 'Checkout & conversion' },
      scale: { title: 'Scale', blurb: 'Extended shop stack' },
    },
    'digital-marketing': {
      audit: { title: 'Audit', blurb: 'Status & quick wins' },
      campaign: { title: 'Campaign', blurb: 'Campaign start pack' },
      retainer: { title: 'Retainer', blurb: 'Ongoing performance' },
    },
    'offline-marketing': {
      print: { title: 'Print', blurb: 'Print media concept' },
      campaign: { title: 'Campaign', blurb: 'Offline campaign on-site' },
      event: { title: 'Event', blurb: 'Event presence & production' },
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
      kickoff: { title: 'انطلاقة', blurb: 'استشارة قصيرة والخطوة التالية' },
      briefing: { title: 'إحاطة', blurb: 'أهداف ونطاق وتوصية' },
      roadmap: { title: 'خارطة طريق', blurb: 'أولويات المشروع' },
    },
    'web-hosting': {
      shared: { title: 'مشترك', blurb: 'مواقع خفيفة وCMS' },
      vps: { title: 'VPS', blurb: 'أداء وتحكم أكبر' },
      dedicated: { title: 'مخصص', blurb: 'حمل عالٍ وعزل' },
    },
    'mobile-app': {
      mvp: { title: 'MVP', blurb: 'وظائف أساسية للتجربة' },
      launch: { title: 'إطلاق', blurb: 'أساس جاهز للمتاجر' },
      scale: { title: 'توسّع', blurb: 'إعداد منتج أوسع' },
    },
    'web-development': {
      landing: { title: 'صفحة هبوط', blurb: 'صفحة دخول قوية' },
      business: { title: 'أعمال', blurb: 'موقع شركة متعدد الصفحات' },
      custom: { title: 'مخصص', blurb: 'تطبيق ويب حسب الطلب' },
    },
    'e-commerce': {
      starter: { title: 'بداية', blurb: 'أساس المتجر' },
      growth: { title: 'نمو', blurb: 'دفع وتحويل' },
      scale: { title: 'توسّع', blurb: 'حزمة متجر أوسع' },
    },
    'digital-marketing': {
      audit: { title: 'تدقيق', blurb: 'وضع حالي وفرص سريعة' },
      campaign: { title: 'حملة', blurb: 'حزمة بدء الحملة' },
      retainer: { title: 'اشتراك', blurb: 'أداء مستمر' },
    },
    'offline-marketing': {
      print: { title: 'طباعة', blurb: 'مفهوم مواد مطبوعة' },
      campaign: { title: 'حملة', blurb: 'حملة ميدانية' },
      event: { title: 'فعالية', blurb: 'حضور وإنتاج للفعالية' },
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
