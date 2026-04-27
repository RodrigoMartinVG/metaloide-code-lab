import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
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

@customElement('forja-course-card')
export class ForkaCourseCard extends LitElement {
  @property({ type: Object }) course!: Course
  @property() pillarColor = 'var(--accent)'
  @state() private _expanded = false

  static styles = css`
    :host { display: block; }

    .card {
      border:        1px solid var(--border-subtle);
      border-radius: 10px;
      overflow:      hidden;
      transition:    border-color 0.15s;
    }

    .card:not(.locked):hover { border-color: var(--border); }

    .card.locked { opacity: 0.5; }

    /* ── Header ──────────────────────────────────────────────────────────── */

    .header {
      display:         flex;
      align-items:     center;
      gap:             12px;
      padding:         14px 16px;
      cursor:          pointer;
      background:      var(--bg-surface);
      user-select:     none;
    }

    .card.locked .header { cursor: default; }

    .status-dot {
      font-size:   13px;
      flex-shrink: 0;
      width:       18px;
      text-align:  center;
    }

    .header-body {
      flex:      1;
      min-width: 0;
    }

    .course-name {
      font-size:   13.5px;
      font-weight: 600;
      color:       var(--text-primary);
      white-space: nowrap;
      overflow:    hidden;
      text-overflow:ellipsis;
    }

    .course-desc {
      font-size:   11.5px;
      color:       var(--text-muted);
      margin-top:  2px;
      white-space: nowrap;
      overflow:    hidden;
      text-overflow:ellipsis;
    }

    .header-right {
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

    .chevron {
      color:      var(--text-muted);
      transition: transform 0.15s;
      flex-shrink:0;
    }

    .chevron.open { transform: rotate(180deg); }

    /* ── Unit list ───────────────────────────────────────────────────────── */

    .units {
      border-top: 1px solid var(--border-subtle);
      background: var(--bg-base);
    }

    .unit-row {
      display:         flex;
      align-items:     center;
      gap:             10px;
      padding:         10px 16px 10px 46px;
      cursor:          pointer;
      transition:      background 0.1s;
      border-bottom:   1px solid var(--border-subtle);
    }

    .unit-row:last-child { border-bottom: none; }

    .unit-row.locked-unit { cursor: default; opacity: 0.45; }

    .unit-row:not(.locked-unit):hover { background: var(--bg-elevated); }

    .unit-status {
      font-size:   11px;
      width:       14px;
      text-align:  center;
      flex-shrink: 0;
    }

    .unit-name {
      flex:          1;
      font-size:     12.5px;
      color:         var(--text-secondary);
      white-space:   nowrap;
      overflow:      hidden;
      text-overflow: ellipsis;
    }

    .unit-badges {
      display:     flex;
      align-items: center;
      gap:         6px;
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

    .unit-arrow {
      color:       var(--text-muted);
      flex-shrink: 0;
    }
  `

  private _doneCount() {
    return this.course.units.filter(u => u.status === 'completed' || u.status === 'mastered').length
  }

  private _toggleExpand() {
    if (this.course.status === 'locked') return
    this._expanded = !this._expanded
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
    const done    = this._doneCount()
    const total   = course.units.length
    const pct     = total ? (done / total) * 100 : 0
    const isLocked = course.status === 'locked'
    const dotColor = STATUS_COLOR[course.status]

    return html`
      <div class="card ${isLocked ? 'locked' : ''}">
        <div class="header" @click=${this._toggleExpand}>
          <span class="status-dot" style="color:${dotColor}">
            ${STATUS_DOT[course.status]}
          </span>
          <div class="header-body">
            <div class="course-name">${course.name}</div>
            <div class="course-desc">${course.description}</div>
          </div>
          <div class="header-right">
            ${!isLocked ? html`
              <span class="progress-text">${done}/${total}</span>
              <div class="progress-bar-wrap">
                <div class="progress-bar-fill" style="width:${pct}%;background:${this.pillarColor}"></div>
              </div>
            ` : null}
            ${!isLocked ? html`
              <svg class="chevron ${this._expanded ? 'open' : ''}" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            ` : html`
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style="color:var(--text-muted);opacity:.5">
                <path d="M6 1a3 3 0 0 0-3 3v1H2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H9V4a3 3 0 0 0-3-3Zm2 4H4V4a2 2 0 1 1 4 0v1Z"/>
              </svg>
            `}
          </div>
        </div>

        ${this._expanded ? html`
          <div class="units">
            ${course.units.map(unit => this._renderUnitRow(unit))}
          </div>
        ` : null}
      </div>
    `
  }

  private _renderUnitRow(unit: Unit) {
    const isLocked = unit.status === 'locked'
    const dotColor = STATUS_COLOR[unit.status]
    return html`
      <div class="unit-row ${isLocked ? 'locked-unit' : ''}" @click=${() => this._selectUnit(unit)}>
        <span class="unit-status" style="color:${dotColor}">${STATUS_DOT[unit.status]}</span>
        <span class="unit-name">${unit.name}</span>
        <div class="unit-badges">
          <span class="badge">${DEPTH_LABEL[unit.depth]}</span>
          <span class="badge mode-${unit.renderMode}">${unit.renderMode}</span>
        </div>
        <span class="unit-time">${unit.estimatedMinutes}m</span>
        ${!isLocked ? html`
          <svg class="unit-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6h7M6 2.5l3.5 3.5L6 9.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        ` : null}
      </div>
    `
  }
}
