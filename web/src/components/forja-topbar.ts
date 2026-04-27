import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { Pillar, Route } from '../types.js'

const PILLAR_COLOR: Record<Pillar, string> = {
  c:         'var(--pillar-c)',
  rust:      'var(--pillar-rust)',
  compilers: 'var(--pillar-compilers)',
  os:        'var(--pillar-os)',
}

const PILLAR_LABEL: Record<Pillar, string> = {
  c:         'C',
  rust:      'Rust',
  compilers: 'Compilers',
  os:        'OS',
}

@customElement('forja-topbar')
export class ForjaTopbar extends LitElement {
  @property() activePillar: Pillar = 'c'
  @property({ type: Object }) route: Route = { view: 'track-map', trackId: 'c' }
  @property() breadcrumb = ''

  static styles = css`
    :host {
      display:       block;
      height:        var(--topbar-height);
      background:    var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      position:      fixed;
      top: 0; left: 0; right: 0;
      z-index:       100;
    }

    .bar {
      height:      100%;
      display:     flex;
      align-items: center;
      padding:     0 20px;
    }

    /* ── Logo ─────────────────────────────────────────────────────────────── */

    .logo {
      display:     flex;
      align-items: center;
      gap:         8px;
      cursor:      pointer;
      flex-shrink: 0;
    }

    .logo-mark {
      width:           22px;
      height:          22px;
      background:      var(--accent);
      border-radius:   5px;
      display:         flex;
      align-items:     center;
      justify-content: center;
    }

    .logo-word {
      font-family:    var(--font-mono);
      font-size:      14px;
      font-weight:    600;
      color:          var(--text-primary);
      letter-spacing: 0.5px;
    }

    .sep {
      width:      1px;
      height:     18px;
      background: var(--border);
      margin:     0 16px;
      flex-shrink:0;
    }

    /* ── Pillar nav ────────────────────────────────────────────────────────── */

    .pillars {
      display: flex;
      gap:     2px;
    }

    .pillar-btn {
      background:     none;
      border:         none;
      cursor:         pointer;
      font-family:    var(--font-prose);
      font-size:      12px;
      font-weight:    500;
      padding:        5px 12px;
      border-radius:  6px;
      color:          var(--text-muted);
      transition:     color 0.12s, background 0.12s;
      letter-spacing: 0.2px;
    }

    .pillar-btn:hover {
      color:      var(--text-secondary);
      background: var(--bg-elevated);
    }

    .pillar-btn.active {
      background: var(--bg-elevated);
      font-weight:600;
    }

    /* ── Lab breadcrumb ────────────────────────────────────────────────────── */

    .back-btn {
      background:  none;
      border:      none;
      cursor:      pointer;
      font-family: var(--font-prose);
      font-size:   12px;
      color:       var(--text-secondary);
      display:     flex;
      align-items: center;
      gap:         6px;
      padding:     5px 10px;
      border-radius:6px;
      flex-shrink: 0;
      transition:  color 0.12s, background 0.12s;
    }

    .back-btn:hover {
      color:      var(--text-primary);
      background: var(--bg-elevated);
    }

    .breadcrumb {
      font-size:     12px;
      color:         var(--text-muted);
      margin-left:   4px;
      flex:          1;
      overflow:      hidden;
      white-space:   nowrap;
      text-overflow: ellipsis;
    }

    .breadcrumb span { color: var(--text-secondary); }

    .spacer { flex: 1; }
  `

  private _pillarClick(p: Pillar) {
    this.dispatchEvent(new CustomEvent('pillar-change', { detail: p, bubbles: true, composed: true }))
  }

  private _backClick() {
    this.dispatchEvent(new CustomEvent('nav-map', { bubbles: true, composed: true }))
  }

  private _logoSvg() {
    return html`
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 10 L6 2 L10 10" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3.5 7 L8.5 7"     stroke="white" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `
  }

  render() {
    const isUnit = this.route.view === 'unit'

    if (isUnit) {
      return html`
        <div class="bar">
          <div class="logo" @click=${this._backClick}>
            <div class="logo-mark">${this._logoSvg()}</div>
            <span class="logo-word">Forja</span>
          </div>
          <div class="sep"></div>
          <button class="back-btn" @click=${this._backClick}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M7.5 2 L3.5 6 L7.5 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Mapa
          </button>
          <span class="breadcrumb"><span>${this.breadcrumb}</span></span>
        </div>
      `
    }

    return html`
      <div class="bar">
        <div class="logo">
          <div class="logo-mark">${this._logoSvg()}</div>
          <span class="logo-word">Forja</span>
        </div>
        <div class="sep"></div>
        <div class="pillars">
          ${(['c', 'rust', 'compilers', 'os'] as Pillar[]).map(p => html`
            <button
              class="pillar-btn ${this.activePillar === p ? 'active' : ''}"
              style=${this.activePillar === p ? `color:${PILLAR_COLOR[p]}` : ''}
              @click=${() => this._pillarClick(p)}
            >${PILLAR_LABEL[p]}</button>
          `)}
        </div>
        <div class="spacer"></div>
      </div>
    `
  }
}
