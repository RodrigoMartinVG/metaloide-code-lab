import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { PortalBlock, AnchorBlock, Pillar } from '../types.js'

const PILLAR_COLOR: Record<Pillar, string> = {
  c:         '#3fb950',
  rust:      '#e05c1a',
  compilers: '#58a6ff',
  os:        '#bc8cff',
}

const PILLAR_LABEL: Record<Pillar, string> = {
  c:         'C',
  rust:      'Rust',
  compilers: 'Compilers',
  os:        'Operating Systems',
}

@customElement('forja-block-portal')
export class ForjaBlockPortal extends LitElement {
  @property({ type: Object }) block!: PortalBlock | AnchorBlock

  static styles = css`
    :host { display: block; margin: 24px 0; }

    .portal {
      display:       flex;
      align-items:   flex-start;
      gap:           14px;
      padding:       16px 18px;
      border-radius: 8px;
      border:        1px solid;
      cursor:        pointer;
      transition:    background 0.12s;
    }

    .portal:hover { filter: brightness(1.08); }

    .icon {
      flex-shrink:  0;
      width:        28px;
      height:       28px;
      border-radius:6px;
      display:      flex;
      align-items:  center;
      justify-content:center;
      font-size:    13px;
      font-weight:  700;
      font-family:  var(--font-mono);
    }

    .body {
      flex: 1;
      min-width: 0;
    }

    .label {
      font-size:   13px;
      font-weight: 600;
      margin-bottom:3px;
    }

    .reason {
      font-size:   12.5px;
      line-height: 1.5;
      color:       var(--text-muted);
    }

    .arrow {
      flex-shrink: 0;
      margin-top:  4px;
      color:       var(--text-muted);
    }
  `

  private _navigate() {
    this.dispatchEvent(new CustomEvent('portal-navigate', {
      detail:   { type: this.block.type, to: this.block.to, unitId: this.block.unitId },
      bubbles:  true,
      composed: true,
    }))
  }

  render() {
    const b     = this.block
    const color = PILLAR_COLOR[b.to]
    const dest  = PILLAR_LABEL[b.to]
    const isPortal = b.type === 'portal'

    return html`
      <div
        class="portal"
        style="border-color:${color}33; background:${color}0d"
        @click=${this._navigate}
      >
        <div class="icon" style="background:${color}22; color:${color}">
          ${isPortal ? '→' : '←'}
        </div>
        <div class="body">
          <div class="label" style="color:${color}">${dest} · ${b.label}</div>
          <div class="reason">${b.reason}</div>
        </div>
        <div class="arrow">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    `
  }
}
