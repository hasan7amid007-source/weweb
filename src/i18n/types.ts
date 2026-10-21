import type { BookingShopCopy } from './booking-shop'
import type { BriefingPageCopy } from './briefing-page'
import type { OrderPageCopy } from './order-page'
import type { ShopPageCopy } from './shop-page'

export type Locale = 'de' | 'en' | 'ar'

export type ServiceId =
  | 'web-hosting'
  | 'mobile-app'
  | 'web-development'
  | 'e-commerce'
  | 'digital-marketing'
  | 'offline-marketing'

export type ServicePageCopy = {
  title: string
  metaTitle: string
  metaDescription: string
  lead: string
  body: string[]
  highlights: string[]
  audienceTitle: string
  audience: string
  processTitle: string
  process: { title: string; body: string }[]
  deliverablesTitle: string
  deliverables: string[]
  benefitsTitle: string
  benefits: { title: string; body: string }[]
  faqTitle: string
  faq: { q: string; a: string }[]
  trustTitle: string
  trust: string[]
  closingTitle: string
  closingBody: string
  imgAlt: string
}

export type Messages = {
  meta: { title: string; description: string }
  brandHome: string
  nav: {
    about: string
    services: string
    shop: string
    faq: string
    contact: string
    process: string
  }
  navAria: string
  langAria: string
  menuOpen: string
  menuClose: string
  skipToContent: string
  slidesAria: string
  prevSlide: string
  nextSlide: string
  slideN: (n: number) => string
  hero: {
    s1Title: string
    s1Sub: string
    s1Cta: string
    s2Title: string
    s2Sub: string
    s2Cta: string
    s3Title: string
    s3Sub: string
    s3Cta: string
  }
  about: {
    title: string
    lead: string
    f1Title: string
    f1Body: string
    f2Title: string
    f2Body: string
    f3Title: string
    f3Body: string
    cta: string
  }
  partner: {
    badge: string
    title: string
    p1: string
    p2: string
    statsLabel: string
    stats: { value: string; label: string }[]
    mediaAlt: string
  }
  services: {
    tags: [string, string, string]
    title: string
    lead: string
    chip: string
    thumbAlt: string
    devicesTitle: string
    devicesBody: string
    devicesCta: string
    s1Title: string
    s1Body: string
    s2Title: string
    s2Body: string
    s3Title: string
    s3Body: string
    s4Title: string
    s4Body: string
    s5Title: string
    s5Body: string
    s6Title: string
    s6Body: string
    processTitle: string
    processBody: string
    cta: string
  }
  process: {
    title: string
    lead: string
    p1Title: string
    p1Body: string
    p2Title: string
    p2Body: string
    p3Title: string
    p3Body: string
    p4Title: string
    p4Body: string
  }
  faq: {
    title: string
    lead: string
    q1: string
    a1: string
    q2: string
    a2: string
    q3: string
    a3: string
    q4: string
    a4: string
  }
  join: {
    eyebrow: string
    title: string
    cta: string
    imgAlt: string
    panelTitle: string
    panelBody: string
    panelCta: string
  }
  contact: {
    eyebrow: string
    title: string
    lead: string
    cta: string
    nameLabel: string
    emailLabel: string
    phoneLabel: string
    serviceLabel: string
    servicePlaceholder: string
    serviceGeneral: string
    messageLabel: string
    successHint: string
    aboutTitle: string
    aboutLead: string
    aboutBody: string
    aboutPoints: string[]
    stepService: string
    stepOptions: string
    stepDetails: string
    stepPay: string
    next: string
    back: string
    depositLabel: string
    monthlyLabel: string
    depositHint: string
    monthlyHint: string
    extrasOnceLabel: string
    quotePackagesHeading: string
    quotePackageCta: string
    quoteMailtoSubject: string
    quoteMailtoBody: string
    summaryTitle: string
    payCta: string
    paySecure: string
    paySecureDemo: string
    paySecurePending: string
    payProcessing: string
    payUnavailable: string
    successTitle: string
    successBody: string
    successBodyDemo: string
    successAgain: string
    demoPayNote: string
  }
  bookingShop: BookingShopCopy
  shopPage: ShopPageCopy
  briefingPage: BriefingPageCopy
  orderPage: OrderPageCopy
  serviceUi: {
    back: string
    highlights: string
    related: string
    cta: string
    ctaSecondary: string
    ctaShop: string
    overview: string
    details: string
    included: string
  }
  servicePages: Record<ServiceId, ServicePageCopy>
  footer: {
    brandBlurb: string
    colBrand: string
    colSupport: string
    colServices: string
    colContact: string
    help: string
    phone: string
    impressum: string
    datenschutz: string
    credit: string
  }
  legal: {
    impressumTitle: string
    impressumDescription: string
    privacyTitle: string
    privacyDescription: string
    counselNote: string
    providerHeading: string
    contactHeading: string
    responsibleHeading: string
    privacyController: string
    privacyData: string
    privacyDataBody: string
    privacyPurpose: string
    privacyPurposeBody: string
    privacyRights: string
    privacyRightsBody: string
    privacyHosting: string
    privacyHostingBody: string
  }
}
