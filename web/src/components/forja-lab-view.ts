import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { marked } from 'marked'
import type { Lab } from '../data/mock.js'

@customElement('forja-lab-view')
export class ForjaLabView extends LitElement {
  @property({ type: Object }) lab: Lab | null = null
  @state() private _code: Record<string, string> = {}
  @state() private _output = ''
  @state() private _outputType: 'idle' | 'running' | 'success' | 'error' = 'idle'
  @state() private _running = false

  static styles = css`
    :host {
      display: flex;
      height: 100%;
      overflow: hidden;
      font-family: var(--font-prose);
    }

    /* ── Left column: theory ───────────────────────────────────────────── */

    .theory-col {
      width: 44%;
      min-width: 320px;
      max-width: 600px;
      overflow-y: auto;
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
    }

    .theory-header {
      padding: 24px 32px 0;
      border-bottom: 1px solid var(--border-subtle);
      flex-shrink: 0;
    }

    .concept-badge {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 1px;
      color: var(--accent);
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .lab-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.3;
      padding-bottom: 20px;
    }

    .theory-body {
      flex: 1;
      padding: 28px 32px 40px;
    }

    /* ── Prose markdown ────────────────────────────────────────────────── */

    .prose { color: var(--text-secondary); line-height: 1.75; font-size: 14px; }

    .prose h1 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .prose h2 {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 28px 0 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.7;
    }

    .prose h3 {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 20px 0 8px;
    }

    .prose p {
      margin: 0 0 14px;
    }

    .prose a {
      color: var(--info);
      text-decoration: none;
    }
    .prose a:hover { text-decoration: underline; }

    .prose strong { color: var(--text-primary); font-weight: 600; }
    .prose em     { color: var(--text-secondary); font-style: italic; }

    .prose code {
      font-family: var(--font-mono);
      font-size: 12px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      padding: 1px 6px;
      border-radius: 4px;
      color: var(--accent-glow);
    }

    .prose pre {
      background: #0d1117;
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 16px 18px;
      overflow-x: auto;
      margin: 0 0 16px;
      position: relative;
    }

    .prose pre::before {
      content: 'rust';
      position: absolute;
      top: 8px;
      right: 12px;
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--text-muted);
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .prose pre code {
      background: none;
      border: none;
      padding: 0;
      font-size: 12.5px;
      line-height: 1.6;
      color: var(--text-primary);
    }

    .prose ul, .prose ol {
      padding-left: 20px;
      margin: 0 0 14px;
    }

    .prose li {
      margin-bottom: 4px;
    }

    .prose table {
      border-collapse: collapse;
      width: 100%;
      margin: 0 0 16px;
      font-size: 12.5px;
    }

    .prose th {
      background: var(--bg-elevated);
      color: var(--text-primary);
      font-weight: 600;
      padding: 8px 12px;
      text-align: left;
      border: 1px solid var(--border-subtle);
    }

    .prose td {
      padding: 7px 12px;
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
    }

    .prose td code {
      font-size: 11.5px;
    }

    /* ── Right column: editor ──────────────────────────────────────────── */

    .editor-col {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      background: #0d1117;
    }

    .exercise-bar {
      padding: 12px 18px;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: flex-start;
      gap: 16px;
      flex-shrink: 0;
    }

    .exercise-label {
      flex: 1;
    }

    .exercise-id {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--text-muted);
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .exercise-desc {
      font-size: 12.5px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .exercise-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
      padding-top: 2px;
    }

    .btn-reset {
      background: none;
      border: 1px solid var(--border);
      cursor: pointer;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--text-muted);
      padding: 5px 10px;
      border-radius: 5px;
      transition: color 0.12s, border-color 0.12s;
    }
    .btn-reset:hover {
      color: var(--text-secondary);
      border-color: var(--text-muted);
    }

    .btn-run {
      background: var(--accent);
      border: 1px solid transparent;
      cursor: pointer;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 500;
      color: #fff;
      padding: 5px 14px;
      border-radius: 5px;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: background 0.12s;
      letter-spacing: 0.2px;
    }
    .btn-run:hover:not(:disabled) { background: var(--accent-glow); }
    .btn-run:disabled {
      background: var(--bg-elevated);
      color: var(--text-muted);
      cursor: default;
    }

    .editor-area {
      flex: 1;
      position: relative;
      overflow: hidden;
    }

    .editor-gutter {
      position: absolute;
      top: 0; left: 0; bottom: 0;
      width: 40px;
      background: #0d1117;
      border-right: 1px solid #1a1f2a;
      padding: 14px 0;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      overflow: hidden;
      user-select: none;
    }

    .line-num {
      font-family: var(--font-mono);
      font-size: 11px;
      color: #3d4557;
      line-height: 1.5;
      padding-right: 8px;
      height: 18px;
    }

    textarea.editor {
      position: absolute;
      top: 0; left: 40px; right: 0; bottom: 0;
      background: #0d1117;
      color: var(--text-primary);
      font-family: var(--font-mono);
      font-size: 13px;
      line-height: 1.5;
      padding: 14px 16px;
      border: none;
      outline: none;
      resize: none;
      tab-size: 4;
      caret-color: var(--accent);
      width: calc(100% - 40px);
    }

    textarea.editor::selection {
      background: rgba(56, 139, 253, 0.2);
    }

    /* ── Output panel ──────────────────────────────────────────────────── */

    .output-panel {
      height: 190px;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      background: #0a0d12;
    }

    .output-tabs {
      height: 32px;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      padding: 0 12px;
      gap: 4px;
      flex-shrink: 0;
    }

    .output-tab {
      font-family: var(--font-prose);
      font-size: 11px;
      color: var(--text-muted);
      padding: 3px 9px;
      border-radius: 4px;
      cursor: pointer;
      background: none;
      border: none;
      transition: color 0.1s, background 0.1s;
    }
    .output-tab.active {
      color: var(--text-primary);
      background: var(--bg-elevated);
    }

    .output-status {
      margin-left: auto;
      font-family: var(--font-mono);
      font-size: 10px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
    .status-dot.running  { background: var(--warning); animation: pulse 1s infinite; }
    .status-dot.success  { background: var(--success); }
    .status-dot.error    { background: var(--error); }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.3; }
    }

    .output-body {
      flex: 1;
      overflow-y: auto;
      padding: 10px 16px;
      font-family: var(--font-mono);
      font-size: 12px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-all;
    }

    .output-idle    { color: var(--text-muted); font-style: italic; font-family: var(--font-prose); font-size: 12px; }
    .output-info    { color: var(--text-muted); }
    .output-stdout  { color: var(--text-primary); }
    .output-stderr  { color: var(--warning); }
    .output-error   { color: var(--error); }
    .output-success { color: var(--success); }
  `

  private _lineCount(code: string) {
    return code.split('\n').length
  }

  private _onInput(id: string, value: string) {
    this._code = { ...this._code, [id]: value }
    this.requestUpdate()
  }

  private _onKeydown(e: KeyboardEvent, id: string) {
    const ta = e.target as HTMLTextAreaElement

    if (e.key === 'Tab') {
      e.preventDefault()
      const start = ta.selectionStart
      const end   = ta.selectionEnd
      const val   = ta.value
      ta.value = val.slice(0, start) + '    ' + val.slice(end)
      ta.selectionStart = ta.selectionEnd = start + 4
      this._onInput(id, ta.value)
      return
    }

    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      this._run(id)
    }
  }

  private async _run(_id: string) {
    this._running = true
    this._outputType = 'running'
    this._output = 'Connecting to backend…'
    await new Promise(r => setTimeout(r, 500))
    this._output = [
      '   Compiling forja-run v0.1.0\n',
      '    Finished dev [unoptimized + debuginfo] in 0.42s\n\n',
      'Backend not connected yet.\nThis is M1 — wire up the real runner in M2.',
    ].join('')
    this._outputType = 'success'
    this._running = false
  }

  render() {
    if (!this.lab) {
      return html`<div style="padding:40px;color:var(--text-muted);font-size:14px">No lab selected.</div>`
    }

    const proseBlocks = this.lab.blocks.filter(b => b.type === 'prose')
    const codeBlock   = this.lab.blocks.find(b => b.type === 'code')

    const code    = codeBlock ? (this._code[codeBlock.id] ?? codeBlock.starter) : ''
    const lines   = codeBlock ? this._lineCount(code) : 0

    return html`
      <!-- Theory column -->
      <div class="theory-col">
        <div class="theory-header">
          <div class="concept-badge">Rust · Depth 1</div>
          <div class="lab-title">${this.lab.title}</div>
        </div>
        <div class="theory-body">
          ${proseBlocks.map(b => html`
            <div class="prose">${unsafeHTML(marked.parse(b.content) as string)}</div>
          `)}
        </div>
      </div>

      <!-- Editor column -->
      ${codeBlock ? html`
        <div class="editor-col">
          <div class="exercise-bar">
            <div class="exercise-label">
              <div class="exercise-id">${codeBlock.id}</div>
              <div class="exercise-desc">${codeBlock.description}</div>
            </div>
            <div class="exercise-actions">
              <button class="btn-reset" @click=${() => { this._code = {}; this.requestUpdate() }}>Reset</button>
              <button
                class="btn-run"
                ?disabled=${this._running}
                @click=${() => this._run(codeBlock.id)}
              >
                ${this._running
                  ? html`<span>Running…</span>`
                  : html`<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M2 1.5l7 3.5-7 3.5V1.5z"/></svg> Run`
                }
              </button>
            </div>
          </div>

          <div class="editor-area">
            <div class="editor-gutter">
              ${Array.from({ length: lines }, (_, i) => html`
                <div class="line-num">${i + 1}</div>
              `)}
            </div>
            <textarea
              class="editor"
              .value=${code}
              @input=${(e: Event) => this._onInput(codeBlock.id, (e.target as HTMLTextAreaElement).value)}
              @keydown=${(e: KeyboardEvent) => this._onKeydown(e, codeBlock.id)}
              spellcheck="false"
              autocorrect="off"
              autocapitalize="off"
              autocomplete="off"
            ></textarea>
          </div>

          <div class="output-panel">
            <div class="output-tabs">
              <button class="output-tab active">Output</button>
              <button class="output-tab">Tests</button>
              <div class="output-status">
                ${this._outputType === 'running' ? html`<div class="status-dot running"></div><span style="color:var(--warning)">Running</span>` : null}
                ${this._outputType === 'success' ? html`<div class="status-dot success"></div><span style="color:var(--success)">Done</span>` : null}
                ${this._outputType === 'error'   ? html`<div class="status-dot error"></div><span style="color:var(--error)">Error</span>` : null}
              </div>
            </div>
            <div class="output-body">
              ${this._outputType === 'idle'
                ? html`<span class="output-idle">Press Ctrl+Enter or click Run to execute.</span>`
                : html`<span class="${this._outputType === 'running' ? 'output-info' : 'output-stdout'}">${this._output}</span>`
              }
            </div>
          </div>
        </div>
      ` : null}
    `
  }
}
