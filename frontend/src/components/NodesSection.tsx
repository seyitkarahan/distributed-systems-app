import { useEffect, useState } from 'react'
import { getNodes, createNode, updateNode, deleteNode } from '../api/nodeApi'
import type { Node, NodeCreateInput, NodeUpdateInput, NodeStatus } from '../types/node'

const STATUS_OPTIONS: NodeStatus[] = ['ACTIVE', 'INACTIVE', 'MAINTENANCE']

function NodesSection() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState<'create' | Node | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Node | null>(null)
  const [formData, setFormData] = useState({ name: '', host: '', port: 8080, status: 'ACTIVE' as NodeStatus })
  const [submitError, setSubmitError] = useState<string | null>(null)

  const loadNodes = () => {
    setLoading(true)
    setError(null)
    getNodes()
      .then(setNodes)
      .catch((e) => setError(e instanceof Error ? e.message : 'Yüklenemedi'))
      .finally(() => setLoading(false))
  }

  useEffect(() => loadNodes(), [])

  const openCreate = () => {
    setFormData({ name: '', host: '', port: 8080, status: 'ACTIVE' })
    setSubmitError(null)
    setFormOpen('create')
  }

  const openEdit = (node: Node) => {
    setFormData({ name: node.name, host: node.host, port: node.port, status: node.status })
    setSubmitError(null)
    setFormOpen(node)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (formOpen === 'create') {
      const input: NodeCreateInput = { ...formData }
      createNode(input)
        .then(() => {
          setFormOpen(null)
          loadNodes()
        })
        .catch((e) => setSubmitError(e instanceof Error ? e.message : 'Hata'))
    } else if (formOpen && typeof formOpen === 'object') {
      const input: NodeUpdateInput = { ...formData }
      updateNode(formOpen.id, input)
        .then(() => {
          setFormOpen(null)
          loadNodes()
        })
        .catch((e) => setSubmitError(e instanceof Error ? e.message : 'Hata'))
    }
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteNode(deleteTarget.id)
      .then(() => {
        setDeleteTarget(null)
        loadNodes()
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Silinemedi'))
  }

  const statusBadgeClass = (s: NodeStatus) => {
    if (s === 'ACTIVE') return 'badge badge-up'
    if (s === 'INACTIVE') return 'badge badge-down'
    return 'badge badge-unknown'
  }

  return (
    <section className="nodes-section">
      <div className="nodes-header">
        <h2>Node Yönetimi</h2>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Yeni Node
        </button>
      </div>

      {error && <p className="card-error">{error}</p>}

      {loading ? (
        <p className="metric-muted">Yükleniyor...</p>
      ) : (
        <div className="nodes-table-wrap">
          <table className="nodes-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Host</th>
                <th>Port</th>
                <th>Status</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((node) => (
                <tr key={node.id}>
                  <td>{node.id}</td>
                  <td>{node.name}</td>
                  <td>{node.host}</td>
                  <td>{node.port}</td>
                  <td>
                    <span className={statusBadgeClass(node.status)}>{node.status}</span>
                  </td>
                  <td>
                    <button type="button" className="btn btn-sm" onClick={() => openEdit(node)}>
                      Düzenle
                    </button>
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => setDeleteTarget(node)}>
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {nodes.length === 0 && <p className="metric-muted">Henüz node yok.</p>}
        </div>
      )}

      {formOpen && (
        <div className="modal-overlay" onClick={() => setFormOpen(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{formOpen === 'create' ? 'Yeni Node' : 'Node Düzenle'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
                  required
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label>Host</label>
                <input
                  type="text"
                  value={formData.host}
                  onChange={(e) => setFormData((d) => ({ ...d, host: e.target.value }))}
                  required
                  maxLength={255}
                />
              </div>
              <div className="form-group">
                <label>Port</label>
                <input
                  type="number"
                  min={1}
                  value={formData.port}
                  onChange={(e) => setFormData((d) => ({ ...d, port: parseInt(e.target.value, 10) || 0 }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData((d) => ({ ...d, status: e.target.value as NodeStatus }))}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              {submitError && <p className="card-error">{submitError}</p>}
              <div className="form-actions">
                <button type="button" className="btn" onClick={() => setFormOpen(null)}>
                  İptal
                </button>
                <button type="submit" className="btn btn-primary">
                  {formOpen === 'create' ? 'Oluştur' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Node Sil</h3>
            <p>
              <strong>{deleteTarget.name}</strong> ({deleteTarget.host}:{deleteTarget.port}) silinsin mi?
            </p>
            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setDeleteTarget(null)}>
                İptal
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default NodesSection
