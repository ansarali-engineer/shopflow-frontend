const variants = {
  green:  'bg-green-100 text-green-800',
  red:    'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  blue:   'bg-blue-100 text-blue-800',
  gray:   'bg-gray-100 text-gray-700',
  purple: 'bg-purple-100 text-purple-800',
}

// Map order/payment statuses to colors
const statusMap = {
  PENDING_PAYMENT: 'yellow',
  PAID: 'blue',
  PROCESSING: 'blue',
  SHIPPED: 'purple',
  DELIVERED: 'green',
  CANCELLED: 'gray',
  REFUNDED: 'gray',
  RETURNED: 'gray',
  pending: 'yellow',
  success: 'green',
  failed: 'red',
  refunded: 'gray',
  active: 'green',
  inactive: 'gray',
  suspended: 'red',
  deleted: 'gray',
  published: 'green',
  hidden: 'gray',
  flagged: 'red',
}

export default function Badge({ label, color }) {
  const resolvedColor = color || statusMap[label] || 'gray'
  return (
    <span className={`badge ${variants[resolvedColor]}`}>
      {label}
    </span>
  )
}
