import './styles/tokens.css'
import { LitElement, html, css, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import type { Pillar, Route, StudyContent, Unit, Status } from './types.js'
import { ALL_TRACKS, getTrack, getUnit, getLab } from './data/mock.js'

import './components/forja-topbar.js'
import './components/forja-platform-map.js'
import './components/forja-nav-tree.js'
import './components/forja-blogpost.js'
import './components/forja-unit-blog.js'
import './components/forja-unit-studio.js'

const API = 'http://localhost:3000'

@customElement('forja-app')
class ForjaApp extends LitElement {
  @state() private _route:          Route        = { view: 'platform' }
  @state() private _content:        StudyContent = { type: 'track' }
  @state() private _progress:       Map<string, Status> = new Map()
  @state() private _treeCollapsed:  boolean = false

  private _backendOnline = false

  static styles = css`
    :host {
      display:        flex;
      flex-direction: column;
      height:         100vh;
      overflow:       hidden;
    }

    .main {
      flex:       1;
      margin-top: var(--topbar-height);
      overflow:   hidden;
      display:    flex;
    }

    /* ── Platform: full-screen map ────────────────────────────────────────── */

    .platform-view {
      flex:     1;
      overflow: hidden;
      display:  flex;
    }

    .platform-view > * {
      flex:       1;
      min-width:  0;
      min-height: 0;
    }

    /* ── Study: persistent split ──────────────────────────────────────────── */

    .study-view {
      display:  flex;
      flex:     1;
      overflow: hidden;
    }

    .tree-panel {
      width:          280px;
      flex-shrink:    0;
      overflow:       hidden;
      display:        flex;
      flex-direction: column;
      transition:     width 0.2s ease;
    }

    .tree-panel.collapsed { width: 0; }

    .tree-panel > * {
      flex:       1;
      min-height: 0;
    }

    /* ── Divider ──────────────────────────────────────────────────────────── */

    .divider {
      width:           20px;
      flex-shrink:     0;
      display:         flex;
      align-items:     center;
      justify-content: center;
      padding-top:     14px;
      cursor:          pointer;
      position:        relative;
      user-select:     none;
    }

    .divider::before {
      content:        '';
      position:       absolute;
      top:            0; bottom: 0; left: 9px;
      width:          1px;
      background:     var(--border-subtle);
      pointer-events: none;
    }

    .divider-pill {
      position:        relative;
      z-index:         1;
      width:           18px;
      height:          44px;
      background:      var(--bg-elevated);
      border:          1px solid var(--border-subtle);
      border-radius:   9px;
      display:         flex;
      align-items:     center;
      justify-content: center;
      color:           var(--text-muted);
      transition:      background 0.1s, color 0.1s, border-color 0.1s;
    }

    .divider:hover .divider-pill {
      background:   var(--bg-surface);
      border-color: var(--border);
      color:        var(--text-secondary);
    }

    /* ── Content panel ────────────────────────────────────────────────────── */

    .content-panel {
      flex:     1;
      overflow: hidden;
      display:  flex;
    }

    .content-panel > * {
      flex:       1;
      min-width:  0;
      min-height: 0;
    }

    /* ── Empty / fallback ─────────────────────────────────────────────────── */

    .empty {
      flex:            1;
      display:         flex;
      align-items:     center;
      justify-content: center;
      color:           var(--text-muted);
      font-size:       14px;
    }
  `

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback()
    void this._loadProgress()
  }

  // ── Progress: load ────────────────────────────────────────────────────────

  private async _loadProgress() {
    try {
      const res = await fetch(`${API}/api/progress`)
      if (!res.ok) return
      const records = (await res.json()) as Array<{ unit_id: string; status: string }>
      this._progress      = new Map(records.map(r => [r.unit_id, r.status as Status]))
      this._backendOnline = true
    } catch {
      // backend offline — mock statuses remain in effect
    }
  }

  // ── Progress: write ───────────────────────────────────────────────────────

  private async _putProgress(unitId: string, status: Status) {
    this._progress = new Map(this._progress).set(unitId, status)
    if (!this._backendOnline) return
    try {
      await fetch(`${API}/api/progress/${unitId}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status }),
      })
    } catch { /* backend went offline */ }
  }

  private async _postClosing(unitId: string, question: string, answer: string) {
    if (!this._backendOnline) return
    try {
      await fetch(`${API}/api/closing`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ unit_id: unitId, question, answer }),
      })
    } catch { /* offline */ }
  }

  // ── Progress helpers ──────────────────────────────────────────────────────

  private _applyProgress<T extends ReturnType<typeof getTrack>>(track: T): T {
    if (!track) return track
    const courses = track.courses.map(course => {
      const units = course.units.map(unit => ({
        ...unit,
        status: this._progress.get(unit.id) ?? unit.status,
      }))
      return { ...course, units, status: this._deriveCourseStatus(units) }
    })
    return { ...track, courses }
  }

  private _deriveCourseStatus(units: Unit[]): Status {
    if (units.every(u => u.status === 'locked'))                                                        return 'locked'
    if (units.every(u => u.status === 'completed' || u.status === 'mastered'))                          return 'completed'
    if (units.some(u => u.status === 'started' || u.status === 'completed' || u.status === 'mastered')) return 'started'
    if (units.some(u => u.status === 'available'))                                                      return 'available'
    return 'locked'
  }

  // ── Derived data ──────────────────────────────────────────────────────────

  private get _activePillar(): Pillar {
    if (this._route.view === 'study') return this._route.trackId
    return 'c'
  }

  private _breadcrumb(): string {
    if (this._route.view !== 'study') return ''
    const track = getTrack(this._route.trackId)
    if (!track) return ''
    const sel = this._content
    if (sel.type === 'track') return track.label
    if (sel.type === 'course') {
      const course = track.courses.find(c => c.id === sel.courseId)
      return course ? `${track.label} › ${course.name}` : track.label
    }
    if (sel.type === 'unit') {
      const found = getUnit(sel.unitId)
      return found ? `${track.label} › ${found.course.name} › ${found.unit.name}` : track.label
    }
    return ''
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    return html`
      <forja-topbar
        .activePillar=${this._activePillar}
        .route=${this._route}
        .breadcrumb=${this._breadcrumb()}
        @pillar-change=${this._onPillarChange}
        @nav-platform=${this._onNavPlatform}
      ></forja-topbar>

      <div
        class="main"
        @track-select=${this._onTrackSelect}
        @course-select=${this._onCourseSelect}
        @unit-select=${this._onUnitSelect}
        @content-select=${this._onContentSelect}
        @closing-answer=${this._onClosingAnswer}
      >
        ${this._route.view === 'platform'
          ? this._renderPlatform()
          : this._renderStudy()
        }
      </div>
    `
  }

  // ── Platform view: full-screen map ────────────────────────────────────────

  private _renderPlatform() {
    const tracks = ALL_TRACKS.map(t => this._applyProgress(t))
    return html`
      <div class="platform-view">
        <forja-platform-map .tracks=${tracks}></forja-platform-map>
      </div>
    `
  }

  // ── Study view: tree + content ────────────────────────────────────────────

  private _renderStudy() {
    if (this._route.view !== 'study') return nothing
    const raw  = getTrack(this._route.trackId)
    const track = this._applyProgress(raw)
    if (!track) return html`<div class="empty">Track not found.</div>`

    const chevron = this._treeCollapsed
      ? html`<path d="M1.5 1l4 5-4 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`
      : html`<path d="M5.5 1L1.5 6l4 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`

    return html`
      <div class="study-view">

        <div class="tree-panel ${this._treeCollapsed ? 'collapsed' : ''}">
          <forja-nav-tree
            .track=${track}
            .content=${this._content}
          ></forja-nav-tree>
        </div>

        <div
          class="divider"
          @click=${() => { this._treeCollapsed = !this._treeCollapsed }}
          title=${this._treeCollapsed ? 'Mostrar árbol' : 'Ocultar árbol'}
        >
          <div class="divider-pill">
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
              ${chevron}
            </svg>
          </div>
        </div>

        <div class="content-panel">
          ${this._renderContent(track)}
        </div>

      </div>
    `
  }

  private _renderContent(track: NonNullable<ReturnType<typeof getTrack>>) {
    const { _content: sel } = this

    if (sel.type === 'track') {
      return track.blog
        ? html`<forja-blogpost .blog=${track.blog} .trackColor=${track.color} eyebrow="Track"></forja-blogpost>`
        : html`<div class="empty">Sin contenido editorial para este track aún.</div>`
    }

    if (sel.type === 'course') {
      const course = track.courses.find(c => c.id === sel.courseId)
      return course?.blog
        ? html`<forja-blogpost .blog=${course.blog} .trackColor=${track.color} eyebrow="Course"></forja-blogpost>`
        : html`<div class="empty">Sin contenido editorial para este curso aún.</div>`
    }

    if (sel.type === 'unit') {
      const found = getUnit(sel.unitId)
      const lab   = getLab(sel.unitId)
      if (!found || !lab) return html`<div class="empty">Unidad no encontrada: ${sel.unitId}</div>`
      const { unit } = found
      return unit.renderMode === 'blog'
        ? html`<forja-unit-blog
                  .unit=${unit} .lab=${lab}
                  .trackColor=${track.color} .courseName=${found.course.name}
                ></forja-unit-blog>`
        : html`<forja-unit-studio
                  .unit=${unit} .lab=${lab}
                  .trackColor=${track.color} .courseName=${found.course.name}
                ></forja-unit-studio>`
    }

    return nothing
  }

  // ── Event handlers ────────────────────────────────────────────────────────

  private _onNavPlatform() {
    this._route = { view: 'platform' }
  }

  private _onPillarChange(e: CustomEvent<Pillar>) {
    this._route   = { view: 'study', trackId: e.detail }
    this._content = { type: 'track' }
  }

  // Fired by forja-nav-tree
  private _onContentSelect(e: CustomEvent<StudyContent>) {
    e.stopPropagation()
    this._content = e.detail
    if (e.detail.type === 'unit') {
      const current = this._progress.get(e.detail.unitId)
      if (!current || current === 'available') void this._putProgress(e.detail.unitId, 'started')
    }
  }

  // Fired by nav-card blocks inside blog posts
  private _onTrackSelect(e: CustomEvent<Pillar>) {
    this._route   = { view: 'study', trackId: e.detail }
    this._content = { type: 'track' }
  }

  private _onCourseSelect(e: CustomEvent<{ courseId: string; trackId: Pillar }>) {
    const { courseId, trackId } = e.detail
    if (this._route.view !== 'study' || this._route.trackId !== trackId) {
      this._route = { view: 'study', trackId }
    }
    this._content = { type: 'course', courseId }
  }

  private _onUnitSelect(e: CustomEvent<{ unitId: string; trackId: Pillar }>) {
    const { unitId, trackId } = e.detail
    if (this._route.view !== 'study' || this._route.trackId !== trackId) {
      this._route = { view: 'study', trackId }
    }
    this._content = { type: 'unit', unitId }
    const current = this._progress.get(unitId)
    if (!current || current === 'available') void this._putProgress(unitId, 'started')
  }

  private _onClosingAnswer(e: CustomEvent<{ question: string; answer: string }>) {
    if (this._content.type !== 'unit') return
    const { unitId } = this._content
    void this._putProgress(unitId, 'completed')
    void this._postClosing(unitId, e.detail.question, e.detail.answer)
  }
}

const _ = ALL_TRACKS
document.querySelector('#app')!.innerHTML = '<forja-app></forja-app>'
