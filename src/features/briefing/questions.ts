import type { BookingServiceKey } from '../booking/catalog'
import type { BriefingFieldDef, BriefingProfileId, BriefingStepId } from './types'

const ADVICE = 'advice'

function opt(...values: string[]): { value: string; labelKey: string }[] {
  return values.map((value) => ({ value, labelKey: `opt.${value}` }))
}

const SHARED_BUSINESS: BriefingFieldDef[] = [
  {
    id: 'company',
    type: 'text',
    labelKey: 'fields.company',
    required: true,
    maxLength: 160,
    shared: true,
  },
  {
    id: 'industry',
    type: 'select',
    labelKey: 'fields.industry',
    required: true,
    options: opt(
      'retail',
      'services',
      'tech',
      'health',
      'hospitality',
      'manufacturing',
      'nonprofit',
      'other',
    ),
    shared: true,
  },
  {
    id: 'industryOther',
    type: 'text',
    labelKey: 'fields.industryOther',
    maxLength: 120,
    shared: true,
    when: { field: 'industry', values: ['other'] },
  },
  {
    id: 'businessDescription',
    type: 'textarea',
    labelKey: 'fields.businessDescription',
    required: true,
    maxLength: 1200,
    shared: true,
  },
  {
    id: 'mainGoal',
    type: 'textarea',
    labelKey: 'fields.mainGoal',
    required: true,
    maxLength: 800,
    shared: true,
  },
  {
    id: 'audience',
    type: 'textarea',
    labelKey: 'fields.audience',
    required: true,
    maxLength: 600,
    shared: true,
  },
  {
    id: 'regions',
    type: 'text',
    labelKey: 'fields.regions',
    required: true,
    maxLength: 200,
    shared: true,
  },
  {
    id: 'languages',
    type: 'text',
    labelKey: 'fields.languages',
    required: true,
    maxLength: 120,
    shared: true,
  },
  {
    id: 'existingWebsite',
    type: 'url',
    labelKey: 'fields.existingWebsite',
    hintKey: 'hints.urlOptional',
    maxLength: 400,
    shared: true,
  },
  {
    id: 'contactName',
    type: 'text',
    labelKey: 'fields.contactName',
    required: true,
    maxLength: 120,
    shared: true,
  },
  {
    id: 'contactEmail',
    type: 'email',
    labelKey: 'fields.contactEmail',
    required: true,
    maxLength: 254,
    shared: true,
  },
  {
    id: 'contactPhone',
    type: 'tel',
    labelKey: 'fields.contactPhone',
    maxLength: 40,
    shared: true,
  },
  {
    id: 'timing',
    type: 'select',
    labelKey: 'fields.timing',
    required: true,
    options: opt('flexible', 'asap', 'date'),
    hintKey: 'hints.dateNotConfirmed',
    shared: true,
  },
  {
    id: 'desiredDate',
    type: 'text',
    labelKey: 'fields.desiredDate',
    hintKey: 'hints.dateNotConfirmed',
    maxLength: 80,
    shared: true,
    when: { field: 'timing', values: ['date'] },
  },
  {
    id: 'budget',
    type: 'select',
    labelKey: 'fields.budget',
    options: opt('open', 'under-1k', '1k-3k', '3k-8k', '8k-plus'),
    hintKey: 'hints.budgetNotQuote',
    shared: true,
  },
]

const WEB_FIELDS: BriefingFieldDef[] = [
  {
    id: 'projectStatus',
    type: 'radio',
    labelKey: 'fields.projectStatus',
    required: true,
    options: opt('new', 'redesign', 'improve', ADVICE),
  },
  {
    id: 'currentUrl',
    type: 'url',
    labelKey: 'fields.currentUrl',
    maxLength: 400,
    when: { field: 'projectStatus', values: ['redesign', 'improve'] },
  },
  {
    id: 'currentProblems',
    type: 'textarea',
    labelKey: 'fields.currentProblems',
    maxLength: 1000,
    when: { field: 'projectStatus', values: ['redesign', 'improve'] },
  },
  {
    id: 'websitePurpose',
    type: 'radio',
    labelKey: 'fields.websitePurpose',
    required: true,
    options: opt(
      'presentation',
      'leads',
      'landing',
      'booking',
      'store',
      'webapp',
      ADVICE,
    ),
  },
  {
    id: 'requiredPages',
    type: 'textarea',
    labelKey: 'fields.requiredPages',
    required: true,
    maxLength: 800,
  },
  {
    id: 'siteLanguages',
    type: 'text',
    labelKey: 'fields.siteLanguages',
    maxLength: 120,
  },
  {
    id: 'needsForms',
    type: 'radio',
    labelKey: 'fields.needsForms',
    options: opt('yes', 'no', ADVICE),
  },
  {
    id: 'needsBooking',
    type: 'radio',
    labelKey: 'fields.needsBooking',
    options: opt('yes', 'no', ADVICE),
  },
  {
    id: 'needsAccounts',
    type: 'radio',
    labelKey: 'fields.needsAccounts',
    options: opt('yes', 'no', ADVICE),
  },
  {
    id: 'needsCms',
    type: 'radio',
    labelKey: 'fields.needsCms',
    options: opt('yes', 'no', ADVICE),
  },
  {
    id: 'integrations',
    type: 'textarea',
    labelKey: 'fields.integrations',
    hintKey: 'hints.integrations',
    maxLength: 800,
  },
  {
    id: 'domainHosting',
    type: 'textarea',
    labelKey: 'fields.domainHosting',
    maxLength: 600,
  },
  {
    id: 'contentProvider',
    type: 'radio',
    labelKey: 'fields.contentProvider',
    options: opt('customer', 'agency', 'mixed', ADVICE),
  },
]

const ECOM_EXTRA: BriefingFieldDef[] = [
  {
    id: 'storeStatus',
    type: 'radio',
    labelKey: 'fields.storeStatus',
    required: true,
    options: opt('new-store', 'migration', ADVICE),
  },
  {
    id: 'existingPlatform',
    type: 'text',
    labelKey: 'fields.existingPlatform',
    maxLength: 120,
    when: { field: 'storeStatus', values: ['migration'] },
  },
  {
    id: 'productCount',
    type: 'select',
    labelKey: 'fields.productCount',
    options: opt('under-20', '20-100', '100-500', '500-plus', 'unknown'),
  },
  {
    id: 'productTypes',
    type: 'checkbox',
    labelKey: 'fields.productTypes',
    options: opt('physical', 'digital', 'service-products', 'subscriptions'),
  },
  {
    id: 'marketsCurrencies',
    type: 'text',
    labelKey: 'fields.marketsCurrencies',
    maxLength: 200,
  },
  {
    id: 'shippingNeeds',
    type: 'textarea',
    labelKey: 'fields.shippingNeeds',
    maxLength: 600,
  },
  {
    id: 'inventoryIntegrations',
    type: 'textarea',
    labelKey: 'fields.inventoryIntegrations',
    maxLength: 600,
  },
  {
    id: 'paymentMethods',
    type: 'textarea',
    labelKey: 'fields.paymentMethods',
    hintKey: 'hints.noCredentials',
    maxLength: 400,
  },
  {
    id: 'migrationData',
    type: 'textarea',
    labelKey: 'fields.migrationData',
    maxLength: 600,
    when: { field: 'storeStatus', values: ['migration'] },
  },
]

const MOBILE_FIELDS: BriefingFieldDef[] = [
  {
    id: 'appProblem',
    type: 'textarea',
    labelKey: 'fields.appProblem',
    required: true,
    maxLength: 1000,
  },
  {
    id: 'appUsers',
    type: 'textarea',
    labelKey: 'fields.appUsers',
    required: true,
    maxLength: 600,
  },
  {
    id: 'firstVersion',
    type: 'textarea',
    labelKey: 'fields.firstVersion',
    required: true,
    maxLength: 800,
  },
  {
    id: 'platforms',
    type: 'radio',
    labelKey: 'fields.platforms',
    required: true,
    options: opt('ios', 'android', 'both', ADVICE),
  },
  {
    id: 'existingApp',
    type: 'radio',
    labelKey: 'fields.existingApp',
    options: opt('none', 'prototype', 'live', 'designs'),
  },
  {
    id: 'loginRoles',
    type: 'textarea',
    labelKey: 'fields.loginRoles',
    maxLength: 600,
  },
  {
    id: 'featPayments',
    type: 'radio',
    labelKey: 'fields.featPayments',
    options: opt('essential', 'later', 'discuss', 'none'),
  },
  {
    id: 'featNotifications',
    type: 'radio',
    labelKey: 'fields.featNotifications',
    options: opt('essential', 'later', 'discuss', 'none'),
  },
  {
    id: 'featMaps',
    type: 'radio',
    labelKey: 'fields.featMaps',
    options: opt('essential', 'later', 'discuss', 'none'),
  },
  {
    id: 'featCamera',
    type: 'radio',
    labelKey: 'fields.featCamera',
    options: opt('essential', 'later', 'discuss', 'none'),
  },
  {
    id: 'featMessaging',
    type: 'radio',
    labelKey: 'fields.featMessaging',
    options: opt('essential', 'later', 'discuss', 'none'),
  },
  {
    id: 'featOffline',
    type: 'radio',
    labelKey: 'fields.featOffline',
    options: opt('essential', 'later', 'discuss', 'none'),
  },
  {
    id: 'existingBackend',
    type: 'textarea',
    labelKey: 'fields.existingBackend',
    hintKey: 'hints.noCredentials',
    maxLength: 600,
  },
  {
    id: 'adminDashboard',
    type: 'radio',
    labelKey: 'fields.adminDashboard',
    options: opt('yes', 'no', ADVICE),
  },
  {
    id: 'appLanguages',
    type: 'text',
    labelKey: 'fields.appLanguages',
    maxLength: 120,
  },
  {
    id: 'referenceApps',
    type: 'textarea',
    labelKey: 'fields.referenceApps',
    maxLength: 800,
  },
]

const MARKETING_FIELDS: BriefingFieldDef[] = [
  {
    id: 'marketingHelp',
    type: 'checkbox',
    labelKey: 'fields.marketingHelp',
    required: true,
    options: opt('strategy', 'paid-ads', 'content', 'social', ADVICE),
  },
  {
    id: 'marketingObjective',
    type: 'textarea',
    labelKey: 'fields.marketingObjective',
    required: true,
    maxLength: 800,
  },
  {
    id: 'promoteWhat',
    type: 'textarea',
    labelKey: 'fields.promoteWhat',
    required: true,
    maxLength: 600,
  },
  {
    id: 'currentChannels',
    type: 'textarea',
    labelKey: 'fields.currentChannels',
    maxLength: 800,
  },
  {
    id: 'pastCampaigns',
    type: 'textarea',
    labelKey: 'fields.pastCampaigns',
    maxLength: 800,
  },
  {
    id: 'mainOffer',
    type: 'textarea',
    labelKey: 'fields.mainOffer',
    maxLength: 600,
  },
  {
    id: 'adsBudget',
    type: 'text',
    labelKey: 'fields.adsBudget',
    hintKey: 'hints.adsBudgetSeparate',
    maxLength: 120,
  },
  {
    id: 'contentApprover',
    type: 'text',
    labelKey: 'fields.contentApprover',
    maxLength: 120,
  },
  {
    id: 'socialPlatforms',
    type: 'checkbox',
    labelKey: 'fields.socialPlatforms',
    options: opt('instagram', 'facebook', 'linkedin', 'tiktok', 'youtube', 'other'),
    when: { field: 'marketingHelp', values: ['social'] },
  },
  {
    id: 'contentFormats',
    type: 'textarea',
    labelKey: 'fields.contentFormats',
    maxLength: 400,
    when: { field: 'marketingHelp', values: ['social', 'content'] },
  },
  {
    id: 'toneOfVoice',
    type: 'text',
    labelKey: 'fields.toneOfVoice',
    maxLength: 200,
    when: { field: 'marketingHelp', values: ['social', 'content'] },
  },
  {
    id: 'communityManagement',
    type: 'radio',
    labelKey: 'fields.communityManagement',
    options: opt('yes', 'no', ADVICE),
    when: { field: 'marketingHelp', values: ['social'] },
  },
]

const SEO_FIELDS: BriefingFieldDef[] = [
  {
    id: 'seoUrl',
    type: 'url',
    labelKey: 'fields.seoUrl',
    required: true,
    maxLength: 400,
  },
  {
    id: 'seoPlatform',
    type: 'text',
    labelKey: 'fields.seoPlatform',
    maxLength: 120,
  },
  {
    id: 'priorityOffers',
    type: 'textarea',
    labelKey: 'fields.priorityOffers',
    required: true,
    maxLength: 600,
  },
  {
    id: 'competitors',
    type: 'textarea',
    labelKey: 'fields.competitors',
    maxLength: 600,
  },
  {
    id: 'keywords',
    type: 'textarea',
    labelKey: 'fields.keywords',
    maxLength: 600,
  },
  {
    id: 'trafficChanges',
    type: 'textarea',
    labelKey: 'fields.trafficChanges',
    maxLength: 600,
  },
  {
    id: 'analyticsAccess',
    type: 'radio',
    labelKey: 'fields.analyticsAccess',
    hintKey: 'hints.permissionsNotPasswords',
    options: opt('yes', 'no', 'unknown'),
  },
  {
    id: 'desiredConversions',
    type: 'checkbox',
    labelKey: 'fields.desiredConversions',
    options: opt('inquiries', 'calls', 'bookings', 'purchases'),
  },
  {
    id: 'whoImplements',
    type: 'radio',
    labelKey: 'fields.whoImplements',
    options: opt('customer', 'agency', 'mixed', ADVICE),
  },
]

const HOSTING_FIELDS: BriefingFieldDef[] = [
  {
    id: 'hostingNeed',
    type: 'radio',
    labelKey: 'fields.hostingNeed',
    required: true,
    options: opt('new-hosting', 'migration', 'maintenance', 'troubleshoot'),
  },
  {
    id: 'hostingUrl',
    type: 'url',
    labelKey: 'fields.hostingUrl',
    maxLength: 400,
  },
  {
    id: 'hostingPlatform',
    type: 'text',
    labelKey: 'fields.hostingPlatform',
    maxLength: 120,
  },
  {
    id: 'currentProvider',
    type: 'text',
    labelKey: 'fields.currentProvider',
    maxLength: 120,
  },
  {
    id: 'hasStoreOrAccounts',
    type: 'radio',
    labelKey: 'fields.hasStoreOrAccounts',
    options: opt('yes', 'no', 'unknown'),
  },
  {
    id: 'approxUsage',
    type: 'select',
    labelKey: 'fields.approxUsage',
    options: opt('low', 'medium', 'high', 'unknown'),
  },
  {
    id: 'domainsEmail',
    type: 'textarea',
    labelKey: 'fields.domainsEmail',
    maxLength: 600,
  },
  {
    id: 'backups',
    type: 'radio',
    labelKey: 'fields.backups',
    options: opt('yes', 'no', 'unknown'),
  },
  {
    id: 'urgency',
    type: 'textarea',
    labelKey: 'fields.urgency',
    hintKey: 'hints.noSla',
    maxLength: 400,
  },
  {
    id: 'migrationScope',
    type: 'textarea',
    labelKey: 'fields.migrationScope',
    maxLength: 800,
    when: { field: 'hostingNeed', values: ['migration'] },
  },
  {
    id: 'emailContinuity',
    type: 'radio',
    labelKey: 'fields.emailContinuity',
    options: opt('yes', 'no', 'unknown'),
    when: { field: 'hostingNeed', values: ['migration'] },
  },
  {
    id: 'downtimeConstraints',
    type: 'textarea',
    labelKey: 'fields.downtimeConstraints',
    maxLength: 400,
    when: { field: 'hostingNeed', values: ['migration'] },
  },
  {
    id: 'problemDescription',
    type: 'textarea',
    labelKey: 'fields.problemDescription',
    required: true,
    maxLength: 1200,
    when: { field: 'hostingNeed', values: ['troubleshoot'] },
  },
  {
    id: 'problemStarted',
    type: 'text',
    labelKey: 'fields.problemStarted',
    maxLength: 120,
    when: { field: 'hostingNeed', values: ['troubleshoot'] },
  },
  {
    id: 'reproduceSteps',
    type: 'textarea',
    labelKey: 'fields.reproduceSteps',
    maxLength: 800,
    when: { field: 'hostingNeed', values: ['troubleshoot'] },
  },
]

const OFFLINE_FIELDS: BriefingFieldDef[] = [
  {
    id: 'offlineType',
    type: 'radio',
    labelKey: 'fields.offlineType',
    required: true,
    options: opt('print', 'events', 'outdoor', 'production'),
  },
  {
    id: 'printMaterial',
    type: 'text',
    labelKey: 'fields.printMaterial',
    maxLength: 200,
    when: { field: 'offlineType', values: ['print'] },
  },
  {
    id: 'printDimensions',
    type: 'text',
    labelKey: 'fields.printDimensions',
    maxLength: 120,
    when: { field: 'offlineType', values: ['print', 'production'] },
  },
  {
    id: 'printQuantity',
    type: 'text',
    labelKey: 'fields.printQuantity',
    maxLength: 80,
    when: { field: 'offlineType', values: ['print'] },
  },
  {
    id: 'designReadiness',
    type: 'radio',
    labelKey: 'fields.designReadiness',
    options: opt('ready', 'need-design', 'partial'),
    when: { field: 'offlineType', values: ['print', 'production'] },
  },
  {
    id: 'eventType',
    type: 'text',
    labelKey: 'fields.eventType',
    maxLength: 200,
    when: { field: 'offlineType', values: ['events'] },
  },
  {
    id: 'eventLocationDate',
    type: 'text',
    labelKey: 'fields.eventLocationDate',
    maxLength: 200,
    when: { field: 'offlineType', values: ['events'] },
  },
  {
    id: 'outdoorMedium',
    type: 'text',
    labelKey: 'fields.outdoorMedium',
    maxLength: 200,
    when: { field: 'offlineType', values: ['outdoor'] },
  },
  {
    id: 'campaignDuration',
    type: 'text',
    labelKey: 'fields.campaignDuration',
    maxLength: 120,
    when: { field: 'offlineType', values: ['outdoor'] },
  },
  {
    id: 'scopeSplit',
    type: 'radio',
    labelKey: 'fields.scopeSplit',
    required: true,
    options: opt('design-only', 'design-production', 'production-files', 'install-also'),
    hintKey: 'hints.siteAssessment',
  },
  {
    id: 'siteAccess',
    type: 'textarea',
    labelKey: 'fields.siteAccess',
    maxLength: 600,
    when: { field: 'offlineType', values: ['production', 'outdoor'] },
  },
]

const VISUAL_FIELDS: BriefingFieldDef[] = [
  {
    id: 'identityStatus',
    type: 'radio',
    labelKey: 'fields.identityStatus',
    required: true,
    options: opt('identity-existing', 'identity-improve', 'identity-new'),
  },
  {
    id: 'primaryColor',
    type: 'color',
    labelKey: 'fields.primaryColor',
    maxLength: 7,
  },
  {
    id: 'secondaryColor',
    type: 'color',
    labelKey: 'fields.secondaryColor',
    maxLength: 7,
  },
  {
    id: 'suggestPalette',
    type: 'radio',
    labelKey: 'fields.suggestPalette',
    options: opt('yes', 'no'),
  },
  {
    id: 'colorsAvoid',
    type: 'text',
    labelKey: 'fields.colorsAvoid',
    maxLength: 200,
  },
  {
    id: 'visualDirection',
    type: 'radio',
    labelKey: 'fields.visualDirection',
    required: true,
    options: opt('minimal', 'corporate', 'premium', 'bold', 'friendly', ADVICE),
  },
  {
    id: 'visualExplain',
    type: 'textarea',
    labelKey: 'fields.visualExplain',
    maxLength: 600,
  },
  {
    id: 'referenceLinks',
    type: 'textarea',
    labelKey: 'fields.referenceLinks',
    hintKey: 'hints.referencesGuide',
    maxLength: 1000,
  },
  {
    id: 'referenceLikes',
    type: 'textarea',
    labelKey: 'fields.referenceLikes',
    maxLength: 600,
  },
  {
    id: 'referenceAvoid',
    type: 'textarea',
    labelKey: 'fields.referenceAvoid',
    maxLength: 600,
  },
]

const MATERIAL_KEYS = [
  'logo',
  'copy',
  'photos',
  'guidelines',
  'designs',
  'printFiles',
  'techSpecs',
] as const

export type MaterialKey = (typeof MATERIAL_KEYS)[number]

export function materialKeysForProfile(profile: BriefingProfileId): MaterialKey[] {
  if (profile === 'hosting') return ['techSpecs', 'guidelines']
  if (profile === 'offline') return ['logo', 'copy', 'photos', 'guidelines', 'designs', 'printFiles']
  if (profile === 'seo') return ['guidelines', 'techSpecs']
  return ['logo', 'copy', 'photos', 'guidelines', 'designs']
}

export function profileForService(
  service: BookingServiceKey,
  packageId: string,
): BriefingProfileId {
  if (service === 'e-commerce') return 'ecommerce'
  if (service === 'mobile-app') return 'mobile'
  if (service === 'web-hosting') return 'hosting'
  if (service === 'offline-marketing') return 'offline'
  if (service === 'general') return 'general'
  if (service === 'digital-marketing') {
    if (packageId === 'audit' || packageId === 'seo-pflege') return 'seo'
    return 'marketing'
  }
  return 'web'
}

export function requirementFields(profile: BriefingProfileId): BriefingFieldDef[] {
  switch (profile) {
    case 'ecommerce':
      return [...WEB_FIELDS, ...ECOM_EXTRA]
    case 'mobile':
      return MOBILE_FIELDS
    case 'marketing':
      return MARKETING_FIELDS
    case 'seo':
      return SEO_FIELDS
    case 'hosting':
      return HOSTING_FIELDS
    case 'offline':
      return OFFLINE_FIELDS
    case 'general':
      return WEB_FIELDS
    default:
      return WEB_FIELDS
  }
}

export function sharedBusinessFields(): BriefingFieldDef[] {
  return SHARED_BUSINESS
}

export function visualFields(): BriefingFieldDef[] {
  return VISUAL_FIELDS
}

/** Hosting and SEO skip visual identity; other profiles include it. */
export function stepsForDocument(input: {
  service: BookingServiceKey
  packageId: string
}): BriefingStepId[] {
  const profile = profileForService(input.service, input.packageId)
  const steps: BriefingStepId[] = ['business', 'requirements']
  if (profile !== 'hosting' && profile !== 'seo') {
    steps.push('visual')
  }
  steps.push('materials', 'review')
  return steps
}

export function fieldVisible(
  field: BriefingFieldDef,
  values: Record<string, string | string[]>,
): boolean {
  if (!field.when) return true
  const raw = values[field.when.field]
  if (Array.isArray(raw)) {
    return field.when.values.some((v) => raw.includes(v))
  }
  return field.when.values.includes(String(raw || ''))
}

export function serviceSpecificAnswerKeys(service: BookingServiceKey, packageId: string): string[] {
  const profile = profileForService(service, packageId)
  return requirementFields(profile).map((f) => f.id)
}
