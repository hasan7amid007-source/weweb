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
  cartClear: string
  cartCheckout: string
  cartOpen: string
  cartName: string
  cartEmail: string
  cartPayHint: string
  cartProcessing: string
  cartError: string
  faqTitle: string
  faq: { q: string; a: string }[]
}

export const shopPageDe: ShopPageCopy = {
  metaTitle: 'Shop — BDITEC Agentur-Pakete',
  metaDescription:
    'BDITEC Shop: feste Startpakete online bestellen oder individuelles Angebot anfragen — Web, Marketing, SEO, Hosting, Apps und Offline.',
  eyebrow: 'BDITEC Plans',
  title: 'Pläne & Pakete',
  lead: 'Starterpläne nach Service vergleichen. Online starten und bezahlen — oder für größeren Scope ein individuelles Angebot anfragen.',
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
  recommended: 'Beliebt',
  fromLabel: 'ab',
  monthSuffix: '/ Monat',
  choosePlan: 'Plan wählen',
  viewDetails: 'Details ansehen',
  viewService: 'Zur Service-Seite',
  planIncludes: 'Enthalten im Start',
  planIncludesSubscription: 'Orientierung (monatlich)',
  startAmountNote: 'Angezeigter Betrag ist ein Start-/Anzahlungswert in EUR und wird auf das Projekt angerechnet — kein Festpreis für das Gesamtprojekt.',
  subscriptionAmountNote:
    'Monatsbetrag (Orientierung, zzgl. MwSt.). Werbebudget, Hosting und Lizenzen nur wenn ausdrücklich genannt. Soft-Launch kann Demo-Checkout nutzen.',
  quoteAmountNote: 'Richtwert für die Anfrage — verbindliches Angebot folgt nach Briefing.',
  priceKindCheckout: 'Startbetrag',
  priceKindSubscription: 'pro Monat',
  priceKindQuote: 'Richtwert',
  vatNote: 'Alle Beträge in EUR zzgl. MwSt., sofern nicht anders angegeben.',
  missingTerms:
    'Preise und Konditionen sind Orientierungswerte (kein Festpreis wie bei manchen Agenturen) — finale Vereinbarung im Briefing. Soft-Launch kann Demo-Checkout nutzen.',
  detailBack: 'Alle Pläne',
  breadcrumbNav: 'Brotkrumen',
  breadcrumbShop: 'Shop',
  relatedTitle: 'Weitere Pläne in diesem Service',
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
  ctaSubscriptionShort: 'Abo wählen',
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
    'Monatspakete ohne einmalige Extras im Warenkorb — Add-ons nur bei Startbetrag-Paketen.',
  cartRemove: 'Entfernen',
  cartEdit: 'Extras bearbeiten',
  cartClear: 'Leeren',
  cartCheckout: 'Zur Kasse',
  cartOpen: 'Warenkorb öffnen',
  cartName: 'Name',
  cartEmail: 'E-Mail',
  cartPayHint:
    'Beträge werden serverseitig geprüft. Ohne Stripe-Schlüssel läuft der Soft-Launch als Demo.',
  cartProcessing: 'Checkout wird vorbereitet…',
  cartError: 'Checkout fehlgeschlagen. Bitte erneut versuchen oder Angebot anfragen.',
  faqTitle: 'Shop FAQ',
  faq: [
    {
      q: 'Was bedeuten die Startbeträge?',
      a: 'Einmalige Pakete zeigen einen Online-Start-/Anzahlungswert — kein Festpreis für das Gesamtprojekt. Monatliche Pakete (Care, SEA Start, SEO Pflege, Social) sind Orientierungshonorare pro Monat; Werbebudget und Hosting sind nur inklusive, wenn ausdrücklich genannt.',
    },
    {
      q: 'Warum Demo-Checkout?',
      a: 'Ohne konfigurierten Stripe-Testschlüssel bleibt der Soft-Launch im Demo-Modus — kein echter Karteneinzug. Live-/Test-Zahlung folgt nach Ops-Setup.',
    },
    {
      q: 'Wie funktionieren Abos?',
      a: 'Monatliche Pakete nutzen Stripe Billing, sobald Test-Keys und wiederkehrende Price IDs gesetzt sind. Bis dahin läuft der Soft-Launch als Demo. Konditionen (Stunden-Deckel, Kündigung) werden im Briefing bestätigt.',
    },
  ],
}

export const shopPageEn: ShopPageCopy = {
  metaTitle: 'Shop — BDITEC agency packages',
  metaDescription:
    'BDITEC shop: order scoped starter packages online or request a custom quote — web, marketing, SEO, hosting, apps, and offline.',
  eyebrow: 'BDITEC Plans',
  title: 'Plans & packages',
  lead: 'Compare starter plans by service. Pay online to begin — or request a custom quote for larger scope.',
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
  recommended: 'Popular',
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
    'Monthly orientation fee (excl. VAT). Ad spend, hosting, and licenses only when explicitly listed. Soft-launch may use demo checkout.',
  quoteAmountNote: 'Indicative amount for the request — binding quote follows after briefing.',
  priceKindCheckout: 'Start amount',
  priceKindSubscription: 'per month',
  priceKindQuote: 'Indicative',
  vatNote: 'All amounts in EUR excl. VAT unless stated otherwise.',
  missingTerms:
    'Listed amounts are orientation start prices (not full agency Festpreise) — final scope is confirmed in the briefing. Soft-launch may use demo checkout.',
  detailBack: 'All plans',
  breadcrumbNav: 'Breadcrumb',
  breadcrumbShop: 'Shop',
  relatedTitle: 'More plans in this service',
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
  ctaSubscriptionShort: 'Choose subscription',
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
  cartClear: 'Clear',
  cartCheckout: 'Proceed to checkout',
  cartOpen: 'Open cart',
  cartName: 'Name',
  cartEmail: 'Email',
  cartPayHint:
    'Amounts are validated server-side. Without a Stripe secret key, soft-launch stays in demo mode.',
  cartProcessing: 'Preparing checkout…',
  cartError: 'Checkout failed. Try again or request a quote.',
  faqTitle: 'Shop FAQ',
  faq: [
    {
      q: 'What do the start amounts mean?',
      a: 'One-time packages show an online start/deposit — not a full-project Festpreis. Monthly packages (Care, SEA Start, SEO Care, Social) are orientation retainers; ad spend and hosting are included only when explicitly stated.',
    },
    {
      q: 'Why demo checkout?',
      a: 'Until a Stripe test secret is configured, soft-launch stays in demo mode — no real card charge. Live/test payment follows the ops setup.',
    },
    {
      q: 'How do subscriptions work?',
      a: 'Monthly packages use Stripe Billing once test keys and recurring Price IDs are set. Until then soft-launch stays demo. Hour caps and cancellation are confirmed in the briefing.',
    },
  ],
}

export const shopPageAr: ShopPageCopy = {
  metaTitle: 'المتجر — باقات وكالة BDITEC',
  metaDescription:
    'متجر BDITEC: اطلب باقات البداية المحددة عبر الإنترنت أو اطلب عرض سعر مخصص — ويب، تسويق، SEO، استضافة، تطبيقات وأوفلاين.',
  eyebrow: 'خطط BDITEC',
  title: 'الخطط والباقات',
  lead: 'قارن خطط البداية حسب الخدمة. ادفع أونلاين للبدء — أو اطلب عرض سعر مخصص لنطاق أكبر.',
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
  recommended: 'الأكثر طلباً',
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
    'أتعاب شهرية توجيهية (بدون ضريبة ما لم يُذكر). ميزانية الإعلان والاستضافة والتراخيص فقط إن ذُكرت صراحة. الإطلاق التجريبي قد يستخدم دفعاً تجريبياً.',
  quoteAmountNote: 'مبلغ توجيهي للطلب — العرض الملزم بعد الإحاطة.',
  priceKindCheckout: 'مبلغ بداية',
  priceKindSubscription: 'شهرياً',
  priceKindQuote: 'توجيهي',
  vatNote: 'جميع المبالغ باليورو بدون ضريبة القيمة المضافة ما لم يُذكر خلاف ذلك.',
  missingTerms:
    'المبالغ توجيهية لمبالغ البداية (وليست أسعار مشاريع كاملة) — النطاق النهائي يُؤكد في الإحاطة. الإطلاق التجريبي قد يستخدم دفعاً تجريبياً.',
  detailBack: 'كل الخطط',
  breadcrumbNav: 'مسار التنقل',
  breadcrumbShop: 'المتجر',
  relatedTitle: 'خطط أخرى في هذه الخدمة',
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
  ctaSubscriptionShort: 'اختر الاشتراك',
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
  cartClear: 'تفريغ',
  cartCheckout: 'المتابعة للدفع',
  cartOpen: 'فتح السلة',
  cartName: 'الاسم',
  cartEmail: 'البريد',
  cartPayHint:
    'تُتحقق المبالغ على الخادم. بدون مفتاح Stripe يبقى الإطلاق التجريبي في وضع العرض.',
  cartProcessing: 'جاري تجهيز الدفع…',
  cartError: 'فشل الدفع. حاول مجدداً أو اطلب عرض سعر.',
  faqTitle: 'أسئلة المتجر',
  faq: [
    {
      q: 'ماذا تعني مبالغ البداية؟',
      a: 'الباقات لمرة واحدة تعرض مبلغ بداية/عربون — وليس سعر مشروع كامل. الباقات الشهرية (Care وSEA Start ورعاية SEO وسوشيال) أتعاب توجيهية؛ ميزانية الإعلان والاستضافة فقط إن ذُكرت صراحة.',
    },
    {
      q: 'لماذا وضع العرض (Demo)؟',
      a: 'بدون مفتاح Stripe للاختبار يبقى الإطلاق التجريبي في وضع العرض — بلا خصم حقيقي. الدفع الحي/الاختباري يتبع إعداد العمليات.',
    },
    {
      q: 'كيف تعمل الاشتراكات؟',
      a: 'الباقات الشهرية تستخدم Stripe Billing بعد ضبط مفاتيح الاختبار وأسعار متكررة. حتى ذلك يبقى الإطلاق التجريبي في وضع العرض. حدود الساعات والإلغاء تُؤكد في الإحاطة.',
    },
  ],
}
