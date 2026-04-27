import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { Unit, Lab, ExerciseBlock } from '../types.js'
import '../blocks/forja-block-renderer.js'
import './forja-editor-panel.js'

@customElement('forja-unit-studio')
export class ForjaUnitStudio extends LitElement {
  @property({ type: Object }) unit!: Unit
  @property({ type: Object }) lab!:  Lab
  @property() trackColor = 'var(--accent)'
  @property() courseName = ''

  static styles = css`
    :host {
      display:  flex;
      width:    100%;
      height:   100%;
      overflow: hidden;
      font-family: var(--font-prose);
    }

    /* ── Theory column ───────────────────────────────────────────────────── */

    .theory-col {
      width:         42%;
      min-width:     300px;
      max-width:     520px;
      display:       flex;
      flex-direction:column;
      border-right:  1px solid var(--border-subtle);
      overflow:      hidden;
    }

    .theory-header {
      padding:       18px 24px 14px;
      border-bottom: 1px solid var(--border-subtle);
      background:    var(--bg-surface);
      flex-shrink:   0;
    }

    .breadcrumb {
      font-family:    var(--font-mono);
      font-size:      10px;
      color:          var(--text-muted);
      letter-spacing: 0.3px;
      margin-bottom:  6px;
    }

    .breadcrumb .sep { margin: 0 5px; }

    .unit-name {
      font-size:   16px;
      font-weight: 600;
      color:       var(--text-primary);
      margin:      0 0 6px;
    }

    .unit-badges {
      display:     flex;
      align-items: center;
      gap:         6px;
    }

    .badge {
      font-family:    var(--font-mono);
      font-size:      9px;
      font-weight:    600;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      padding:        2px 7px;
      border-radius:  3px;
      background:     var(--bg-elevated);
      color:          var(--text-muted);
    }

    .badge.depth {
      color:      var(--text-secondary);
    }

    .badge.mode {
      color:      var(--accent);
      background: #1a0f08;
    }

    .badge.time {
      color: var(--text-muted);
    }

    .theory-body {
      flex:       1;
      overflow-y: auto;
      padding:    24px 24px 40px;
    }

    /* ── Editor column ───────────────────────────────────────────────────── */

    .editor-col {
      flex:           1;
      min-width:      0;
      display:        flex;
      flex-direction: column;
      overflow:       hidden;
    }
  `

  render() {
    const { unit, lab } = this

    const theoryBlocks   = lab.blocks.filter(b => b.type !== 'exercise')
    const exerciseBlocks = lab.blocks.filter(b => b.type === 'exercise') as ExerciseBlock[]
    const exercise       = exerciseBlocks[0] ?? null

    return html`
      <div class="theory-col">
        <div class="theory-header">
          <div class="breadcrumb">
            <span>${this.courseName}</span>
            <span class="sep">›</span>
            <span>${unit.name}</span>
          </div>
          <div class="unit-name">${lab.title}</div>
          <div class="unit-badges">
            <span class="badge depth">Depth ${unit.depth}</span>
            <span class="badge mode">Taller</span>
            <span class="badge time">${unit.estimatedMinutes}m</span>
          </div>
        </div>
        <div class="theory-body">
          ${theoryBlocks.map(block => html`
            <forja-block-renderer .block=${block}></forja-block-renderer>
          `)}
        </div>
      </div>

      <div class="editor-col">
        ${exercise
          ? html`<forja-editor-panel .exercise=${exercise}></forja-editor-panel>`
          : html`<div style="padding:40px;color:var(--text-muted);font-size:13px">No exercise for this unit yet.</div>`
        }
      </div>
    `
  }
}
