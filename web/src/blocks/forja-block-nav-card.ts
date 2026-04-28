import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { NavCardBlock } from '../types.js'

const PILLAR_COLOR: Record<string, string> = {
  c:         '#3fb950',
  rust:      '#e05c1a',
  compilers: '#58a6ff',
  os:        '#bc8cff',
}

const TARGET_LABEL: Record<string, string> = {
  track:  'Track',
  course: 'Course',
  unit:   'Unit',
}

@customElement('forja-block-nav-card')
export class ForjaBlockNavCard extends LitElement {
  @property({ type: Object }) block!: NavCardBlock

  static styles = css`
    :host { display: block; margin: 8px 0; }

    .card {
      display:       flex;
      align-items:   center;
      gap:           14px;
      padding:       14px 16px;
      border-radius: 8px;
      border:        1px solid;
      cursor:        pointer;
      transition:    background 0.12s, transform 0.1s;
      text-decoration: none;
    }

    .card:hover {
      filter:    brightness(1.05);
      transform: translateX(2px);
    }

    .card:active { transform: translateX(1px); }

    .icon {
      flex-shrink:     0;
      width:           34px;
      height:          34px;
      border-radius:   7px;
      display:         flex;
      align-items:     center;
      justify-content: center;
    }

    .body {
      flex:      1;
      min-width: 0;
    }

    .label {
      font-size:    13.5px;
      font-weight:  600;
      margin-bottom:3px;
      white-space:  nowrap;
      overflow:     hidden;
      text-overflow:ellipsis;
    }

    .description {
      font-size:   12.5px;
      line-height: 1.5;
      color:       #9ca3af;
    }

    .badge {
      font-family:    var(--font-mono);
      font-size:      9px;
      font-weight:    600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding:        2px 7px;
      border-radius:  3px;
      flex-shrink:    0;
    }

    .arrow {
      flex-shrink: 0;
      color:       #9ca3af;
    }
  `

  private _navigate() {
    const { targetType, targetId, trackId } = this.block
    if (targetType === 'track') {
      this.dispatchEvent(new CustomEvent('track-select', {
        detail: targetId, bubbles: true, composed: true,
      }))
    } else if (targetType === 'course') {
      this.dispatchEvent(new CustomEvent('course-select', {
        detail: { courseId: targetId, trackId }, bubbles: true, composed: true,
      }))
    } else {
      this.dispatchEvent(new CustomEvent('unit-select', {
        detail: { unitId: targetId, trackId }, bubbles: true, composed: true,
      }))
    }
  }

  render() {
    const b     = this.block
    const color = b.color ?? PILLAR_COLOR[b.trackId] ?? 'var(--accent)'
    const badge = TARGET_LABEL[b.targetType]

    return html`
      <div
        class="card"
        style="border-color:${color}33; background:${color}0d"
        @click=${this._navigate}
        role="button"
        tabindex="0"
        @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this._navigate()}
      >
        <div class="icon" style="background:${color}22">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="${color}" stroke-width="1.6"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="body">
          <div class="label" style="color:${color}">${b.label}</div>
          <div class="description">${b.description}</div>
        </div>
        <span class="badge" style="background:${color}22; color:${color}">${badge}</span>
        <div class="arrow">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6h7M6 2.5l3.5 3.5L6 9.5"
              stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    `
  }
}
