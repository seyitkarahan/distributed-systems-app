export type NodeStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'

export interface Node {
  id: number
  name: string
  host: string
  port: number
  status: NodeStatus
  createdAt: string
  updatedAt: string
}

export interface NodeCreateInput {
  name: string
  host: string
  port: number
  status?: NodeStatus
}

export interface NodeUpdateInput {
  name?: string
  host?: string
  port?: number
  status?: NodeStatus
}
