import './styles/tokens.css'
import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import type { Pillar, Route } from './types.js'
import { ALL_TRACKS, getTrack, getUnit, getLab } from './data/mock.js'

import './components/forja-topbar.js'
import './components/forja-track-map.js'
import './components/forja-unit-blog.js'
import './components/forja-unit-studio.js'

@customElement('forja-app')
class ForjaApp extends LitElement {
  @state() private _route: Route = { view: 'track-map', trackId: 'c' }

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

    .map-scroll {
      flex:       1;
      overflow-y: auto;
    }

    .unit-wrap {
      flex:     1;
      overflow: hidden;
      display:  flex;
    }

    .empty-track {
      flex:            1;
      display:         flex;
      flex-direction:  column;
      align-items:     center;
      justify-content: center;
      color:           var(--text-muted);
      font-size:       14px;
      gap:             8px;
    }
  `

  private get _activePillar(): Pillar {
    return this._route.view === 'track-map'
      ? this._route.trackId
      : this._route.trackId
  }

  private _breadcrumb(): string {
    if (this._route.view !== 'unit') return ''
    const found = getUnit(this._route.unitId)
    if (!found) return ''
    const track = getTrack(found.track.id)
    return `${track?.label ?? ''} › ${found.course.name} › ${found.unit.name}`
  }

  private _onPillarChange(e: CustomEvent<Pillar>) {
    this._route = { view: 'track-map', trackId: e.detail }
  }

  private _onNavMap() {
    this._route = { view: 'track-map', trackId: this._activePillar }
  }

  private _onUnitSelect(e: CustomEvent<{ unitId: string; trackId: Pillar }>) {
    this._route = { view: 'unit', unitId: e.detail.unitId, trackId: e.detail.trackId }
  }

  render() {
    return html`
      <forja-topbar
        .activePillar=${this._activePillar}
        .route=${this._route}
        .breadcrumb=${this._breadcrumb()}
        @pillar-change=${this._onPillarChange}
        @nav-map=${this._onNavMap}
      ></forja-topbar>

      <div class="main" @unit-select=${this._onUnitSelect}>
        ${this._route.view === 'track-map'
          ? this._renderTrackMap()
          : this._renderUnit()
        }
      </div>
    `
  }

  private _renderTrackMap() {
    const track = getTrack(this._route.trackId as string)
    if (!track) return html`<div class="empty-track"><span>Track not found.</span></div>`

    return html`
      <div class="map-scroll">
        <forja-track-map .track=${track}></forja-track-map>
      </div>
    `
  }

  private _renderUnit() {
    if (this._route.view !== 'unit') return null

    const found = getUnit(this._route.unitId)
    const lab   = getLab(this._route.unitId)

    if (!found || !lab) {
      return html`
        <div class="empty-track">
          <strong style="color:var(--text-secondary)">Unit not found</strong>
          <span>No content available for ${this._route.unitId} yet.</span>
        </div>
      `
    }

    const { unit, course, track } = found

    if (unit.renderMode === 'blog') {
      return html`
        <div class="unit-wrap">
          <forja-unit-blog
            .unit=${unit}
            .lab=${lab}
            .trackColor=${track.color}
            .courseName=${course.name}
          ></forja-unit-blog>
        </div>
      `
    }

    return html`
      <div class="unit-wrap">
        <forja-unit-studio
          .unit=${unit}
          .lab=${lab}
          .trackColor=${track.color}
          .courseName=${course.name}
        ></forja-unit-studio>
      </div>
    `
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _tracksPreload = ALL_TRACKS  // ensures mock data is loaded

document.querySelector('#app')!.innerHTML = '<forja-app></forja-app>'
