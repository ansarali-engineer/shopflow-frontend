import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ToastContext = createContext(null)
let _id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++_id
    setToasts((prev) => [...prev.slice(-4), { id, message, type, duration, progress: 100 }])
    return id
  }, [])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = {
    success: (msg, dur) => add(msg, 'success', dur),
    error:   (msg, dur) => add(msg, 'error',   dur ?? 6000),
    info:    (msg, dur) => add(msg, 'info',    dur),
    warning: (msg, dur) => add(msg, 'warning', dur),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastStack toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

/* ── Visual stack ────────────────────────────────────────── */
const STYLES = {
  success: {
    bar:  'bg-emerald-500',
    icon: 'bg-emerald-100 text-emerald-600',
    border: 'border-emerald-100',
    svg: <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />,
  },
  error: {
    bar:  'bg-red-500',
    icon: 'bg-red-100 text-red-600',
    border: 'border-red-100',
    svg: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
  },
  warning: {
    bar:  'bg-amber-400',
    icon: 'bg-amber-100 text-amber-600',
    border: 'border-amber-100',
    svg: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />,
  },
  info: {
    bar:  'bg-primary-500',
    icon: 'bg-primary-50 text-primary-600',
    border: 'border-primary-100',
    svg: <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />,
  },
}

function Toast({ toast, onRemove }) {
  const [visible, setVisible] = useState(false)
  const s = STYLES[toast.type] ?? STYLES.info

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, toast.duration)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className={`relative w-full max-w-sm bg-white border ${s.border} rounded-2xl shadow-xl
                  overflow-hidden transition-all duration-300
                  ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
    >
      {/* Progress bar */}
      <div className={`absolute top-0 left-0 h-0.5 ${s.bar} rounded-full`}
        style={{
          animation: `shrink ${toast.duration}ms linear forwards`,
          width: '100%',
        }}
      />
      <div className="flex items-start gap-3 px-4 py-3.5">
        <div className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 ${s.icon}`}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            {s.svg}
          </svg>
        </div>
        <p className="flex-1 text-sm font-medium text-gray-800 pt-0.5 leading-snug">{toast.message}</p>
        <button
          onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300) }}
          className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors mt-0.5"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function ToastStack({ toasts, onRemove }) {
  if (!toasts.length) return null
  return (
    <>
      <style>{`@keyframes shrink { from { width: 100% } to { width: 0% } }`}</style>
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col-reverse gap-2 pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast toast={t} onRemove={onRemove} />
          </div>
        ))}
      </div>
    </>
  )
}
