// Where the FastAPI server lives. Set VITE_API_URL for the live site (step 7).
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

async function getJson(path) {
  const response = await fetch(`${API_URL}${path}`)
  if (!response.ok) throw new Error(`${path} returned ${response.status}`)
  return response.json()
}

const fieldHelp = {
  name: 'Please enter your name.',
  email: 'Please enter a valid email address, like name@example.com.',
  message: 'Please write a message of at least 10 characters.',
}

// Resolves to { ok: true } or { ok: false, error, fieldErrors } so the form can show what went wrong.
export async function sendContact(form) {
  try {
    const response = await fetch(`${API_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (response.ok) return { ok: true }
    const body = await response.json().catch(() => ({}))
    if (response.status === 422) {
      const fieldErrors = Object.fromEntries(body.detail.map(({ loc }) => [loc.at(-1), fieldHelp[loc.at(-1)]]))
      return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors }
    }
    return { ok: false, error: body.detail || 'Something went wrong. Please try again.', fieldErrors: {} }
  } catch {
    return { ok: false, error: "Couldn't reach the server. Check your connection, or email me directly.", fieldErrors: {} }
  }
}

// Never rejects: a failed request comes back as status 'error' so the page can show it.
export function loadPortfolio() {
  return Promise.all([getJson('/api/skills'), getJson('/api/projects')])
    .then(([skills, projects]) => ({ status: 'ready', skills, projects }))
    .catch(() => ({ status: 'error', skills: [], projects: [] }))
}
