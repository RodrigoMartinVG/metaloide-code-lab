import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { ClosingBlock } from '../types.js'

@customElement('forja-block-closing-question')
export class ForjaBlockClosingQuestion extends LitElement {
  @property({ type: Object }) block!: ClosingBlock
  @state() private _answer = ''
  @state() private _saved  = false

  static styles = css`
    :host {
      display:    block;
      margin-top: 48px;
    }

    .wrap {
      border-top: 1px solid var(--prose-border, var(--border-subtle));
      padding-top:32px;
    }

    .eyebrow {
      font-family:   var(--font-mono);
      font-size:     10px;
      font-weight:   600;
      letter-spacing:1px;
      text-transform:uppercase;
      color:         var(--accent);
      margin-bottom: 10px;
    }

    .question {
      font-size:   16px;
      font-weight: 600;
      color:       var(--prose-heading, var(--text-primary));
      line-height: 1.4;
      margin:      0 0 16px;
    }

    .hint {
      font-size:    12.5px;
      color:        var(--text-muted);
      margin-bottom:14px;
      font-style:   italic;
    }

    textarea {
      display:     block;
      width:       100%;
      box-sizing:  border-box;
      min-height:  100px;
      background:  var(--prose-textarea-bg, var(--bg-base));
      border:      1px solid var(--prose-border, var(--border));
      border-radius:6px;
      padding:     12px 14px;
      font-family: var(--font-prose);
      font-size:   13.5px;
      line-height: 1.6;
      color:       var(--prose-text, var(--text-secondary));
      resize:      vertical;
      outline:     none;
      transition:  border-color 0.12s;
    }

    textarea:focus {
      border-color: var(--accent);
    }

    .actions {
      display:    flex;
      align-items:center;
      gap:        10px;
      margin-top: 10px;
    }

    .save-btn {
      background:  var(--accent);
      border:      none;
      cursor:      pointer;
      font-family: var(--font-mono);
      font-size:   11px;
      font-weight: 500;
      color:       #fff;
      padding:     6px 14px;
      border-radius:5px;
      transition:  background 0.12s;
    }
    .save-btn:hover:not(:disabled) { background: var(--accent-glow); }
    .save-btn:disabled {
      background: var(--bg-elevated);
      color:      var(--text-muted);
      cursor:     default;
    }

    .saved-msg {
      font-size:  12px;
      color:      var(--success);
      font-family:var(--font-mono);
    }
  `

  private _onInput(e: Event) {
    this._answer = (e.target as HTMLTextAreaElement).value
    this._saved  = false
  }

  private _save() {
    this._saved = true
    this.dispatchEvent(new CustomEvent('closing-answer', {
      detail:   { question: this.block.question, answer: this._answer },
      bubbles:  true,
      composed: true,
    }))
  }

  render() {
    return html`
      <div class="wrap">
        <div class="eyebrow">¿Por qué así?</div>
        <p class="question">${this.block.question}</p>
        <p class="hint">Escribe lo que piensas ahora. Lo verás de nuevo cuando revisites esta unidad.</p>
        <textarea
          .value=${this._answer}
          @input=${this._onInput}
          placeholder="Tu respuesta…"
        ></textarea>
        <div class="actions">
          <button class="save-btn" ?disabled=${!this._answer.trim()} @click=${this._save}>
            Guardar respuesta
          </button>
          ${this._saved ? html`<span class="saved-msg">✓ guardado</span>` : null}
        </div>
      </div>
    `
  }
}
