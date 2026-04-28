import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { Lab } from '../types.js'
import '../blocks/forja-block-renderer.js'

@customElement('forja-blogpost')
export class ForjaBlogpost extends LitElement {
  @property({ type: Object }) blog!: Lab
  @property() trackColor = 'var(--accent)'
  @property() eyebrow    = ''

  static styles = css`
    :host {
      display:        flex;
      flex-direction: column;
      width:          100%;
      height:         100%;
      background:     #f8f4ef;
      overflow-y:     auto;

      /* ── prose theme (warm, light) ──────────────────────────────────────── */
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
    }

    .scroll-body {
      max-width: 680px;
      margin:    0 auto;
      padding:   52px 40px 100px;
    }

    /* ── Header ──────────────────────────────────────────────────────────── */

    .post-header {
      margin-bottom: 44px;
      padding-bottom:28px;
      border-bottom: 1px solid #e5ddd5;
    }

    .eyebrow {
      font-family:    var(--font-mono);
      font-size:      10px;
      font-weight:    600;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color:          #9ca3af;
      margin-bottom:  10px;
    }

    .post-title {
      font-size:   30px;
      font-weight: 700;
      color:       #111827;
      line-height: 1.2;
      margin:      0;
    }

    /* ── Blocks ──────────────────────────────────────────────────────────── */

    .blocks {
      display:        flex;
      flex-direction: column;
      gap:            2px;
    }

    /* ── nav-card group spacing ──────────────────────────────────────────── */

    .blocks > * + * { margin-top: 0; }
  `

  render() {
    const { blog } = this

    return html`
      <div class="scroll-body">
        <div class="post-header">
          ${this.eyebrow ? html`<div class="eyebrow">${this.eyebrow}</div>` : null}
          <h1 class="post-title" style="color:${this.trackColor !== 'var(--accent)' ? this.trackColor : '#111827'}">${blog.title}</h1>
        </div>

        <div class="blocks">
          ${blog.blocks.map(block => html`
            <forja-block-renderer .block=${block}></forja-block-renderer>
          `)}
        </div>
      </div>
    `
  }
}
