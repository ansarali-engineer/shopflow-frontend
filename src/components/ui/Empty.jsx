export default function Empty({ title = 'Nothing here', description = '', icon = '📭', children }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
      <span className="mb-3 text-5xl">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      {description && <p className="mt-1 text-sm">{description}</p>}
      {children}
    </div>
  )
}
