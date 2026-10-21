import type { PurchaseMode, ShopCategoryId } from '../features/booking/shop-catalog'

export type ShopPageCopy = {
  metaTitle: string
  metaDescription: string
  eyebrow: string
  title: string
  lead: string
  heroPrimaryCta: string
  heroSecondaryCta: string
  servicesTitle: string
  servicesLead: string
  servicesExplore: string
  servicesFrom: string
  catalogTitle: string
  catalogLead: string
  processTitle: string
  processLead: string
  processSteps: { title: string; body: string }[]
  finalCtaTitle: string
  finalCtaLead: string
  finalCtaBriefing: string
  finalCtaCatalog: string
  searchLabel: string
  searchPlaceholder: string
  filterAll: string
  filterModeLabel: string
  filterModeAll: string
  filterClear: string
  filterActiveLabel: string
  sortLabel: string
  sortPopular: string
  sortPriceAsc: string
  sortPriceDesc: string
  sortName: string
  modeCheckout: string
  modeSubscription: string
  modeQuote: string
  categories: Record<ShopCategoryId, { title: string; blurb: string }>
  results: (n: number) => string
  empty: string
  recommended: string
  fromLabel: string
  monthSuffix: string
  choosePlan: string
  viewDetails: string
  viewService: string
  planIncludes: string
  planIncludesSubscription: string
  startAmountNote: string
  subscriptionAmountNote: string
  quoteAmountNote: string
  priceKindCheckout: string
  priceKindSubscription: string
  priceKindQuote: string
  priceOnRequest: string
  vatNote: string
  missingTerms: string
  detailBack: string
  breadcrumbNav: string
  breadcrumbShop: string
  relatedTitle: string
  scopeTitle: string
  scopeBody: string
  exclusionsTitle: string
  exclusionsBody: string
  deliveryTitle: string
  deliveryBody: string
  extrasTitle: string
  extrasBody: string
  ctaCheckout: string
  ctaSubscription: string
  ctaSubscriptionShort: string
  ctaQuote: string
  ctaBriefing: string
  ctaService: string
  quoteTitle: string
  quoteLead: string
  quoteEyebrow: string
  quoteAsideTitle: string
  quoteSteps: string[]
  quoteResponseNote: string
  quoteSelectedPackage: string
  quoteName: string
  quoteEmail: string
  quotePhone: string
  quoteCompany: string
  quoteService: string
  quoteBudget: string
  quoteBudgetOptions: { value: string; label: string }[]
  quoteTiming: string
  quoteTimingOptions: { value: string; label: string }[]
  quoteMessage: string
  quoteMessageHint: string
  quoteSubmit: string
  quoteHint: string
  quoteSuccess: string
  quoteEmailVisible: string
  quoteCopySummary: string
  quoteCopied: string
  quoteCopyFailed: string
  modeBadge: Record<PurchaseMode, string>
  cartTitle: string
  cartEmpty: string
  cartCount: (n: number) => string
  cartAdd: string
  cartAdded: string
  cartUpdated: string
  cartDuplicate: string
  cartFull: string
  buyboxTotal: string
  extrasSelectHint: string
  subscriptionNoExtras: string
  cartRemove: string
  cartEdit: string
  cartViewPackage: string
  cartOnceLabel: string
  cartMonthlyLabel: string
  cartMixedBilling: string
  cartSingleItemOnly: string
  cartClear: string
  cartCheckout: string
  cartOpen: string
  cartName: string
  cartEmail: string
  cartPayHint: string
  cartProcessing: string
  cartError: string
  checkoutUnavailable: string
  termsGateNote: string
  orientationAmountNote: string
  afterOrderTitle: string
  afterOrderSteps: string[]
  afterOrderNote: string
  printSummary: string
  compareAdd: string
  compareOpen: string
  compareClear: string
  compareClose: string
  compareTitle: string
  compareFeature: string
  compareCount: (n: number) => string
  taxonomyNote: string
  faqTitle: string
  faq: { q: string; a: string }[]
}

export const shopPageDe: ShopPageCopy = {
  metaTitle: 'Shop — BDITEC Agentur-Pakete',
  metaDescription:
    'BDITEC Shop: feste Startpakete online bestellen oder individuelles Angebot anfragen — Web, Marketing, SEO, Hosting, Apps und Offline.',
  eyebrow: 'BDITEC Shop',
  title: 'Digitale & Marketing-Lösungen mit klaren Paketen',
  lead:
    'Wählen Sie ein Startpaket für Web, Shop, App, Marketing, Hosting oder Offline — dann beschreiben Sie Ihr Projekt im Briefing. Beträge sind Orientierung bzw. Startwerte aus dem Katalog; der Server prüft Preise vor dem Checkout.',
  heroPrimaryCta: 'Pakete ansehen',
  heroSecondaryCta: 'Projekt beschreiben',
  servicesTitle: 'Leistungsbereiche',
  servicesLead: 'Sechs Service-Linien — jeweils mit Paketen aus dem aktuellen Katalog.',
  servicesExplore: 'Pakete öffnen',
  servicesFrom: 'ab',
  catalogTitle: 'Pakete vergleichen',
  catalogLead: 'Filter und Sortierung nutzen — oder nach Service gruppieren.',
  processTitle: 'So starten Sie',
  processLead: 'Der Soft-Launch-Ablauf, wie er heute im Shop und Briefing abgebildet ist.',
  processSteps: [
    {
      title: 'Service & Paket wählen',
      body: 'Vergleichen Sie Startbetrag, Monatlich oder Angebot — nur freigegebene Pakete lassen sich online kaufen.',
    },
    {
      title: 'Projekt beschreiben',
      body: 'Das Briefing sichert Ihre Angaben dauerhaft (wenn Speicher konfiguriert ist) und verknüpft sie mit dem gewählten Paket.',
    },
    {
      title: 'Prüfung & Abstimmung',
      body: 'Wir prüfen das Briefing. Bei Bedarf folgt ein Angebot oder eine Feinabstimmung des Umfangs.',
    },
    {
      title: 'Checkout oder Angebot',
      body: 'Passendes Briefing + Zugangstoken freigeben den Demo-/Test-Checkout. Sonst Angebot per E-Mail — ohne erfundene Zahlung im Soft-Launch.',
    },
    {
      title: 'Umsetzung digital',
      body: 'Abstimmung und Lieferung erfolgen digital; konkrete Termine nach Briefing — keine festen Lieferzeiten auf dieser Seite.',
    },
  ],
  finalCtaTitle: 'Bereit für den nächsten Schritt?',
  finalCtaLead: 'Pakete vergleichen oder direkt mit dem Projekt-Briefing starten.',
  finalCtaBriefing: 'Projekt beschreiben',
  finalCtaCatalog: 'Zu den Paketen',
  searchLabel: 'Pakete suchen',
  searchPlaceholder: 'z. B. Audit, Landing, Hosting…',
  filterAll: 'Alle Kategorien',
  filterModeLabel: 'Kaufart',
  filterModeAll: 'Alle',
  filterClear: 'Filter zurücksetzen',
  filterActiveLabel: 'Aktive Filter',
  sortLabel: 'Sortieren',
  sortPopular: 'Beliebtheit',
  sortPriceAsc: 'Preis: aufsteigend',
  sortPriceDesc: 'Preis: absteigend',
  sortName: 'Name A–Z',
  modeCheckout: 'Startbetrag',
  modeSubscription: 'Monatlich',
  modeQuote: 'Angebot',
  categories: {
    'web-design': {
      title: 'Webdesign & Entwicklung',
      blurb: 'Landingpages, Firmenwebsites, Shops und Custom-Web',
    },
    'digital-marketing': {
      title: 'Digitales Marketing',
      blurb: 'Kampagnen-Starts und laufende Performance',
    },
    'seo-analytics': {
      title: 'SEO & Analytics',
      blurb: 'Audits, Sichtbarkeit und Reporting-Grundlage',
    },
    'hosting-support': {
      title: 'Hosting & Support',
      blurb: 'Setup, Betrieb und technische Betreuung',
    },
    'mobile-app': {
      title: 'Mobile Apps',
      blurb: 'MVP-Kickoff bis Launch — oft mit Angebot',
    },
    'offline-marketing': {
      title: 'Offline-Marketing',
      blurb: 'Print, Events, Außenwerbung und Produktion',
    },
  },
  results: (n) => (n === 1 ? '1 Paket' : `${n} Pakete`),
  empty: 'Keine Pakete für diese Filter. Filter zurücksetzen oder Angebot anfragen.',
  recommended: 'Empfohlen',
  fromLabel: 'ab',
  monthSuffix: '/ Monat',
  choosePlan: 'Plan wählen',
  viewDetails: 'Details ansehen',
  viewService: 'Zur Service-Seite',
  planIncludes: 'Enthalten im Start',
  planIncludesSubscription: 'Orientierung (monatlich)',
  startAmountNote:
    'Angezeigter Betrag ist ein Start-/Anzahlungswert in EUR und wird auf das Projekt angerechnet — kein Festpreis für das Gesamtprojekt.',
  subscriptionAmountNote:
    'Monatsbetrag (Orientierung). Werbebudget, Hosting und Lizenzen nur wenn ausdrücklich genannt.',
  quoteAmountNote:
    'Preis auf Anfrage — der Leistungsumfang wird vor der Bestellung im Angebot geklärt. Kein Online-Kauf für dieses Paket.',
  priceKindCheckout: 'Startbetrag',
  priceKindSubscription: 'pro Monat',
  priceKindQuote: 'Auf Anfrage',
  priceOnRequest: 'Preis auf Anfrage',
  vatNote: 'Alle Beträge in EUR zzgl. MwSt., sofern nicht anders angegeben (B2B-Hinweis — bitte bei Bedarf rechtlich prüfen).',
  missingTerms:
    'Angezeigte Beträge sind Orientierungswerte, kein Agentur-Festpreis. Der aufgelistete Leistungsumfang gilt als Orientierung vor der Bestellung; Feinabstimmung im Briefing.',
  detailBack: 'Alle Pläne',
  breadcrumbNav: 'Brotkrumen',
  breadcrumbShop: 'Shop',
  relatedTitle: 'Weitere Pläne in diesem Service',
  scopeTitle: 'Leistungsumfang (Orientierung)',
  scopeBody:
    'Die aufgelisteten Punkte beschreiben den Orientierungs-Leistungsumfang vor der Bestellung. Feinabstimmung folgt im Briefing — ohne dass hier feste Mindestlaufzeiten oder Kündigungsfristen zugesichert werden.',
  exclusionsTitle: 'Nicht automatisch enthalten',
  exclusionsBody:
    'Medienbudget, Drittanbieter-Lizenzen, Sonderwünsche außerhalb des Pakets und laufende Werbekosten sind nicht pauschal enthalten — Details im Briefing.',
  deliveryTitle: 'Ablauf & Lieferung',
  deliveryBody:
    'Nach Zahlung bzw. Angebotsannahme folgt ein digitales Briefing und die Datei-/Zugangsabfrage. Konkrete Termine werden dann vereinbart — keine festen Lieferzeiten auf dieser Seite.',
  extrasTitle: 'Optionale Extras',
  extrasBody: 'Extras können im Checkout-Assistenten ergänzt werden.',
  ctaCheckout: 'Zur Bestellung',
  ctaSubscription: 'Abo starten (Checkout)',
  ctaSubscriptionShort: 'Abo wählen',
  ctaQuote: 'Angebot anfragen',
  ctaBriefing: 'Erzählen Sie uns von Ihrem Projekt',
  ctaService: 'Service-Seite',
  quoteTitle: 'Individuelles Angebot anfragen',
  quoteLead:
    'Für individuelle Projekte und Monats-Pakete ohne Sofortkauf: kurz beschreiben, was Sie brauchen — wir antworten per E-Mail. In diesem Schritt findet keine Zahlung statt.',
  quoteEyebrow: 'BDITEC Anfrage',
  quoteAsideTitle: 'So läuft die Anfrage',
  quoteSteps: [
    'Formular ausfüllen — Paket und Bereich werden mitgeschickt, wenn ausgewählt',
    'E-Mail-Entwurf prüfen und absenden (oder Zusammenfassung kopieren)',
    'Wir melden uns mit Rückfragen oder einem konkreten Angebot',
  ],
  quoteResponseNote:
    'Keine festen Antwortzeiten auf dieser Seite. Ohne abgesendete E-Mail ist die Anfrage nicht bei uns eingegangen.',
  quoteSelectedPackage: 'Gewähltes Paket',
  quoteName: 'Name',
  quoteEmail: 'E-Mail',
  quotePhone: 'Telefon (optional)',
  quoteCompany: 'Unternehmen (optional)',
  quoteService: 'Leistungsbereich',
  quoteBudget: 'Budgetrahmen (optional, Orientierung)',
  quoteBudgetOptions: [
    { value: '', label: 'Noch offen' },
    { value: 'under-1k', label: 'Unter 1.000 €' },
    { value: '1k-3k', label: 'ca. 1.000–3.000 €' },
    { value: '3k-8k', label: 'ca. 3.000–8.000 €' },
    { value: '8k-plus', label: 'Über 8.000 €' },
  ],
  quoteTiming: 'Zeitrahmen (optional)',
  quoteTimingOptions: [
    { value: '', label: 'Noch offen' },
    { value: 'asap', label: 'So bald wie sinnvoll' },
    { value: '1-3m', label: 'In 1–3 Monaten' },
    { value: 'later', label: 'Später / Planung' },
  ],
  quoteMessage: 'Projektbeschreibung',
  quoteMessageHint:
    'Ziele, Ist-Zustand, gewünschte Ergebnisse — je klarer, desto gezielter die Rückmeldung. Keine Passwörter oder Zugangsdaten hier eintragen.',
  quoteSubmit: 'Anfrage per E-Mail vorbereiten',
  quoteHint:
    'Öffnet Ihr E-Mail-Programm mit vorausgefülltem Text. Gesendet ist die Anfrage erst, wenn Sie die E-Mail absenden. Es wird kein Konto angelegt.',
  quoteSuccess:
    'Entwurf vorbereitet. Bitte die E-Mail absenden — oder die Zusammenfassung kopieren und an info@bditec.com senden.',
  quoteEmailVisible: 'Direkt an',
  quoteCopySummary: 'Zusammenfassung kopieren',
  quoteCopied: 'Kopiert',
  quoteCopyFailed: 'Kopieren nicht möglich — bitte manuell markieren',
  modeBadge: {
    checkout: 'Startbetrag',
    subscription: 'Monatlich',
    quote: 'Angebot',
  },
  cartTitle: 'Warenkorb',
  cartEmpty: 'Noch keine Pakete im Warenkorb.',
  cartCount: (n) => (n === 1 ? '1 Artikel' : `${n} Artikel`),
  cartAdd: 'In den Warenkorb',
  cartAdded: 'Hinzugefügt',
  cartUpdated: 'Warenkorb aktualisiert',
  cartDuplicate: 'Bereits im Warenkorb',
  cartFull: 'Warenkorb voll (max. 8)',
  buyboxTotal: 'Zwischensumme',
  extrasSelectHint: 'Optionale Extras — Betrag aktualisiert sich sofort.',
  subscriptionNoExtras:
    'Monatspakete ohne einmalige Extras im Warenkorb — Extras nur bei Startbetrag-Paketen.',
  cartRemove: 'Entfernen',
  cartEdit: 'Extras bearbeiten',
  cartViewPackage: 'Paket ansehen',
  cartOnceLabel: 'Einmalig jetzt',
  cartMonthlyLabel: 'Monatlich',
  cartMixedBilling:
    'Einmalige und monatliche Pakete können nicht in einem Checkout kombiniert werden. Bitte den Warenkorb auf eine Kaufart beschränken oder ein Angebot anfragen.',
  cartSingleItemOnly:
    'Der Soft-Launch erlaubt aktuell nur ein Paket pro Bestellung. Bitte entfernen Sie weitere Positionen, schließen Sie das Briefing ab und zahlen Sie dann — nichts wird stillschweigend weggelassen.',
  cartClear: 'Leeren',
  cartCheckout: 'Zur Kasse',
  cartOpen: 'Warenkorb öffnen',
  cartName: 'Name',
  cartEmail: 'E-Mail',
  cartPayHint:
    'Beträge prüft der Server. Soft-Launch: ohne echte Kartenzahlung erscheint ein klar gekennzeichneter Demo-Auftrag.',
  cartProcessing: 'Checkout wird vorbereitet…',
  cartError: 'Checkout fehlgeschlagen. Bitte erneut versuchen oder Angebot anfragen.',
  checkoutUnavailable:
    'Die Online-Buchung ist derzeit nicht verfügbar. Bitte fragen Sie ein Angebot an.',
  termsGateNote:
    'Online-Kauf für dieses Monats-Paket ist vorübergehend nur über Angebot möglich — bis Mindestlaufzeit, Kündigung und verbindlicher Leistungsumfang freigegeben sind. Der angezeigte Betrag ist Orientierung.',
  orientationAmountNote: 'Orientierungsbetrag — noch kein Online-Checkout für dieses Paket.',
  afterOrderTitle: 'Nach Bestellung oder Angebot',
  afterOrderSteps: [
    'Bestätigung bzw. klar gekennzeichnete Demo-Kennzeichnung',
    'Digitales Briefing und Datei-/Zugangshinweise (keine Passwörter in Formularen)',
    'Abstimmung des Leistungsumfangs',
    'Umsetzung und Rückmeldung',
  ],
  afterOrderNote:
    'Der Aufruf einer Erfolgsseite allein beweist keine Zahlung. Demo-Aufträge sind klar gekennzeichnet. Liefertermine starten erst nach abgestimmtem Briefing — sofern nicht anders vereinbart.',
  printSummary: 'Zusammenfassung drucken',
  compareAdd: 'Vergleichen',
  compareOpen: 'Vergleich öffnen',
  compareClear: 'Auswahl leeren',
  compareClose: 'Schließen',
  compareTitle: 'Paketvergleich',
  compareFeature: 'Punkt',
  compareCount: (n) => `${n} Pakete ausgewählt (max. 3)`,
  taxonomyNote:
    'Hinweis: Shops (E-Commerce) liegen unter der Filterkategorie „Webdesign & Entwicklung“. SEO-Pakete nutzen den Filter „SEO & Analytics“, gehören aber zum Service Digitales Marketing.',
  faqTitle: 'Häufige Fragen',
  faq: [
    {
      q: 'Was ist in einem Paket enthalten?',
      a: 'Die Punkte auf der Paketkarte und in der Detailansicht beschreiben den Orientierungs-Leistungsumfang vor der Bestellung. Feinabstimmung erfolgt im Briefing — ohne dass hier Festpreise für das Gesamtprojekt zugesichert werden.',
    },
    {
      q: 'Welche Angaben sollte ich vorbereiten?',
      a: 'Ziele, Ist-Zustand, gewünschte Ergebnisse und — falls vorhanden — Links zu Markenmaterial. Keine Passwörter oder Zugangsgeheimnisse in Formularen eintragen.',
    },
    {
      q: 'Kann der Umfang angepasst werden?',
      a: 'Ja. Abweichungen und Sonderwünsche werden im Briefing oder Angebot geklärt und sind nicht automatisch im Katalogpreis enthalten.',
    },
    {
      q: 'Wie funktionieren monatliche Leistungen?',
      a: 'Monatsbeträge sind Orientierungshonorare pro Monat. Zeitkontingente und Ausschlüsse stehen in den Paketpunkten. Ohne freigegebene Kündigung/Mindestlaufzeit führt der Shop zum Angebot statt zum Sofortkauf.',
    },
    {
      q: 'Wann brauche ich ein Angebot?',
      a: 'Bei Angebot-Paketen, bei gesperrten Retainern und wenn Ihr Umfang über den Startpaket-Rahmen hinausgeht. Dann keine Online-Sofortzahlung.',
    },
    {
      q: 'Wie funktioniert das Briefing?',
      a: 'Sie beschreiben das Projekt schrittweise. Bei konfiguriertem Speicher erhalten Sie eine Briefing-Referenz und ein Zugangstoken für den passenden Checkout. Schlägt die Speicherung fehl, gibt es keinen Erfolg und keinen Checkout-Freigabe.',
    },
    {
      q: 'Ist die Online-Zahlung live?',
      a: 'Der Soft-Launch kann einen Demo-Checkout ohne echte Kartenzahlung nutzen. Live-Zahlung folgt nach Freigabe. Demo-Aufträge sind klar als Demo gekennzeichnet.',
    },
  ],
}

export const shopPageEn: ShopPageCopy = {
  metaTitle: 'Shop — BDITEC agency packages',
  metaDescription:
    'BDITEC shop: order scoped starter packages online or request a custom quote — web, marketing, SEO, hosting, apps, and offline.',
  eyebrow: 'BDITEC Shop',
  title: 'Digital & marketing solutions with clear packages',
  lead:
    'Choose a starter package for web, shop, app, marketing, hosting, or offline — then describe your project in the briefing. Amounts are orientation or start values from the catalog; the server validates prices before checkout.',
  heroPrimaryCta: 'Browse packages',
  heroSecondaryCta: 'Tell us about your project',
  servicesTitle: 'Service areas',
  servicesLead: 'Six service lines — each with packages from the current catalog.',
  servicesExplore: 'View packages',
  servicesFrom: 'from',
  catalogTitle: 'Compare packages',
  catalogLead: 'Use filters and sorting — or browse by service.',
  processTitle: 'How to get started',
  processLead: 'The soft-launch flow as implemented in the shop and briefing today.',
  processSteps: [
    {
      title: 'Choose a service & package',
      body: 'Compare start amount, monthly, or quote — only approved packages can be purchased online.',
    },
    {
      title: 'Describe your project',
      body: 'The briefing stores your answers durably (when storage is configured) and links them to the selected package.',
    },
    {
      title: 'Review & align',
      body: 'We review the briefing. A quote or scope fine-tuning follows when needed.',
    },
    {
      title: 'Checkout or quote',
      body: 'A matching briefing plus access token unlocks demo/test checkout. Otherwise quote by email — no live card charge in soft launch.',
    },
    {
      title: 'Delivery online',
      body: 'Coordination and delivery are digital; concrete dates follow the briefing — no fixed delivery times on this page.',
    },
  ],
  finalCtaTitle: 'Ready for the next step?',
  finalCtaLead: 'Compare packages or start the project briefing now.',
  finalCtaBriefing: 'Tell us about your project',
  finalCtaCatalog: 'Browse packages',
  searchLabel: 'Search packages',
  searchPlaceholder: 'e.g. audit, landing, hosting…',
  filterAll: 'All categories',
  filterModeLabel: 'Billing type',
  filterModeAll: 'All',
  filterClear: 'Clear filters',
  filterActiveLabel: 'Active filters',
  sortLabel: 'Sort by',
  sortPopular: 'Popularity',
  sortPriceAsc: 'Price: low to high',
  sortPriceDesc: 'Price: high to low',
  sortName: 'Name A–Z',
  modeCheckout: 'Start amount',
  modeSubscription: 'Monthly',
  modeQuote: 'Quote',
  categories: {
    'web-design': {
      title: 'Web design & development',
      blurb: 'Landings, business sites, shops, and custom web',
    },
    'digital-marketing': {
      title: 'Digital marketing',
      blurb: 'Campaign kickoffs and ongoing performance',
    },
    'seo-analytics': {
      title: 'SEO & analytics',
      blurb: 'Audits, visibility, and reporting foundations',
    },
    'hosting-support': {
      title: 'Hosting & support',
      blurb: 'Setup, operations, and technical care',
    },
    'mobile-app': {
      title: 'Mobile apps',
      blurb: 'MVP kickoff to launch — often quote-led',
    },
    'offline-marketing': {
      title: 'Offline marketing',
      blurb: 'Print, events, outdoor, and production',
    },
  },
  results: (n) => (n === 1 ? '1 package' : `${n} packages`),
  empty: 'No packages for these filters. Reset filters or request a quote.',
  recommended: 'Recommended',
  fromLabel: 'from',
  monthSuffix: '/ month',
  choosePlan: 'Choose plan',
  viewDetails: 'View details',
  viewService: 'Service page',
  planIncludes: 'Included to start',
  planIncludesSubscription: 'Orientation (monthly)',
  startAmountNote:
    'Shown amount is a start / deposit value in EUR credited toward the project — not a full-project Festpreis.',
  subscriptionAmountNote:
    'Monthly orientation fee. Ad spend, hosting, and licenses only when explicitly listed.',
  quoteAmountNote:
    'Price on request — scope is agreed in a quote before ordering. No online purchase for this package.',
  priceKindCheckout: 'Start amount',
  priceKindSubscription: 'per month',
  priceKindQuote: 'On request',
  priceOnRequest: 'Price on request',
  vatNote: 'All amounts in EUR excl. VAT unless stated otherwise (B2B note — confirm with counsel if needed).',
  missingTerms:
    'Listed amounts are orientation prices, not agency Festpreise. Listed deliverables are orientation before purchase; fine-tuning follows in the briefing.',
  detailBack: 'All plans',
  breadcrumbNav: 'Breadcrumb',
  breadcrumbShop: 'Shop',
  relatedTitle: 'More plans in this service',
  scopeTitle: 'Deliverables (orientation)',
  scopeBody:
    'The listed points describe orientation deliverables before purchase. Fine-tuning follows in the briefing — without fixing minimum terms or cancellation windows here.',
  exclusionsTitle: 'Not included by default',
  exclusionsBody:
    'Ad media spend, third-party licenses, out-of-scope custom work, and ongoing ad costs are not blanket-included — details in the briefing.',
  deliveryTitle: 'Process & delivery',
  deliveryBody:
    'After payment or quote acceptance comes a digital briefing and file/access collection. Concrete dates are agreed then — no fixed delivery times on this page.',
  extrasTitle: 'Optional extras',
  extrasBody: 'Extras can be added in the checkout wizard.',
  ctaCheckout: 'Go to checkout',
  ctaSubscription: 'Start subscription (checkout)',
  ctaSubscriptionShort: 'Choose subscription',
  ctaQuote: 'Request a quote',
  ctaBriefing: 'Tell us about your project',
  ctaService: 'Service page',
  quoteTitle: 'Request a custom quote',
  quoteLead:
    'For tailored projects and monthly plans without instant checkout: briefly describe what you need — we reply by email. No payment happens in this step.',
  quoteEyebrow: 'BDITEC inquiry',
  quoteAsideTitle: 'How the request works',
  quoteSteps: [
    'Fill in the form — selected package and area are included when set',
    'Review the email draft and send it (or copy the summary)',
    'We follow up with questions or a concrete proposal',
  ],
  quoteResponseNote:
    'No fixed response times on this page. Without a sent email, the request has not reached us.',
  quoteSelectedPackage: 'Selected package',
  quoteName: 'Name',
  quoteEmail: 'Email',
  quotePhone: 'Phone (optional)',
  quoteCompany: 'Company (optional)',
  quoteService: 'Service area',
  quoteBudget: 'Budget range (optional, orientation)',
  quoteBudgetOptions: [
    { value: '', label: 'Not sure yet' },
    { value: 'under-1k', label: 'Under €1,000' },
    { value: '1k-3k', label: 'Approx. €1,000–3,000' },
    { value: '3k-8k', label: 'Approx. €3,000–8,000' },
    { value: '8k-plus', label: 'Over €8,000' },
  ],
  quoteTiming: 'Timeline (optional)',
  quoteTimingOptions: [
    { value: '', label: 'Not sure yet' },
    { value: 'asap', label: 'As soon as practical' },
    { value: '1-3m', label: 'In 1–3 months' },
    { value: 'later', label: 'Later / planning' },
  ],
  quoteMessage: 'Project description',
  quoteMessageHint:
    'Goals, current state, desired outcomes — clearer input means a more useful reply. Do not include passwords or access credentials here.',
  quoteSubmit: 'Prepare email request',
  quoteHint:
    'Opens your email app with a prefilled draft. The request is only sent when you send the email. No account is created.',
  quoteSuccess:
    'Draft prepared. Please send the email — or copy the summary and send it to info@bditec.com.',
  quoteEmailVisible: 'Direct to',
  quoteCopySummary: 'Copy summary',
  quoteCopied: 'Copied',
  quoteCopyFailed: 'Could not copy — select the text manually',
  modeBadge: {
    checkout: 'Start amount',
    subscription: 'Monthly',
    quote: 'Quote',
  },
  cartTitle: 'Cart',
  cartEmpty: 'No packages in the cart yet.',
  cartCount: (n) => (n === 1 ? '1 item' : `${n} items`),
  cartAdd: 'Add to cart',
  cartAdded: 'Added',
  cartUpdated: 'Cart updated',
  cartDuplicate: 'Already in cart',
  cartFull: 'Cart full (max 8)',
  buyboxTotal: 'Subtotal',
  extrasSelectHint: 'Optional extras — total updates instantly.',
  subscriptionNoExtras:
    'Monthly plans exclude one-time extras in the cart — add-ons are only for start-amount packages.',
  cartRemove: 'Remove',
  cartEdit: 'Edit extras',
  cartViewPackage: 'View package',
  cartOnceLabel: 'Due now (one-time)',
  cartMonthlyLabel: 'Monthly',
  cartMixedBilling:
    'One-time and monthly packages cannot share a single checkout. Keep the cart to one billing type or request a quote.',
  cartSingleItemOnly:
    'Soft-launch checkout allows one package per order. Remove extra lines, complete the briefing, then pay — nothing is silently dropped.',
  cartClear: 'Clear',
  cartCheckout: 'Proceed to checkout',
  cartOpen: 'Open cart',
  cartName: 'Name',
  cartEmail: 'Email',
  cartPayHint:
    'Amounts are checked on the server. Soft-launch may use a clearly labeled demo order without a real card charge.',
  cartProcessing: 'Preparing checkout…',
  cartError: 'Checkout failed. Try again or request a quote.',
  checkoutUnavailable: 'Online booking is currently unavailable. Please request a quote.',
  termsGateNote:
    'Online purchase for this monthly package is temporarily quote-only until minimum term, cancellation, and binding deliverables are approved. The amount shown is orientation only.',
  orientationAmountNote: 'Orientation amount — online checkout is not open for this package yet.',
  afterOrderTitle: 'After order or quote',
  afterOrderSteps: [
    'Confirmation or clearly labeled demo marker',
    'Digital briefing and file/access notes (no passwords in forms)',
    'Agree deliverables',
    'Delivery and feedback',
  ],
  afterOrderNote:
    'Visiting a success page alone does not prove payment. Demo orders are clearly labeled. Delivery timing starts after an agreed briefing unless otherwise confirmed.',
  printSummary: 'Print summary',
  compareAdd: 'Compare',
  compareOpen: 'Open comparison',
  compareClear: 'Clear selection',
  compareClose: 'Close',
  compareTitle: 'Package comparison',
  compareFeature: 'Item',
  compareCount: (n) => `${n} packages selected (max 3)`,
  taxonomyNote:
    'Note: E-Commerce packages use the “Web design & development” filter. SEO packages use “SEO & analytics” while belonging to the Digital marketing service.',
  faqTitle: 'Frequently asked questions',
  faq: [
    {
      q: 'What is included in a package?',
      a: 'The points on the package card and detail view describe orientation deliverables before purchase. Fine-tuning happens in the briefing — without promising a full-project Festpreis here.',
    },
    {
      q: 'What information should I prepare?',
      a: 'Goals, current state, desired outcomes, and — if available — links to brand materials. Do not enter passwords or access secrets in forms.',
    },
    {
      q: 'Can the scope be customized?',
      a: 'Yes. Deviations and special requests are clarified in the briefing or quote and are not automatically included in the catalog price.',
    },
    {
      q: 'How do monthly services work?',
      a: 'Monthly amounts are orientation retainers per month. Time allowances and exclusions are listed on the package. Without approved cancellation/minimum term, the shop routes to a quote instead of instant purchase.',
    },
    {
      q: 'When is a quotation required?',
      a: 'For quote packages, gated retainers, and when your scope exceeds the starter package. Then no instant online payment.',
    },
    {
      q: 'How does the briefing work?',
      a: 'You describe the project step by step. When storage is configured you receive a briefing reference and an access token for matching checkout. If storage fails, there is no success and no checkout unlock.',
    },
    {
      q: 'Is online payment live?',
      a: 'Soft-launch may use a demo checkout without a real card charge. Live payment follows approval. Demo orders are clearly labeled as demo.',
    },
  ],
}

export const shopPageAr: ShopPageCopy = {
  metaTitle: 'المتجر — باقات وكالة BDITEC',
  metaDescription:
    'متجر BDITEC: اطلب باقات البداية المحددة عبر الإنترنت أو اطلب عرض سعر مخصص — ويب، تسويق، SEO، استضافة، تطبيقات وأوفلاين.',
  eyebrow: 'متجر BDITEC',
  title: 'حلول رقمية وتسويقية بباقات واضحة',
  lead:
    'اختر باقة بداية للويب أو المتجر أو التطبيق أو التسويق أو الاستضافة أو الأوفلاين — ثم صف مشروعك في الإحاطة. المبالغ توجيهية أو بداية من الكتالوج؛ يتحقق الخادم من الأسعار قبل الدفع.',
  heroPrimaryCta: 'تصفح الباقات',
  heroSecondaryCta: 'صف لنا مشروعك',
  servicesTitle: 'مجالات الخدمة',
  servicesLead: 'ستة خطوط خدمة — كل منها بباقات من الكتالوج الحالي.',
  servicesExplore: 'عرض الباقات',
  servicesFrom: 'من',
  catalogTitle: 'قارن الباقات',
  catalogLead: 'استخدم الفلاتر والترتيب — أو تصفح حسب الخدمة.',
  processTitle: 'كيف تبدأ',
  processLead: 'مسار الإطلاق الناعم كما هو مطبّق في المتجر والإحاطة اليوم.',
  processSteps: [
    {
      title: 'اختر خدمة وباقة',
      body: 'قارن مبلغ البداية أو الشهري أو العرض — فقط الباقات المعتمدة تُشترى أونلاين.',
    },
    {
      title: 'صف مشروعك',
      body: 'تحفظ الإحاطة إجاباتك بشكل دائم (عند تهيئة التخزين) وتربطها بالباقة المختارة.',
    },
    {
      title: 'مراجعة وتنسيق',
      body: 'نراجع الإحاطة. عند الحاجة يتبع عرض سعر أو ضبط دقيق للنطاق.',
    },
    {
      title: 'الدفع أو العرض',
      body: 'إحاطة مطابقة مع رمز وصول تفتح دفعاً تجريبياً. وإلا عرض بالبريد — بلا خصم بطاقة حي في الإطلاق الناعم.',
    },
    {
      title: 'التنفيذ رقمياً',
      body: 'التنسيق والتسليم رقميان؛ المواعيد بعد الإحاطة — بلا أوقات تسليم ثابتة في هذه الصفحة.',
    },
  ],
  finalCtaTitle: 'جاهز للخطوة التالية؟',
  finalCtaLead: 'قارن الباقات أو ابدأ إحاطة المشروع الآن.',
  finalCtaBriefing: 'صف لنا مشروعك',
  finalCtaCatalog: 'تصفح الباقات',
  searchLabel: 'البحث في الباقات',
  searchPlaceholder: 'مثل: تدقيق، صفحة هبوط، استضافة…',
  filterAll: 'كل الفئات',
  filterModeLabel: 'نوع الفوترة',
  filterModeAll: 'الكل',
  filterClear: 'مسح الفلاتر',
  filterActiveLabel: 'الفلاتر النشطة',
  sortLabel: 'ترتيب حسب',
  sortPopular: 'الأكثر طلباً',
  sortPriceAsc: 'السعر: من الأقل',
  sortPriceDesc: 'السعر: من الأعلى',
  sortName: 'الاسم أ–ي',
  modeCheckout: 'مبلغ بداية',
  modeSubscription: 'شهري',
  modeQuote: 'عرض سعر',
  categories: {
    'web-design': {
      title: 'تصميم وتطوير الويب',
      blurb: 'صفحات هبوط، مواقع شركات، متاجر وويب مخصص',
    },
    'digital-marketing': {
      title: 'التسويق الرقمي',
      blurb: 'انطلاق الحملات والأداء المستمر',
    },
    'seo-analytics': {
      title: 'SEO والتحليلات',
      blurb: 'تدقيقات، ظهور، وأساس التقارير',
    },
    'hosting-support': {
      title: 'الاستضافة والدعم',
      blurb: 'الإعداد والتشغيل والرعاية التقنية',
    },
    'mobile-app': {
      title: 'تطبيقات الجوال',
      blurb: 'من MVP إلى الإطلاق — غالباً بعرض سعر',
    },
    'offline-marketing': {
      title: 'التسويق الأوفلاين',
      blurb: 'طباعة، فعاليات، إعلانات خارجية وإنتاج',
    },
  },
  results: (n) => (n === 1 ? 'باقة واحدة' : `${n} باقات`),
  empty: 'لا باقات لهذه الفلاتر. أعد الضبط أو اطلب عرض سعر.',
  recommended: 'موصى به',
  fromLabel: 'من',
  monthSuffix: '/ شهر',
  choosePlan: 'اختر الخطة',
  viewDetails: 'عرض التفاصيل',
  viewService: 'صفحة الخدمة',
  planIncludes: 'يشمل للبداية',
  planIncludesSubscription: 'توجيهي (شهري)',
  startAmountNote:
    'المبلغ المعروض قيمة بداية / عربون باليورو ويُحتسب ضمن المشروع — وليس سعر مشروع كامل.',
  subscriptionAmountNote:
    'أتعاب شهرية توجيهية. ميزانية الإعلان والاستضافة والتراخيص فقط إن ذُكرت صراحة.',
  quoteAmountNote:
    'السعر عند الطلب — يُتفق على النطاق في العرض قبل الطلب. لا شراء أونلاين لهذه الباقة.',
  priceKindCheckout: 'مبلغ بداية',
  priceKindSubscription: 'شهرياً',
  priceKindQuote: 'عند الطلب',
  priceOnRequest: 'السعر عند الطلب',
  vatNote: 'جميع المبالغ باليورو بدون ضريبة القيمة المضافة ما لم يُذكر خلاف ذلك (ملاحظة B2B — راجع قانونياً عند الحاجة).',
  missingTerms:
    'المبالغ توجيهية وليست أسعار مشاريع كاملة. النقاط المدرجة توجيه قبل الشراء؛ التفاصيل في الإحاطة.',
  detailBack: 'كل الخطط',
  breadcrumbNav: 'مسار التنقل',
  breadcrumbShop: 'المتجر',
  relatedTitle: 'خطط أخرى في هذه الخدمة',
  scopeTitle: 'نطاق الخدمة (توجيهي)',
  scopeBody:
    'النقاط المدرجة تصف نطاق التوجيه قبل الشراء. التفاصيل في الإحاطة — دون تعهد بمدد أو إلغاء ثابت هنا.',
  exclusionsTitle: 'غير مشمول افتراضياً',
  exclusionsBody:
    'ميزانيات الإعلانات وتراخيص الطرف الثالث والعمل خارج النطاق وتكاليف الإعلانات المستمرة غير مشمولة تلقائياً — التفاصيل في الإحاطة.',
  deliveryTitle: 'السير والتسليم',
  deliveryBody:
    'بعد الدفع أو قبول العرض تأتي إحاطة رقمية وجمع الملفات/الوصول. المواعيد تُتفق لاحقاً — لا مواعيد تسليم ثابتة في هذه الصفحة.',
  extrasTitle: 'إضافات اختيارية',
  extrasBody: 'يمكن إضافة الإضافات في معالج الدفع.',
  ctaCheckout: 'إلى الطلب',
  ctaSubscription: 'بدء الاشتراك (دفع)',
  ctaSubscriptionShort: 'اختر الاشتراك',
  ctaQuote: 'طلب عرض سعر',
  ctaBriefing: 'أخبرنا عن مشروعك',
  ctaService: 'صفحة الخدمة',
  quoteTitle: 'طلب عرض سعر مخصص',
  quoteLead:
    'للمشاريع المخصصة والباقات الشهرية بدون شراء فوري: صف باختصار ما تحتاجه — نرد عبر البريد. لا يتم أي دفع في هذه الخطوة.',
  quoteEyebrow: 'استفسار BDITEC',
  quoteAsideTitle: 'كيف تعمل الطلبية',
  quoteSteps: [
    'املأ النموذج — تُرسل الباقة والمجال المختاران إن وُجدا',
    'راجع مسودة البريد وأرسلها (أو انسخ الملخص)',
    'نتابع بأسئلة أو بعرض واضح',
  ],
  quoteResponseNote:
    'لا مواعيد رد ثابتة في هذه الصفحة. بدون إرسال البريد لم تصلنا الطلبية.',
  quoteSelectedPackage: 'الباقة المختارة',
  quoteName: 'الاسم',
  quoteEmail: 'البريد',
  quotePhone: 'الهاتف (اختياري)',
  quoteCompany: 'الشركة (اختياري)',
  quoteService: 'مجال الخدمة',
  quoteBudget: 'نطاق الميزانية (اختياري، توجيه)',
  quoteBudgetOptions: [
    { value: '', label: 'غير محدد بعد' },
    { value: 'under-1k', label: 'أقل من 1.000 €' },
    { value: '1k-3k', label: 'حوالي 1.000–3.000 €' },
    { value: '3k-8k', label: 'حوالي 3.000–8.000 €' },
    { value: '8k-plus', label: 'أكثر من 8.000 €' },
  ],
  quoteTiming: 'الإطار الزمني (اختياري)',
  quoteTimingOptions: [
    { value: '', label: 'غير محدد بعد' },
    { value: 'asap', label: 'في أقرب وقت مناسب' },
    { value: '1-3m', label: 'خلال 1–3 أشهر' },
    { value: 'later', label: 'لاحقاً / تخطيط' },
  ],
  quoteMessage: 'وصف المشروع',
  quoteMessageHint:
    'الأهداف والوضع الحالي والنتائج المرغوبة — كلما أوضح الوصف كانت الردود أدق. لا تُدخل كلمات مرور أو بيانات وصول هنا.',
  quoteSubmit: 'تجهيز طلب بالبريد',
  quoteHint:
    'يفتح تطبيق البريد بمسودة جاهزة. يُرسل الطلب فقط عند إرسال الرسالة. لا يُنشأ حساب.',
  quoteSuccess:
    'تم تجهيز المسودة. أرسل البريد — أو انسخ الملخص وأرسله إلى info@bditec.com.',
  quoteEmailVisible: 'مباشرة إلى',
  quoteCopySummary: 'نسخ الملخص',
  quoteCopied: 'تم النسخ',
  quoteCopyFailed: 'تعذر النسخ — حدّد النص يدوياً',
  modeBadge: {
    checkout: 'مبلغ بداية',
    subscription: 'شهري',
    quote: 'عرض',
  },
  cartTitle: 'السلة',
  cartEmpty: 'لا باقات في السلة بعد.',
  cartCount: (n) => (n === 1 ? 'عنصر واحد' : `${n} عناصر`),
  cartAdd: 'أضف إلى السلة',
  cartAdded: 'تمت الإضافة',
  cartUpdated: 'تم تحديث السلة',
  cartDuplicate: 'موجود مسبقاً في السلة',
  cartFull: 'السلة ممتلئة (حد أقصى 8)',
  buyboxTotal: 'المجموع الفرعي',
  extrasSelectHint: 'إضافات اختيارية — يتحدث المجموع فوراً.',
  subscriptionNoExtras:
    'الباقات الشهرية بدون إضافات لمرة واحدة في السلة — الإضافات فقط لحزم مبلغ البداية.',
  cartRemove: 'إزالة',
  cartEdit: 'تعديل الإضافات',
  cartViewPackage: 'عرض الباقة',
  cartOnceLabel: 'مرة واحدة الآن',
  cartMonthlyLabel: 'شهرياً',
  cartMixedBilling:
    'لا يمكن دمج باقات لمرة واحدة وشهرية في دفع واحد. اقتصر السلة على نوع واحد أو اطلب عرض سعر.',
  cartSingleItemOnly:
    'الإطلاق الناعم يسمح بباقة واحدة لكل طلب. أزل العناصر الإضافية، أكمل الإحاطة، ثم ادفع — لن يُتجاهل شيء بصمت.',
  cartClear: 'تفريغ',
  cartCheckout: 'المتابعة للدفع',
  cartOpen: 'فتح السلة',
  cartName: 'الاسم',
  cartEmail: 'البريد',
  cartPayHint:
    'يتحقق الخادم من المبالغ. الإطلاق التجريبي قد يستخدم طلباً تجريبياً واضحاً بلا خصم حقيقي.',
  cartProcessing: 'جاري تجهيز الدفع…',
  cartError: 'فشل الدفع. حاول مجدداً أو اطلب عرض سعر.',
  checkoutUnavailable: 'الحجز أونلاين غير متاح حالياً. يُرجى طلب عرض سعر.',
  termsGateNote:
    'الشراء أونلاين لهذه الباقة الشهرية مؤقتاً عبر عرض سعر فقط حتى اعتماد المدة والإلغاء والنطاق الملزم. المبلغ المعروض توجيهي.',
  orientationAmountNote: 'مبلغ توجيهي — الدفع أونلاين غير مفتوح لهذه الباقة بعد.',
  afterOrderTitle: 'بعد الطلب أو العرض',
  afterOrderSteps: [
    'تأكيد أو وسم تجريبي واضح',
    'إحاطة رقمية وملاحظات الملفات/الوصول (بدون كلمات مرور في النماذج)',
    'الاتفاق على نطاق الخدمة',
    'التنفيذ والملاحظات',
  ],
  afterOrderNote:
    'زيارة صفحة النجاح وحدها لا تثبت الدفع. الطلبات التجريبية مُعلَّمة. مواعيد التسليم تبدأ بعد إحاطة متفق عليها ما لم يُؤكد خلاف ذلك.',
  printSummary: 'طباعة الملخص',
  compareAdd: 'مقارنة',
  compareOpen: 'فتح المقارنة',
  compareClear: 'مسح الاختيار',
  compareClose: 'إغلاق',
  compareTitle: 'مقارنة الباقات',
  compareFeature: 'بند',
  compareCount: (n) => `${n} باقات محددة (حد أقصى 3)`,
  taxonomyNote:
    'ملاحظة: باقات التجارة الإلكترونية ضمن فلتر «تصميم وتطوير الويب». باقات SEO ضمن «SEO والتحليلات» وتنتمي لخدمة التسويق الرقمي.',
  faqTitle: 'أسئلة شائعة',
  faq: [
    {
      q: 'ما المشمول في الباقة؟',
      a: 'النقاط على بطاقة الباقة وفي التفاصيل تصف نطاقاً توجيهياً قبل الشراء. الضبط الدقيق في الإحاطة — دون وعد بسعر مشروع كامل هنا.',
    },
    {
      q: 'ما المعلومات التي أجهّزها؟',
      a: 'الأهداف، الوضع الحالي، النتائج المرغوبة، وروابط مواد العلامة إن وُجدت. لا تُدخل كلمات مرور أو أسرار وصول في النماذج.',
    },
    {
      q: 'هل يمكن تخصيص النطاق؟',
      a: 'نعم. الانحرافات والطلبات الخاصة تُوضح في الإحاطة أو العرض وليست مشمولة تلقائياً في سعر الكتالوج.',
    },
    {
      q: 'كيف تعمل الخدمات الشهرية؟',
      a: 'المبالغ الشهرية أتعاب توجيهية شهرياً. الوقت والاستثناءات في نقاط الباقة. بدون مدة/إلغاء معتمدين يوجّه المتجر لعرض سعر بدل الشراء الفوري.',
    },
    {
      q: 'متى يلزم عرض سعر؟',
      a: 'لباقات العرض والاحتفاظ المقيّد وعندما يتجاوز نطاقك باقة البداية. عندها لا دفع فوري أونلاين.',
    },
    {
      q: 'كيف تعمل الإحاطة؟',
      a: 'تصف المشروع خطوة بخطوة. عند تهيئة التخزين تحصل على مرجع إحاطة ورمز وصول للدفع المطابق. إن فشل التخزين فلا نجاح ولا فتح للدفع.',
    },
    {
      q: 'هل الدفع أونلاين فعّال؟',
      a: 'الإطلاق التجريبي قد يستخدم دفعاً تجريبياً بلا خصم بطاقة حقيقي. الدفع الحي بعد الموافقة. الطلبات التجريبية مُعلَّمة بوضوح.',
    },
  ],
}
