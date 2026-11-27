import Image from "next/image";
import ContactForm from "./contact-form";
import Navbar from "../components/layout/Navbar";
import { getData } from "../lib/api";

export const dynamic = "force-dynamic";

function reportDataFetchFailure(resource, error) {
  if (error instanceof Error && error.message === "BACKEND_UNAVAILABLE") {
    console.warn(`${resource} data is unavailable.`);
    return;
  }

  console.error(`${resource} data could not be loaded.`);
}

function readListResult(result, property, resource) {
  if (
    result.status === "fulfilled" &&
    Array.isArray(result.value?.[property])
  ) {
    return result.value[property];
  }

  reportDataFetchFailure(
    resource,
    result.status === "rejected"
      ? result.reason
      : new Error(`${resource} response did not contain a list.`)
  );
  return [];
}

function isPublicImageSource(source) {
  if (typeof source !== "string" || !source.trim()) return false;
  if (source.startsWith("/") && !source.startsWith("//")) return true;

  try {
    const url = new URL(source);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function getResumeDownloadHref(source) {
  if (typeof source !== "string" || !source.trim()) return "";
  if (source.startsWith("cloudinary:raw:")) return "/api/about/resume";
  if (source.startsWith("/") && !source.startsWith("//")) return source;

  try {
    const url = new URL(source);
    if (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      /^\/[^/]+\/raw\/authenticated\/s--[a-z0-9_-]+--\/v\d+\/nisha-portfolio\/about\/resumes\/resume-[0-9a-f-]{36}\.pdf$/i.test(
        url.pathname
      )
    ) {
      return "/api/about/resume";
    }

    return url.protocol === "http:" || url.protocol === "https:" ? source : "";
  } catch {
    return "";
  }
}

function SectionHeading({ number, eyebrow, title, description, id }) {
  return (
    <div className="portfolio-section-heading">
      <div>
        <p className="portfolio-eyebrow">
          {number} / {eyebrow}
        </p>
        <h2 id={id}>{title}</h2>
      </div>
      {description && <p className="portfolio-section-description">{description}</p>}
    </div>
  );
}

function formatEducationDate(record) {
  return [record.startYear, record.endYear || (record.startYear ? "Present" : "")]
    .filter(Boolean)
    .join(" — ");
}

function formatExperienceDate(record) {
  const endDate = record.currentlyWorking ? "Present" : record.endDate;
  return [record.startDate, endDate].filter(Boolean).join(" — ");
}

export default async function Home() {
  const [
    projectsResult,
    skillsResult,
    aboutResult,
    educationResult,
    experienceResult,
    certificationsResult,
    testimonialsResult,
  ] = await Promise.allSettled([
    getData("/api/projects"),
    getData("/api/skills"),
    getData("/api/about"),
    getData("/api/education"),
    getData("/api/experiences"),
    getData("/api/certifications"),
    getData("/api/testimonials"),
  ]);

  const projects = readListResult(projectsResult, "projects", "Projects");
  const skills = readListResult(skillsResult, "skills", "Skills");
  const education = readListResult(educationResult, "education", "Education");
  const experiences = readListResult(
    experienceResult,
    "experiences",
    "Experience"
  );
  const certifications = readListResult(
    certificationsResult,
    "certifications",
    "Certifications"
  );
  const testimonials = readListResult(
    testimonialsResult,
    "testimonials",
    "Testimonials"
  );

  let about = null;
  let aboutUnavailable = false;
  if (aboutResult.status === "fulfilled") {
    about = aboutResult.value?.about || null;
    aboutUnavailable = !about;
  } else {
    aboutUnavailable = true;
    reportDataFetchFailure("About", aboutResult.reason);
  }

  const displayName = about?.name || "Nisha Kumari";
  const displayRole = about?.role || "Full Stack Developer";
  const resumeDownloadHref = getResumeDownloadHref(about?.resumeUrl);
  const resumeViewHref =
    resumeDownloadHref === "/api/about/resume"
      ? `${resumeDownloadHref}?disposition=inline`
      : resumeDownloadHref;

  const skillGroups = Array.from(
    skills.reduce((groups, skill) => {
      const category = skill.category?.trim() || "Other";
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(skill);
      return groups;
    }, new Map())
  );

  const metrics = [
    { label: "Projects", value: projects.length },
    { label: "Technologies", value: skills.length },
    { label: "Certifications", value: certifications.length },
    { label: "Experiences", value: experiences.length },
  ].filter((metric) => metric.value > 0);

  const navigationLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    ...(skills.length ? [{ label: "Skills", href: "#skills" }] : []),
    ...(projects.length ? [{ label: "Projects", href: "#projects" }] : []),
    ...(education.length ? [{ label: "Journey", href: "#journey" }] : []),
    ...(experiences.length
      ? [{ label: "Experience", href: "#experience" }]
      : []),
    ...(resumeDownloadHref ? [{ label: "Resume", href: "#resume" }] : []),
    ...(metrics.length || certifications.length
      ? [{ label: "Achievements", href: "#accomplishments" }]
      : []),
    ...(testimonials.length
      ? [{ label: "Testimonials", href: "#testimonials" }]
      : []),
    { label: "Contact", href: "#contact" },
  ];

  let sectionIndex = 0;
  const nextSectionNumber = () => String(++sectionIndex).padStart(2, "0");

  return (
    <main className="portfolio-shell">
      <Navbar
        links={navigationLinks}
        name={displayName}
        resumeHref={resumeViewHref}
      />

      <section className="portfolio-hero" id="home" aria-labelledby="hero-title">
        <div className="portfolio-container portfolio-hero-inner">
          <div className="portfolio-hero-copy">
            <p className="portfolio-hero-greeting">Hello, I&apos;m</p>
            <h1 id="hero-title">{displayName}</h1>
            <p className="portfolio-hero-role">{displayRole}</p>
            {about?.shortBio && (
              <p className="portfolio-hero-description">{about.shortBio}</p>
            )}
            <p className="portfolio-hero-description portfolio-hero-focus">
              Focused on creating responsive, user-friendly and clean web interfaces.
            </p>
            <div className="portfolio-hero-actions">
              {projects.length > 0 && (
                <a className="portfolio-button" href="#projects">
                  View my projects <span aria-hidden="true">↗</span>
                </a>
              )}
              <a className="portfolio-button portfolio-button-outline" href="#contact">
                Contact me <span aria-hidden="true">↗</span>
              </a>
            </div>
            {(about?.github || about?.linkedin) && (
              <div className="portfolio-social-links">
                {about.github && (
                  <a href={about.github} target="_blank" rel="noreferrer">
                    GitHub <span aria-hidden="true">↗</span>
                  </a>
                )}
                {about.linkedin && (
                  <a href={about.linkedin} target="_blank" rel="noreferrer">
                    LinkedIn <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="portfolio-hero-visual">
            <div className="portfolio-profile-frame">
              {isPublicImageSource(about?.profileImage) ? (
                <Image
                  src={about.profileImage}
                  alt={`${displayName} profile photo`}
                  fill
                  priority
                  sizes="(max-width: 760px) 82vw, 420px"
                  className="portfolio-profile-image"
                />
              ) : (
                <div className="portfolio-profile-placeholder" aria-hidden="true">
                  <span>{displayName.slice(0, 1).toUpperCase()}</span>
                </div>
              )}
            </div>
            <p className="portfolio-profile-caption">
              {about?.location || displayRole}
            </p>
          </div>
        </div>
      </section>

      <section
        className="portfolio-section portfolio-section-tint"
        id="about"
        aria-labelledby="about-title"
      >
        <div className="portfolio-container portfolio-about-layout">
          <SectionHeading
            number={nextSectionNumber()}
            eyebrow="GET TO KNOW ME"
            title="About me"
            description="A little introduction to my background and interests."
            id="about-title"
          />
          <div className="portfolio-about-copy">
            {aboutUnavailable && (
              <p className="portfolio-data-notice" role="status">
                Profile details are temporarily unavailable.
              </p>
            )}
            {about?.shortBio && (
              <p className="portfolio-about-intro">{about.shortBio}</p>
            )}
            {about?.description && (
              <p className="portfolio-about-description">{about.description}</p>
            )}
            <div className="portfolio-facts">
              {about?.education && (
                <div className="portfolio-fact">
                  <span>Education</span>
                  <strong>{about.education}</strong>
                </div>
              )}
              {about?.location && (
                <div className="portfolio-fact">
                  <span>Based in</span>
                  <strong>{about.location}</strong>
                </div>
              )}
              {about?.email && (
                <div className="portfolio-fact">
                  <span>Email</span>
                  <a href={`mailto:${about.email}`}>{about.email}</a>
                </div>
              )}
            </div>
            <a className="portfolio-inline-link" href="#contact">
              Let&apos;s connect <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      {skills.length > 0 && (
        <section
          className="portfolio-section"
          id="skills"
          aria-labelledby="skills-title"
        >
          <div className="portfolio-container">
            <SectionHeading
              number={nextSectionNumber()}
              eyebrow="MY TECHNICAL EXPERTISE"
              title="Tools & technologies"
              description="Technologies and tools I use while learning and building projects."
              id="skills-title"
            />
            <div className="portfolio-skill-grid">
              {skillGroups.map(([category, items]) => (
                <article className="portfolio-skill-card" key={category}>
                  <h3>{category}</h3>
                  <ul>
                    {items.map((skill) => (
                      <li key={skill._id || skill.name}>
                        <span>{skill.name}</span>
                        {skill.proficiency > 0 && (
                          <span className="portfolio-skill-level">
                            {skill.proficiency}%
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section
          className="portfolio-section portfolio-section-tint"
          id="projects"
          aria-labelledby="projects-title"
        >
          <div className="portfolio-container">
            <SectionHeading
              number={nextSectionNumber()}
              eyebrow="MY WORK"
              title="Featured projects"
              description="A selection of projects from my development journey."
              id="projects-title"
            />
            <div className="portfolio-project-grid">
              {projects.map((project, index) => (
                <article
                  className="portfolio-project-card"
                  key={project._id || project.title}
                >
                  {isPublicImageSource(project.image) && (
                    <div className="portfolio-project-image">
                      <Image
                        src={project.image}
                        alt={`${project.title} project preview`}
                        width={960}
                        height={540}
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="portfolio-project-body">
                    <div className="portfolio-card-overline">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      {project.featured && <span>Featured</span>}
                    </div>
                    <h3>{project.title}</h3>
                    {project.description && <p>{project.description}</p>}
                    {Array.isArray(project.technologies) &&
                      project.technologies.length > 0 && (
                        <ul className="portfolio-tag-list">
                          {project.technologies.map((technology) => (
                            <li key={technology}>{technology}</li>
                          ))}
                        </ul>
                      )}
                    {(project.liveUrl || project.githubUrl) && (
                      <div className="portfolio-project-links">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Live demo <span aria-hidden="true">↗</span>
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Source code <span aria-hidden="true">↗</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section
          className="portfolio-section"
          id="journey"
          aria-labelledby="journey-title"
        >
          <div className="portfolio-container">
            <SectionHeading
              number={nextSectionNumber()}
              eyebrow="MY LEARNING PATH"
              title="My journey"
              description="Education and milestones that have shaped my learning."
              id="journey-title"
            />
            <ol className="portfolio-timeline">
              {education.map((record, index) => (
                <li className="portfolio-timeline-item" key={record._id || index}>
                  <span className="portfolio-timeline-marker" aria-hidden="true" />
                  <article className="portfolio-timeline-card">
                    <div className="portfolio-card-overline">
                      <span>{record.degree}</span>
                      {formatEducationDate(record) && (
                        <span>{formatEducationDate(record)}</span>
                      )}
                    </div>
                    <h3>{record.institution}</h3>
                    {record.fieldOfStudy && <p>{record.fieldOfStudy}</p>}
                    {record.grade && (
                      <p className="portfolio-record-meta">{record.grade}</p>
                    )}
                    {record.description && <p>{record.description}</p>}
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {experiences.length > 0 && (
        <section
          className="portfolio-section portfolio-section-tint"
          id="experience"
          aria-labelledby="experience-title"
        >
          <div className="portfolio-container">
            <SectionHeading
              number={nextSectionNumber()}
              eyebrow="MY PROFESSIONAL PROFILE"
              title="Professional experience"
              description="Experience and contributions managed through my portfolio."
              id="experience-title"
            />
            <div className="portfolio-experience-list">
              {experiences.map((experience) => (
                <article
                  className="portfolio-experience-card"
                  key={experience._id || `${experience.role}-${experience.company}`}
                >
                  <div className="portfolio-experience-date">
                    {formatExperienceDate(experience)}
                  </div>
                  <div>
                    <h3>{experience.role}</h3>
                    <p className="portfolio-experience-company">
                      {experience.company}
                      {experience.location ? ` · ${experience.location}` : ""}
                    </p>
                    {(experience.employmentType || experience.description) && (
                      <p className="portfolio-experience-description">
                        {[experience.employmentType, experience.description]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {resumeDownloadHref && (
        <section
          className="portfolio-section"
          id="resume"
          aria-labelledby="resume-title"
        >
          <div className="portfolio-container portfolio-resume-panel">
            <div>
              <p className="portfolio-eyebrow">MY PROFESSIONAL PROFILE</p>
              <h2 id="resume-title">My resume</h2>
              <p>
                {about?.shortBio || `${displayName} — ${displayRole}`}
              </p>
              {about?.education && (
                <div className="portfolio-resume-detail">
                  <span>Education</span>
                  <strong>{about.education}</strong>
                </div>
              )}
            </div>
            <div className="portfolio-resume-actions">
              <a
                className="portfolio-button"
                href={resumeDownloadHref}
                download="resume.pdf"
              >
                Download resume <span aria-hidden="true">↓</span>
              </a>
              <a
                className="portfolio-button portfolio-button-outline"
                href={resumeViewHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                View resume <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {(metrics.length > 0 || certifications.length > 0) && (
        <section
          className="portfolio-section portfolio-section-tint"
          id="accomplishments"
          aria-labelledby="accomplishments-title"
        >
          <div className="portfolio-container">
            <SectionHeading
              number={nextSectionNumber()}
              eyebrow="MILESTONES & ACHIEVEMENTS"
              title="Accomplishments"
              description="A snapshot of my work and milestones."
              id="accomplishments-title"
            />
            {metrics.length > 0 && (
              <div className="portfolio-stat-grid">
                {metrics.map((metric) => (
                  <article className="portfolio-stat-card" key={metric.label}>
                    <strong>{metric.value}</strong>
                    <span>{metric.label}</span>
                  </article>
                ))}
              </div>
            )}
            {certifications.length > 0 && (
              <div className="portfolio-certification-grid">
                {certifications.map((certification) => (
                  <article
                    className="portfolio-certification-card"
                    key={certification._id || certification.title}
                  >
                    {isPublicImageSource(certification.image) && (
                      <div className="portfolio-certification-image">
                        <Image
                          src={certification.image}
                          alt={`${certification.title} certificate`}
                          width={640}
                          height={400}
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="portfolio-certification-body">
                      <p className="portfolio-eyebrow">
                        {certification.issuer}
                      </p>
                      <h3>{certification.title}</h3>
                      {certification.issueDate && (
                        <p>{certification.issueDate}</p>
                      )}
                      {certification.description && (
                        <p>{certification.description}</p>
                      )}
                      {certification.credentialUrl && (
                        <a
                          className="portfolio-inline-link"
                          href={certification.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View credential <span aria-hidden="true">↗</span>
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section
          className="portfolio-section"
          id="testimonials"
          aria-labelledby="testimonials-title"
        >
          <div className="portfolio-container">
            <SectionHeading
              number={nextSectionNumber()}
              eyebrow="KIND WORDS"
              title="Testimonials"
              description="Feedback shared by people I have worked with."
              id="testimonials-title"
            />
            <div className="portfolio-testimonial-grid">
              {testimonials.map((testimonial) => (
                <article
                  className="portfolio-testimonial-card"
                  key={testimonial._id || testimonial.name}
                >
                  <p className="portfolio-testimonial-rating" aria-label={`${testimonial.rating} out of 5 stars`}>
                    {"★".repeat(Math.max(0, Math.min(5, testimonial.rating || 0)))}
                  </p>
                  <blockquote>{testimonial.message}</blockquote>
                  <div className="portfolio-testimonial-author">
                    {isPublicImageSource(testimonial.image) && (
                      <Image
                        src={testimonial.image}
                        alt=""
                        width={48}
                        height={48}
                        unoptimized
                      />
                    )}
                    <div>
                      <strong>{testimonial.name}</strong>
                      {(testimonial.role || testimonial.company) && (
                        <span>
                          {[testimonial.role, testimonial.company]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        className="portfolio-section portfolio-contact-section"
        id="contact"
        aria-labelledby="contact-title"
      >
        <div className="portfolio-container">
          <SectionHeading
            number={nextSectionNumber()}
            eyebrow="GET IN TOUCH"
            title="Contact me"
            description="Have a project idea or opportunity? I’d love to hear from you."
            id="contact-title"
          />
          <ContactForm email={about?.email || ""} />
        </div>
      </section>

      <footer className="portfolio-footer">
        <div className="portfolio-container">
          <div className="portfolio-footer-main">
            <div className="portfolio-footer-brand">
              <a href="#home" className="portfolio-footer-logo">
                {displayName}
              </a>
              <p>{displayRole}</p>
              {about?.shortBio && <p>{about.shortBio}</p>}
            </div>
            <nav aria-label="Footer navigation">
              <h2>Quick links</h2>
              <ul>
                {navigationLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
            <div>
              <h2>Connect</h2>
              <ul>
                {about?.email && (
                  <li>
                    <a href={`mailto:${about.email}`}>{about.email}</a>
                  </li>
                )}
                {about?.github && (
                  <li>
                    <a href={about.github} target="_blank" rel="noreferrer">
                      GitHub <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                )}
                {about?.linkedin && (
                  <li>
                    <a href={about.linkedin} target="_blank" rel="noreferrer">
                      LinkedIn <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="portfolio-footer-bottom">
            <p>
              © {new Date().getFullYear()} {displayName}. All rights reserved.
            </p>
            <a href="#home">
              Back to top <span aria-hidden="true">↑</span>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
