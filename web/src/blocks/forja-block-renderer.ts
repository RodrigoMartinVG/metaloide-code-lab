import { LitElement, html, css, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { Block } from '../types.js'

import './forja-block-prose.js'
import './forja-block-code.js'
import './forja-block-portal.js'
import './forja-block-closing-question.js'

// exercise blocks are registered by forja-editor-panel; skip them here
// (studio mode renders exercise blocks separately, not through this renderer)

@customElement('forja-block-renderer')
export class ForjaBlockRenderer extends LitElement {
  @property({ type: Object }) block!: Block

  static styles = css`:host { display: block; }`

  render() {
    const b = this.block
    switch (b.type) {
      case 'prose':            return html`<forja-block-prose .block=${b}></forja-block-prose>`
      case 'code':             return html`<forja-block-code  .block=${b}></forja-block-code>`
      case 'portal':           return html`<forja-block-portal .block=${b}></forja-block-portal>`
      case 'anchor':           return html`<forja-block-portal .block=${b}></forja-block-portal>`
      case 'closing-question': return html`<forja-block-closing-question .block=${b}></forja-block-closing-question>`
      case 'exercise':         return nothing  // handled by forja-editor-panel
      default:                 return nothing
    }
  }
}
