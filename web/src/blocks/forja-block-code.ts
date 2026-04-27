import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { CodeBlock } from '../types.js'

@customElement('forja-block-code')
export class ForjaBlockCode extends LitElement {
  @property({ type: Object }) block!: CodeBlock

  static styles = css`
    :host { display: block; margin: 0 0 20px; }

    .code-wrap {
      position:     relative;
      background:   #0d1117;
      border:       1px solid var(--prose-code-border, var(--border-subtle));
      border-radius:8px;
      overflow:     hidden;
    }

    .code-header {
      display:        flex;
      align-items:    center;
      justify-content:space-between;
      padding:        6px 14px;
      background:     #161b22;
      border-bottom:  1px solid var(--border-subtle);
    }

    .lang-label {
      font-family:   var(--font-mono);
      font-size:     10px;
      color:         var(--text-muted);
      letter-spacing:0.5px;
      text-transform:uppercase;
    }

    .copy-btn {
      background:    none;
      border:        none;
      cursor:        pointer;
      font-family:   var(--font-mono);
      font-size:     10px;
      color:         var(--text-muted);
      padding:       2px 6px;
      border-radius: 4px;
      transition:    color 0.1s, background 0.1s;
    }
    .copy-btn:hover {
      color:      var(--text-secondary);
      background: var(--bg-elevated);
    }

    pre {
      margin:      0;
      padding:     16px 18px;
      overflow-x:  auto;
      font-family: var(--font-mono);
      font-size:   12.5px;
      line-height: 1.6;
      color:       var(--text-primary);
    }
  `

  private async _copy() {
    await navigator.clipboard.writeText(this.block.content)
  }

  render() {
    return html`
      <div class="code-wrap">
        <div class="code-header">
          <span class="lang-label">${this.block.language}</span>
          <button class="copy-btn" @click=${this._copy}>copy</button>
        </div>
        <pre>${this.block.content}</pre>
      </div>
    `
  }
}
