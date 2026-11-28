import Image from "next/image";
import ContactForm from "./contact-form";
import Navbar from "../components/layout/Navbar";
import { getData } from "../lib/api";

export const dynamic = "force-dynamic";

const socialProfiles = [
  {
    label: "GitHub",
    href: "https://github.com/nisharma346",
    icon: "github",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/nisha-kumari-6a9948377/",
    icon: "linkedin",
  },
];

function ProfileIcon({ type }) {
  if (type === "github") {
    return (
      <svg
        aria-hidden="true"
        className="portfolio-social-icon"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.85 10.91.57.1.78-.25.78-.55v-2.1c-3.19.69-3.86-1.36-3.86-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.67 1.24 3.32.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .96-.31 3.15 1.18a10.94 10.94 0 0 1 5.73 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.77.11 3.06.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.7.41.36.77 1.06.77 2.14v3.18c0 .3.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
      </svg>
    );
  }

  if (type === "linkedin") {
    return (
      <svg
        aria-hidden="true"
        className="portfolio-social-icon"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M22.22 1H1.78C.79 1 0 1.77 0 2.72v18.56c0 .95.79 1.72 1.78 1.72h20.44c.99 0 1.78-.77 1.78-1.72V2.72C24 1.77 23.21 1 22.22 1ZM7.12 20.45H3.56V8.99h3.56v11.46ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm15.11 13.02h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V8.99h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.28Z" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="portfolio-social-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

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

  const footerLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Skills", href: "#skills" },
    { label: "Projects", href: "#projects" },
    { label: "Journey", href: "#journey" },
    { label: "Resume", href: "#resume" },
    { label: "Achievements", href: "#accomplishments" },
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
              I enjoy building real-world web applications that solve practical problems, from healthcare and e-commerce platforms to dynamic portfolio systems, while continuously growing as a full-stack developer.
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
            <div className="portfolio-social-links">
              {socialProfiles.map((profile) => (
                <a
                  href={profile.href}
                  key={profile.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ProfileIcon type={profile.icon} />
                  {profile.label}
                </a>
              ))}
            </div>
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
          <div className="portfolio-about-intro-column">
            <SectionHeading
              number={nextSectionNumber()}
              eyebrow="GET TO KNOW ME"
              title="About me"
              description="A little introduction to my background and interests."
              id="about-title"
            />
            <p className="portfolio-about-summary">
              As a BCA student at Shobhit University, I enjoy building
              real-world web applications that solve practical problems, from
              healthcare and e-commerce platforms to dynamic portfolio systems,
              while continuously growing as a full-stack developer.
            </p>
          </div>
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
            <div className="portfolio-about-social">
              <h3>Connect with me</h3>
              <div className="portfolio-about-social-links">
                {socialProfiles.map((profile) => (
                  <a
                    href={profile.href}
                    key={profile.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ProfileIcon type={profile.icon} />
                    {profile.label}
                  </a>
                ))}
              </div>
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
                        <div className="portfolio-skill-item-heading">
                          <span>{skill.name}</span>
                          <span className="portfolio-skill-level">
                            {skill.proficiency ?? 0}%
                          </span>
                        </div>
                        <div
                          className="portfolio-skill-progress-track"
                          role="progressbar"
                          aria-label={`${skill.name} proficiency`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={skill.proficiency ?? 0}
                        >
                          <span
                            className="portfolio-skill-progress-fill"
                            style={{
                              width: `${skill.proficiency ?? 0}%`,
                            }}
                          />
                        </div>
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
          <div className="portfolio-contact-social">
            <h3>Social profiles</h3>
            <ul>
              {socialProfiles.map((profile) => (
                <li key={profile.label}>
                  <a
                    href={profile.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ProfileIcon type={profile.icon} />
                    <span className="portfolio-contact-profile-copy">
                      <strong>{profile.label}</strong>
                      <span className="portfolio-contact-profile-value">
                        {profile.href.replace(/^https:\/\/(www\.)?/, "")}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
              {about?.email && (
                <li>
                  <a href={`mailto:${about.email}`}>
                    <ProfileIcon type="email" />
                    <span className="portfolio-contact-profile-copy">
                      <strong>Email</strong>
                      <span className="portfolio-contact-profile-value">
                        {about.email}
                      </span>
                    </span>
                  </a>
                </li>
              )}
            </ul>
          </div>
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
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="portfolio-footer-connect">
              <h2>Connect</h2>
              <ul className="portfolio-footer-social-links">
                {about?.email && (
                  <li>
                    <a href={`mailto:${about.email}`}>{about.email}</a>
                  </li>
                )}
                {socialProfiles.map((profile) => (
                  <li key={profile.label}>
                    <a
                      href={profile.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {profile.label} <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
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
