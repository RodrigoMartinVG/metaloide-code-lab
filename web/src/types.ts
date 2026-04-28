export type Pillar     = 'c' | 'rust' | 'compilers' | 'os'
export type Status     = 'locked' | 'available' | 'started' | 'completed' | 'mastered'
export type RenderMode = 'blog' | 'studio'

export interface Track {
  id:            Pillar
  label:         string
  tagline:       string
  color:         string
  prerequisite?: string
  intro?:        string
  blog?:         Lab
  courses:       Course[]
}

export interface Course {
  id:          string
  trackId:     Pillar
  name:        string
  description: string
  status:      Status
  intro?:      string
  blog?:       Lab
  units:       Unit[]
}

export interface Unit {
  id:               string
  courseId:         string
  name:             string
  depth:            1 | 2 | 3
  renderMode:       RenderMode
  status:           Status
  estimatedMinutes: number
}

// ── Block types ───────────────────────────────────────────────────────────────

export interface ProseBlock    { type: 'prose';            content: string }
export interface CodeBlock     { type: 'code';             language: string; content: string }
export interface ExerciseBlock { type: 'exercise';         id: string; language: string; starter: string; description: string }
export interface PortalBlock   { type: 'portal';           to: Pillar; unitId: string; label: string; reason: string }
export interface AnchorBlock   { type: 'anchor';           to: Pillar; unitId: string; label: string; reason: string }
export interface ClosingBlock  { type: 'closing-question'; question: string }

export interface NavCardBlock {
  type:       'nav-card'
  label:      string
  description:string
  targetType: 'track' | 'course' | 'unit'
  targetId:   string
  trackId:    Pillar
  color?:     string
}

export type Block =
  | ProseBlock
  | CodeBlock
  | ExerciseBlock
  | PortalBlock
  | AnchorBlock
  | ClosingBlock
  | NavCardBlock

export interface Lab {
  unitId: string
  title:  string
  blocks: Block[]
}

// ── Routing ───────────────────────────────────────────────────────────────────

export type Route =
  | { view: 'platform' }
  | { view: 'study'; trackId: Pillar }

// What is currently open in the content panel
export type StudyContent =
  | { type: 'track' }
  | { type: 'course'; courseId: string }
  | { type: 'unit';   unitId:  string }
