import { useEffect, useRef, useState } from 'react'
import './App.css'
import seattleImg from './assets/seattle.jpg'
import Arrow from './components/Arrow'
import Projects from './components/Projects'
import { projects } from './data/projects'

const navigation = [['skills', 'Skills'], ['about', 'About'], ['projects', 'Projects'], ['contact', 'Contact me']]
const email = 'ayushj8@terpmail.umd.edu'

function App() {
  const [activeSection, setActiveSection] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const copyTimer = useRef(null)

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
    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
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
        <a href="#home" className="logo" aria-label="AJ — Home" onClick={() => setMenuOpen(false)}>AJ</a>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close' : 'Menu'}<span className={menuOpen ? 'menu-lines open' : 'menu-lines'} aria-hidden="true" /></button>
        <nav id="main-nav" className={menuOpen ? 'is-open' : ''} aria-label="Main navigation" onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); document.querySelector('.menu-toggle').focus() } }}>
          {navigation.map(([id, label]) => <a key={id} href={`#${id}`} className={`${id === 'contact' ? 'hello-button' : ''} ${activeSection === id ? 'active' : ''}`} aria-current={activeSection === id ? 'location' : undefined} onClick={() => { setMenuOpen(false); setActiveSection(id) }}>{label}</a>)}
        </nav>
      </header>
      <main id="main">
        <section id="home" className="hero" aria-labelledby="hero-title">
          <div className="hero-text">
            <p className="greeting">Hi, I'm</p>
            <h1 id="hero-title">Ayush Jain</h1>
            <p className="school">Computer Science at University of Maryland</p>
            <p className="hometown"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>Seattle, WA <span className="location-divider">/</span> College Park, MD</p>
            <p className="description">I'm interested in turning ideas into products that effectively address problems and needs.</p>
            <div className="buttons">
              <a href="#projects" className="button primary">Explore my work <Arrow /></a>
            </div>
            <div id="skills" className="skills">
              <h2>My toolkit</h2>
              <ul className="skill-tags" aria-label="Skills">{['Python', 'Java', 'HTML', 'CSS', 'JavaScript', 'React', 'GitHub'].map(skill => <li key={skill}>{skill}</li>)}</ul>
            </div>
          </div>
          <figure className="hero-image" onPointerMove={tiltPhoto} onPointerLeave={event => { event.currentTarget.style.setProperty('--tilt-x', '0deg'); event.currentTarget.style.setProperty('--tilt-y', '0deg') }}>
            <div className="photo-frame"><img src={seattleImg} alt="Seattle skyline featuring the Space Needle" width="612" height="408" fetchPriority="high" /></div>
          </figure>
        </section>
        <section id="about" className="about section" aria-labelledby="about-title">
          <div><h2 id="about-title">About me</h2><a className="text-link" href="#contact">Let's get to know each other <Arrow /></a></div>
          <p className="description">I'm Ayush, a computer science student at the University of Maryland minoring in business analytics. I'm passionate about building useful applications and learning how business, technology, and AI connect. Outside of school, I love watching and playing sports, especially football, basketball, soccer, and baseball.</p>
        </section>
        <Projects projects={projects} />
        <section id="contact" className="contact section" aria-labelledby="contact-title">
          <div><h2 id="contact-title">Let's connect</h2><p className="description">Interested in learning and building something together?</p></div>
          <div className="contact-actions">
            <a className="button primary" href={`mailto:${email}`}>Send me an email <Arrow diagonal /></a>
            <button className="copy-email" type="button" onClick={copyEmail}>Copy email address<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M15 8V4H4v11h4"/></svg></button>
            <p className="copy-status" role="status">{copyStatus}</p>
          </div>
        </section>
      </main>
      <footer><a href="#home">Back to top <Arrow /></a></footer>
    </div>
  )
}

export default App
