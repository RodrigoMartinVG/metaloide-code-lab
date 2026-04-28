import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { Course, Unit, Status } from '../types.js'

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

const DEPTH_LABEL: Record<number, string> = { 1: 'D1', 2: 'D2', 3: 'D3' }

@customElement('forja-course-map')
export class ForjaCourseMap extends LitElement {
  @property({ type: Object }) course!: Course
  @property() pillarColor = 'var(--accent)'

  static styles = css`
    :host {
      display:        flex;
      flex-direction: column;
      width:          100%;
      height:         100%;
    }

    /* ── Course header ───────────────────────────────────────────────────── */

    .course-header {
      padding:       24px 24px 20px;
      border-bottom: 1px solid var(--border-subtle);
      flex-shrink:   0;
    }

    .course-eyebrow {
      font-family:    var(--font-mono);
      font-size:      9px;
      font-weight:    600;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color:          var(--text-muted);
      margin-bottom:  6px;
    }

    .course-name {
      font-size:   18px;
      font-weight: 700;
      line-height: 1.25;
      color:       var(--text-primary);
      margin:      0 0 6px;
    }

    .course-desc {
      font-size:   12.5px;
      color:       var(--text-muted);
      line-height: 1.5;
    }

    /* ── Progress bar ────────────────────────────────────────────────────── */

    .progress-wrap {
      margin-top:  14px;
      display:     flex;
      align-items: center;
      gap:         10px;
    }

    .progress-bar {
      flex:          1;
      height:        3px;
      background:    var(--bg-elevated);
      border-radius: 2px;
      overflow:      hidden;
    }

    .progress-fill {
      height:        100%;
      border-radius: 2px;
      transition:    width 0.3s ease;
    }

    .progress-text {
      font-family: var(--font-mono);
      font-size:   10px;
      color:       var(--text-muted);
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* ── Unit list ───────────────────────────────────────────────────────── */

    .units-label {
      font-family:    var(--font-mono);
      font-size:      9px;
      font-weight:    600;
      letter-spacing: 1px;
      text-transform: uppercase;
      color:          var(--text-muted);
      padding:        16px 24px 8px;
      flex-shrink:    0;
    }

    .units {
      flex:       1;
      overflow-y: auto;
    }

    .unit-row {
      display:       flex;
      align-items:   center;
      gap:           10px;
      padding:       11px 24px;
      cursor:        pointer;
      transition:    background 0.1s;
      border-bottom: 1px solid var(--border-subtle);
    }

    .unit-row:last-child { border-bottom: none; }

    .unit-row.locked    { cursor: default; opacity: 0.4; }
    .unit-row:not(.locked):hover { background: var(--bg-elevated); }

    .unit-status {
      font-size:   12px;
      width:       16px;
      text-align:  center;
      flex-shrink: 0;
    }

    .unit-name {
      flex:          1;
      font-size:     13px;
      color:         var(--text-secondary);
      white-space:   nowrap;
      overflow:      hidden;
      text-overflow: ellipsis;
    }

    .unit-badges {
      display:     flex;
      align-items: center;
      gap:         5px;
      flex-shrink: 0;
    }

    .badge {
      font-family:   var(--font-mono);
      font-size:     9px;
      padding:       2px 6px;
      border-radius: 3px;
      background:    var(--bg-elevated);
      color:         var(--text-muted);
      letter-spacing:0.3px;
    }

    .badge.mode-blog   { color: var(--pillar-compilers); background: #1a2535; }
    .badge.mode-studio { color: var(--accent);           background: #1a0f08; }

    .unit-time {
      font-family: var(--font-mono);
      font-size:   10px;
      color:       var(--text-muted);
      flex-shrink: 0;
    }

    .unit-arrow { color: var(--text-muted); flex-shrink: 0; }
  `

  private _doneCount() {
    return this.course.units.filter(
      u => u.status === 'completed' || u.status === 'mastered'
    ).length
  }

  private _selectUnit(unit: Unit) {
    if (unit.status === 'locked') return
    this.dispatchEvent(new CustomEvent('unit-select', {
      detail:   { unitId: unit.id, trackId: this.course.trackId },
      bubbles:  true,
      composed: true,
    }))
  }

  render() {
    const { course } = this
    const done  = this._doneCount()
    const total = course.units.length
    const pct   = total ? (done / total) * 100 : 0

    return html`
      <div class="course-header">
        <div class="course-eyebrow">Course</div>
        <h2 class="course-name">${course.name}</h2>
        <div class="course-desc">${course.description}</div>
        <div class="progress-wrap">
          <div class="progress-bar">
            <div class="progress-fill" style="width:${pct}%;background:${this.pillarColor}"></div>
          </div>
          <span class="progress-text">${done} / ${total} units</span>
        </div>
      </div>

      <div class="units-label">Units</div>

      <div class="units">
        ${course.units.map(unit => this._renderUnit(unit))}
      </div>
    `
  }

  private _renderUnit(unit: Unit) {
    const isLocked  = unit.status === 'locked'
    const dotColor  = STATUS_COLOR[unit.status]

    return html`
      <div
        class="unit-row ${isLocked ? 'locked' : ''}"
        @click=${() => this._selectUnit(unit)}
      >
        <span class="unit-status" style="color:${dotColor}">${STATUS_DOT[unit.status]}</span>
        <span class="unit-name">${unit.name}</span>
        <div class="unit-badges">
          <span class="badge">${DEPTH_LABEL[unit.depth]}</span>
          <span class="badge mode-${unit.renderMode}">${unit.renderMode}</span>
        </div>
        <span class="unit-time">${unit.estimatedMinutes}m</span>
        ${!isLocked ? html`
          <svg class="unit-arrow" width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M2 5.5h7M5.5 2l3.5 3.5L5.5 9"
              stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        ` : null}
      </div>
    `
  }
}
