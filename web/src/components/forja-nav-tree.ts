import { LitElement, html, css, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { Track, Course, Unit, Status } from '../types.js'
import type { StudyContent } from '../types.js'

const DOT: Record<Status, string> = {
  locked: '⊘', available: '·', started: '●', completed: '✓', mastered: '★',
}
const DOT_COLOR: Record<Status, string> = {
  locked:    'var(--text-muted)',
  available: 'var(--text-muted)',
  started:   'var(--accent)',
  completed: 'var(--success)',
  mastered:  '#f0c040',
}

@customElement('forja-nav-tree')
export class ForjaNavTree extends LitElement {
  @property({ type: Object }) track!:   Track
  @property({ type: Object }) content!: StudyContent

  @state() private _expanded: Set<string> = new Set()

  // Auto-expand the course that contains the active unit; reset on track change
  override willUpdate(changed: Map<string, unknown>) {
    if (changed.has('track')) {
      const prev = changed.get('track') as Track | undefined
      if (prev?.id !== this.track?.id) this._expanded = new Set()
    }
    if (changed.has('content') && this.content?.type === 'unit') {
      const host = this.track?.courses.find(c =>
        c.units.some(u => u.id === (this.content as { type: 'unit'; unitId: string }).unitId)
      )
      if (host && !this._expanded.has(host.id)) {
        this._expanded = new Set([...this._expanded, host.id])
      }
    }
  }

  private _emit(content: StudyContent) {
    this.dispatchEvent(new CustomEvent('content-select', {
      detail: content, bubbles: true, composed: true,
    }))
  }

  private _clickCourse(course: Course) {
    const isSelected = this.content?.type === 'course' && (this.content as { type: 'course'; courseId: string }).courseId === course.id
    const isExpanded = this._expanded.has(course.id)

    const next = new Set(this._expanded)
    if (isExpanded && isSelected) {
      next.delete(course.id)  // already open and selected → collapse
    } else {
      next.add(course.id)     // expand always
    }
    this._expanded = next
    this._emit({ type: 'course', courseId: course.id })
  }

  static styles = css`
    :host {
      display:        flex;
      flex-direction: column;
      width:          100%;
      height:         100%;
      overflow:       hidden;
    }

    /* ── Track header ─────────────────────────────────────────────── */

    .track-header {
      padding:       20px 16px 16px;
      border-bottom: 1px solid var(--border-subtle);
      flex-shrink:   0;
      cursor:        pointer;
      transition:    background 0.1s;
      position:      relative;
    }

    .track-header:hover { background: var(--bg-elevated); }

    .track-header.active {
      background: color-mix(in srgb, var(--accent) 8%, transparent);
    }

    .track-header.active::before {
      content:       '';
      position:      absolute;
      left:          0;
      top:           6px;
      bottom:        6px;
      width:         2px;
      background:    var(--accent);
      border-radius: 1px;
    }

    .track-eyebrow {
      font-family:    var(--font-mono);
      font-size:      9px;
      font-weight:    600;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color:          var(--text-muted);
      margin-bottom:  4px;
    }

    .track-title {
      font-size:   15px;
      font-weight: 700;
      line-height: 1.2;
      margin:      0 0 2px;
    }

    .track-tagline {
      font-family: var(--font-mono);
      font-size:   10px;
      color:       var(--text-muted);
      opacity:     0.8;
    }

    /* ── Section label ────────────────────────────────────────────── */

    .section-label {
      font-family:    var(--font-mono);
      font-size:      9px;
      font-weight:    600;
      letter-spacing: 1px;
      text-transform: uppercase;
      color:          var(--text-muted);
      padding:        14px 16px 6px;
      flex-shrink:    0;
    }

    /* ── Scrollable tree ──────────────────────────────────────────── */

    .tree {
      flex:       1;
      overflow-y: auto;
    }

    /* ── Course row ───────────────────────────────────────────────── */

    .course-row {
      display:     flex;
      align-items: center;
      gap:         8px;
      padding:     8px 16px 8px 10px;
      cursor:      pointer;
      position:    relative;
      transition:  background 0.1s;
      user-select: none;
    }

    .course-row.locked    { opacity: 0.3; cursor: default; pointer-events: none; }
    .course-row.active    { background: color-mix(in srgb, var(--accent) 8%, transparent); }
    .course-row:not(.locked):not(.active):hover { background: var(--bg-elevated); }

    .course-row.active::before {
      content:       '';
      position:      absolute;
      left:          0;
      top:           5px;
      bottom:        5px;
      width:         2px;
      background:    var(--accent);
      border-radius: 1px;
    }

    .chevron {
      width:      12px;
      flex-shrink:0;
      color:      var(--text-muted);
      transition: transform 0.15s;
      display:    flex;
      align-items:center;
    }

    .chevron.open { transform: rotate(90deg); }

    .dot {
      font-size:   10px;
      width:       12px;
      text-align:  center;
      flex-shrink: 0;
      font-family: var(--font-mono);
    }

    .course-name {
      flex:          1;
      font-size:     12.5px;
      font-weight:   500;
      color:         var(--text-secondary);
      overflow:      hidden;
      text-overflow: ellipsis;
      white-space:   nowrap;
    }

    .course-row.active .course-name { color: var(--text-primary); }

    .course-progress {
      font-family: var(--font-mono);
      font-size:   9px;
      color:       var(--text-muted);
      flex-shrink: 0;
    }

    /* ── Unit row ─────────────────────────────────────────────────── */

    .unit-row {
      display:     flex;
      align-items: center;
      gap:         8px;
      padding:     7px 16px 7px 34px;
      cursor:      pointer;
      position:    relative;
      transition:  background 0.1s;
    }

    .unit-row.locked    { opacity: 0.3; cursor: default; pointer-events: none; }
    .unit-row.active    { background: color-mix(in srgb, var(--accent) 8%, transparent); }
    .unit-row:not(.locked):not(.active):hover { background: var(--bg-elevated); }

    .unit-row.active::before {
      content:       '';
      position:      absolute;
      left:          0;
      top:           4px;
      bottom:        4px;
      width:         2px;
      background:    var(--accent);
      border-radius: 1px;
    }

    .unit-name {
      flex:          1;
      font-size:     12px;
      color:         var(--text-muted);
      overflow:      hidden;
      text-overflow: ellipsis;
      white-space:   nowrap;
    }

    .unit-row.active .unit-name { color: var(--text-primary); font-weight: 500; }

    .depth {
      font-family: var(--font-mono);
      font-size:   9px;
      color:       var(--text-muted);
      flex-shrink: 0;
      opacity:     0.7;
    }
  `

  render() {
    if (!this.track) return nothing

    return html`
      <div
        class="track-header ${this.content?.type === 'track' ? 'active' : ''}"
        @click=${() => this._emit({ type: 'track' })}
        title="Ver blog del track"
      >
        <div class="track-eyebrow">Track</div>
        <div class="track-title" style="color:${this.track.color}">${this.track.label}</div>
        ${this.track.tagline
          ? html`<div class="track-tagline">${this.track.tagline}</div>`
          : nothing}
      </div>

      <div class="section-label">Cursos</div>

      <div class="tree">
        ${this.track.courses.map(c => this._renderCourse(c))}
      </div>
    `
  }

  private _renderCourse(course: Course) {
    const isSelected = this.content?.type === 'course'
      && (this.content as { type: 'course'; courseId: string }).courseId === course.id
    const isExpanded = this._expanded.has(course.id)
    const locked     = course.status === 'locked'
    const done       = course.units.filter(u => u.status === 'completed' || u.status === 'mastered').length

    return html`
      <div>
        <div
          class="course-row ${isSelected ? 'active' : ''} ${locked ? 'locked' : ''}"
          @click=${() => this._clickCourse(course)}
        >
          <span class="chevron ${isExpanded ? 'open' : ''}">
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
              <path d="M2 2l4 4-4 4"
                stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="dot" style="color:${DOT_COLOR[course.status]}">${DOT[course.status]}</span>
          <span class="course-name">${course.name}</span>
          <span class="course-progress">${done}/${course.units.length}</span>
        </div>
        ${isExpanded
          ? course.units.map(u => this._renderUnit(u))
          : nothing}
      </div>
    `
  }

  private _renderUnit(unit: Unit) {
    const isActive = this.content?.type === 'unit'
      && (this.content as { type: 'unit'; unitId: string }).unitId === unit.id
    const locked = unit.status === 'locked'

    return html`
      <div
        class="unit-row ${isActive ? 'active' : ''} ${locked ? 'locked' : ''}"
        @click=${() => this._emit({ type: 'unit', unitId: unit.id })}
      >
        <span class="dot" style="color:${DOT_COLOR[unit.status]}">${DOT[unit.status]}</span>
        <span class="unit-name">${unit.name}</span>
        <span class="depth">D${unit.depth}</span>
      </div>
    `
  }
}
