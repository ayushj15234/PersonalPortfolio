import './App.css'
import seattleImg from './assets/seattle.jpg'

function App() {
  return (
    <div className="portfolio">
      <header className="navbar">
        <a href="#" className="logo">
          ayush<span>.</span>
        </a>

        <nav aria-label="Main navigation">
          <a href="#">Home</a>
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#contact" className="hello-button">Say hello</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-text">
            <p className="badge">● LEARNING & BUILDING</p>

            <p className="greeting">Hi, I'm</p>
            <h1>Ayush Jain.</h1>

            <p className="school">
              Computer Science @ University of Maryland
            </p>

            <p className="hometown">From Seattle to College Park.</p>

            <p className="description">
              I'm learning to turn ideas into thoughtful digital
              experiences, one project at a time.
            </p>

            <div className="buttons">
              <a href="#about" className="button primary">
                About me →
              </a>
              <a href="#contact" className="button secondary">
                Get in touch
              </a>
            </div>

            <div id="skills" className="skills">
              <h2>CURRENTLY LEARNING</h2>
              <div className="skill-tags">
                <span>HTML</span>
                <span>CSS</span>
                <span>React</span>
              </div>
            </div>
          </div>

          <figure className="hero-image">
            <img
              src={seattleImg}
              alt="Seattle skyline featuring the Space Needle"
            />
            <figcaption>
              ● Seattle roots. New beginnings.
            </figcaption>
          </figure>
        </section>

        <section id="about" className="about">
          <div>
            <p className="section-label">01 / ABOUT ME</p>
            <h2>Curious by nature.</h2>
          </div>

          <p className="description">
            A CS student exploring web development, AI, and the ideas
            that connect technology with people.
          </p>
        </section>

        <section id="contact" className="contact">
          <p className="section-label">02 / CONTACT</p>
          <h2>Let's connect.</h2>
          <p className="description">
            Interested in learning and building something together?
          </p>
          <a href="mailto:you@example.com">Send me an email →</a>
        </section>
      </main>
    </div>
  )
}

export default App