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
  startAmountNote: string
  vatNote: string
  missingTerms: string
  detailBack: string
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
  cartRemove: string
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
  modeCheckout: 'Einmalig',
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
  startAmountNote: 'Angezeigter Betrag ist ein Start-/Anzahlungswert in EUR und wird auf das Projekt angerechnet.',
  vatNote: 'Alle Beträge in EUR zzgl. MwSt., sofern nicht anders angegeben.',
  missingTerms:
    'Preise und Konditionen sind Orientierungswerte (kein Festpreis wie bei manchen Agenturen) — finale Vereinbarung im Briefing. Soft-Launch kann Demo-Checkout nutzen.',
  detailBack: 'Alle Pläne',
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
    checkout: 'Einmalig',
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
  cartRemove: 'Entfernen',
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
      a: 'Angezeigte EUR-Beträge sind Online-Startbeträge aus dem Katalog und werden serverseitig geprüft. Endpreise, Lieferzeiten und Vertragsbedingungen bedürfen noch der Freigabe durch BDITEC.',
    },
    {
      q: 'Warum Demo-Checkout?',
      a: 'Ohne konfigurierten Stripe-Testschlüssel bleibt der Soft-Launch im Demo-Modus — kein echter Karteneinzug. Live-/Test-Zahlung folgt nach Ops-Setup.',
    },
    {
      q: 'Wie funktionieren Abos?',
      a: 'Pakete mit Kaufart „Abo“ nutzen Stripe Billing, sobald Test-/Live-Keys und Price IDs gesetzt sind. Danach können Sie Abos im Kundenportal verwalten.',
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
  modeCheckout: 'One-time',
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
  startAmountNote: 'Shown amount is a start / deposit value in EUR and is credited toward the project.',
  vatNote: 'All amounts in EUR excl. VAT unless stated otherwise.',
  missingTerms:
    'Listed amounts are orientation start prices (not full agency Festpreise) — final scope is confirmed in the briefing. Soft-launch may use demo checkout.',
  detailBack: 'All plans',
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
    checkout: 'One-time',
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
  cartRemove: 'Remove',
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
      a: 'Listed EUR amounts are online catalog start amounts, validated on the server. Final prices, delivery times, and contract terms still need BDITEC business approval.',
    },
    {
      q: 'Why demo checkout?',
      a: 'Until a Stripe test secret is configured, soft-launch stays in demo mode — no real card charge. Live/test payment follows the ops setup.',
    },
    {
      q: 'How do subscriptions work?',
      a: 'Packages marked Subscription use Stripe Billing once test/live keys and Price IDs are set. You can then manage subscriptions in the customer portal.',
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
  modeCheckout: 'مرة واحدة',
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
  startAmountNote: 'المبلغ المعروض قيمة بداية / عربون باليورو ويُحتسب ضمن المشروع.',
  vatNote: 'جميع المبالغ باليورو بدون ضريبة القيمة المضافة ما لم يُذكر خلاف ذلك.',
  missingTerms:
    'المبالغ توجيهية لمبالغ البداية (وليست أسعار مشاريع كاملة) — النطاق النهائي يُؤكد في الإحاطة. الإطلاق التجريبي قد يستخدم دفعاً تجريبياً.',
  detailBack: 'كل الخطط',
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
    checkout: 'مرة واحدة',
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
  cartRemove: 'إزالة',
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
      a: 'المبالغ باليورو المعروضة هي مبالغ بداية من الكتالوج وتُتحقق على الخادم. الأسعار النهائية والمدد والشروط تحتاج موافقة أعمال BDITEC.',
    },
    {
      q: 'لماذا وضع العرض (Demo)؟',
      a: 'بدون مفتاح Stripe للاختبار يبقى الإطلاق التجريبي في وضع العرض — بلا خصم حقيقي. الدفع الحي/الاختباري يتبع إعداد العمليات.',
    },
    {
      q: 'كيف تعمل الاشتراكات؟',
      a: 'الباقات من نوع اشتراك تستخدم Stripe Billing بعد ضبط المفاتيح وPrice IDs. بعدها يمكن إدارة الاشتراك عبر بوابة العملاء.',
    },
  ],
}
