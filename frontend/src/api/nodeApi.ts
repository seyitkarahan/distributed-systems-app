import type { Node, NodeCreateInput, NodeUpdateInput } from '../types/node'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

type ErrorBody = { message?: string; fieldErrors?: { field: string; message: string }[] }

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = data as ErrorBody
    const msg =
      err?.message ||
      (err?.fieldErrors?.length ? err.fieldErrors.map((e) => `${e.field}: ${e.message}`).join(', ') : null) ||
      `HTTP ${res.status}`
    throw new Error(msg)
  }
  return data as T
}

export async function getNodes(): Promise<Node[]> {
  const res = await fetch(`${API_BASE}/api/nodes`)
  return handleResponse<Node[]>(res)
}

export async function getNode(id: number): Promise<Node> {
  const res = await fetch(`${API_BASE}/api/nodes/${id}`)
  return handleResponse<Node>(res)
}

export async function createNode(input: NodeCreateInput): Promise<Node> {
  const res = await fetch(`${API_BASE}/api/nodes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return handleResponse<Node>(res)
}

export async function updateNode(id: number, input: NodeUpdateInput): Promise<Node> {
  const res = await fetch(`${API_BASE}/api/nodes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return handleResponse<Node>(res)
}

export async function deleteNode(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/nodes/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { message?: string })?.message || `HTTP ${res.status}`)
  }
}
