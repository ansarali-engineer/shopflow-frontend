import { useForm } from 'react-hook-form'
import Spinner from '../ui/Spinner'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
]

export default function AddressForm({ defaultValues, onSubmit, onCancel, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: defaultValues || {
      label: '', street_line1: '', street_line2: '',
      city: '', state: '', postal_code: '', country: 'US', is_default: false,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Label */}
        <div className="sm:col-span-2">
          <label className="label" htmlFor="addr-label">Label</label>
          <input
            id="addr-label"
            type="text"
            placeholder="e.g. Home, Work"
            className={`input ${errors.label ? 'input-error' : ''}`}
            {...register('label', { required: 'Label is required' })}
          />
          {errors.label && <p className="mt-1 text-xs text-red-600">{errors.label.message}</p>}
        </div>

        {/* Street line 1 */}
        <div className="sm:col-span-2">
          <label className="label" htmlFor="addr-street1">Street address</label>
          <input
            id="addr-street1"
            type="text"
            placeholder="123 Main St"
            className={`input ${errors.street_line1 ? 'input-error' : ''}`}
            {...register('street_line1', { required: 'Street address is required' })}
          />
          {errors.street_line1 && (
            <p className="mt-1 text-xs text-red-600">{errors.street_line1.message}</p>
          )}
        </div>

        {/* Street line 2 */}
        <div className="sm:col-span-2">
          <label className="label" htmlFor="addr-street2">
            Apt / Suite <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            id="addr-street2"
            type="text"
            className="input"
            {...register('street_line2')}
          />
        </div>

        {/* City */}
        <div>
          <label className="label" htmlFor="addr-city">City</label>
          <input
            id="addr-city"
            type="text"
            className={`input ${errors.city ? 'input-error' : ''}`}
            {...register('city', { required: 'City is required' })}
          />
          {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
        </div>

        {/* State */}
        <div>
          <label className="label" htmlFor="addr-state">State</label>
          <select
            id="addr-state"
            className="input"
            {...register('state')}
          >
            <option value="">— Select —</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Postal code */}
        <div>
          <label className="label" htmlFor="addr-postal">ZIP / Postal code</label>
          <input
            id="addr-postal"
            type="text"
            className="input"
            {...register('postal_code')}
          />
        </div>

        {/* Country */}
        <div>
          <label className="label" htmlFor="addr-country">Country</label>
          <select
            id="addr-country"
            className="input"
            {...register('country')}
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="AU">Australia</option>
          </select>
        </div>

        {/* Default checkbox */}
        <div className="sm:col-span-2 flex items-center gap-2">
          <input
            id="addr-default"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            {...register('is_default')}
          />
          <label htmlFor="addr-default" className="text-sm text-gray-700 cursor-pointer">
            Set as default address
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? <Spinner size="sm" className="border-white border-t-white/30" /> : 'Save Address'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
