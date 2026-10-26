import { useEffect, useRef, useState } from 'react'
import './App.css'
import seattleImg from './assets/seattle.jpg'
import Arrow from './components/Arrow'
import ContactForm from './components/ContactForm'
import LoadState from './components/LoadState'
import Projects from './components/Projects'
import { loadPortfolio } from './api'

const navigation = [['skills', 'Skills'], ['about', 'About'], ['projects', 'Projects'], ['contact', 'Contact me']]
const email = 'ayushj8@terpmail.umd.edu'
const github = 'https://github.com/ayushj15234'
// The data comes from the API; the icons stay here because they're design, not data.
const skillIcons = {
  Languages: 'M8 6 2 12l6 6m8-12 6 6-6 6m-2-14-4 16',
  Frameworks: 'M12 3 3 8l9 5 9-5-9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5',
  Tools: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z',
}

function App() {
  const [portfolio, setPortfolio] = useState({ status: 'loading', skills: [], projects: [] })
  const [activeSection, setActiveSection] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const copyTimer = useRef(null)

  // Ask the backend for skills and projects once, when the page opens.
  useEffect(() => {
    let active = true
    loadPortfolio().then(data => { if (active) setPortfolio(data) })
    return () => { active = false }
  }, [])

  function retryLoad() {
    setPortfolio(current => ({ ...current, status: 'loading' }))
    loadPortfolio().then(setPortfolio)
  }

  useEffect(() => {
    let frame = 0
    function updateSection() {
      frame = 0
      const sections = navigation.map(([id]) => ({ id, top: document.getElementById(id).getBoundingClientRect().top }))
      const reached = sections.filter(section => section.top <= window.innerHeight * 0.35).sort((a, b) => b.top - a.top)
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4
      setActiveSection(atBottom ? 'contact' : reached[0]?.id || 'home')
    }
    function scheduleUpdate() {
      if (!frame) frame = window.requestAnimationFrame(updateSection)
    }
    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    // Sections settle into view once, as they're scrolled to.
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('is-visible')
      reveal.unobserve(entry.target)
    }), { rootMargin: '0px 0px -10% 0px' })
    document.querySelectorAll('[data-reveal]').forEach(el => reveal.observe(el))

    // Cards light up under the pointer.
    function spotlight(event) {
      const card = event.target.closest?.('.card')
      if (!card) return
      const bounds = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${event.clientX - bounds.left}px`)
      card.style.setProperty('--my', `${event.clientY - bounds.top}px`)
    }
    document.addEventListener('pointermove', spotlight, { passive: true })

    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      document.removeEventListener('pointermove', spotlight)
      reveal.disconnect()
      window.cancelAnimationFrame(frame)
      window.clearTimeout(copyTimer.current)
    }
  }, [])

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email)
      setCopyStatus('Email copied!')
    } catch {
      setCopyStatus('Could not copy. Use the email link instead.')
    }
    window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopyStatus(''), 4000)
  }

  function tiltPhoto(event) {
    if (!window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    event.currentTarget.style.setProperty('--tilt-x', `${-y * 4}deg`)
    event.currentTarget.style.setProperty('--tilt-y', `${x * 4}deg`)
  }

  return (
    <div className="portfolio">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="navbar">
        <a href="#home" className="logo" aria-label="AJ — Home" onClick={() => setMenuOpen(false)}><span>A<span className="upright-j">J</span></span></a>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close' : 'Menu'}<span className={menuOpen ? 'menu-lines open' : 'menu-lines'} aria-hidden="true" /></button>
        <nav id="main-nav" className={menuOpen ? 'is-open' : ''} aria-label="Main navigation" onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); document.querySelector('.menu-toggle').focus() } }}>
          {navigation.map(([id, label]) => <a key={id} href={`#${id}`} className={`${id === 'contact' ? 'hello-button' : ''} ${activeSection === id ? 'active' : ''}`} aria-current={activeSection === id ? 'location' : undefined} onClick={() => { setMenuOpen(false); setActiveSection(id) }}>{label}</a>)}
        </nav>
      </header>
      <main id="main">
        <section id="home" className="hero" aria-labelledby="hero-title">
          <div className="hero-text">
            <p className="greeting rise">Hi, I'm</p>
            <h1 id="hero-title" className="rise">Ayush <span className="upright-j">J</span>ain</h1>
            <p className="school rise">Computer Science at University of Maryland</p>
            <p className="hometown rise"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>Seattle, WA <span className="location-divider">/</span> College Park, MD</p>
            <p className="description rise">I'm interested in turning ideas into <em>products</em> that effectively address problems and needs.</p>
            <div className="buttons rise">
              <a href="#projects" className="button primary">Explore my work <Arrow /></a>
              <a href={github} className="button secondary" target="_blank" rel="noopener noreferrer">GitHub <Arrow diagonal /><span className="sr-only"> (opens in a new tab)</span></a>
            </div>
          </div>
          <figure className="hero-image rise" onPointerMove={tiltPhoto} onPointerLeave={event => { event.currentTarget.style.setProperty('--tilt-x', '0deg'); event.currentTarget.style.setProperty('--tilt-y', '0deg') }}>
            <div className="photo-frame"><img src={seattleImg} alt="Seattle skyline featuring the Space Needle" width="612" height="408" fetchPriority="high" /></div>
          </figure>
        </section>

        <section id="skills" className="skills section" aria-labelledby="skills-title">
          <h2 id="skills-title" data-reveal>My <em>toolkit</em></h2>
          {portfolio.status !== 'ready' && <LoadState status={portfolio.status} what="skills" onRetry={retryLoad} />}
          <div className="skill-boxes" data-reveal>
            {portfolio.skills.map(({ category, description, items }) => (
              <article className="card skill-box" key={category}>
                {skillIcons[category] && <svg className="skill-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={skillIcons[category]} /></svg>}
                <h3>{category}</h3>
                <p>{description}</p>
                <ul className="skill-tags">{items.map(skill => <li key={skill}>{skill}</li>)}</ul>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="about section" aria-labelledby="about-title">
          <div data-reveal>
            <h2 id="about-title">About <em>me</em></h2>
            <a className="text-link" href="#contact">Let's get to know each other <Arrow /></a>
          </div>
          <div data-reveal>
            <p className="lead">I'm Ayush, a computer science student at the University of Maryland minoring in business analytics.</p>
            <p className="description">I'm passionate about building useful applications and learning how business, technology, and AI connect. Outside of school, I love watching and playing sports, especially football, basketball, soccer, and baseball.</p>
          </div>
        </section>

        <Projects projects={portfolio.projects} status={portfolio.status} onRetry={retryLoad} />

        <section id="contact" className="contact section" aria-labelledby="contact-title">
          <div className="contact-actions" data-reveal>
            <h2 id="contact-title">Let's <em>connect</em></h2>
            <p className="description">Interested in learning and building something together? Send me a message, or reach me directly.</p>
            <a className="card contact-card" href={`mailto:${email}`}><span>Send me an email</span>{email}<Arrow diagonal /></a>
            <a className="card contact-card" href={github} target="_blank" rel="noopener noreferrer"><span>GitHub</span>github.com/ayushj15234<Arrow diagonal /><span className="sr-only"> (opens in a new tab)</span></a>
            <button className="copy-email" type="button" onClick={copyEmail}>Copy email address<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M15 8V4H4v11h4"/></svg></button>
            <p className="copy-status" role="status">{copyStatus}</p>
          </div>
          <div data-reveal><ContactForm /></div>
        </section>
      </main>
      <footer>
        <a href="#home">Back to top <Arrow /></a>
      </footer>
    </div>
  )
}

export default App
