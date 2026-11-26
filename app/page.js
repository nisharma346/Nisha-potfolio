import { getData } from "../lib/api";
import Image from "next/image";
import ContactForm from "./contact-form";
import Navbar from "../components/layout/Navbar";

export default async function Home() {
  let projects = [];
  let skillsData = [];
  let about = null;
  let projectsUnavailable = false;
  let skillsUnavailable = false;
  let aboutUnavailable = false;

  const [projectsResult, skillsResult, aboutResult] = await Promise.allSettled([
    getData("/api/projects"),
    getData("/api/skills"),
    getData("/api/about"),
  ]);

  if (projectsResult.status === "fulfilled" && Array.isArray(projectsResult.value.projects)) {
    projects = projectsResult.value.projects;
  } else {
    projectsUnavailable = true;
    console.error(
      "Projects fetch error:",
      projectsResult.status === "rejected"
        ? projectsResult.reason
        : new Error("Projects response did not contain a list.")
    );
  }

  if (skillsResult.status === "fulfilled" && Array.isArray(skillsResult.value.skills)) {
    skillsData = skillsResult.value.skills;
  } else {
    skillsUnavailable = true;
    console.error(
      "Skills fetch error:",
      skillsResult.status === "rejected"
        ? skillsResult.reason
        : new Error("Skills response did not contain a list.")
    );
  }

  if (aboutResult.status === "fulfilled") {
    about = aboutResult.value.about || null;
    aboutUnavailable = !about;
  } else {
    aboutUnavailable = true;
    console.error("About fetch error:", aboutResult.reason);
  }

  const displayName = about?.name || "Nisha";
  const footerName = about?.name || "Nisha Kumari";
  const footerRole = about?.role || "Full Stack Developer";
  const monogram = displayName.charAt(0).toUpperCase();

  return (
    <main>
      <Navbar monogram={monogram} />

      {/* Hero Section */}
      <section className="hero section-container" id="home">
        <div className="hero-content">
          <div className="availability">
            <span className="status-dot"></span>
            {about?.role || "Aspiring Full-Stack Developer"}
          </div>

          <p className="eyebrow">HELLO, I'M {displayName.toUpperCase()}</p>

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
          <div className="hero-monogram">{monogram}.</div>
          <p>DESIGNING · DEVELOPING · LEARNING</p>
          <span>{about?.location ? `BASED IN ${about.location.toUpperCase()}` : "BASED IN INDIA"}</span>
        </div>

        <div className="hero-bottom">
          <span>SCROLL TO EXPLORE</span>
          <span>01 / 04</span>
        </div>
      </section>

      {/* About Section */}
      <section className="about section-container" id="about">
        {aboutUnavailable && (
          <p className="content-empty-state" role="status">
            Profile details are unavailable. Temporary fallback content is shown.
          </p>
        )}
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
            {skillsData.length > 0 ? (
              skillsData.map((skill, index) => (
                <div className="skill-item" key={skill._id || skill.name}>
                  <span className="skill-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{skill.name}</span>
                  <span className="skill-arrow">↗</span>
                </div>
              ))
            ) : (
              <p
                className="content-empty-state"
                role={skillsUnavailable ? "alert" : "status"}
              >
                {skillsUnavailable
                  ? "Skills could not be loaded right now."
                  : "No skills have been added yet."}
              </p>
            )}
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
          {projects.length > 0 ? (
            projects.map((project, index) => (
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

                  {(project.liveUrl || project.githubUrl) && (
                    <div className="project-links">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open ${project.title} live site`}
                        >
                          Live site <span aria-hidden="true">↗</span>
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`View ${project.title} source on GitHub`}
                        >
                          Source code <span aria-hidden="true">↗</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))
          ) : (
            <p
              className="content-empty-state"
              role={projectsUnavailable ? "alert" : "status"}
            >
              {projectsUnavailable
                ? "Projects could not be loaded right now."
                : "No projects have been added yet."}
            </p>
          )}
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

        <ContactForm email={about?.email || ""} />
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-main">
          <section className="footer-brand" aria-labelledby="footer-brand-title">
            <h2 className="footer-brand-name" id="footer-brand-title">{footerName}</h2>
            <p className="footer-role">{footerRole}</p>
            <p className="footer-tagline">
              {about?.shortBio || "Building thoughtful digital experiences with care."}
            </p>
            {(about?.github || about?.linkedin) && (
              <div className="footer-social-links" aria-label="Social profiles">
                {about?.github && (
                  <a href={about.github} target="_blank" rel="noreferrer" aria-label="GitHub profile">
                    GitHub <span aria-hidden="true">↗</span>
                  </a>
                )}
                {about?.linkedin && (
                  <a href={about.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn profile">
                    LinkedIn <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            )}
          </section>

          <nav className="footer-column" aria-label="Footer navigation">
            <h2 className="footer-heading">Quick links</h2>
            <ul className="footer-link-list">
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#skills">Skills</a></li>
              <li><a href="#projects">Projects</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>

          <section className="footer-column" aria-labelledby="footer-contact-title">
            <h2 className="footer-heading" id="footer-contact-title">Get in touch</h2>
            <ul className="footer-link-list footer-contact-list">
              {about?.email && (
                <li><a href={`mailto:${about.email}`}>{about.email}</a></li>
              )}
              {about?.github && (
                <li><a href={about.github} target="_blank" rel="noreferrer">GitHub profile <span aria-hidden="true">↗</span></a></li>
              )}
              {about?.linkedin && (
                <li><a href={about.linkedin} target="_blank" rel="noreferrer">LinkedIn profile <span aria-hidden="true">↗</span></a></li>
              )}
            </ul>
          </section>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {footerName}. All rights reserved.</p>
          <p>Designed &amp; Developed by {footerName}</p>
        </div>
      </footer>
    </main>
  );
}