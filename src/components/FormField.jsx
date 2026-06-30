import { useId } from 'react'

export function Input({ label, ...props }) {
  const uid = useId()
  const id = props.id ?? uid
  return (
    <div>
      {label && <label className="label" htmlFor={id}>{label}</label>}
      <input id={id} className="input" {...props} />
    </div>
  )
}

export function Select({ label, children, ...props }) {
  const uid = useId()
  const id = props.id ?? uid
  return (
    <div>
      {label && <label className="label" htmlFor={id}>{label}</label>}
      <select id={id} className="input" {...props}>
        {children}
      </select>
    </div>
  )
}

export function Textarea({ label, ...props }) {
  const uid = useId()
  const id = props.id ?? uid
  return (
    <div>
      {label && <label className="label" htmlFor={id}>{label}</label>}
      <textarea id={id} className="input resize-none" rows={3} {...props} />
    </div>
  )
}

export function CheckItem({ label, checked, onChange }) {
  const id = useId()
  return (
    <label className="check-card" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 accent-brand-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}
