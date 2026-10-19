import './styles/site.css'
import './styles/effects.css'
import { SERVICE_ICONS, SERVICE_IDS, SERVICE_IMAGES, SITE_ORIGIN, isServiceId, servicePath, type ServiceId } from './data/services'
import { initTelemetry } from './lib/telemetry'
import { initAccordions } from './features/accordion'
import { bindLangSwitch, bindNavToggle, renderFooter, renderHeader, siteLinks } from './features/shell'
import { applyHreflang, detectLocale, setLocale, t, type Locale } from './i18n'

const root = document.querySelector<HTMLDivElement>('#app')
if (!root) throw new Error('#app not found')
const app = root

const serviceIdAttr = document.body.dataset.service
if (!isServiceId(serviceIdAttr)) {
  throw new Error(`Unknown service: ${serviceIdAttr}`)
}
const serviceId: ServiceId = serviceIdAttr

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  const sel = attr === 'name' ? `meta[name="${key}"]` : `meta[property="${key}"]`
  let el = document.querySelector<HTMLMetaElement>(sel)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

function applyServiceMeta(locale: Locale) {
  const page = t(locale).servicePages[serviceId]
  const url = `${SITE_ORIGIN}${servicePath(serviceId)}`
  document.title = page.metaTitle
  upsertMeta('name', 'description', page.metaDescription)
  upsertLink('canonical', url)
  upsertMeta('property', 'og:type', 'website')
  upsertMeta('property', 'og:title', page.metaTitle)
  upsertMeta('property', 'og:description', page.metaDescription)
  upsertMeta('property', 'og:url', url)
  const image = `${SITE_ORIGIN}${SERVICE_IMAGES[serviceId]}`
  upsertMeta('property', 'og:image', image)
  upsertMeta(
    'property',
    'og:locale',
    locale === 'de' ? 'de_DE' : locale === 'en' ? 'en_US' : 'ar_AR',
  )
  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', page.metaTitle)
  upsertMeta('name', 'twitter:description', page.metaDescription)
  upsertMeta('name', 'twitter:image', image)
  applyHreflang(servicePath(serviceId))
}

function injectJsonLd(locale: Locale) {
  const page = t(locale).servicePages[serviceId]
  const url = `${SITE_ORIGIN}${servicePath(serviceId)}`
  const payload = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: page.title,
        description: page.metaDescription,
        url,
        provider: {
          '@type': 'Organization',
          name: 'BDITEC',
          url: SITE_ORIGIN,
          email: 'info@bditec.com',
          telephone: '+49-1573-5804396',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Alte Holsten Straße 72',
            addressLocality: 'Hamburg',
            postalCode: '21029',
            addressCountry: 'DE',
          },
        },
        areaServed: 'DE',
        image: `${SITE_ORIGIN}${SERVICE_IMAGES[serviceId]}`,
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'BDITEC',
            item: `${SITE_ORIGIN}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: page.title,
            item: url,
          },
        ],
      },
    ],
  }

  document.querySelectorAll('script[data-service-jsonld]').forEach((n) => n.remove())
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.dataset.serviceJsonld = '1'
  script.textContent = JSON.stringify(payload)
  document.head.appendChild(script)
}

function render(locale: Locale) {
  const m = t(locale)
  setLocale(locale)
  applyServiceMeta(locale)
  injectJsonLd(locale)
  const page = m.servicePages[serviceId]
  const links = siteLinks('service')
  const bookingHref = `/?service=${serviceId}#booking`
  const shopHref = `/shop.html?service=${encodeURIComponent(serviceId)}`
  const related = SERVICE_IDS.filter((id) => id !== serviceId)

  app.innerHTML = `
  ${renderHeader(locale, 'service')}

  <main id="main" class="service-main">
    <section
      class="service-hero-band"
      style="--service-hero-image: url('${SERVICE_IMAGES[serviceId]}')"
      aria-label="${page.imgAlt}"
    >
      <div class="wrap service-hero-grid">
        <div class="service-hero-copy">
          <nav class="service-crumb" aria-label="Breadcrumb">
            <a class="service-back" href="${links.services}">← ${m.serviceUi.back}</a>
          </nav>
          <p class="devices-badge">${m.partner.badge}</p>
          <h1>${page.title}</h1>
          <p class="service-lead">${page.lead}</p>
          <div class="service-hero-actions">
            <span class="glowborder">
              <a class="ts-btn pink solid" href="${bookingHref}">
                <span class="mi" aria-hidden="true">▶</span> ${m.serviceUi.cta}
              </a>
            </span>
            <a class="service-hero-secondary" href="${shopHref}">${m.serviceUi.ctaShop}</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section service-benefits" aria-labelledby="service-benefits-title">
      <div class="wrap">
        <h2 id="service-benefits-title">${page.benefitsTitle}</h2>
        <div class="service-benefit-grid">
          ${page.benefits
            .map(
              (b) => `
            <article class="service-benefit">
              <h3>${b.title}</h3>
              <p>${b.body}</p>
            </article>`,
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="section service-body">
      <div class="wrap service-layout">
        <div class="service-prose">
          <h2>${m.serviceUi.overview}</h2>
          ${page.body.map((p) => `<p>${p}</p>`).join('')}

          <h2>${page.audienceTitle}</h2>
          <p>${page.audience}</p>

          <h2>${page.processTitle}</h2>
          <ol class="service-steps">
            ${page.process
              .map(
                (step, i) => `
              <li>
                <span class="service-step-num">${String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>${step.title}</h3>
                  <p>${step.body}</p>
                </div>
              </li>`,
              )
              .join('')}
          </ol>

          <h2 id="service-faq-title">${page.faqTitle}</h2>
          <div class="service-faq" data-accordion>
            ${page.faq
              .map(
                (item) => `
              <details>
                <summary>${item.q}</summary>
                <p>${item.a}</p>
              </details>`,
              )
              .join('')}
          </div>
        </div>

        <aside class="service-aside-stack">
          <div class="service-aside">
            <h2>${m.serviceUi.included}</h2>
            <ul>
              ${page.highlights.map((item) => `<li>${item}</li>`).join('')}
            </ul>
          </div>
          <div class="service-aside">
            <h2>${page.deliverablesTitle}</h2>
            <ul>
              ${page.deliverables.map((item) => `<li>${item}</li>`).join('')}
            </ul>
          </div>
          <div class="service-aside">
            <h2>${page.trustTitle}</h2>
            <ul>
              ${page.trust.map((item) => `<li>${item}</li>`).join('')}
            </ul>
          </div>
          <div class="service-aside service-aside-cta">
            <p class="devices-badge">${m.partner.badge}</p>
            <h2>${m.serviceUi.cta}</h2>
            <p>${page.lead}</p>
            <span class="glowborder">
              <a class="ts-btn pink solid" href="${bookingHref}">
                <span class="mi" aria-hidden="true">▶</span> ${m.serviceUi.cta}
              </a>
            </span>
            <p class="service-aside-shop"><a href="${shopHref}">${m.serviceUi.ctaShop}</a></p>
          </div>
        </aside>
      </div>
    </section>

    <section class="section service-closing" aria-labelledby="service-closing-title">
      <div class="wrap service-closing-inner">
        <div>
          <h2 id="service-closing-title">${page.closingTitle}</h2>
          <p>${page.closingBody}</p>
        </div>
        <span class="glowborder">
          <a class="ts-btn pink solid" href="${bookingHref}">
            <span class="mi" aria-hidden="true">▶</span> ${m.serviceUi.cta}
          </a>
        </span>
      </div>
    </section>

    <section class="section dark-showcase service-related">
      <div class="wrap">
        <h2>${m.serviceUi.related}</h2>
        <div class="service-grid">
          ${related
            .map((id) => {
              const sp = m.servicePages[id]
              return `
              <a class="service-item service-item-link" href="${servicePath(id)}">
                <span class="service-icon"><img src="${SERVICE_ICONS[id]}" width="24" height="24" alt="" loading="lazy" decoding="async" /></span>
                <div>
                  <h3>${sp.title}</h3>
                  <p>${sp.lead}</p>
                </div>
              </a>`
            })
            .join('')}
        </div>
      </div>
    </section>
  </main>

  ${renderFooter(locale, 'service')}
`

  bindLangSwitch(app, locale, render)
  bindNavToggle(app, locale)
  initAccordions(app)
}

initTelemetry()
render(detectLocale())
