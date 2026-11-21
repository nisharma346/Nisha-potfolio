import { getData } from "../lib/api";
import Image from "next/image";

export default async function Home() {
  let projects = [];
  let skillsData = [];
  let about = null;

  try {
    const data = await getData("/api/projects");
    projects = data.projects || [];
  } catch (error) {
    console.error("Projects fetch error:", error);
  }

  try {
    const data = await getData("/api/skills");
    skillsData = data.skills || [];
  } catch (error) {
    console.error("Skills fetch error:", error);
  }

  try {
    const data = await getData("/api/about");
    about = data.about || null;
  } catch (error) {
    console.error("About fetch error:", error);
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
          {/* Profile Image */}
          {about?.profileImage ? (
            <div className="about-image-wrapper">
              <Image
                src={about.profileImage}
                alt={about.name || "Profile"}
                width={280}
                height={320}
                className="about-profile-image"
              />
            </div>
          ) : (
            <div className="about-image-wrapper">
              <div className="about-profile-placeholder">
                <span>{about?.name ? about.name.charAt(0).toUpperCase() : "N"}</span>
              </div>
            </div>
          )}

          {/* Bio Text */}
          <p className="about-intro">
            {about?.shortBio ||
              "I'm an aspiring developer passionate about technology, creativity and building useful web experiences."}
          </p>

          <p className="about-description">
            {about?.description ||
              "My journey started with learning programming and gradually exploring web development. I enjoy understanding how things work behind the scenes, solving problems and continuously improving my skills through practical projects."}
          </p>

          {/* Meta Info: location, education, email */}
          {about && (
            <ul className="about-meta">
              {about.location && (
                <li>
                  <span className="meta-label">Location</span>
                  <span className="meta-value">{about.location}</span>
                </li>
              )}
              {about.education && (
                <li>
                  <span className="meta-label">Education</span>
                  <span className="meta-value">{about.education}</span>
                </li>
              )}
              {about.email && (
                <li>
                  <span className="meta-label">Email</span>
                  <a href={`mailto:${about.email}`} className="meta-value meta-link">
                    {about.email}
                  </a>
                </li>
              )}
            </ul>
          )}

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
            {skillsData.map((skill, index) => (
              <div className="skill-item" key={index}>
                <span className="skill-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{skill.name}</span>
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
            <article className="project-card" key={project._id || index}>
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