import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { Pillar } from '../data/mock.js'

@customElement('forja-topbar')
export class ForjaTopbar extends LitElement {
  @property() pillar: Pillar = 'rust'
  @property() view: 'tree' | 'lab' = 'tree'
  @property() breadcrumb = ''

  static styles = css`
    :host {
      display: block;
      height: 48px;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 100;
    }

    .bar {
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 20px;
      gap: 0;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      flex-shrink: 0;
      text-decoration: none;
    }

    .logo-mark {
      width: 22px;
      height: 22px;
      background: var(--accent);
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .logo-mark svg {
      display: block;
    }

    .logo-word {
      font-family: var(--font-mono);
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      letter-spacing: 0.5px;
    }

    .sep {
      width: 1px;
      height: 18px;
      background: var(--border);
      margin: 0 16px;
      flex-shrink: 0;
    }

    .pillars {
      display: flex;
      gap: 2px;
    }

    .pillar-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-family: var(--font-prose);
      font-size: 12px;
      font-weight: 500;
      padding: 5px 12px;
      border-radius: 6px;
      color: var(--text-muted);
      transition: color 0.12s, background 0.12s;
      letter-spacing: 0.2px;
    }

    .pillar-btn:hover {
      color: var(--text-secondary);
      background: var(--bg-elevated);
    }

    .pillar-btn.active {
      background: var(--bg-elevated);
    }
    .pillar-btn.c.active         { color: var(--pillar-c); }
    .pillar-btn.rust.active      { color: var(--pillar-rust); }
    .pillar-btn.compilers.active { color: var(--pillar-compilers); }
    .pillar-btn.os.active        { color: var(--pillar-os); }

    .back-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-family: var(--font-prose);
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      border-radius: 6px;
      transition: color 0.12s, background 0.12s;
      flex-shrink: 0;
    }

    .back-btn:hover {
      color: var(--text-primary);
      background: var(--bg-elevated);
    }

    .breadcrumb {
      font-size: 12px;
      color: var(--text-muted);
      flex: 1;
      margin-left: 4px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .breadcrumb span { color: var(--text-secondary); }

    .spacer { flex: 1; }

    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-muted);
      padding: 6px;
      border-radius: 5px;
      display: flex;
      align-items: center;
      transition: color 0.12s, background 0.12s;
    }
    .icon-btn:hover {
      color: var(--text-secondary);
      background: var(--bg-elevated);
    }
  `

  private _pillarClick(p: Pillar) {
    this.dispatchEvent(new CustomEvent('pillar-change', { detail: p, bubbles: true, composed: true }))
  }

  private _backClick() {
    this.dispatchEvent(new CustomEvent('nav-tree', { bubbles: true, composed: true }))
  }

  private _logoSvg() {
    return html`
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 10 L6 2 L10 10" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3.5 7 L8.5 7" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `
  }

  render() {
    if (this.view === 'lab') {
      return html`
        <div class="bar">
          <div class="logo" @click=${this._backClick}>
            <div class="logo-mark">${this._logoSvg()}</div>
            <span class="logo-word">Forja</span>
          </div>
          <div class="sep"></div>
          <button class="back-btn" @click=${this._backClick}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M7.5 2L3.5 6l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
            Map
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
              class="pillar-btn ${p} ${this.pillar === p ? 'active' : ''}"
              @click=${() => this._pillarClick(p)}
            >${p === 'c' ? 'C' : p === 'os' ? 'OS' : p.charAt(0).toUpperCase() + p.slice(1)}</button>
          `)}
        </div>
        <div class="spacer"></div>
        <button class="icon-btn" title="Settings">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M7.5 9.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" stroke-width="1.2"/>
            <path d="M12.3 5.9c.1-.3.2-.5.2-.8s-.1-.5-.2-.8l1.1-1.2-1.5-1.5-1.2 1.1c-.3-.1-.5-.2-.8-.2s-.5.1-.8.2L7.9.6 6 .6l-.2 1.6c-.3.1-.5.2-.7.4L3.7 2 2.2 3.5l1 1.2c-.1.2-.2.5-.2.8s.1.5.2.8L2 7.6l1.5 1.5 1.3-1.1c.3.1.5.2.7.3l.3 1.6h1.9l.2-1.6c.3-.1.5-.2.8-.3l1.2 1.1L11.4 7.5l-1-1.2c.1-.2.2-.4.2-.7.1.1.1.2.2.3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    `
  }
}
