import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { Track } from '../types.js'
import './forja-course-card.js'

@customElement('forja-track-map')
export class ForjaTrackMap extends LitElement {
  @property({ type: Object }) track!: Track

  static styles = css`
    :host {
      display:    block;
      max-width:  680px;
      margin:     0 auto;
      padding:    40px 32px 80px;
    }

    /* ── Track header ────────────────────────────────────────────────────── */

    .track-header {
      margin-bottom: 32px;
    }

    .track-eyebrow {
      font-family:    var(--font-mono);
      font-size:      10px;
      font-weight:    600;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color:          var(--text-muted);
      margin-bottom:  6px;
    }

    .track-title {
      font-size:   26px;
      font-weight: 700;
      line-height: 1.2;
      margin:      0 0 6px;
    }

    .track-tagline {
      font-family: var(--font-mono);
      font-size:   13px;
      font-weight: 500;
      opacity:     0.7;
    }

    .prereq-note {
      margin-top:    16px;
      padding:       10px 14px;
      background:    var(--bg-elevated);
      border:        1px solid var(--border-subtle);
      border-radius: 6px;
      font-size:     12px;
      color:         var(--text-muted);
      font-style:    italic;
    }

    /* ── Course list ─────────────────────────────────────────────────────── */

    .courses {
      display:        flex;
      flex-direction: column;
      gap:            10px;
    }

    .section-label {
      font-family:    var(--font-mono);
      font-size:      9px;
      font-weight:    600;
      letter-spacing: 1px;
      text-transform: uppercase;
      color:          var(--text-muted);
      padding:        0 4px;
      margin:         8px 0 4px;
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
        <div class="section-label">Courses</div>
        <div class="courses">
          ${track.courses.map(course => html`
            <forja-course-card
              .course=${course}
              .pillarColor=${track.color}
            ></forja-course-card>
          `)}
        </div>
      ` : html`
        <div style="color:var(--text-muted);font-size:13px;padding:24px 0">
          Content for this track is not yet available.
        </div>
      `}
    `
  }
}
