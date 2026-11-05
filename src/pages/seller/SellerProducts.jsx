import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  getSellerProducts, createProduct, updateProduct,
  addVariant, addProductImage, getCategories, getProduct,
} from '../../api/products'
import api from '../../api/axios'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import Pagination from '../../components/ui/Pagination'
import Empty from '../../components/ui/Empty'
import DataTable from '../../components/dashboard/DataTable'

// ── Main page ─────────────────────────────────────────────
export default function SellerProducts() {
  const toast = useToast()
  const [products, setProducts]     = useState([])
  const [meta, setMeta]             = useState(null)
  const [page, setPage]             = useState(1)
  const [loading, setLoading]       = useState(true)
  const [categories, setCategories] = useState([])

  // Modal state
  const [createOpen, setCreateOpen]     = useState(false)
  const [editProduct, setEditProduct]   = useState(null)   // full product detail
  const [variantProduct, setVariantProduct] = useState(null)
  const [imageProduct, setImageProduct] = useState(null)
  const [deleteProduct, setDeleteProduct] = useState(null)
  const [deleting, setDeleting]         = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const load = () => {
    setLoading(true)
    getSellerProducts({ page, page_size: 10 })
      .then(({ data }) => { setProducts(data.data || []); setMeta(data.meta) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [page])

  useEffect(() => {
    getCategories()
      .then(({ data }) => setCategories(data.data || []))
      .catch(() => {})
  }, [])

  // Load full detail (with variants + images) before opening edit modal
  const openEdit = async (row) => {
    setLoadingDetail(true)
    try {
      const { data } = await getProduct(row.id)
      setEditProduct(data.data)
    } catch {
      toast.error('Could not load product details')
    } finally {
      setLoadingDetail(false)
    }
  }

  const columns = [
    {
      key: 'name', label: 'Product',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          {row.image_url ? (
            <img src={row.image_url} alt={v}
              className="h-10 w-10 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-surface-subtle flex items-center justify-center text-gray-300 flex-shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
              </svg>
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{v}</p>
            <p className="text-xs text-gray-400">{row.category_name}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'base_price', label: 'Base Price',
      render: (v) => <span className="font-semibold">Rs.{parseFloat(v).toFixed(2)}</span>,
    },
    {
      key: 'variant_count', label: 'Variants',
      render: (v) => <span className="badge bg-blue-50 text-blue-700">{v ?? 0}</span>,
    },
    {
      key: 'total_stock', label: 'Stock',
      render: (v) => {
        const n = parseInt(v) || 0
        return (
          <span className={`badge ${n === 0 ? 'bg-red-50 text-red-700' : n < 10 ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
            {n === 0 ? 'Out of stock' : n}
          </span>
        )
      },
    },
    {
      key: 'status', label: 'Status',
      render: (v) => <Badge label={v} />,
    },
    {
      key: 'actions', label: '',
      render: (_, row) => (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => openEdit(row)}
            disabled={loadingDetail}
            className="btn btn-secondary btn-sm"
          >
            {loadingDetail ? <Spinner size="sm" /> : 'Edit'}
          </button>
          <button onClick={() => setVariantProduct(row)} className="btn btn-secondary btn-sm">+ Variant</button>
          <button onClick={() => setImageProduct(row)}   className="btn btn-secondary btn-sm">+ Image</button>
          <button
            onClick={() => setDeleteProduct(row)}
            className="btn btn-sm border border-red-200 text-red-500 hover:bg-red-50"
          >Delete</button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          {meta && <p className="text-sm text-gray-500 mt-0.5">{meta.total} products</p>}
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn btn-primary">
          + New Product
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={products}
        loading={loading}
        emptyIcon="📦"
        emptyTitle="No products yet"
        emptyDesc="Create your first product to start selling"
        keyField="id"
      />
      <Pagination meta={meta} onPageChange={setPage} />

      {/* ── Create product modal ── */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Product" size="lg">
        <ProductForm
          categories={categories}
          onSuccess={() => { setCreateOpen(false); load() }}
          toast={toast}
        />
      </Modal>

      {/* ── Edit product modal (full detail) ── */}
      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title="Edit Product" size="lg">
        {editProduct && (
          <ProductEditView
            product={editProduct}
            categories={categories}
            onSuccess={() => { setEditProduct(null); load() }}
            toast={toast}
          />
        )}
      </Modal>

      {/* ── Add variant modal ── */}
      <Modal open={!!variantProduct} onClose={() => setVariantProduct(null)}
        title={`Add Variant — ${variantProduct?.name}`}>
        {variantProduct && (
          <VariantForm
            productId={variantProduct.id}
            onSuccess={() => { setVariantProduct(null); load() }}
            toast={toast}
          />
        )}
      </Modal>

      {/* ── Add image modal ── */}
      <Modal open={!!imageProduct} onClose={() => setImageProduct(null)}
        title={`Add Image — ${imageProduct?.name}`}>
        {imageProduct && (
          <ImageForm
            productId={imageProduct.id}
            onSuccess={() => { setImageProduct(null); toast.success('Image added'); load() }}
            toast={toast}
          />
        )}
      </Modal>

      {/* ── Delete confirm modal ── */}
      <Modal open={!!deleteProduct} onClose={() => setDeleteProduct(null)} title="Delete Product" size="sm">
        {deleteProduct && (
          <div className="text-center space-y-4">
            <div className="text-5xl">🗑️</div>
            <p className="text-gray-700">Delete <strong>{deleteProduct.name}</strong>?</p>
            <p className="text-sm text-gray-500">Sets the product to deleted. Existing orders are unaffected.</p>
            <div className="flex gap-3 justify-center pt-2">
              <button onClick={() => setDeleteProduct(null)} className="btn btn-secondary">Cancel</button>
              <button
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true)
                  try {
                    await api.delete(`/products/seller/${deleteProduct.id}/delete/`)
                    toast.success(`${deleteProduct.name} deleted`)
                    setDeleteProduct(null); load()
                  } catch (err) {
                    toast.error(err.response?.data?.error?.message || 'Delete failed')
                  } finally { setDeleting(false) }
                }}
                className="btn btn-danger"
              >
                {deleting ? <Spinner size="sm" className="border-white/30 border-t-white" /> : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// ── Full edit view with tabs: Details / Variants / Images ─
function ProductEditView({ product, categories, onSuccess, toast }) {
  const [tab, setTab] = useState('details')

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 mb-6">
        {[
          { id: 'details',  label: `Details` },
          { id: 'variants', label: `Variants (${product.variants?.length ?? 0})` },
          { id: 'images',   label: `Images (${product.images?.length ?? 0})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition
              ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'details' && (
        <ProductForm
          categories={categories}
          defaultValues={{
            name:        product.name,
            description: product.description,
            base_price:  product.base_price,
            category_id: String(product.category_id),
            status:      product.status,
          }}
          productId={product.id}
          onSuccess={onSuccess}
          toast={toast}
        />
      )}

      {tab === 'variants' && (
        <VariantsTab product={product} toast={toast} onSuccess={onSuccess} />
      )}

      {tab === 'images' && (
        <ImagesTab product={product} toast={toast} onSuccess={onSuccess} />
      )}
    </div>
  )
}

// ── Variants tab ──────────────────────────────────────────
function VariantsTab({ product, toast, onSuccess }) {
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="space-y-4">
      {product.variants?.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="text-3xl mb-2">📦</p>
          <p className="text-sm">No variants yet. Add one below.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['SKU', 'Name', 'Price', 'Stock', 'Reserved', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {product.variants.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-xs font-mono text-gray-600">{v.sku}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-900">{v.variant_name}</td>
                  <td className="px-4 py-2.5 text-sm font-semibold">Rs.{parseFloat(v.price).toFixed(2)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`badge ${v.available_stock === 0 ? 'bg-red-50 text-red-700' : v.available_stock < 10 ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
                      {v.available_stock}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-500">{v.reserved_quantity}</td>
                  <td className="px-4 py-2.5"><Badge label={v.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!showAdd ? (
        <button onClick={() => setShowAdd(true)} className="btn btn-secondary">
          + Add Variant
        </button>
      ) : (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">New Variant</h3>
          <VariantForm
            productId={product.id}
            toast={toast}
            onSuccess={() => { setShowAdd(false); onSuccess() }}
            onCancel={() => setShowAdd(false)}
          />
        </div>
      )}
    </div>
  )
}

// ── Images tab ────────────────────────────────────────────
function ImagesTab({ product, toast, onSuccess }) {
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="space-y-4">
      {/* Image gallery */}
      {product.images?.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {product.images.map((img, i) => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square border border-gray-100">
              <img
                src={img.image_url}
                alt={img.alt_text || product.name}
                className="h-full w-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 badge bg-primary-600 text-white text-[10px]">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p className="text-3xl mb-2">🖼️</p>
          <p className="text-sm">No images yet. Add one below.</p>
        </div>
      )}

      {!showAdd ? (
        <button onClick={() => setShowAdd(true)} className="btn btn-secondary">
          + Add Image
        </button>
      ) : (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Add Image</h3>
          <ImageForm
            productId={product.id}
            toast={toast}
            onSuccess={() => { setShowAdd(false); onSuccess(); toast.success('Image added') }}
            onCancel={() => setShowAdd(false)}
          />
        </div>
      )}
    </div>
  )
}

// ── Product form (create + edit details) ──────────────────
function ProductForm({ categories, defaultValues, productId, onSuccess, toast }) {
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: defaultValues || {
      name: '', description: '', base_price: '',
      category_id: '', status: 'active',
    },
  })

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (productId) {
        await updateProduct(productId, data)
        toast.success('Product updated')
      } else {
        await createProduct(data)
        toast.success('Product created')
      }
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label className="label">Product name *</label>
        <input
          type="text"
          className={`input ${errors.name ? 'input-error' : ''}`}
          placeholder="e.g. Wireless Headphones Pro"
          {...register('name', { required: 'Name is required' })}
        />
        {errors.name && <p className="field-error">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Category *</label>
          <select
            className={`input ${errors.category_id ? 'input-error' : ''}`}
            {...register('category_id', { required: 'Category is required' })}
          >
            <option value="">— Select —</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {'  '.repeat(c.depth || 0)}{c.name}
              </option>
            ))}
          </select>
          {errors.category_id && <p className="field-error">{errors.category_id.message}</p>}
        </div>
        <div>
          <label className="label">Base price *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              className={`input pl-7 ${errors.base_price ? 'input-error' : ''}`}
              placeholder="0.00"
              {...register('base_price', { required: 'Price is required', min: { value: 0, message: 'Must be ≥ 0' } })}
            />
          </div>
          {errors.base_price && <p className="field-error">{errors.base_price.message}</p>}
        </div>
      </div>

      <div>
        <label className="label">Description</label>
        <textarea
          className="input min-h-[90px] resize-y"
          placeholder="Describe your product…"
          {...register('description')}
        />
      </div>

      {productId && (
        <div>
          <label className="label">Status</label>
          <select className="input" {...register('status')}>
            <option value="active">Active — visible to buyers</option>
            <option value="inactive">Inactive — hidden from catalog</option>
          </select>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving
            ? <Spinner size="sm" className="border-white/30 border-t-white" />
            : productId ? 'Save Changes' : 'Create Product'}
        </button>
      </div>
    </form>
  )
}

// ── Variant form ──────────────────────────────────────────
function VariantForm({ productId, onSuccess, onCancel, toast }) {
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { sku: '', variant_name: '', price: '', stock_quantity: 0, attributes: '' },
  })

  const onSubmit = async (data) => {
    // Validate JSON attributes if provided
    let parsedAttrs = undefined
    if (data.attributes?.trim()) {
      try {
        parsedAttrs = JSON.parse(data.attributes)
      } catch {
        toast.error('Attributes must be valid JSON, e.g. {"color":"red","size":"L"}')
        return
      }
    }
    setSaving(true)
    try {
      await addVariant(productId, {
        sku:            data.sku,
        variant_name:   data.variant_name,
        price:          data.price,
        stock_quantity: parseInt(data.stock_quantity) || 0,
        attributes:     parsedAttrs,
      })
      toast.success('Variant added')
      reset()
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not add variant')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">SKU *</label>
          <input type="text" className={`input ${errors.sku ? 'input-error' : ''}`}
            placeholder="e.g. HP-RED-L"
            {...register('sku', { required: 'SKU is required' })} />
          {errors.sku && <p className="field-error">{errors.sku.message}</p>}
        </div>
        <div>
          <label className="label">Variant name *</label>
          <input type="text" className={`input ${errors.variant_name ? 'input-error' : ''}`}
            placeholder="e.g. Red / Large"
            {...register('variant_name', { required: 'Name is required' })} />
          {errors.variant_name && <p className="field-error">{errors.variant_name.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Price *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input type="number" step="0.01" min="0" className={`input pl-7 ${errors.price ? 'input-error' : ''}`}
              placeholder="0.00"
              {...register('price', { required: 'Price is required' })} />
          </div>
          {errors.price && <p className="field-error">{errors.price.message}</p>}
        </div>
        <div>
          <label className="label">Initial stock</label>
          <input type="number" min="0" className="input" placeholder="0"
            {...register('stock_quantity')} />
        </div>
      </div>
      <div>
        <label className="label">
          Attributes <span className="font-normal text-gray-400">(JSON, optional)</span>
        </label>
        <input type="text" className="input font-mono text-xs"
          placeholder='{"color": "red", "size": "L"}'
          {...register('attributes')} />
        <p className="field-hint">Must be valid JSON if provided.</p>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? <Spinner size="sm" className="border-white/30 border-t-white" /> : 'Add Variant'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
        )}
      </div>
    </form>
  )
}

// ── Image form ────────────────────────────────────────────
function ImageForm({ productId, onSuccess, onCancel, toast }) {
  const [saving, setSaving]     = useState(false)
  const [preview, setPreview]   = useState('')
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { image_url: '', alt_text: '', display_order: 0 },
  })
  const watchUrl = watch('image_url')

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      await addProductImage(productId, data)
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not add image')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label className="label">Image URL *</label>
        <input
          type="url"
          className={`input ${errors.image_url ? 'input-error' : ''}`}
          placeholder="https://images.unsplash.com/photo-…?w=600&q=80"
          {...register('image_url', { required: 'Image URL is required' })}
          onChange={(e) => setPreview(e.target.value)}
        />
        {errors.image_url && <p className="field-error">{errors.image_url.message}</p>}
      </div>

      {/* Live preview */}
      {(preview || watchUrl) && (
        <div className="rounded-xl overflow-hidden border border-gray-100 aspect-video bg-surface-subtle">
          <img
            src={preview || watchUrl}
            alt="Preview"
            className="h-full w-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Alt text</label>
          <input type="text" className="input" placeholder="Describe the image"
            {...register('alt_text')} />
        </div>
        <div>
          <label className="label">Display order</label>
          <input type="number" min="0" className="input" placeholder="0 = primary"
            {...register('display_order')} />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? <Spinner size="sm" className="border-white/30 border-t-white" /> : 'Add Image'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
        )}
      </div>
    </form>
  )
}
