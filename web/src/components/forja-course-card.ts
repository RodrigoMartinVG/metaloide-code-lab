import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { Course, Status } from '../types.js'

const STATUS_DOT: Record<Status, string> = {
  locked:    '⊘',
  available: '·',
  started:   '●',
  completed: '✓',
  mastered:  '★',
}

const STATUS_COLOR: Record<Status, string> = {
  locked:    'var(--text-muted)',
  available: 'var(--text-muted)',
  started:   'var(--accent)',
  completed: 'var(--success)',
  mastered:  '#f0c040',
}

@customElement('forja-course-card')
export class ForjaCourseCard extends LitElement {
  @property({ type: Object }) course!: Course
  @property() pillarColor = 'var(--accent)'

  static styles = css`
    :host { display: block; }

    .card {
      border:        1px solid var(--border-subtle);
      border-radius: 10px;
      overflow:      hidden;
      transition:    border-color 0.15s, background 0.15s;
      cursor:        pointer;
      background:    var(--bg-surface);
    }

    .card.locked {
      opacity: 0.5;
      cursor:  default;
    }

    .card:not(.locked):hover {
      border-color: var(--border);
      background:   var(--bg-elevated);
    }

    .card:not(.locked):hover .enter { opacity: 1; }

    /* ── Body ────────────────────────────────────────────────────────────── */

    .body {
      display:     flex;
      align-items: center;
      gap:         12px;
      padding:     14px 16px;
      user-select: none;
    }

    .status-dot {
      font-size:   13px;
      flex-shrink: 0;
      width:       18px;
      text-align:  center;
    }

    .meta {
      flex:      1;
      min-width: 0;
    }

    .course-name {
      font-size:     13.5px;
      font-weight:   600;
      color:         var(--text-primary);
      white-space:   nowrap;
      overflow:      hidden;
      text-overflow: ellipsis;
    }

    .course-desc {
      font-size:     11.5px;
      color:         var(--text-muted);
      margin-top:    2px;
      white-space:   nowrap;
      overflow:      hidden;
      text-overflow: ellipsis;
    }

    .right {
      display:     flex;
      align-items: center;
      gap:         10px;
      flex-shrink: 0;
    }

    .progress-text {
      font-family: var(--font-mono);
      font-size:   11px;
      color:       var(--text-muted);
    }

    .progress-bar-wrap {
      width:        48px;
      height:       3px;
      background:   var(--border-subtle);
      border-radius:2px;
      overflow:     hidden;
    }

    .progress-bar-fill {
      height:       100%;
      border-radius:2px;
      transition:   width 0.3s ease;
    }

    .enter {
      font-family:   var(--font-mono);
      font-size:     10px;
      color:         var(--text-muted);
      opacity:       0;
      transition:    opacity 0.12s;
      display:       flex;
      align-items:   center;
      gap:           3px;
    }

    .lock-icon { color: var(--text-muted); opacity: 0.5; }
  `

  private _doneCount() {
    return this.course.units.filter(
      u => u.status === 'completed' || u.status === 'mastered'
    ).length
  }

  private _onClick() {
    if (this.course.status === 'locked') return
    this.dispatchEvent(new CustomEvent('course-select', {
      detail:   { courseId: this.course.id, trackId: this.course.trackId },
      bubbles:  true,
      composed: true,
    }))
  }

  render() {
    const { course }  = this
    const done        = this._doneCount()
    const total       = course.units.length
    const pct         = total ? (done / total) * 100 : 0
    const isLocked    = course.status === 'locked'
    const dotColor    = STATUS_COLOR[course.status]

    return html`
      <div
        class="card ${isLocked ? 'locked' : ''}"
        @click=${this._onClick}
        role=${isLocked ? 'presentation' : 'button'}
        tabindex=${isLocked ? '-1' : '0'}
        @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this._onClick()}
      >
        <div class="body">
          <span class="status-dot" style="color:${dotColor}">
            ${STATUS_DOT[course.status]}
          </span>
          <div class="meta">
            <div class="course-name">${course.name}</div>
            <div class="course-desc">${course.description}</div>
          </div>
          <div class="right">
            ${!isLocked ? html`
              <span class="progress-text">${done}/${total}</span>
              <div class="progress-bar-wrap">
                <div class="progress-bar-fill"
                  style="width:${pct}%;background:${this.pillarColor}">
                </div>
              </div>
              <div class="enter">
                Ver
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5"
                    stroke="currentColor" stroke-width="1.4"
                    stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            ` : html`
              <svg class="lock-icon" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 1a3 3 0 0 0-3 3v1H2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H9V4a3 3 0 0 0-3-3Zm2 4H4V4a2 2 0 1 1 4 0v1Z"/>
              </svg>
            `}
          </div>
        </div>
      </div>
    `
  }
}
