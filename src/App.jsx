import './App.css'
import seattleImg from './assets/seattle.jpg'

function App() {
  return (
    <div className="portfolio">
      <header className="navbar">
        <a href="#" className="logo" aria-label="AJ — Home">
          AJ
        </a>
        <nav aria-label="Main navigation">
          <a href="#">Home</a>
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#contact" className="hello-button">Contact me</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-text">
            <p className="badge">PERSONAL PORTFOLIO</p>

            <p className="greeting">Hi, I'm</p>
            <h1>Ayush Jain.</h1>

            <p className="school">
              Computer Science at University of Maryland
            </p>

            <p className="hometown"> Seattle, WA | College Park, MD </p>

            <p className="description">
              I'm interested in turning ideas into products that effectively 
              address problems and needs. 
            </p>

            <div className="buttons">
              <a href="#about" className="button primary">
                About me →
              </a>
              <a href="#contact" className="button secondary">
                Reach me →
              </a>
            </div>

            <div id="skills" className="skills">
              <h2>SKILLS</h2>
              <div className="skill-tags">
                <span>Python</span>
                <span>Java</span>
                <span>HTML</span>
                <span>CSS</span>
                <span>JavaScript</span>
                <span>React</span>
                <span>Node.js</span>
                <span>Github</span>
              </div>
            </div>
          </div>

          <figure className="hero-image">
            <img
              src={seattleImg}
              alt="Seattle skyline featuring the Space Needle"
            />
          </figure>
        </section>

        <section id="about" className="about">
          <div>
            <p className="section-label">ABOUT ME</p>
            <h2>Curious by nature.</h2>
          </div>

          <p className="description">
            I'm Ayush, a computer science student at the University of Maryland minoring in business analytics. 
            I'm passionate about building useful applications and learning how business, technology, and AI connect. 
            Outside of school, I love watching and playing sports, especially football, basketball, soccer, and baseball.
          </p>
        </section>

        <section id="contact" className="contact">
          <p className="section-label">CONTACT</p>
          <h2>Let's connect.</h2>
          <p className="description">
            Interested in learning and building something together?
          </p>
          <a href="mailto:ayushj8@terpmail.umd.edu">Send me an email →</a>
        </section>
      </main>
    </div>
  )
}

export default App