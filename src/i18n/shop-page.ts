import type { PurchaseMode, ShopCategoryId } from '../features/booking/shop-catalog'

export type ShopPageCopy = {
  metaTitle: string
  metaDescription: string
  eyebrow: string
  title: string
  lead: string
  searchLabel: string
  searchPlaceholder: string
  filterAll: string
  filterModeLabel: string
  modeCheckout: string
  modeSubscription: string
  modeQuote: string
  categories: Record<ShopCategoryId, { title: string; blurb: string }>
  results: (n: number) => string
  empty: string
  recommended: string
  fromLabel: string
  startAmountNote: string
  missingTerms: string
  detailBack: string
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
  ctaQuote: string
  ctaService: string
  quoteTitle: string
  quoteLead: string
  quoteName: string
  quoteEmail: string
  quotePhone: string
  quoteService: string
  quoteMessage: string
  quoteSubmit: string
  quoteHint: string
  quoteSuccess: string
  modeBadge: Record<PurchaseMode, string>
}

export const shopPageDe: ShopPageCopy = {
  metaTitle: 'Shop — BDITEC Agentur-Pakete',
  metaDescription:
    'BDITEC Shop: feste Startpakete online bestellen oder individuelles Angebot anfragen — Web, Marketing, SEO, Hosting, Apps und Offline.',
  eyebrow: 'Agentur-Shop',
  title: 'Pakete & Startbeträge',
  lead: 'Wählen Sie ein klar umrissenes Startpaket zum Online-Checkout — oder fordern Sie ein Angebot für individuelle Projekte an.',
  searchLabel: 'Pakete suchen',
  searchPlaceholder: 'z. B. Audit, Landing, Hosting…',
  filterAll: 'Alle Kategorien',
  filterModeLabel: 'Kaufart',
  modeCheckout: 'Sofort bestellen',
  modeSubscription: 'Abo / laufend',
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
  startAmountNote: 'Angezeigter Betrag ist ein Start-/Anzahlungswert in EUR und wird auf das Projekt angerechnet.',
  missingTerms:
    'Endgültige Preise, Lieferzeiten, Leistungsumfang und Vertragsbedingungen stehen noch unter Geschäftsprüfung — der Soft-Launch-Checkout kann Demo sein.',
  detailBack: 'Zurück zum Shop',
  scopeTitle: 'Leistungsumfang (Orientierung)',
  scopeBody:
    'Der gewählte Paket-Titel und die Kurzbeschreibung skizzieren den Start. Der verbindliche Scope wird im Briefing nach der Bestellung festgehalten.',
  exclusionsTitle: 'Nicht automatisch enthalten',
  exclusionsBody:
    'Medienbudget, Drittanbieter-Lizenzen, Sonderwünsche außerhalb des Pakets und laufende Werbekosten sind nicht pauschal enthalten — Details im Briefing.',
  deliveryTitle: 'Ablauf & Lieferung',
  deliveryBody:
    'Nach Zahlung bzw. Angebotsannahme folgt ein digitales Briefing und die Datei-/Zugangsabbfrage. Konkrete Termine werden dann vereinbart — keine festen Lieferzeiten auf dieser Seite.',
  extrasTitle: 'Optionale Extras',
  extrasBody: 'Extras können im Checkout-Assistenten ergänzt werden.',
  ctaCheckout: 'Zur Bestellung',
  ctaSubscription: 'Abo starten (Checkout)',
  ctaQuote: 'Angebot anfragen',
  ctaService: 'Service-Seite',
  quoteTitle: 'Individuelles Angebot',
  quoteLead: 'Beschreiben Sie kurz Ihr Vorhaben — wir antworten per E-Mail. Keine Zahlung in diesem Schritt.',
  quoteName: 'Name',
  quoteEmail: 'E-Mail',
  quotePhone: 'Telefon (optional)',
  quoteService: 'Bereich',
  quoteMessage: 'Kurzbeschreibung',
  quoteSubmit: 'Anfrage per E-Mail öffnen',
  quoteHint: 'Öffnet Ihr E-Mail-Programm an info@bditec.com. Es wird kein Konto angelegt und keine Zahlung ausgeführt.',
  quoteSuccess: 'E-Mail-Entwurf geöffnet. Senden Sie die Nachricht ab, um die Anfrage zu übermitteln.',
  modeBadge: {
    checkout: 'Checkout',
    subscription: 'Abo',
    quote: 'Angebot',
  },
}

export const shopPageEn: ShopPageCopy = {
  metaTitle: 'Shop — BDITEC agency packages',
  metaDescription:
    'BDITEC shop: order scoped starter packages online or request a custom quote — web, marketing, SEO, hosting, apps, and offline.',
  eyebrow: 'Agency shop',
  title: 'Packages & start amounts',
  lead: 'Pick a clearly scoped starter package for online checkout — or request a quote for custom work.',
  searchLabel: 'Search packages',
  searchPlaceholder: 'e.g. audit, landing, hosting…',
  filterAll: 'All categories',
  filterModeLabel: 'Purchase type',
  modeCheckout: 'Buy now',
  modeSubscription: 'Subscription',
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
  startAmountNote: 'Shown amount is a start / deposit value in EUR and is credited toward the project.',
  missingTerms:
    'Final prices, delivery times, scope, and contract terms still need business review — soft-launch checkout may be demo mode.',
  detailBack: 'Back to shop',
  scopeTitle: 'Scope (orientation)',
  scopeBody:
    'The package title and short blurb outline the start. Binding scope is confirmed in the post-order briefing.',
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
  ctaQuote: 'Request a quote',
  ctaService: 'Service page',
  quoteTitle: 'Custom quote',
  quoteLead: 'Briefly describe your project — we reply by email. No payment in this step.',
  quoteName: 'Name',
  quoteEmail: 'Email',
  quotePhone: 'Phone (optional)',
  quoteService: 'Area',
  quoteMessage: 'Short description',
  quoteSubmit: 'Open email request',
  quoteHint: 'Opens your email app to info@bditec.com. No account is created and no payment is taken.',
  quoteSuccess: 'Email draft opened. Send the message to submit your request.',
  modeBadge: {
    checkout: 'Checkout',
    subscription: 'Subscription',
    quote: 'Quote',
  },
}

export const shopPageAr: ShopPageCopy = {
  metaTitle: 'المتجر — باقات وكالة BDITEC',
  metaDescription:
    'متجر BDITEC: اطلب باقات البداية المحددة عبر الإنترنت أو اطلب عرض سعر مخصص — ويب، تسويق، SEO، استضافة، تطبيقات وأوفلاين.',
  eyebrow: 'متجر الوكالة',
  title: 'الباقات ومبالغ البداية',
  lead: 'اختر باقة بداية واضحة للدفع عبر الإنترنت — أو اطلب عرض سعر للمشاريع المخصصة.',
  searchLabel: 'البحث في الباقات',
  searchPlaceholder: 'مثل: تدقيق، صفحة هبوط، استضافة…',
  filterAll: 'كل الفئات',
  filterModeLabel: 'نوع الشراء',
  modeCheckout: 'اطلب الآن',
  modeSubscription: 'اشتراك',
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
  startAmountNote: 'المبلغ المعروض قيمة بداية / عربون باليورو ويُحتسب ضمن المشروع.',
  missingTerms:
    'الأسعار النهائية وأوقات التسليم والنطاق وشروط العقد ما زالت قيد مراجعة الأعمال — قد يكون الدفع في الإطلاق التجريبي وضعاً تجريبياً.',
  detailBack: 'العودة للمتجر',
  scopeTitle: 'نطاق الخدمة (توجيهي)',
  scopeBody:
    'عنوان الباقة والوصف القصير يحددان البداية. النطاق الملزم يُثبت في الإحاطة بعد الطلب.',
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
  ctaQuote: 'طلب عرض سعر',
  ctaService: 'صفحة الخدمة',
  quoteTitle: 'عرض سعر مخصص',
  quoteLead: 'صف مشروعك باختصار — نرد عبر البريد. لا دفع في هذه الخطوة.',
  quoteName: 'الاسم',
  quoteEmail: 'البريد',
  quotePhone: 'الهاتف (اختياري)',
  quoteService: 'المجال',
  quoteMessage: 'وصف مختصر',
  quoteSubmit: 'فتح طلب بالبريد',
  quoteHint: 'يفتح تطبيق البريد إلى info@bditec.com. لا يُنشأ حساب ولا يُؤخذ دفع.',
  quoteSuccess: 'فُتح مسودة البريد. أرسل الرسالة لإتمام الطلب.',
  modeBadge: {
    checkout: 'دفع',
    subscription: 'اشتراك',
    quote: 'عرض',
  },
}
