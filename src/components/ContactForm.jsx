import { useState } from 'react'
import Arrow from './Arrow'
import { sendContact } from '../api'

const empty = { name: '', email: '', message: '', website: '' }

export default function ContactForm() {
  const [form, setForm] = useState(empty)
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState({ error: '', fieldErrors: {} })

  function update(event) {
    const { name, value } = event.target
    setForm(current => ({ ...current, [name]: value }))
    setResult(current => ({ ...current, fieldErrors: { ...current.fieldErrors, [name]: undefined } }))
  }

  async function submit(event) {
    event.preventDefault()
    setStatus('sending')
    const outcome = await sendContact(form)
    if (outcome.ok) {
      setStatus('sent')
      setForm(empty)
    } else {
      setStatus('idle')
      setResult(outcome)
    }
  }

  if (status === 'sent') {
    return (
      <div className="card contact-form contact-sent" role="status">
        <h3>Message sent</h3>
        <p>Thanks for reaching out! I&apos;ll get back to you soon.</p>
        <button type="button" className="button secondary" onClick={() => { setStatus('idle'); setResult({ error: '', fieldErrors: {} }) }}>Send another</button>
      </div>
    )
  }

  const field = (name, label, props) => (
    <label className="field">
      <span>{label}</span>
      {props.as === 'textarea'
        ? <textarea name={name} value={form[name]} onChange={update} aria-invalid={Boolean(result.fieldErrors[name])} aria-describedby={result.fieldErrors[name] ? `${name}-error` : undefined} rows={5} maxLength={5000} required minLength={10} />
        : <input name={name} value={form[name]} onChange={update} aria-invalid={Boolean(result.fieldErrors[name])} aria-describedby={result.fieldErrors[name] ? `${name}-error` : undefined} required {...props} />}
      {result.fieldErrors[name] && <small id={`${name}-error`} className="field-error">{result.fieldErrors[name]}</small>}
    </label>
  )

  return (
    <form className="card contact-form" onSubmit={submit} noValidate>
      {field('name', 'Name', { type: 'text', autoComplete: 'name', maxLength: 100 })}
      {field('email', 'Email', { type: 'email', autoComplete: 'email', maxLength: 254 })}
      {field('message', 'Message', { as: 'textarea' })}
      {/* Hidden from people; bots that fill every field get caught by the server. */}
      <input className="honeypot" name="website" value={form.website} onChange={update} tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {result.error && <p className="form-error" role="alert">{result.error}</p>}
      <button type="submit" className="button primary" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send message'} <Arrow /></button>
    </form>
  )
}
