import { getData } from "../lib/api";
const skills = [
  "Python",
  "Django",
  "JavaScript",
  "Node.js",
  "Next.js",
  "MongoDB",
  "HTML & CSS",
  "Tailwind CSS",
];



export default async function Home() {
  let projects = [];
  let skillsData = [];

  try {
    const data = await getData("/api/projects");
    projects = data.projects || [];
  } catch (error) {
    console.error("Projects fetch error:", error);
  }
  return (
    <main>
      {/* Navigation */}
      <nav className="navbar">
        <a href="#home" className="logo">
          N<span>.</span>
        </a>

        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </div>

        <a href="#contact" className="nav-button">
          Let's Talk <span>↗</span>
        </a>
      </nav>

      {/* Hero Section */}
      <section className="hero section-container" id="home">
        <div className="hero-content">
          <div className="availability">
            <span className="status-dot"></span>
            Aspiring Full-Stack Developer
          </div>

          <p className="eyebrow">HELLO, I'M NISHA</p>

          <h1>
            Creating digital
            <br />
            experiences with
            <br />
            <span>purpose & passion.</span>
          </h1>

          <p className="hero-description">
            I enjoy building modern websites and exploring technologies
            that turn creative ideas into meaningful digital experiences.
          </p>

          <div className="hero-buttons">
            <a href="#projects" className="primary-button">
              Explore My Work <span>↗</span>
            </a>

            <a href="#about" className="text-button">
              More About Me <span>↓</span>
            </a>
          </div>
        </div>

        <div className="hero-side">
          <div className="hero-monogram">N.</div>
          <p>DESIGNING · DEVELOPING · LEARNING</p>
          <span>BASED IN INDIA</span>
        </div>

        <div className="hero-bottom">
          <span>SCROLL TO EXPLORE</span>
          <span>01 / 04</span>
        </div>
      </section>

      {/* About Section */}
      <section className="about section-container" id="about">
        <div className="section-heading">
          <span className="section-label">01 — ABOUT ME</span>
          <h2>
            A little about
            <br />
            <span>who I am.</span>
          </h2>
        </div>

        <div className="about-content">
          <p className="about-intro">
            I'm Nisha, an aspiring developer passionate about technology,
            creativity and building useful web experiences.
          </p>

          <p className="about-description">
            My journey started with learning programming and gradually
            exploring web development. I enjoy understanding how things
            work behind the scenes, solving problems and continuously
            improving my skills through practical projects.
          </p>

          <a href="#contact" className="underlined-link">
            Let's connect <span>↗</span>
          </a>
        </div>
      </section>

      {/* Skills Section */}
      <section className="skills section-container" id="skills">
        <div className="section-heading">
          <span className="section-label">02 — MY TOOLKIT</span>
          <h2>
            Technologies I
            <br />
            <span>work with.</span>
          </h2>
        </div>

        <div className="skills-content">
          <p>
            Tools and technologies I have been learning and using
            to build web applications.
          </p>

          <div className="skill-list">
            {skills.map((skill, index) => (
              <div className="skill-item" key={skill}>
                <span className="skill-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{skill}</span>
                <span className="skill-arrow">↗</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="projects section-container" id="projects">
        <div className="projects-heading">
          <div className="section-heading">
            <span className="section-label">03 — SELECTED WORK</span>
            <h2>
              Things I've
              <br />
              <span>been building.</span>
            </h2>
          </div>

          <p>
            A selection of projects that reflect my learning,
            creativity and development journey.
          </p>
        </div>

        <div className="project-list">
          {projects.map((project, index) => (
            <article className="project-card" key={project._id}>
              <span className="project-number">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="project-info">
                <span className="project-category">
                  Development Project
                </span>

                <h3>{project.title}</h3>

                <p>{project.description}</p>

                <span className="project-stack">
                  {Array.isArray(project.technologies)
                    ? project.technologies.join(" · ")
                    : project.technologies}
                </span>
              </div>

              <span className="project-arrow">↗</span>
            </article>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact section-container" id="contact">
        <span className="section-label">04 — GET IN TOUCH</span>

        <h2>
          Have an idea?
          <br />
          <span>Let's build it.</span>
        </h2>

        <p>
          I'm always interested in learning, collaborating and
          connecting with people who love building meaningful things.
        </p>

        <a href="mailto:your-email@example.com" className="primary-button">
          Say Hello <span>↗</span>
        </a>
      </section>

      {/* Footer */}
      <footer className="footer">
        <a href="#home" className="logo">
          N<span>.</span>
        </a>

        <p>Designed & built with care by Nisha.</p>

        <a href="#home">Back to top ↑</a>
      </footer>
    </main>
  );
}