import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { updateMe, changePassword } from '../../api/auth'
import { getAddresses, createAddress, updateAddress, deleteAddress } from '../../api/users'
import AddressForm from '../../components/address/AddressForm'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import PageLoader from '../../components/ui/PageLoader'
import Empty from '../../components/ui/Empty'
import Badge from '../../components/ui/Badge'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const toast = useToast()

  const [activeTab, setActiveTab] = useState('profile')

  if (!user) return <PageLoader />

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Account</h1>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 mb-8">
        {[
          { id: 'profile',   label: 'Profile' },
          { id: 'addresses', label: 'Addresses' },
          { id: 'password',  label: 'Change Password' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition
              ${activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile'   && <ProfileTab user={user} updateUser={updateUser} toast={toast} />}
      {activeTab === 'addresses' && <AddressesTab toast={toast} />}
      {activeTab === 'password'  && <PasswordTab toast={toast} />}
    </div>
  )
}

// ── Profile tab ───────────────────────────────────────────
function ProfileTab({ user, updateUser, toast }) {
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      first_name: user.first_name || '',
      last_name:  user.last_name  || '',
      phone:      user.phone      || '',
    },
  })

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const res = await updateMe(data)
      updateUser(res.data.data)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
        <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center
                        text-primary-700 text-2xl font-bold">
          {user.first_name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {user.first_name} {user.last_name}
          </h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          <Badge label={user.role} color={user.role === 'admin' ? 'purple' : user.role === 'seller' ? 'blue' : 'green'} />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="p-first">First name</label>
            <input
              id="p-first"
              type="text"
              className={`input ${errors.first_name ? 'input-error' : ''}`}
              {...register('first_name', { required: 'Required' })}
            />
            {errors.first_name && <p className="mt-1 text-xs text-red-600">{errors.first_name.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="p-last">Last name</label>
            <input
              id="p-last"
              type="text"
              className={`input ${errors.last_name ? 'input-error' : ''}`}
              {...register('last_name', { required: 'Required' })}
            />
            {errors.last_name && <p className="mt-1 text-xs text-red-600">{errors.last_name.message}</p>}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="p-email">Email address</label>
          <input
            id="p-email"
            type="email"
            className="input bg-gray-50"
            value={user.email}
            disabled
            aria-readonly
          />
          <p className="mt-1 text-xs text-gray-400">Email cannot be changed here.</p>
        </div>

        <div>
          <label className="label" htmlFor="p-phone">
            Phone <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            id="p-phone"
            type="tel"
            className="input"
            {...register('phone')}
          />
        </div>

        <div className="pt-2">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? <Spinner size="sm" className="border-white border-t-white/30" /> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Addresses tab ─────────────────────────────────────────
function AddressesTab({ toast }) {
  const [addresses, setAddresses]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [showAdd, setShowAdd]       = useState(false)
  const [editAddr, setEditAddr]     = useState(null)   // address object being edited
  const [savingAddr, setSavingAddr] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const loadAddresses = () => {
    setLoading(true)
    getAddresses()
      .then(({ data }) => setAddresses(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(loadAddresses, [])

  const handleAdd = async (formData) => {
    setSavingAddr(true)
    try {
      await createAddress(formData)
      loadAddresses()
      setShowAdd(false)
      toast.success('Address added')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not add address')
    } finally {
      setSavingAddr(false)
    }
  }

  const handleEdit = async (formData) => {
    setSavingAddr(true)
    try {
      await updateAddress(editAddr.id, formData)
      loadAddresses()
      setEditAddr(null)
      toast.success('Address updated')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not update address')
    } finally {
      setSavingAddr(false)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await deleteAddress(id)
      setAddresses((prev) => prev.filter((a) => a.id !== id))
      toast.success('Address removed')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not delete address')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>

  return (
    <div>
      {addresses.length === 0 && !showAdd ? (
        <Empty icon="📍" title="No addresses saved" description="Add an address for faster checkout">
          <button onClick={() => setShowAdd(true)} className="btn btn-primary mt-4">Add Address</button>
        </Empty>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="card p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-semibold text-gray-800">{addr.label}</span>
                    {addr.is_default && (
                      <span className="badge bg-primary-100 text-primary-700">Default</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {addr.street_line1}
                    {addr.street_line2 && <>, {addr.street_line2}</>}
                    <br />
                    {addr.city}, {addr.state} {addr.postal_code}
                    <br />
                    {addr.country}
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setEditAddr(addr)}
                    className="btn btn-secondary btn-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    disabled={deletingId === addr.id}
                    className="btn btn-sm text-red-500 hover:bg-red-50 border border-red-100"
                  >
                    {deletingId === addr.id ? <Spinner size="sm" /> : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!showAdd && (
            <button onClick={() => setShowAdd(true)} className="btn btn-secondary">
              + Add Address
            </button>
          )}
        </>
      )}

      {/* Add new address inline */}
      {showAdd && (
        <div className="card p-5 mt-5">
          <h3 className="font-semibold text-gray-900 mb-4">New Address</h3>
          <AddressForm
            onSubmit={handleAdd}
            onCancel={() => setShowAdd(false)}
            loading={savingAddr}
          />
        </div>
      )}

      {/* Edit address in modal */}
      <Modal
        open={!!editAddr}
        onClose={() => setEditAddr(null)}
        title="Edit Address"
      >
        {editAddr && (
          <AddressForm
            defaultValues={editAddr}
            onSubmit={handleEdit}
            onCancel={() => setEditAddr(null)}
            loading={savingAddr}
          />
        )}
      </Modal>
    </div>
  )
}

// ── Change password tab ───────────────────────────────────
function PasswordTab({ toast }) {
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm()
  const newPwd = watch('new_password')

  const onSubmit = async ({ old_password, new_password }) => {
    setSaving(true)
    try {
      await changePassword(old_password, new_password)
      toast.success('Password changed successfully')
      reset()
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not change password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-6 max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label className="label" htmlFor="pw-old">Current password</label>
          <input
            id="pw-old"
            type="password"
            autoComplete="current-password"
            className={`input ${errors.old_password ? 'input-error' : ''}`}
            {...register('old_password', { required: 'Current password is required' })}
          />
          {errors.old_password && <p className="mt-1 text-xs text-red-600">{errors.old_password.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="pw-new">New password</label>
          <input
            id="pw-new"
            type="password"
            autoComplete="new-password"
            className={`input ${errors.new_password ? 'input-error' : ''}`}
            {...register('new_password', {
              required: 'New password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
            })}
          />
          {errors.new_password && <p className="mt-1 text-xs text-red-600">{errors.new_password.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="pw-confirm">Confirm new password</label>
          <input
            id="pw-confirm"
            type="password"
            autoComplete="new-password"
            className={`input ${errors.confirm ? 'input-error' : ''}`}
            {...register('confirm', {
              required: 'Please confirm your password',
              validate: (v) => v === newPwd || 'Passwords do not match',
            })}
          />
          {errors.confirm && <p className="mt-1 text-xs text-red-600">{errors.confirm.message}</p>}
        </div>

        <div className="pt-2">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? <Spinner size="sm" className="border-white border-t-white/30" /> : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  )
}
