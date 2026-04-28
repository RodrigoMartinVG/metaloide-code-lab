import { LitElement, html, css, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { Track, Pillar } from '../types.js'

function trackStats(track: Track): { done: number; total: number } {
  let done = 0, total = 0
  for (const course of track.courses)
    for (const unit of course.units) {
      total++
      if (unit.status === 'completed' || unit.status === 'mastered') done++
    }
  return { done, total }
}

@customElement('forja-platform-map')
export class ForjaPlatformMap extends LitElement {
  @property({ type: Array }) tracks: Track[] = []

  static styles = css`
    :host {
      display:        flex;
      flex-direction: column;
      width:          100%;
      height:         100%;
      overflow-y:     auto;
    }

    /* ── Page shell ────────────────────────────────────────────────────────── */

    .page {
      padding: 32px 24px 60px;
    }

    .page-header {
      margin-bottom: 28px;
    }

    .page-title {
      font-size:      17px;
      font-weight:    600;
      color:          var(--text-primary);
      letter-spacing: -0.2px;
      margin:         0 0 4px;
    }

    .page-sub {
      font-size:  12px;
      color:      var(--text-muted);
      line-height:1.5;
    }

    /* ── Track card ────────────────────────────────────────────────────────── */

    .card {
      background:    var(--bg-surface);
      border:        1px solid var(--border-subtle);
      border-radius: 8px;
      padding:       14px 16px;
      cursor:        pointer;
      transition:    border-color 0.14s, background 0.14s;
    }

    .card:hover {
      border-color: var(--track-color, var(--border));
      background:   var(--bg-elevated);
    }

    .card-top {
      display:       flex;
      align-items:   flex-start;
      gap:           10px;
      margin-bottom: 10px;
    }

    .card-dot {
      width:         8px;
      height:        8px;
      border-radius: 50%;
      background:    var(--track-color);
      flex-shrink:   0;
      margin-top:    4px;
    }

    .card-meta { flex: 1; min-width: 0; }

    .card-label {
      font-size:   13px;
      font-weight: 600;
      color:       var(--text-primary);
      line-height: 1.3;
    }

    .card-tagline {
      font-family:    var(--font-mono);
      font-size:      9px;
      color:          var(--track-color);
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-top:     2px;
    }

    .card-footer {
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
      background:    var(--track-color);
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

    /* ── Topology connectors ───────────────────────────────────────────────── */

    .v-connector {
      display:        flex;
      flex-direction: column;
      align-items:    center;
      height:         24px;
    }

    .v-line {
      width:      1px;
      flex:       1;
      background: var(--border-subtle);
    }

    .v-arrow {
      width:        0;
      height:       0;
      border-left:  4px solid transparent;
      border-right: 4px solid transparent;
      border-top:   5px solid var(--border-subtle);
    }

    .fork-connector {
      position: relative;
      height:   32px;
    }

    .fork-connector::before {
      content:    '';
      position:   absolute;
      top:        0;
      left:       calc(50% - 0.5px);
      width:      1px;
      height:     12px;
      background: var(--border-subtle);
    }

    .fork-connector::after {
      content:    '';
      position:   absolute;
      top:        12px;
      left:       25%;
      right:      25%;
      height:     1px;
      background: var(--border-subtle);
    }

    .fork-leg {
      position:   absolute;
      top:        12px;
      bottom:     0;
      width:      1px;
      background: var(--border-subtle);
    }

    .fork-leg.left  { left:  25%; }
    .fork-leg.right { right: 25%; }

    /* ── Bottom row ────────────────────────────────────────────────────────── */

    .bottom-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap:     12px;
    }
  `

  private _enter(trackId: Pillar) {
    this.dispatchEvent(new CustomEvent('track-select', {
      detail:   trackId,
      bubbles:  true,
      composed: true,
    }))
  }

  private _card(track: Track) {
    const { done, total } = trackStats(track)
    const pct = total > 0 ? (done / total) * 100 : 0

    return html`
      <div
        class="card"
        style="--track-color:${track.color}"
        @click=${() => this._enter(track.id)}
        role="button"
        tabindex="0"
        @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this._enter(track.id)}
      >
        <div class="card-top">
          <div class="card-dot"></div>
          <div class="card-meta">
            <div class="card-label">${track.label}</div>
            <div class="card-tagline">${track.tagline}</div>
          </div>
        </div>
        <div class="card-footer">
          <div class="progress-bar">
            <div class="progress-fill" style="width:${pct}%"></div>
          </div>
          <span class="progress-text">${done}/${total}</span>
        </div>
      </div>
    `
  }

  render() {
    const byId = (id: Pillar) => this.tracks.find(t => t.id === id)

    const c         = byId('c')
    const rust      = byId('rust')
    const compilers = byId('compilers')
    const os        = byId('os')

    return html`
      <div class="page">
        <div class="page-header">
          <h2 class="page-title">El Viaje</h2>
          <p class="page-sub">Cuatro disciplinas. Un sistema coherente.</p>
        </div>

        ${c    ? this._card(c)    : nothing}

        <div class="v-connector"><div class="v-line"></div><div class="v-arrow"></div></div>

        ${rust ? this._card(rust) : nothing}

        <div class="fork-connector">
          <div class="fork-leg left"></div>
          <div class="fork-leg right"></div>
        </div>

        <div class="bottom-row">
          ${compilers ? this._card(compilers) : nothing}
          ${os        ? this._card(os)        : nothing}
        </div>
      </div>
    `
  }
}
