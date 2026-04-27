import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { ExerciseBlock } from '../types.js'

@customElement('forja-editor-panel')
export class ForjaEditorPanel extends LitElement {
  @property({ type: Object }) exercise!: ExerciseBlock

  @state() private _code    = ''
  @state() private _output  = ''
  @state() private _status: 'idle' | 'running' | 'success' | 'error' = 'idle'
  @state() private _running = false

  static styles = css`
    :host {
      display:        flex;
      flex-direction: column;
      height:         100%;
      background:     #0a0d12;
      overflow:       hidden;
    }

    /* ── Exercise bar ────────────────────────────────────────────────────── */

    .exercise-bar {
      padding:       12px 18px;
      background:    var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      display:       flex;
      align-items:   flex-start;
      gap:           14px;
      flex-shrink:   0;
    }

    .exercise-id {
      font-family:    var(--font-mono);
      font-size:      9px;
      color:          var(--text-muted);
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom:  3px;
    }

    .exercise-desc {
      font-size:   12.5px;
      color:       var(--text-secondary);
      line-height: 1.5;
      flex:        1;
    }

    .exercise-actions {
      display:     flex;
      align-items: center;
      gap:         8px;
      flex-shrink: 0;
      padding-top: 2px;
    }

    .btn-reset {
      background:   none;
      border:       1px solid var(--border);
      cursor:       pointer;
      font-family:  var(--font-mono);
      font-size:    11px;
      color:        var(--text-muted);
      padding:      5px 10px;
      border-radius:5px;
      transition:   color 0.12s, border-color 0.12s;
    }
    .btn-reset:hover { color: var(--text-secondary); border-color: var(--text-muted); }

    .btn-run {
      background:   var(--accent);
      border:       none;
      cursor:       pointer;
      font-family:  var(--font-mono);
      font-size:    11px;
      font-weight:  500;
      color:        #fff;
      padding:      5px 14px;
      border-radius:5px;
      display:      flex;
      align-items:  center;
      gap:          5px;
      transition:   background 0.12s;
    }
    .btn-run:hover:not(:disabled) { background: var(--accent-glow); }
    .btn-run:disabled { background: var(--bg-elevated); color: var(--text-muted); cursor: default; }

    /* ── Editor area ─────────────────────────────────────────────────────── */

    .editor-area {
      flex:     1;
      position: relative;
      overflow: hidden;
      min-height: 0;
    }

    .gutter {
      position:        absolute;
      top: 0; left: 0; bottom: 0;
      width:           40px;
      background:      #0d1117;
      border-right:    1px solid #1a1f2a;
      padding:         14px 0;
      display:         flex;
      flex-direction:  column;
      align-items:     flex-end;
      overflow:        hidden;
      user-select:     none;
      pointer-events:  none;
    }

    .line-num {
      font-family: var(--font-mono);
      font-size:   11px;
      color:       #3d4557;
      line-height: 1.5;
      padding-right:8px;
      height:      19.5px;
    }

    textarea.editor {
      position:    absolute;
      top: 0; left: 40px; right: 0; bottom: 0;
      background:  #0d1117;
      color:       var(--text-primary);
      font-family: var(--font-mono);
      font-size:   13px;
      line-height: 1.5;
      padding:     14px 16px;
      border:      none;
      outline:     none;
      resize:      none;
      tab-size:    4;
      caret-color: var(--accent);
      width:       calc(100% - 40px);
      box-sizing:  border-box;
    }

    textarea.editor::selection { background: rgba(56,139,253,0.2); }

    /* ── Output panel ────────────────────────────────────────────────────── */

    .output-panel {
      height:         180px;
      border-top:     1px solid var(--border-subtle);
      flex-direction: column;
      flex-shrink:    0;
      display:        flex;
    }

    .output-header {
      height:        32px;
      background:    var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      display:       flex;
      align-items:   center;
      padding:       0 14px;
      gap:           4px;
      flex-shrink:   0;
    }

    .output-tab {
      font-family:  var(--font-prose);
      font-size:    11px;
      color:        var(--text-muted);
      padding:      2px 8px;
      border-radius:4px;
      background:   var(--bg-elevated);
    }

    .output-status {
      margin-left: auto;
      display:     flex;
      align-items: center;
      gap:         5px;
      font-family: var(--font-mono);
      font-size:   10px;
    }

    .status-dot {
      width:        6px;
      height:       6px;
      border-radius:50%;
    }
    .status-dot.running { background: var(--warning); animation: pulse 1s infinite; }
    .status-dot.success { background: var(--success); }
    .status-dot.error   { background: var(--error); }

    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

    .output-body {
      flex:        1;
      overflow-y:  auto;
      padding:     10px 16px;
      font-family: var(--font-mono);
      font-size:   12px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break:  break-all;
    }

    .idle-msg { color: var(--text-muted); font-style: italic; font-family: var(--font-prose); font-size: 12px; }
  `

  connectedCallback() {
    super.connectedCallback()
    this._code = this.exercise?.starter ?? ''
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has('exercise') && this.exercise) {
      this._code   = this.exercise.starter
      this._status = 'idle'
      this._output = ''
    }
  }

  private _lineCount() { return this._code.split('\n').length }

  private _onInput(e: Event) {
    this._code = (e.target as HTMLTextAreaElement).value
    this.requestUpdate()
  }

  private _onKeydown(e: KeyboardEvent) {
    const ta = e.target as HTMLTextAreaElement

    if (e.key === 'Tab') {
      e.preventDefault()
      const s = ta.selectionStart, end = ta.selectionEnd
      ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(end)
      ta.selectionStart = ta.selectionEnd = s + 4
      this._onInput(e)
      return
    }

    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      this._run()
    }
  }

  private async _run() {
    this._running = true
    this._status  = 'running'
    this._output  = 'Connecting to backend…'
    await new Promise(r => setTimeout(r, 400))
    // M2: replace with real WebSocket /run call
    this._output  = '   Compiling…\n    Finished dev in 0.38s\n\nBackend not connected. Wire up in M2.'
    this._status  = 'success'
    this._running = false
  }

  private _reset() {
    this._code   = this.exercise.starter
    this._status = 'idle'
    this._output = ''
    this.requestUpdate()
  }

  render() {
    if (!this.exercise) return html`<div style="padding:40px;color:var(--text-muted)">No exercise.</div>`

    const lines = this._lineCount()

    return html`
      <div class="exercise-bar">
        <div style="flex:1;min-width:0">
          <div class="exercise-id">${this.exercise.id}</div>
          <div class="exercise-desc">${this.exercise.description}</div>
        </div>
        <div class="exercise-actions">
          <button class="btn-reset" @click=${this._reset}>Reset</button>
          <button class="btn-run" ?disabled=${this._running} @click=${this._run}>
            ${this._running
              ? html`<span>Running…</span>`
              : html`<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M2 1.5l7 3.5-7 3.5V1.5z"/></svg> Run`
            }
          </button>
        </div>
      </div>

      <div class="editor-area">
        <div class="gutter">
          ${Array.from({ length: lines }, (_, i) => html`<div class="line-num">${i + 1}</div>`)}
        </div>
        <textarea
          class="editor"
          .value=${this._code}
          @input=${this._onInput}
          @keydown=${this._onKeydown}
          spellcheck="false"
          autocorrect="off"
          autocapitalize="off"
          autocomplete="off"
        ></textarea>
      </div>

      <div class="output-panel">
        <div class="output-header">
          <span class="output-tab">Output</span>
          <div class="output-status">
            ${this._status === 'running' ? html`<div class="status-dot running"></div><span style="color:var(--warning)">Running</span>` : null}
            ${this._status === 'success' ? html`<div class="status-dot success"></div><span style="color:var(--success)">Done</span>`    : null}
            ${this._status === 'error'   ? html`<div class="status-dot error"></div><span style="color:var(--error)">Error</span>`       : null}
          </div>
        </div>
        <div class="output-body">
          ${this._status === 'idle'
            ? html`<span class="idle-msg">Ctrl+Enter or Run to execute.</span>`
            : html`<span>${this._output}</span>`
          }
        </div>
      </div>
    `
  }
}
