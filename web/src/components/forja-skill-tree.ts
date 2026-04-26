import { LitElement, html, css, svg } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { ConceptNode, GraphEdge, Pillar } from '../data/mock.js'

const NW = 176  // node width
const NH = 60   // node height
const NR = 8    // border radius

interface TooltipState {
  node: ConceptNode
  x: number
  y: number
}

// Per-status visual config
const S = {
  locked:    { bg: 'var(--bg-surface)',  stroke: '#21262d', strokeW: 1,   text: 'var(--text-muted)',  sub: 'var(--border)',        dot: '',         filter: '' },
  available: { bg: '#1a2030',           stroke: '#30363d', strokeW: 1,   text: 'var(--text-primary)', sub: 'var(--text-muted)',   dot: '#4a5568',  filter: '' },
  started:   { bg: '#1a1208',           stroke: '#e05c1a', strokeW: 1.5, text: '#ff9a5c',             sub: '#9a4010',             dot: '#e05c1a',  filter: 'url(#glow-orange)' },
  completed: { bg: '#0d1f12',           stroke: '#2ea043', strokeW: 1.5, text: '#4caf6e',             sub: '#1a4d28',             dot: '#3fb950',  filter: '' },
  mastered:  { bg: '#1a1500',           stroke: '#b8860b', strokeW: 1.5, text: '#f0c040',             sub: '#7a6000',             dot: '#f0c040',  filter: 'url(#glow-gold)' },
} as const

const STATUS_BADGE: Record<string, string> = {
  completed: '✓',
  mastered:  '★',
  started:   '●',
  locked:    '⊘',
}

@customElement('forja-skill-tree')
export class ForjaSkillTree extends LitElement {
  @property({ type: Array }) nodes: ConceptNode[] = []
  @property({ type: Array }) edges: GraphEdge[]   = []
  @property() pillar: Pillar = 'rust'

  @state() private _tooltip: TooltipState | null = null
  @state() private _hovered: string | null = null

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
    }

    .canvas {
      width: 100%;
      height: 100%;
      overflow: auto;
    }

    svg { display: block; }

    .node-group { cursor: pointer; }
    .node-group.locked { cursor: default; pointer-events: all; }

    .node-group.clickable:hover .node-bg {
      filter: brightness(1.12);
    }

    .tooltip {
      position: absolute;
      background: #1c2128;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 12px 14px;
      font-size: 12px;
      color: var(--text-secondary);
      pointer-events: none;
      min-width: 180px;
      max-width: 240px;
      line-height: 1.5;
      z-index: 10;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }

    .tooltip-name {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 13px;
      margin-bottom: 6px;
    }

    .tooltip-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }

    .tooltip-val {
      color: var(--text-muted);
    }

    .tooltip-locked {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #21262d;
      font-size: 11px;
      color: #666;
    }

    .tooltip-prereq {
      color: var(--error);
      font-size: 11px;
    }

    .pillar-header {
      padding: 0 0 var(--space-xl) 0;
      display: flex;
      align-items: baseline;
      gap: 12px;
    }

    .pillar-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .pillar-title.rust      { color: var(--pillar-rust); }
    .pillar-title.compilers { color: var(--pillar-compilers); }
    .pillar-title.os        { color: var(--pillar-os); }

    .pillar-stats {
      font-size: 12px;
      color: var(--text-muted);
    }
  `

  private _nodeKey(id: string, depth: number) { return `${id}-${depth}` }

  private _getEdgeCoords(edge: GraphEdge) {
    const from = this.nodes.find(n => n.id === edge.from.id && n.depth === edge.from.depth)
    const to   = this.nodes.find(n => n.id === edge.to.id   && n.depth === edge.to.depth)
    if (!from || !to) return null
    const x1 = from.x + NW / 2, y1 = from.y + NH
    const x2 = to.x   + NW / 2, y2 = to.y
    const mid = y1 + (y2 - y1) * 0.5
    return { x1, y1, x2, y2, mid }
  }

  private _svgWidth()  { return this.nodes.length ? Math.max(...this.nodes.map(n => n.x + NW)) + 60 : 700 }
  private _svgHeight() { return this.nodes.length ? Math.max(...this.nodes.map(n => n.y + NH)) + 100 : 500 }

  private _onNodeClick(node: ConceptNode) {
    if (node.status === 'locked') return
    this.dispatchEvent(new CustomEvent('concept-select', { detail: node, bubbles: true, composed: true }))
  }

  private _onEnter(e: MouseEvent, node: ConceptNode) {
    this._hovered = this._nodeKey(node.id, node.depth)
    const wrap = this.shadowRoot!.querySelector('.canvas') as HTMLElement
    const rect = wrap.getBoundingClientRect()
    const scrollLeft = wrap.scrollLeft, scrollTop = wrap.scrollTop
    let x = e.clientX - rect.left + scrollLeft + 16
    let y = e.clientY - rect.top  + scrollTop  + 16
    if (x + 250 > this._svgWidth())  x -= 260
    this._tooltip = { node, x, y }
  }

  private _onLeave() {
    this._hovered = null
    this._tooltip = null
  }

  private _completedCount() { return this.nodes.filter(n => n.status === 'completed' || n.status === 'mastered').length }

  render() {
    const W = this._svgWidth()
    const H = this._svgHeight()
    const completed = this._completedCount()
    const total = this.nodes.length
    const pillarLabel = this.pillar === 'os' ? 'Operating Systems' : this.pillar.charAt(0).toUpperCase() + this.pillar.slice(1)

    return html`
      <div class="pillar-header">
        <span class="pillar-title ${this.pillar}">${pillarLabel}</span>
        <span class="pillar-stats">${completed} / ${total} completed</span>
      </div>

      <div class="canvas">
        <svg width=${W} height=${H} viewBox="0 0 ${W} ${H}">
          <defs>
            <!-- dot grid background pattern -->
            <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="0.7" fill="rgba(255,255,255,0.045)"/>
            </pattern>

            <!-- glow filters -->
            <filter id="glow-orange" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#e05c1a" flood-opacity="0.35"/>
            </filter>
            <filter id="glow-gold" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#f0c040" flood-opacity="0.3"/>
            </filter>

            <!-- arrow marker -->
            <marker id="arrow-default" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,1 L5,3 L0,5" fill="none" stroke="#30363d" stroke-width="1"/>
            </marker>
            <marker id="arrow-active" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,1 L5,3 L0,5" fill="none" stroke="#e05c1a" stroke-width="1"/>
            </marker>
            <marker id="arrow-done" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,1 L5,3 L0,5" fill="none" stroke="#2ea043" stroke-width="1"/>
            </marker>
          </defs>

          <!-- background -->
          <rect width=${W} height=${H} fill="var(--bg-base)"/>
          <rect width=${W} height=${H} fill="url(#dots)"/>

          <!-- edges -->
          ${this.edges.map(edge => {
            const c = this._getEdgeCoords(edge)
            if (!c) return null
            const fromNode = this.nodes.find(n => n.id === edge.from.id)
            const isActive    = fromNode?.status === 'started'
            const isCompleted = fromNode?.status === 'completed' || fromNode?.status === 'mastered'
            const stroke = isActive ? '#e05c1a33' : isCompleted ? '#2ea04333' : '#21262d'
            const marker = isActive ? 'url(#arrow-active)' : isCompleted ? 'url(#arrow-done)' : 'url(#arrow-default)'
            return svg`
              <path
                d="M ${c.x1} ${c.y1} C ${c.x1} ${c.mid}, ${c.x2} ${c.mid}, ${c.x2} ${c.y2}"
                fill="none"
                stroke=${stroke}
                stroke-width="1.5"
                marker-end=${marker}
              />
            `
          })}

          <!-- nodes -->
          ${this.nodes.map(node => {
            const s = S[node.status]
            const isClickable = node.status !== 'locked'
            const isHovered = this._hovered === this._nodeKey(node.id, node.depth)
            const badge = STATUS_BADGE[node.status]
            const opacity = node.status === 'locked' ? '0.4' : '1'

            return svg`
              <g
                class="node-group ${isClickable ? 'clickable' : 'locked'}"
                transform="translate(${node.x}, ${node.y})"
                opacity=${opacity}
                @click=${() => this._onNodeClick(node)}
                @mouseenter=${(e: MouseEvent) => this._onEnter(e, node)}
                @mouseleave=${() => this._onLeave()}
              >
                <!-- node background -->
                <rect
                  class="node-bg"
                  width=${NW} height=${NH} rx=${NR}
                  fill=${s.bg}
                  stroke=${isHovered && isClickable ? s.dot || s.stroke : s.stroke}
                  stroke-width=${isHovered && isClickable ? Math.max(s.strokeW, 1.5) : s.strokeW}
                  filter=${s.filter}
                />

                <!-- left accent stripe -->
                ${s.dot ? svg`
                  <rect
                    x="0" y="0" width="3" height=${NH} rx="8"
                    fill=${s.dot}
                    clip-path="inset(0 round ${NR}px)"
                  />
                  <rect x="3" y="0" width="3" height=${NH} fill=${s.dot} opacity="0.15"/>
                ` : null}

                <!-- depth badge (top right) -->
                <rect x=${NW - 26} y="8" width="18" height="14" rx="3" fill="rgba(0,0,0,0.3)"/>
                <text
                  x=${NW - 17} y="19"
                  text-anchor="middle"
                  font-family="JetBrains Mono, monospace"
                  font-size="9"
                  font-weight="600"
                  fill=${s.sub}
                  letter-spacing="0.5"
                >D${node.depth}</text>

                <!-- status badge (top left, only if not available) -->
                ${badge ? svg`
                  <text
                    x="14" y="20"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    font-family="var(--font-mono)"
                    font-size="10"
                    fill=${s.dot || s.sub}
                  >${badge}</text>
                ` : null}

                <!-- node name -->
                <text
                  x=${badge ? 24 : 14}
                  y=${NH / 2}
                  dominant-baseline="middle"
                  font-family="Inter, system-ui, sans-serif"
                  font-size="12"
                  font-weight="500"
                  fill=${s.text}
                  letter-spacing="0.1"
                >${node.name}</text>

                <!-- time estimate (bottom right) -->
                <text
                  x=${NW - 30} y=${NH - 9}
                  text-anchor="middle"
                  font-family="Inter, system-ui, sans-serif"
                  font-size="9"
                  fill=${s.sub}
                >${node.estimatedMinutes}m</text>
              </g>
            `
          })}
        </svg>
      </div>

      ${this._tooltip ? html`
        <div class="tooltip" style="left:${this._tooltip.x}px; top:${this._tooltip.y}px">
          <div class="tooltip-name">${this._tooltip.node.name}</div>
          <div class="tooltip-row">
            <span>Depth ${this._tooltip.node.depth}</span>
            <span class="tooltip-val">${this._tooltip.node.estimatedMinutes} min</span>
          </div>
          <div class="tooltip-row">
            <span>Status</span>
            <span class="tooltip-val">${this._tooltip.node.status}</span>
          </div>
          ${this._tooltip.node.status === 'locked' ? html`
            <div class="tooltip-locked">
              <span class="tooltip-prereq">Complete prerequisites to unlock</span>
            </div>
          ` : null}
        </div>
      ` : null}
    `
  }
}
