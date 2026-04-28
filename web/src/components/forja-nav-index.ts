import { LitElement, html, css, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { Track, Course, Pillar, Route, Status } from '../types.js'

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

@customElement('forja-nav-index')
export class ForjaNavIndex extends LitElement {
  @property({ type: Object }) route!: Route
  @property({ type: Array  }) tracks: Track[] = []

  static styles = css`
    :host {
      display:        flex;
      flex-direction: column;
      width:          100%;
      height:         100%;
    }

    /* ── Header ─────────────────────────────────────────────────── */

    .hd {
      padding:       16px 20px 12px;
      border-bottom: 1px solid var(--border-subtle);
      flex-shrink:   0;
    }

    .hd-eyebrow {
      font-family:    var(--font-mono);
      font-size:      9px;
      font-weight:    600;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color:          var(--text-muted);
      margin-bottom:  4px;
    }

    .hd-title {
      font-size:   13px;
      font-weight: 600;
      color:       var(--text-primary);
      margin:      0;
      line-height: 1.3;
    }

    .hd-sub {
      font-size:  10.5px;
      color:      var(--text-muted);
      margin-top: 2px;
      font-family: var(--font-mono);
      opacity:    0.8;
    }

    /* ── List ────────────────────────────────────────────────────── */

    .list { flex: 1; overflow-y: auto; }

    /* ── Row ─────────────────────────────────────────────────────── */

    .row {
      display:       flex;
      align-items:   center;
      gap:           10px;
      padding:       9px 20px;
      cursor:        pointer;
      border-bottom: 1px solid var(--border-subtle);
      transition:    background 0.1s;
      position:      relative;
    }
    .row:last-child { border-bottom: none; }

    .row.locked {
      opacity:        0.3;
      cursor:         default;
      pointer-events: none;
    }

    .row.active {
      background: color-mix(in srgb, var(--accent) 9%, transparent);
    }

    .row:not(.locked):not(.active):hover { background: var(--bg-elevated); }

    /* orange left edge on active row */
    .row.active::before {
      content:       '';
      position:      absolute;
      left:          0;
      top:           4px;
      bottom:        4px;
      width:         2px;
      background:    var(--accent);
      border-radius: 1px;
    }

    /* ── Row internals ──────────────────────────────────────────── */

    .dot {
      font-size:   10px;
      width:       14px;
      text-align:  center;
      flex-shrink: 0;
      font-family: var(--font-mono);
    }

    .color-dot {
      width:         6px;
      height:        6px;
      border-radius: 50%;
      flex-shrink:   0;
      margin-top:    1px;
    }

    .name {
      flex:          1;
      font-size:     12.5px;
      color:         var(--text-secondary);
      overflow:      hidden;
      text-overflow: ellipsis;
      white-space:   nowrap;
    }

    .row.active .name { color: var(--text-primary); font-weight: 500; }

    .meta {
      font-family: var(--font-mono);
      font-size:   9px;
      color:       var(--text-muted);
      flex-shrink: 0;
    }

    /* ── Section divider inside list ────────────────────────────── */

    .section-label {
      font-family:    var(--font-mono);
      font-size:      9px;
      font-weight:    600;
      letter-spacing: 1px;
      text-transform: uppercase;
      color:          var(--text-muted);
      padding:        12px 20px 6px;
      flex-shrink:    0;
    }
  `

  private _nav(type: 'track-select' | 'course-select' | 'unit-select', detail: unknown) {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }))
  }

  render() {
    const { route, tracks } = this
    if (!route || !tracks.length) return nothing

    if (route.view === 'platform') return this._renderPlatform()

    const track = tracks.find(t => t.id === route.trackId)
    if (!track) return nothing

    if (route.view === 'track-map') return this._renderTrack(track)

    // course or unit view
    let courseId: string
    let activeUnitId: string | null = null

    if (route.view === 'course') {
      courseId = route.courseId
    } else {
      activeUnitId = route.unitId
      const found = track.courses.find(c => c.units.some(u => u.id === route.unitId))
      if (!found) return nothing
      courseId = found.id
    }

    const course = track.courses.find(c => c.id === courseId)
    if (!course) return nothing

    return this._renderUnits(track, course, activeUnitId)
  }

  // ── Renderers ─────────────────────────────────────────────────────────────

  private _renderPlatform() {
    return html`
      <div class="hd">
        <div class="hd-eyebrow">Plataforma</div>
        <div class="hd-title">El Viaje</div>
      </div>
      <div class="list">
        ${this.tracks.map(track => {
          const units = track.courses.flatMap(c => c.units)
          const done  = units.filter(u => u.status === 'completed' || u.status === 'mastered').length
          return html`
            <div class="row" @click=${() => this._nav('track-select', track.id)}>
              <div class="color-dot" style="background:${track.color}"></div>
              <span class="name">${track.label}</span>
              <span class="meta">${done}/${units.length}</span>
            </div>
          `
        })}
      </div>
    `
  }

  private _renderTrack(track: Track) {
    return html`
      <div class="hd">
        <div class="hd-eyebrow">Track</div>
        <div class="hd-title" style="color:${track.color}">${track.label}</div>
        <div class="hd-sub">${track.tagline}</div>
      </div>
      <div class="list">
        <div class="section-label">Cursos</div>
        ${track.courses.map(course => {
          const done   = course.units.filter(u => u.status === 'completed' || u.status === 'mastered').length
          const locked = course.status === 'locked'
          return html`
            <div
              class="row ${locked ? 'locked' : ''}"
              @click=${() => this._nav('course-select', { courseId: course.id, trackId: track.id })}
            >
              <span class="dot" style="color:${DOT_COLOR[course.status]}">${DOT[course.status]}</span>
              <span class="name">${course.name}</span>
              <span class="meta">${done}/${course.units.length}</span>
            </div>
          `
        })}
      </div>
    `
  }

  private _renderUnits(track: Track, course: Course, activeUnitId: string | null) {
    return html`
      <div class="hd">
        <div class="hd-eyebrow" style="color:${track.color}">${track.label}</div>
        <div class="hd-title">${course.name}</div>
      </div>
      <div class="list">
        <div class="section-label">Unidades</div>
        ${course.units.map(unit => {
          const isActive = unit.id === activeUnitId
          const locked   = unit.status === 'locked'
          return html`
            <div
              class="row ${locked ? 'locked' : ''} ${isActive ? 'active' : ''}"
              @click=${() => this._nav('unit-select', { unitId: unit.id, trackId: track.id })}
            >
              <span class="dot" style="color:${DOT_COLOR[unit.status]}">${DOT[unit.status]}</span>
              <span class="name">${unit.name}</span>
              <span class="meta">D${unit.depth}</span>
            </div>
          `
        })}
      </div>
    `
  }
}
