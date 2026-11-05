import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { getUsers, updateUser, deleteUser } from '../../api/users'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import Empty from '../../components/ui/Empty'

const ROLES    = ['', 'customer', 'seller', 'admin']
const STATUSES = ['', 'active', 'suspended', 'deleted']

export default function AdminUsers() {
  const toast = useToast()
  const { user: me } = useAuth()

  const [users, setUsers]     = useState([])
  const [meta, setMeta]       = useState(null)
  const [loading, setLoading] = useState(true)

  const [search,    setSearch]    = useState('')
  const [roleFilter, setRole]     = useState('')
  const [statusFilter, setStatus] = useState('')
  const [page, setPage]           = useState(1)

  const [editUser, setEditUser]   = useState(null)
  const [delUser,  setDelUser]    = useState(null)
  const [actioning, setActioning] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    const params = {
      page, page_size: 15,
      ...(search && { search }),
      ...(roleFilter && { role: roleFilter }),
      ...(statusFilter && { status: statusFilter }),
    }
    getUsers(params)
      .then(({ data }) => { setUsers(data.data || []); setMeta(data.meta) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, search, roleFilter, statusFilter])

  useEffect(load, [load])

  // ── Edit user ─────────────────────────────────────────────
  const handleEditSubmit = async (data) => {
    setActioning(true)
    try {
      await updateUser(editUser.id, data)
      toast.success('User updated')
      setEditUser(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Update failed')
    } finally {
      setActioning(false)
    }
  }

  // ── Delete user ───────────────────────────────────────────
  const handleDelete = async () => {
    setActioning(true)
    try {
      await deleteUser(delUser.id)
      toast.success(`${delUser.email} deactivated`)
      setDelUser(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not deactivate user')
    } finally {
      setActioning(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          {meta && <p className="text-sm text-gray-500 mt-0.5">{meta.total} users</p>}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="search"
          className="input w-56"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
        <select
          className="input w-36"
          value={roleFilter}
          onChange={(e) => { setRole(e.target.value); setPage(1) }}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{r ? r.charAt(0).toUpperCase() + r.slice(1) : 'All Roles'}</option>
          ))}
        </select>
        <select
          className="input w-36"
          value={statusFilter}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : users.length === 0 ? (
        <Empty icon="👥" title="No users found" description="Try adjusting your filters" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['User', 'Role', 'Status', 'Joined', 'Orders', 'Spent', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center
                                      text-primary-700 font-semibold text-sm flex-shrink-0">
                        {u.first_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {u.first_name} {u.last_name}
                        </p>
                        <p className="text-xs text-gray-400 truncate max-w-[160px]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge label={u.role} color={u.role === 'admin' ? 'purple' : u.role === 'seller' ? 'blue' : 'green'} /></td>
                  <td className="px-4 py-3"><Badge label={u.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{u.order_count ?? '—'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">
                    {u.total_spent != null ? `Rs.Rs.{parseFloat(u.total_spent).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditUser(u)}
                        className="btn btn-secondary btn-sm"
                      >
                        Edit
                      </button>
                      {u.id !== me?.id && u.status !== 'deleted' && (
                        <button
                          onClick={() => setDelUser(u)}
                          className="btn btn-sm text-red-500 hover:bg-red-50 border border-red-100"
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={meta} onPageChange={setPage} />

      {/* Edit modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        {editUser && (
          <EditUserForm
            user={editUser}
            onSubmit={handleEditSubmit}
            loading={actioning}
          />
        )}
      </Modal>

      {/* Confirm deactivate modal */}
      <Modal open={!!delUser} onClose={() => setDelUser(null)} title="Deactivate User" size="sm">
        {delUser && (
          <div className="text-center space-y-4">
            <div className="text-5xl">⚠️</div>
            <p className="text-gray-700">
              Deactivate <strong>{delUser.first_name} {delUser.last_name}</strong>?<br />
              <span className="text-sm text-gray-500">({delUser.email})</span>
            </p>
            <p className="text-sm text-gray-500">
              Their account will be set to <strong>deleted</strong>. This does not remove orders or data.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button onClick={() => setDelUser(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleDelete} disabled={actioning} className="btn btn-danger">
                {actioning ? <Spinner size="sm" className="border-white border-t-white/30" /> : 'Deactivate'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function EditUserForm({ user, onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      first_name: user.first_name || '',
      last_name:  user.last_name  || '',
      email:      user.email      || '',
      phone:      user.phone      || '',
      role:       user.role       || 'customer',
      status:     user.status     || 'active',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">First name</label>
          <input type="text" className={`input ${errors.first_name ? 'input-error' : ''}`}
            {...register('first_name', { required: 'Required' })} />
        </div>
        <div>
          <label className="label">Last name</label>
          <input type="text" className={`input ${errors.last_name ? 'input-error' : ''}`}
            {...register('last_name', { required: 'Required' })} />
        </div>
      </div>
      <div>
        <label className="label">Email</label>
        <input type="email" className="input"
          {...register('email', { required: 'Required' })} />
      </div>
      <div>
        <label className="label">Phone</label>
        <input type="tel" className="input" {...register('phone')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Role</label>
          <select className="input" {...register('role')}>
            <option value="customer">Customer</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" {...register('status')}>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? <Spinner size="sm" className="border-white border-t-white/30" /> : 'Save Changes'}
      </button>
    </form>
  )
}
