import './styles/tokens.css'
import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import type { ConceptNode, Pillar } from './data/mock.js'
import { MOCK_NODES, MOCK_EDGES, MOCK_LABS, MOCK_C_NODES, MOCK_C_EDGES, MOCK_C_LABS } from './data/mock.js'

import './components/forja-topbar.js'
import './components/forja-skill-tree.js'
import './components/forja-lab-view.js'

type View = { kind: 'tree' } | { kind: 'lab'; conceptId: string; depth: number }

@customElement('forja-app')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ForjaApp extends LitElement {
  @state() private _pillar: Pillar = 'c'
  @state() private _view: View = { kind: 'tree' }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    .main {
      flex: 1;
      margin-top: var(--topbar-height);
      overflow: hidden;
      display: flex;
    }

    .tree-container {
      flex: 1;
      padding: var(--space-2xl);
      overflow: auto;
    }

    .lab-container {
      flex: 1;
      overflow: hidden;
      display: flex;
    }

    .empty-pillar {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      font-size: 14px;
      gap: var(--space-sm);
    }

    .empty-pillar strong {
      color: var(--text-secondary);
      font-size: 16px;
    }
  `

  private _onPillarChange(e: CustomEvent) {
    this._pillar = e.detail
    this._view = { kind: 'tree' }
  }

  private _onConceptSelect(e: CustomEvent<ConceptNode>) {
    const node = e.detail
    this._view = { kind: 'lab', conceptId: node.id, depth: node.depth }
  }

  private _onNavTree() {
    this._view = { kind: 'tree' }
  }

  private _allNodes() { return [...MOCK_C_NODES, ...MOCK_NODES] }
  private _allLabs()  { return { ...MOCK_C_LABS, ...MOCK_LABS } }

  private _pillarLabel(p: Pillar): string {
    if (p === 'c')  return 'C'
    if (p === 'os') return 'Operating Systems'
    return p.charAt(0).toUpperCase() + p.slice(1)
  }

  private _getBreadcrumb(): string {
    if (this._view.kind !== 'lab') return ''
    const v = this._view as { kind: 'lab'; conceptId: string; depth: number }
    const node = this._allNodes().find(n => n.id === v.conceptId && n.depth === v.depth)
    if (!node) return ''
    return `${this._pillarLabel(this._pillar)} › ${node.name} › Depth ${node.depth}`
  }

  private _getCurrentLab() {
    if (this._view.kind !== 'lab') return null
    const v = this._view as { kind: 'lab'; conceptId: string; depth: number }
    return this._allLabs()[`${v.conceptId}-${v.depth}`] ?? null
  }

  render() {
    const isLab = this._view.kind === 'lab'
    const allNodes = this._allNodes()
    const filteredNodes = allNodes.filter(n => n.pillar === this._pillar)
    const filteredEdges = (this._pillar === 'c' ? MOCK_C_EDGES : MOCK_EDGES).filter(e => {
      const from = allNodes.find(n => n.id === e.from.id)
      return from?.pillar === this._pillar
    })

    return html`
      <forja-topbar
        .pillar=${this._pillar}
        .view=${this._view.kind}
        .breadcrumb=${this._getBreadcrumb()}
        @pillar-change=${this._onPillarChange}
        @nav-tree=${this._onNavTree}
      ></forja-topbar>

      <div class="main">
        ${isLab ? html`
          <div class="lab-container">
            <forja-lab-view .lab=${this._getCurrentLab()}></forja-lab-view>
          </div>
        ` : html`
          <div class="tree-container">
            ${filteredNodes.length ? html`
              <forja-skill-tree
                .nodes=${filteredNodes}
                .edges=${filteredEdges}
                .pillar=${this._pillar}
                @concept-select=${this._onConceptSelect}
              ></forja-skill-tree>
            ` : html`
              <div class="empty-pillar">
                <strong>${this._pillar.charAt(0).toUpperCase() + this._pillar.slice(1)}</strong>
                <span>Content coming in a future milestone.</span>
              </div>
            `}
          </div>
        `}
      </div>
    `
  }
}

document.querySelector('#app')!.innerHTML = '<forja-app></forja-app>'
