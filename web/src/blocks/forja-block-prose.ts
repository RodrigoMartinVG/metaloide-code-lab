import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { marked } from 'marked'
import type { ProseBlock } from '../types.js'

@customElement('forja-block-prose')
export class ForjaBlockProse extends LitElement {
  @property({ type: Object }) block!: ProseBlock

  static styles = css`
    :host { display: block; }

    .prose {
      color:       var(--prose-text,    var(--text-secondary));
      line-height: 1.75;
      font-size:   14.5px;
    }

    .prose h1 {
      font-size:     22px;
      font-weight:   600;
      color:         var(--prose-heading, var(--text-primary));
      margin:        0 0 24px;
      padding-bottom:14px;
      border-bottom: 1px solid var(--prose-border, var(--border-subtle));
      line-height:   1.3;
    }

    .prose h2 {
      font-size:     11px;
      font-weight:   600;
      color:         var(--prose-heading, var(--text-primary));
      text-transform:uppercase;
      letter-spacing:0.8px;
      margin:        32px 0 10px;
      opacity:       0.65;
    }

    .prose h3 {
      font-size:  14px;
      font-weight:600;
      color:      var(--prose-heading, var(--text-primary));
      margin:     24px 0 8px;
    }

    .prose p     { margin: 0 0 16px; }

    .prose a {
      color:          var(--prose-link, var(--info));
      text-decoration:none;
    }
    .prose a:hover { text-decoration: underline; }

    .prose strong { color: var(--prose-heading, var(--text-primary)); font-weight: 600; }
    .prose em     { font-style: italic; }

    .prose code {
      font-family:  var(--font-mono);
      font-size:    12.5px;
      background:   var(--prose-code-bg, var(--bg-elevated));
      border:       1px solid var(--prose-code-border, var(--border-subtle));
      padding:      1px 6px;
      border-radius:4px;
      color:        var(--prose-code-text, var(--accent-glow));
    }

    .prose pre {
      background:   var(--prose-pre-bg, #0d1117);
      border:       1px solid var(--prose-code-border, var(--border-subtle));
      border-radius:8px;
      padding:      16px 18px;
      overflow-x:   auto;
      margin:       0 0 20px;
    }

    .prose pre code {
      background:  none;
      border:      none;
      padding:     0;
      font-size:   12.5px;
      line-height: 1.6;
      color:       var(--prose-pre-text, var(--text-primary));
    }

    .prose ul, .prose ol { padding-left: 22px; margin: 0 0 16px; }
    .prose li            { margin-bottom: 4px; }

    .prose table {
      border-collapse:collapse;
      width:     100%;
      margin:    0 0 20px;
      font-size: 13px;
    }

    .prose th {
      background:  var(--prose-th-bg, var(--bg-elevated));
      color:       var(--prose-heading, var(--text-primary));
      font-weight: 600;
      padding:     8px 12px;
      text-align:  left;
      border:      1px solid var(--prose-code-border, var(--border-subtle));
    }

    .prose td {
      padding:var(--7px) 12px;
      border: 1px solid var(--prose-code-border, var(--border-subtle));
      color:  var(--prose-text, var(--text-secondary));
    }

    .prose td code { font-size: 12px; }

    .prose blockquote {
      border-left:  3px solid var(--prose-code-border, var(--border));
      margin:       0 0 16px;
      padding:      8px 0 8px 16px;
      color:        var(--prose-text, var(--text-secondary));
      opacity:      0.8;
    }
  `

  render() {
    const html_ = marked.parse(this.block.content) as string
    return html`<div class="prose">${unsafeHTML(html_)}</div>`
  }
}
