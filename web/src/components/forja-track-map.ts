import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { Track } from '../types.js'
import './forja-course-card.js'

@customElement('forja-track-map')
export class ForjaTrackMap extends LitElement {
  @property({ type: Object }) track!: Track

  static styles = css`
    :host {
      display:        flex;
      flex-direction: column;
      width:          100%;
      height:         100%;
    }

    /* ── Track header ────────────────────────────────────────────────────── */

    .track-header {
      padding:       24px 24px 20px;
      border-bottom: 1px solid var(--border-subtle);
      flex-shrink:   0;
    }

    .track-eyebrow {
      font-family:    var(--font-mono);
      font-size:      9px;
      font-weight:    600;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color:          var(--text-muted);
      margin-bottom:  6px;
    }

    .track-title {
      font-size:   22px;
      font-weight: 700;
      line-height: 1.2;
      margin:      0 0 4px;
    }

    .track-tagline {
      font-family: var(--font-mono);
      font-size:   11px;
      font-weight: 500;
      opacity:     0.7;
    }

    .prereq-note {
      margin-top:    12px;
      padding:       8px 12px;
      background:    var(--bg-elevated);
      border:        1px solid var(--border-subtle);
      border-radius: 6px;
      font-size:     11.5px;
      color:         var(--text-muted);
      font-style:    italic;
    }

    /* ── Course list ─────────────────────────────────────────────────────── */

    .courses-label {
      font-family:    var(--font-mono);
      font-size:      9px;
      font-weight:    600;
      letter-spacing: 1px;
      text-transform: uppercase;
      color:          var(--text-muted);
      padding:        16px 24px 8px;
      flex-shrink:    0;
    }

    .courses {
      flex:       1;
      overflow-y: auto;
      padding:    0 16px 24px;
      display:    flex;
      flex-direction: column;
      gap:        8px;
    }

    .empty {
      padding:   32px 24px;
      font-size: 13px;
      color:     var(--text-muted);
    }
  `

  render() {
    const { track } = this

    return html`
      <div class="track-header">
        <div class="track-eyebrow">Track</div>
        <h1 class="track-title" style="color:${track.color}">${track.label}</h1>
        <div class="track-tagline" style="color:${track.color}">${track.tagline}</div>
        ${track.prerequisite ? html`
          <div class="prereq-note">${track.prerequisite}</div>
        ` : null}
      </div>

      ${track.courses.length ? html`
        <div class="courses-label">Courses</div>
        <div class="courses">
          ${track.courses.map(course => html`
            <forja-course-card
              .course=${course}
              .pillarColor=${track.color}
            ></forja-course-card>
          `)}
        </div>
      ` : html`
        <div class="empty">Content for this track is not yet available.</div>
      `}
    `
  }
}
