import { useState } from 'react'
import Arrow from './Arrow'
import LoadState from './LoadState'

function ProjectLink({ href, children }) {
  if (!href || !/^https?:\/\//i.test(href)) return null
  return <a href={href} target="_blank" rel="noopener noreferrer">{children}<Arrow diagonal /><span className="sr-only"> (opens in a new tab)</span></a>
}

export default function Projects({ projects = [], status = 'ready', onRetry }) {
  const [filter, setFilter] = useState('All')
  const categories = ['All', ...new Set(projects.map(project => project.category).filter(Boolean))]
  const visibleProjects = filter === 'All' ? projects : projects.filter(project => project.category === filter)

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
      {status !== 'ready' ? (
        <LoadState status={status} what="projects" onRetry={onRetry} />
      ) : projects.length === 0 ? (
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
                {project.details && <details><summary>Behind the project</summary><p>{project.details}</p></details>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
