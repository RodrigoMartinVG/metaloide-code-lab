import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { basicSetup, EditorView } from 'codemirror'
import { keymap } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { indentWithTab } from '@codemirror/commands'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { cpp } from '@codemirror/lang-cpp'
import { rust } from '@codemirror/lang-rust'
import { tags } from '@lezer/highlight'
import type { Extension } from '@codemirror/state'
import type { ExerciseBlock } from '../types.js'

const WS_URL = 'ws://localhost:3000/ws/run'

interface OutputLine {
  kind: 'compiler' | 'stdout' | 'stderr' | 'error' | 'info'
  text: string
}

// ── Theme ─────────────────────────────────────────────────────────────────────
// CodeMirror 6 calls dom.getRootNode() to locate the shadow root and mounts its
// styles there, so this works correctly inside Shadow DOM with zero hacks.

const forjaDarkTheme = EditorView.theme({
  '&': {
    height:          '100%',
    backgroundColor: '#0d1117',
    color:           '#e6edf3',
  },
  '.cm-content': {
    caretColor: '#e05c1a',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize:   '13px',
    lineHeight: '22px',
    padding:    '8px 0',
  },
  '.cm-scroller':   { overflow: 'auto' },
  '&.cm-focused':   { outline: 'none' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#e05c1a' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
    backgroundColor: '#388bfd33',
  },
  '.cm-gutters': {
    backgroundColor: '#0d1117',
    color:           '#3d4557',
    border:          'none',
    borderRight:     '1px solid #21262d',
  },
  '.cm-lineNumbers .cm-gutterElement': { padding: '0 10px 0 6px', minWidth: '32px' },
  '.cm-activeLineGutter': { backgroundColor: '#1a1f2a', color: '#6b7280' },
  '.cm-activeLine':       { backgroundColor: '#1a1f2a' },
  '.cm-foldPlaceholder':  { backgroundColor: '#21262d', color: '#8b949e', border: 'none' },
  '.cm-tooltip':          { backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '4px' },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
    backgroundColor: '#1f2937',
    color:           '#e6edf3',
  },
  '.cm-matchingBracket':  { color: '#e6edf3 !important', backgroundColor: '#30363d' },
}, { dark: true })

const forjaHighlight = HighlightStyle.define([
  { tag: tags.keyword,                       color: '#ff7b72' },
  { tag: tags.operator,                      color: '#ff7b72' },
  { tag: tags.controlKeyword,                color: '#ff7b72' },
  { tag: tags.definitionKeyword,             color: '#ff7b72' },
  { tag: tags.moduleKeyword,                 color: '#ff7b72' },
  { tag: tags.typeName,                      color: '#ffa657' },
  { tag: tags.className,                     color: '#ffa657' },
  { tag: tags.function(tags.variableName),   color: '#d2a8ff' },
  { tag: tags.function(tags.propertyName),   color: '#d2a8ff' },
  { tag: tags.definition(tags.variableName), color: '#e6edf3' },
  { tag: tags.variableName,                  color: '#e6edf3' },
  { tag: tags.propertyName,                  color: '#e6edf3' },
  { tag: tags.string,                        color: '#a5d6ff' },
  { tag: tags.special(tags.string),          color: '#a5d6ff' },
  { tag: tags.regexp,                        color: '#a5d6ff' },
  { tag: tags.number,                        color: '#79c0ff' },
  { tag: tags.bool,                          color: '#79c0ff' },
  { tag: tags.null,                          color: '#79c0ff' },
  { tag: tags.comment,                       color: '#8b949e', fontStyle: 'italic' },
  { tag: tags.lineComment,                   color: '#8b949e', fontStyle: 'italic' },
  { tag: tags.blockComment,                  color: '#8b949e', fontStyle: 'italic' },
  { tag: tags.meta,                          color: '#8b949e' },
  { tag: tags.processingInstruction,         color: '#ffa657' },
  { tag: tags.bracket,                       color: '#e6edf3' },
  { tag: tags.punctuation,                   color: '#e6edf3' },
  { tag: tags.derefOperator,                 color: '#ff7b72' },
  { tag: tags.self,                          color: '#ff7b72' },
  { tag: tags.namespace,                     color: '#ffa657' },
])

function langExtension(lang: string): Extension {
  if (lang === 'c' || lang === 'cpp') return cpp()
  if (lang === 'rust') return rust()
  return []
}

@customElement('forja-editor-panel')
export class ForjaEditorPanel extends LitElement {
  @property({ type: Object }) exercise!: ExerciseBlock

  @state() private _lines:  OutputLine[] = []
  @state() private _status: 'idle' | 'running' | 'success' | 'error' = 'idle'

  private _view:    EditorView | null = null
  private _ws:      WebSocket | null = null
  private _editorEl = createRef<HTMLDivElement>()
  private _langComp = new Compartment()

  // ── Styles ────────────────────────────────────────────────────────────────

  static styles = css`
    :host {
      display:        flex;
      flex-direction: column;
      flex:           1;
      min-height:     0;
      overflow:       hidden;
    }

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
      background:    none;
      border:        1px solid var(--border);
      cursor:        pointer;
      font-family:   var(--font-mono);
      font-size:     11px;
      color:         var(--text-muted);
      padding:       5px 10px;
      border-radius: 5px;
      transition:    color 0.12s, border-color 0.12s;
    }
    .btn-reset:hover { color: var(--text-secondary); border-color: var(--text-muted); }

    .btn-run {
      background:    var(--accent);
      border:        none;
      cursor:        pointer;
      font-family:   var(--font-mono);
      font-size:     11px;
      font-weight:   500;
      color:         #fff;
      padding:       5px 14px;
      border-radius: 5px;
      display:       flex;
      align-items:   center;
      gap:           5px;
      transition:    background 0.12s;
    }
    .btn-run:hover:not(:disabled) { background: var(--accent-glow); }
    .btn-run:disabled { background: var(--bg-elevated); color: var(--text-muted); cursor: default; }

    .editor-container {
      flex:       1;
      min-height: 0;
      overflow:   hidden;
    }

    .output-panel {
      height:         200px;
      border-top:     1px solid var(--border-subtle);
      display:        flex;
      flex-direction: column;
      flex-shrink:    0;
    }

    .output-header {
      height:        32px;
      background:    var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      display:       flex;
      align-items:   center;
      padding:       0 14px;
      flex-shrink:   0;
    }

    .output-label {
      font-family:   var(--font-prose);
      font-size:     11px;
      color:         var(--text-secondary);
      background:    var(--bg-elevated);
      padding:       2px 8px;
      border-radius: 4px;
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
      width:         6px;
      height:        6px;
      border-radius: 50%;
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
    }

    .idle-msg {
      color:       var(--text-muted);
      font-style:  italic;
      font-family: var(--font-prose);
      font-size:   12px;
    }

    .out-line     { white-space: pre-wrap; word-break: break-all; display: block; }
    .out-compiler { color: var(--text-muted); }
    .out-stdout   { color: var(--text-primary); }
    .out-stderr   { color: var(--warning); }
    .out-error    { color: var(--error); }
    .out-info     { color: var(--text-muted); font-style: italic; }
  `

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  override firstUpdated() {
    const container = this._editorEl.value
    if (!container) return

    this._view = new EditorView({
      state: EditorState.create({
        doc: this.exercise?.starter ?? '',
        extensions: [
          basicSetup,
          this._langComp.of(langExtension(this.exercise?.language ?? '')),
          forjaDarkTheme,
          syntaxHighlighting(forjaHighlight),
          keymap.of([
            { key: 'Ctrl-Enter', mac: 'Cmd-Enter', run: () => { this._run(); return true } },
            indentWithTab,
          ]),
        ],
      }),
      parent: container,
    })
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('exercise') && this.exercise && this._view) {
      this._view.dispatch({
        changes: { from: 0, to: this._view.state.doc.length, insert: this.exercise.starter },
        effects: this._langComp.reconfigure(langExtension(this.exercise.language)),
      })
      this._lines  = []
      this._status = 'idle'
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback()
    this._ws?.close()
    this._view?.destroy()
  }

  // ── Run ───────────────────────────────────────────────────────────────────

  private _run() {
    if (this._status === 'running') return

    this._lines  = []
    this._status = 'running'
    this.requestUpdate()

    const ws = new WebSocket(WS_URL)
    this._ws = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({
        language: this.exercise.language,
        code:     this._view?.state.doc.toString() ?? this.exercise.starter,
      }))
    }

    ws.onmessage = (e: MessageEvent) => {
      const msg = JSON.parse(e.data as string) as { type: string; data: unknown }
      if (msg.type === 'done') {
        const d       = msg.data as { exit_code: number }
        this._status  = d.exit_code === 0 ? 'success' : 'error'
        this._ws      = null
      } else {
        this._lines = [
          ...this._lines,
          { kind: msg.type as OutputLine['kind'], text: String(msg.data) },
        ]
      }
      this.requestUpdate()
    }

    ws.onerror = () => {
      this._lines  = [{ kind: 'error', text: `Could not connect to ${WS_URL}\nRun: cd backend && cargo run` }]
      this._status = 'error'
      this._ws     = null
      this.requestUpdate()
    }

    ws.onclose = () => {
      if (this._status === 'running') {
        this._status = 'error'
        this.requestUpdate()
      }
      this._ws = null
    }
  }

  private _reset() {
    this._ws?.close()
    this._ws = null
    if (this._view) {
      this._view.dispatch({
        changes: { from: 0, to: this._view.state.doc.length, insert: this.exercise?.starter ?? '' },
      })
    }
    this._lines  = []
    this._status = 'idle'
    this.requestUpdate()
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    if (!this.exercise) {
      return html`<div style="padding:40px;color:var(--text-muted)">No exercise.</div>`
    }

    const running = this._status === 'running'

    return html`
      <div class="exercise-bar">
        <div style="flex:1;min-width:0">
          <div class="exercise-id">${this.exercise.id}</div>
          <div class="exercise-desc">${this.exercise.description}</div>
        </div>
        <div class="exercise-actions">
          <button class="btn-reset" @click=${this._reset}>Reset</button>
          <button class="btn-run" ?disabled=${running} @click=${this._run}>
            ${running
              ? html`<span>Running…</span>`
              : html`<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M2 1.5l7 3.5-7 3.5V1.5z"/></svg> Run`
            }
          </button>
        </div>
      </div>

      <div class="editor-container" ${ref(this._editorEl)}></div>

      <div class="output-panel">
        <div class="output-header">
          <span class="output-label">Output</span>
          <div class="output-status">
            ${this._status === 'running' ? html`<div class="status-dot running"></div><span style="color:var(--warning)">Running</span>`  : null}
            ${this._status === 'success' ? html`<div class="status-dot success"></div><span style="color:var(--success)">Done</span>`     : null}
            ${this._status === 'error'   ? html`<div class="status-dot error"></div><span style="color:var(--error)">Error</span>`        : null}
          </div>
        </div>
        <div class="output-body">
          ${this._status === 'idle' && this._lines.length === 0
            ? html`<span class="idle-msg">Ctrl+Enter or Run to execute.</span>`
            : this._lines.map(l => html`<span class="out-line out-${l.kind}">${l.text}</span>`)
          }
        </div>
      </div>
    `
  }
}
