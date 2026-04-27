import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { Unit, Lab } from '../types.js'
import '../blocks/forja-block-renderer.js'

@customElement('forja-unit-blog')
export class ForjaUnitBlog extends LitElement {
  @property({ type: Object }) unit!: Unit
  @property({ type: Object }) lab!:  Lab
  @property() trackColor = 'var(--accent)'
  @property() courseName = ''

  static styles = css`
    :host {
      display:    block;
      width:      100%;
      height:     100%;
      background: #f8f4ef;
      overflow-y: auto;

      /* ── Blog mode prose theming ──────────────────────────────────────── */
      --prose-text:        #374151;
      --prose-heading:     #111827;
      --prose-border:      #d1d5db;
      --prose-link:        #1d4ed8;
      --prose-code-bg:     #f3f0eb;
      --prose-code-border: #d1d5db;
      --prose-code-text:   #c2410c;
      --prose-pre-bg:      #1e1e2e;
      --prose-pre-text:    #cdd6f4;
      --prose-th-bg:       #ede8e3;
      --prose-textarea-bg: #fff;
    }

    .scroll-body {
      max-width: 700px;
      margin:    0 auto;
      padding:   52px 40px 80px;
    }

    /* ── Unit header ─────────────────────────────────────────────────────── */

    .unit-header {
      margin-bottom: 40px;
    }

    .breadcrumb {
      font-family:    var(--font-mono);
      font-size:      11px;
      color:          #9ca3af;
      letter-spacing: 0.3px;
      margin-bottom:  10px;
    }

    .breadcrumb .sep { margin: 0 6px; }

    .depth-badge {
      display:        inline-flex;
      align-items:    center;
      gap:            5px;
      font-family:    var(--font-mono);
      font-size:      10px;
      font-weight:    600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color:          #6b7280;
      background:     #ede8e3;
      border:         1px solid #d1d5db;
      padding:        3px 8px;
      border-radius:  4px;
      margin-bottom:  14px;
    }

    .mode-label {
      font-family:    var(--font-mono);
      font-size:      10px;
      font-weight:    600;
      letter-spacing: 0.5px;
      color:          #6b7280;
      background:     #ede8e3;
      border:         1px solid #d1d5db;
      padding:        3px 8px;
      border-radius:  4px;
      margin-left:    6px;
      text-transform: uppercase;
    }

    .unit-title {
      font-size:   28px;
      font-weight: 700;
      color:       #111827;
      line-height: 1.25;
      margin:      0;
    }

    .unit-meta {
      display:     flex;
      align-items: center;
      gap:         12px;
      margin-top:  10px;
    }

    .meta-item {
      font-size:  12px;
      color:      #9ca3af;
      font-family:var(--font-mono);
    }

    .meta-dot {
      width:        4px;
      height:       4px;
      border-radius:50%;
      background:   #d1d5db;
    }

    /* ── Blocks ──────────────────────────────────────────────────────────── */

    .blocks {
      display:        flex;
      flex-direction: column;
      gap:            4px;
    }
  `

  render() {
    const { unit, lab } = this

    return html`
      <div class="scroll-body">
        <div class="unit-header">
          <div class="breadcrumb">
            <span>${this.courseName}</span>
            <span class="sep">›</span>
            <span>${unit.name}</span>
          </div>
          <div>
            <span class="depth-badge" style="border-color:${this.trackColor}44;color:${this.trackColor}">
              Depth ${unit.depth}
            </span>
            <span class="mode-label">Cuaderno de Campo</span>
          </div>
          <h1 class="unit-title">${lab.title}</h1>
          <div class="unit-meta">
            <span class="meta-item">${unit.estimatedMinutes} min</span>
            <div class="meta-dot"></div>
            <span class="meta-item" style="color:${this.trackColor}">${this.courseName}</span>
          </div>
        </div>

        <div class="blocks">
          ${lab.blocks.map(block => html`
            <forja-block-renderer .block=${block}></forja-block-renderer>
          `)}
        </div>
      </div>
    `
  }
}
