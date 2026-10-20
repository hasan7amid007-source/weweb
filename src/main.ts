import './styles/site.css'
import './features/hero/hero.css'
import './styles/effects.css'
import { SERVICE_ICONS, SERVICE_IDS } from './data/services'
import { fromPriceEur } from './features/booking/shop-catalog'
import { formatEur } from './features/booking/catalog'
import { initTelemetry } from './lib/telemetry'
import { initAccordions } from './features/accordion'
import { initBookingWizard, renderBookingFormMarkup } from './features/booking'
import { initShowcase, initTriangleMotion, triangleHeroSvg } from './features/hero'
import { bindLangSwitch, bindNavToggle, renderFooter, renderHeader } from './features/shell'
import {
  applyMeta,
  detectLocale,
  setLocale,
  t,
  type Locale,
} from './i18n'
import { svgAttention, svgQuickEdit, svgResponsive } from './ui/feature-svgs'

const root = document.querySelector<HTMLDivElement>('#app')
if (!root) throw new Error('#app not found')
const app: HTMLDivElement = root

function render(locale: Locale) {
  setLocale(locale)
  const m = t(locale)
  applyMeta(locale)

  app.innerHTML = `
  ${renderHeader(locale, 'home')}

  <main id="main">
    <section class="site-hero" aria-roledescription="carousel" aria-label="BDITEC">
      <div class="site-hero-bg" aria-hidden="true">${triangleHeroSvg}</div>
      <div class="site-hero-veil" aria-hidden="true"></div>

      <div class="hero-slide is-active" data-slide="0" aria-hidden="false">
        <div class="site-hero-copy">
          <h1 class="ts-title" data-enter="text">${m.hero.s1Title}</h1>
          <p class="ts-sub" data-enter="text">${m.hero.s1Sub}</p>
          <span class="glowborder" data-enter="text">
            <a class="ts-btn pink solid" href="#booking">
              <span class="mi" aria-hidden="true">▶</span> ${m.hero.s1Cta}
            </a>
          </span>
        </div>
      </div>

      <div class="hero-slide" data-slide="1" hidden aria-hidden="true">
        <div class="site-hero-copy">
          <h2 class="ts-title" data-enter="text">${m.hero.s2Title}</h2>
          <p class="ts-sub" data-enter="text">${m.hero.s2Sub}</p>
          <span class="glowborder" data-enter="text">
            <a class="ts-btn pink solid" href="#about">
              <span class="mi" aria-hidden="true">▶</span> ${m.hero.s2Cta}
            </a>
          </span>
        </div>
      </div>

      <div class="hero-slide" data-slide="2" hidden aria-hidden="true">
        <div class="site-hero-copy">
          <h2 class="ts-title" data-enter="text">${m.hero.s3Title}</h2>
          <p class="ts-sub" data-enter="text">${m.hero.s3Sub}</p>
          <span class="glowborder" data-enter="text">
            <a class="ts-btn pink solid" href="#services">
              <span class="mi" aria-hidden="true">▶</span> ${m.hero.s3Cta}
            </a>
          </span>
        </div>
      </div>
    </section>

    <section class="section must-have" id="about">
      <div class="wrap">
        <div class="must-head">
          <h2 class="animatetxtgradient">${m.about.title}</h2>
          <p class="lead">${m.about.lead}</p>
        </div>
        <div class="feature-cards">
          <article class="feature-card">
            ${svgAttention}
            <h3>${m.about.f1Title}</h3>
            <p>${m.about.f1Body}</p>
          </article>
          <article class="feature-card">
            ${svgQuickEdit}
            <h3>${m.about.f2Title}</h3>
            <p>${m.about.f2Body}</p>
          </article>
          <article class="feature-card">
            ${svgResponsive}
            <h3>${m.about.f3Title}</h3>
            <p>${m.about.f3Body}</p>
          </article>
        </div>
        <div class="center-cta">
          <span class="glowborder"><a class="ts-btn pink" href="#booking">${m.about.cta}</a></span>
        </div>
      </div>
    </section>

    <section class="section feature-band" id="quickedit">
      <div class="wrap feature-band-grid">
        <div>
          <p class="badge-pulse addpulse">${m.partner.badge}</p>
          <h2 class="serifhighlight">${m.partner.title}</h2>
          <p>${m.partner.p1}</p>
          <p>${m.partner.p2}</p>
          <div class="partner-stats" aria-label="${m.partner.statsLabel}">
            <p class="partner-stats-label">${m.partner.statsLabel}</p>
            <ul class="partner-stats-grid">
              ${m.partner.stats
                .map(
                  (stat) => `
                <li>
                  <strong>${stat.value}</strong>
                  <span>${stat.label}</span>
                </li>`,
                )
                .join('')}
            </ul>
          </div>
        </div>
        <div class="feature-media">
          <video class="qe-video" autoplay loop muted playsinline src="/page/quick-edit.mp4?v=20261018k"></video>
        </div>
      </div>
    </section>

    <section class="section dark-showcase" id="services">
      <div class="wrap">
        <div class="dark-head">
          <p class="tags"><span class="addpulse">${m.services.tags[0]}</span><span>${m.services.tags[1]}</span><span>${m.services.tags[2]}</span></p>
          <div class="dark-title-row">
            <h2>${m.services.title}</h2>
            <p>${m.services.lead}</p>
          </div>
        </div>

        <div class="dark-hero-card">
          <div class="devices-split">
            <div class="devices-media">
              <img
                class="devices-shot animated zoomIn"
                src="/page/devices-showcase.jpg"
                width="960"
                height="720"
                alt="${m.services.thumbAlt}"
                decoding="async"
                fetchpriority="high"
              />
            </div>
            <div class="devices-copy">
              <p class="devices-badge">${m.partner.badge}</p>
              <h3>${m.services.devicesTitle}</h3>
              <p>${m.services.devicesBody}</p>
              <span class="glowborder">
                <a class="ts-btn pink solid" href="#booking">
                  <span class="mi" aria-hidden="true">▶</span> ${m.services.devicesCta}
                </a>
              </span>
            </div>
          </div>
        </div>

        <div class="svc-framework" aria-label="${m.services.title}">
          ${SERVICE_IDS.map((id, i) => {
            const page = m.servicePages[id]
            const n = String(i + 1).padStart(2, '0')
            const tone = (i % 6) + 1
            const from = fromPriceEur(id)
            return `
            <a class="svc-fw-card tone-${tone}" href="/shop.html?service=${encodeURIComponent(id)}" style="--fw-i:${i}">
              <div class="svc-fw-head">
                <span class="svc-fw-num">${n}</span>
                <span class="svc-fw-icon" aria-hidden="true">
                  <img src="${SERVICE_ICONS[id]}" width="28" height="28" alt="" />
                </span>
              </div>
              <h3 class="svc-fw-title">${page.title}</h3>
              <p class="svc-fw-from">${m.shopPage.fromLabel} ${formatEur(from, locale)}</p>
              <ul class="svc-fw-list">
                ${page.highlights
                  .slice(0, 3)
                  .map((item) => `<li>${item}</li>`)
                  .join('')}
              </ul>
              <span class="svc-fw-more">${m.shopPage.choosePlan} →</span>
            </a>`
          }).join('')}
        </div>

        <div class="dark-footer-row">
          <div class="dark-footer-copy">
            <p class="dark-footer-kicker">${m.services.tags[0]} · ${m.services.tags[1]} · ${m.services.tags[2]}</p>
            <h3>${m.services.processTitle}</h3>
            <p>${m.services.processBody}</p>
          </div>
          <div class="dark-footer-ctas">
            <span class="glowborder"><a class="ts-btn pink solid" href="/shop.html">${m.nav.shop}</a></span>
            <span class="glowborder"><a class="ts-btn pink solid" href="#booking">${m.services.cta}</a></span>
          </div>
        </div>
      </div>
    </section>

    <section class="section resources" id="process">
      <div class="wrap">
        <h2>${m.process.title}</h2>
        <p class="lead">${m.process.lead}</p>
        <div class="resource-grid">
          <article>
            <h3>${m.process.p1Title}</h3>
            <p>${m.process.p1Body}</p>
          </article>
          <article>
            <h3>${m.process.p2Title}</h3>
            <p>${m.process.p2Body}</p>
          </article>
          <article>
            <h3>${m.process.p3Title}</h3>
            <p>${m.process.p3Body}</p>
          </article>
          <article>
            <h3>${m.process.p4Title}</h3>
            <p>${m.process.p4Body}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section faq-section" id="faq">
      <div class="wrap narrow">
        <h2 class="center animatetxtgradient">${m.faq.title}</h2>
        <p class="lead center">${m.faq.lead}</p>
        <div class="accordion" data-accordion data-track-open="home_faq_open">
          <details class="acc-item" open>
            <summary>${m.faq.q1}</summary>
            <div class="acc-body"><p>${m.faq.a1}</p></div>
          </details>
          <details class="acc-item">
            <summary>${m.faq.q2}</summary>
            <div class="acc-body"><p>${m.faq.a2}</p></div>
          </details>
          <details class="acc-item">
            <summary>${m.faq.q3}</summary>
            <div class="acc-body"><p>${m.faq.a3}</p></div>
          </details>
          <details class="acc-item">
            <summary>${m.faq.q4}</summary>
            <div class="acc-body"><p>${m.faq.a4}</p></div>
          </details>
        </div>
      </div>
    </section>

    <section class="section join-band">
      <div class="wrap">
        <div class="join-panel animated zoomIn delay-100ms">
          <div class="join-intro">
            <h2>${m.join.panelTitle}</h2>
            <p class="join-intro-body">${m.join.panelBody}</p>
            <span class="staticglowborder">
              <a class="ts-btn pink solid" href="#booking">${m.join.panelCta}</a>
            </span>
          </div>
          <div class="join-split">
            <div class="join-media">
              <img
                class="join-shot"
                src="/page/join-campaign.jpg"
                width="1400"
                height="900"
                alt="${m.join.imgAlt}"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div class="join-copy">
              <p class="join-eyebrow">${m.join.eyebrow}</p>
              <h2><span class="join-accent">${m.join.title}</span></h2>
              <span class="glowborder">
                <a class="ts-btn pink solid" href="#booking">
                  <span class="mi" aria-hidden="true">▶</span> ${m.join.cta}
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section contact-band" id="booking" data-alias-contact>
      <div class="wrap contact-hero">
        <p class="contact-eyebrow">${m.contact.eyebrow}</p>
        <h2>${m.contact.title}</h2>
        <p class="contact-lead">${m.contact.lead}</p>
      </div>
      <div class="contact-panel">
        <div class="wrap contact-grid">
          ${renderBookingFormMarkup(locale)}
          <aside class="contact-about">
            <p class="contact-about-badge">${m.partner.badge}</p>
            <h3>${m.contact.aboutTitle}</h3>
            <p class="contact-about-lead">${m.contact.aboutLead}</p>
            <p>${m.contact.aboutBody}</p>
            <ul class="contact-about-points">
              ${m.contact.aboutPoints.map((point) => `<li>${point}</li>`).join('')}
            </ul>
            <p class="booking-hint">${m.contact.successHint}</p>
          </aside>
        </div>
      </div>
    </section>
  </main>

  ${renderFooter(locale, 'home')}
`

  bindLangSwitch(app, locale, render)
  bindNavToggle(app, locale)
  initTriangleMotion(app)
  initShowcase(app)
  initAccordions(app)
  initSvcFramework(app)
  initBookingWizard(app, locale)
  aliasContactHash()
  scrollToBookingHash()
}

function scrollToBookingHash() {
  if (location.hash !== '#booking' && location.hash !== '#contact') return
  requestAnimationFrame(() => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function aliasContactHash() {
  if (location.hash === '#contact') {
    history.replaceState(null, '', `${location.pathname}${location.search}#booking`)
    scrollToBookingHash()
  }
  window.addEventListener('hashchange', () => {
    if (location.hash === '#contact') {
      history.replaceState(null, '', `${location.pathname}${location.search}#booking`)
      scrollToBookingHash()
    } else if (location.hash === '#booking') {
      scrollToBookingHash()
    }
  })
}

function initSvcFramework(root: ParentNode) {
  const grid = root.querySelector('.svc-framework')
  if (!(grid instanceof HTMLElement)) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    grid.classList.add('is-inview')
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-inview')
        io.unobserve(entry.target)
      }
    },
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
  )
  io.observe(grid)
}

initTelemetry()
render(detectLocale())
