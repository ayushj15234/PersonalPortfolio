import { useEffect, useState } from 'react'
import { getJSON } from '../api'
import Arrow from './Arrow'

function ProjectLink({ href, children }) {
  if (!href || !/^https?:\/\//i.test(href)) return null
  return <a href={href} target="_blank" rel="noopener noreferrer">{children}<Arrow diagonal /><span className="sr-only"> (opens in a new tab)</span></a>
}

// Fetches the full project from GET /api/projects/{id} the first time it's opened.
function ProjectDetails({ id }) {
  const [state, setState] = useState({ status: 'idle' })

  async function load(event) {
    if (!event.currentTarget.open || state.status === 'done') return
    setState({ status: 'loading' })
    const project = await getJSON(`/api/projects/${encodeURIComponent(id)}`)
    setState(project ? { status: 'done', text: project.details } : { status: 'error' })
  }

  return (
    <details onToggle={load}>
      <summary>Behind the project</summary>
      <p aria-live="polite">{state.status === 'done' ? state.text : state.status === 'error' ? "Couldn't load the details. Check your connection, then close and reopen this to try again." : 'Loading…'}</p>
    </details>
  )
}

export default function Projects({ projects: fallbackProjects }) {
  const [projects, setProjects] = useState(fallbackProjects)
  const [filter, setFilter] = useState('All')
  const [filtered, setFiltered] = useState(null)
  const categories = ['All', ...new Set(projects.map(project => project.category).filter(Boolean))]
  // Use the API's answer for the current filter; filter locally while it loads or if the API is down.
  const visibleProjects = filter === 'All' ? projects : filtered?.filter === filter && filtered.data ? filtered.data : projects.filter(project => project.category === filter)

  useEffect(() => {
    getJSON('/api/projects').then(data => data && setProjects(data))
  }, [])

  useEffect(() => {
    if (filter === 'All') return
    getJSON(`/api/projects?category=${encodeURIComponent(filter)}`).then(data => setFiltered({ filter, data }))
  }, [filter])

  return (
    <section id="projects" className="projects section" aria-labelledby="projects-title">
      <div className="section-heading" data-reveal>
        <h2 id="projects-title">Things I&apos;ve <em>built</em></h2>
        {categories.length > 2 && (
          <div className="project-filters" aria-label="Filter projects">
            {categories.map(category => <button type="button" key={category} aria-pressed={filter === category} onClick={() => setFilter(category)}>{category}</button>)}
          </div>
        )}
      </div>
      {projects.length === 0 ? (
        <div className="projects-empty card">
          <svg className="project-symbol" width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="8" width="38" height="32" rx="5" /><path d="M5 17h38M12 12.5h.1m4 0h.1M18 24l-5 5 5 5m12-10 5 5-5 5m-5-12-3 14" /></svg>
          <div><h3>More to come</h3><p>Projects, experiments, and the things I learn along the way.</p></div>
          <span className="coming-soon">Coming soon</span>
        </div>
      ) : (
        <div className="project-list" aria-live="polite">
          {visibleProjects.map(project => (
            <article className={`project card ${project.image ? 'has-image' : ''}`} key={project.id || project.title}>
              {project.image && <div className="project-image"><img src={project.image} alt={`${project.title} preview`} loading="lazy" /></div>}
              <div className="project-content">
                {project.icon === 'mountain' && (
                  <svg className="project-mountain" width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m4 38 15-27 9 16 5-9 11 20H4Z" />
                    <path d="m14 20 5 4 5-4m5 5 4 3 4-3" />
                  </svg>
                )}
                <h3>{project.title}</h3>
                {project.description && <p>{project.description}</p>}
                {project.tags?.length > 0 && <ul className="project-tags" aria-label="Technologies">{project.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>}
                <div className="project-links"><ProjectLink href={project.liveUrl}>Live project</ProjectLink><ProjectLink href={project.githubUrl}>View on GitHub</ProjectLink></div>
                {project.details && project.id && <ProjectDetails id={project.id} />}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
