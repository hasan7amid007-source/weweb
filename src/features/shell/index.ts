import { LOCALES, type Locale, t } from '../../i18n'
import { SERVICE_IDS, servicePath } from '../../data/services'

export function langSwitcher(locale: Locale) {
  return `
    <div class="lang-switch" role="group" aria-label="Language">
      ${LOCALES.map(
        (l) => `
        <button type="button" class="lang-btn${l.id === locale ? ' is-active' : ''}"
          data-locale="${l.id}" aria-pressed="${l.id === locale}">${l.label}</button>`
      ).join('')}
    </div>`
}

/** Links from home (hash) vs nested service pages */
export function siteLinks(from: 'home' | 'service') {
  const root = from === 'home' ? '' : '/'
  const hash = (id: string) => (from === 'home' ? `#${id}` : `${root}#${id}`)
  return {
    home: from === 'home' ? '#top' : '/',
    about: hash('about'),
    services: hash('services'),
    faq: hash('faq'),
    /** Self-service checkout (service → details → pay). Legacy #contact aliases to #booking. */
    contact: hash('booking'),
    booking: hash('booking'),
    process: hash('process'),
  }
}

export function renderHeader(locale: Locale, from: 'home' | 'service') {
  const m = t(locale)
  const links = siteLinks(from)
  return `
  <header class="site-header">
    <a class="brand" href="${links.home}" aria-label="${m.brandHome}">
      <span class="brand-mark" aria-hidden="true"></span>
      <span class="brand-name">BDITEC</span>
    </a>
    <nav class="header-nav" aria-label="${m.navAria}">
      <a href="${links.about}">${m.nav.about}</a>
      <a href="${links.services}">${m.nav.services}</a>
      <a href="${links.faq}">${m.nav.faq}</a>
      <a href="${links.contact}">${m.nav.contact}</a>
    </nav>
    <div class="header-actions">
      ${langSwitcher(locale)}
      <a class="header-cta" href="${links.contact}">${m.nav.contact}</a>
    </div>
  </header>`
}

export function renderFooter(locale: Locale, from: 'home' | 'service') {
  const m = t(locale)
  const links = siteLinks(from)
  return `
  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div class="footer-brand-col">
          <strong class="footer-logo">BDITEC</strong>
          <p class="footer-blurb">${m.footer.brandBlurb}</p>
          <ul>
            <li><a href="${links.about}">${m.nav.about}</a></li>
            <li><a href="${links.services}">${m.nav.services}</a></li>
            <li><a href="${links.process}">${m.nav.process}</a></li>
            <li><a href="${links.contact}">${m.nav.contact}</a></li>
          </ul>
        </div>
        <div>
          <strong>${m.footer.colServices}</strong>
          <ul>
            ${SERVICE_IDS.map((id) => {
              const page = m.servicePages[id]
              return `<li><a href="${servicePath(id)}">${page.title}</a></li>`
            }).join('')}
          </ul>
        </div>
        <div>
          <strong>${m.footer.colSupport}</strong>
          <ul>
            <li><a href="${links.faq}">${m.nav.faq}</a></li>
            <li><a href="mailto:info@bditec.com">${m.footer.help}</a></li>
            <li><a href="tel:+4915735804396">${m.footer.phone}</a></li>
            <li><a href="${links.contact}">${m.nav.contact}</a></li>
          </ul>
        </div>
        <div>
          <strong>${m.footer.colContact}</strong>
          <ul>
            <li>Alte Holsten Straße 72</li>
            <li>21029 Hamburg, Deutschland</li>
            <li><a href="mailto:info@bditec.com">info@bditec.com</a></li>
            <li><a href="tel:+4915735804396">+49 1573 5804396</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="credit">${m.footer.credit}</p>
      </div>
    </div>
  </footer>`
}

export function bindLangSwitch(root: HTMLElement, locale: Locale, onChange: (next: Locale) => void) {
  root.querySelectorAll<HTMLButtonElement>('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.locale as Locale
      if (next && next !== locale) onChange(next)
    })
  })
}
