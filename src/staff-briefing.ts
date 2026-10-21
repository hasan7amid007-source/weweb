import './styles/site.css'

const TOKEN_KEY = 'bditec-staff-briefing-token'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function readStoredToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

function writeStoredToken(token: string): void {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token)
    else sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

function clearResultPanel(): void {
  const result = document.getElementById('staff-result')
  const jsonEl = document.getElementById('staff-json')
  if (jsonEl) jsonEl.textContent = ''
  if (result) result.hidden = true
}

function logoutStaff(): void {
  writeStoredToken('')
  const tokenInput = document.getElementById('staff-token') as HTMLInputElement | null
  if (tokenInput) tokenInput.value = ''
  clearResultPanel()
  setStatus('Logged out — staff token removed from this browser session.')
}

function renderShell(): void {
  const app = document.getElementById('app')
  if (!app) return
  const params = new URLSearchParams(window.location.search)
  const prefillRef = (params.get('ref') || '').trim()
  // Never put staff token in the URL. Optional ?ref=BRF_… is allowed (reference only).
  app.innerHTML = `
    <main class="staff-briefing" id="main">
      <header class="staff-briefing__head">
        <p class="staff-briefing__eyebrow">BDITEC · internal</p>
        <h1>Staff briefing viewer</h1>
        <p class="staff-briefing__lead">
          Requires the shared staff token (<code>BRIEFING_STAFF_TOKEN</code>).
          A briefing reference alone never grants access.
        </p>
        <ul class="staff-briefing__warnings">
          <li><strong>noindex is not access control</strong> — this URL is reachable if known; authentication is the only gate.</li>
          <li><strong>Shared token</strong> — anyone with the token can open any <code>BRF_…</code>; rotate via env + redeploy, then Logout everywhere.</li>
          <li>Do not paste tokens into URLs, analytics, tickets, or chat. Use Logout when finished.</li>
        </ul>
      </header>
      <form class="staff-briefing__form" id="staff-form" autocomplete="off">
        <label>
          <span>Staff token</span>
          <input
            type="password"
            name="token"
            id="staff-token"
            required
            minlength="24"
            autocomplete="off"
            spellcheck="false"
            placeholder="Paste BRIEFING_STAFF_TOKEN"
          />
        </label>
        <label>
          <span>Briefing reference</span>
          <input
            type="text"
            name="ref"
            id="staff-ref"
            required
            pattern="BRF_[A-Za-z0-9]+"
            maxlength="48"
            value="${escapeHtml(prefillRef)}"
            placeholder="BRF_…"
            autocomplete="off"
          />
        </label>
        <div class="staff-briefing__actions">
          <button type="submit" class="ts-btn pink solid">Load briefing</button>
          <button type="button" class="ts-btn pink" id="staff-logout">Logout</button>
        </div>
        <p class="staff-briefing__hint" id="staff-status" role="status" aria-live="polite"></p>
      </form>
      <section class="staff-briefing__result" id="staff-result" hidden>
        <h2>Stored briefing</h2>
        <pre id="staff-json" class="staff-briefing__json"></pre>
      </section>
    </main>
  `

  const tokenInput = document.getElementById('staff-token') as HTMLInputElement | null
  if (tokenInput) tokenInput.value = readStoredToken()

  document.getElementById('staff-logout')?.addEventListener('click', () => {
    logoutStaff()
  })

  document.getElementById('staff-form')?.addEventListener('submit', (e) => {
    e.preventDefault()
    void loadBriefing()
  })
}

function setStatus(msg: string): void {
  const el = document.getElementById('staff-status')
  if (el) el.textContent = msg
}

async function loadBriefing(): Promise<void> {
  const tokenInput = document.getElementById('staff-token') as HTMLInputElement | null
  const refInput = document.getElementById('staff-ref') as HTMLInputElement | null
  const result = document.getElementById('staff-result')
  const jsonEl = document.getElementById('staff-json')
  const token = (tokenInput?.value || '').trim()
  const ref = (refInput?.value || '').trim()
  if (!token || token.length < 24) {
    setStatus('Staff token required (min 24 characters).')
    return
  }
  if (!ref.startsWith('BRF_')) {
    setStatus('Enter a valid BRF_ reference.')
    return
  }
  writeStoredToken(token)
  setStatus('Loading…')
  clearResultPanel()

  try {
    const res = await fetch(`/api/staff-briefing?ref=${encodeURIComponent(ref)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
      credentials: 'same-origin',
    })
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean
      error?: string
      briefing?: unknown
    }
    if (!res.ok || !data.ok) {
      // Generic status text only — never echo tokens or payload fragments
      setStatus(data.error || `Request failed (${res.status})`)
      return
    }
    if (jsonEl) jsonEl.textContent = JSON.stringify(data.briefing, null, 2)
    if (result) result.hidden = false
    setStatus(`Loaded ${ref}.`)
  } catch {
    setStatus('Network error — API unreachable from this host.')
  }
}

renderShell()
