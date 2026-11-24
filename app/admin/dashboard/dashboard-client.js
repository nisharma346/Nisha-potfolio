"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navigation = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "grid" },
  { label: "Projects", href: "/admin/projects", icon: "layers" },
  { label: "Skills", href: "/admin/skills", icon: "spark" },
  { label: "About", href: "/admin/about", icon: "user" },
  { label: "Education", href: "/admin/education", icon: "book" },
  { label: "Experience", href: "/admin/experiences", icon: "briefcase" },
  { label: "Testimonials", href: "/admin/testimonials", icon: "quote" },
  { label: "Certifications", href: "/admin/certifications", icon: "award" },
  { label: "Contact Messages", href: "/admin/messages", icon: "mail" },
];

const metrics = [
  { key: "projects", label: "Total Projects", icon: "layers", tone: "sand" },
  { key: "skills", label: "Total Skills", icon: "spark", tone: "sage" },
  {
    key: "education",
    label: "Total Education Entries",
    icon: "book",
    tone: "rose",
  },
  {
    key: "certifications",
    label: "Total Certifications",
    icon: "award",
    tone: "gold",
  },
  {
    key: "testimonials",
    label: "Total Testimonials",
    icon: "quote",
    tone: "blue",
  },
];

function Icon({ name, size = 18 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    grid: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" />
        <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
        <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18m-11 0v2h4v-2" />
      </>
    ),
    quote: (
      <>
        <path d="M10 11H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v7a5 5 0 0 1-5 5M21 11h-5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v7a5 5 0 0 1-5 5" />
      </>
    ),
    award: (
      <>
        <circle cx="12" cy="8" r="5" />
        <path d="m8.5 12-1 9 4.5-2.5 4.5 2.5-1-9" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    external: (
      <>
        <path d="M14 4h6v6m0-6-9 9" />
        <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5m5 5H3" />
        <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function Sidebar({ pathname, isOpen, onNavigate, onLogout, isLoggingOut }) {
  return (
    <>
      {isOpen && (
        <button
          className="admin-sidebar-overlay"
          aria-label="Close navigation menu"
          onClick={onNavigate}
        />
      )}
      <aside className={`admin-sidebar${isOpen ? " is-open" : ""}`}>
        <Link
          href="/admin/dashboard"
          className="admin-brand"
          onClick={onNavigate}
        >
          <span className="admin-brand-mark">N.</span>
          <span className="admin-brand-copy">
            <strong>PORTFOLIO</strong>
            <small>ADMIN STUDIO</small>
          </span>
        </Link>

        <div className="admin-nav-label">WORKSPACE</div>
        <nav className="admin-nav" aria-label="Admin navigation">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-link${isActive ? " is-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
                onClick={onNavigate}
              >
                <Icon name={item.icon} size={17} />
                <span>{item.label}</span>
                {isActive && <span className="admin-nav-indicator" />}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          <Link
            href="/"
            className="admin-portfolio-link"
            target="_blank"
            rel="noreferrer"
            onClick={onNavigate}
          >
            <Icon name="external" size={17} />
            <span>View Portfolio</span>
          </Link>

          <div className="admin-profile">
            <div className="admin-avatar" aria-hidden="true">
              N
            </div>
            <div className="admin-profile-copy">
              <strong>Portfolio Admin</strong>
              <span>Administrator</span>
            </div>
            <button
              type="button"
              className="admin-logout-button"
              onClick={onLogout}
              disabled={isLoggingOut}
              aria-label="Log out"
              title="Log out"
            >
              <Icon name="logout" size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function MetricCard({ metric, value, available }) {
  return (
    <article className="admin-metric-card">
      <div className={`admin-metric-icon tone-${metric.tone}`}>
        <Icon name={metric.icon} size={19} />
      </div>
      <div className="admin-metric-value">
        {available ? value.toLocaleString() : "—"}
      </div>
      <div className="admin-metric-label">{metric.label}</div>
      {!available && (
        <span className="admin-metric-note">Temporarily unavailable</span>
      )}
    </article>
  );
}

export default function AdminDashboard({
  collections = {},
  activity = [],
  pageTitle = "Dashboard",
  children,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    setLogoutError("");
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      const data = await response.json();

      if (!response.ok || data.success !== true) {
        throw new Error(data.message || "Unable to log out. Please try again.");
      }

      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      setLogoutError(error.message || "Unable to log out. Please try again.");
      setIsLoggingOut(false);
    }
  }

  const failedCollections = Object.values(collections).filter(
    (collection) => !collection.available
  ).length;

  return (
    <div className="admin-dashboard">
      <Sidebar
        pathname={pathname}
        isOpen={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      <main className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-menu-button"
            aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            <Icon name={sidebarOpen ? "close" : "menu"} size={20} />
          </button>
          <div className="admin-topbar-context">
            <span>ADMINISTRATION</span>
            <span className="admin-topbar-divider">/</span>
            <strong>{pageTitle}</strong>
          </div>
          <div className="admin-topbar-profile">
            <span className="admin-topbar-greeting">Portfolio workspace</span>
            <span className="admin-topbar-avatar">N</span>
          </div>
        </header>

        <div className="admin-content">
          {logoutError && (
            <div className="admin-inline-error" role="alert">
              {logoutError}
            </div>
          )}

          {children ?? (
            <>
              <section className="admin-welcome">
                <div>
                  <p className="admin-eyebrow">YOUR PORTFOLIO, AT A GLANCE</p>
                  <h1>
                    Good to see you<span>.</span>
                  </h1>
                  <p className="admin-welcome-copy">
                    Here&apos;s what&apos;s happening across your portfolio today.
                  </p>
                </div>
                <Link
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="admin-view-button"
                >
                  View live site <Icon name="arrow" size={16} />
                </Link>
              </section>

              {failedCollections > 0 && (
                <div className="admin-data-notice" role="status">
                  Some portfolio totals could not be loaded. Available data is
                  shown below; unavailable counts are marked with a dash.
                </div>
              )}

              <section
                className="admin-overview"
                aria-labelledby="overview-title"
              >
                <div className="admin-section-heading">
                  <div>
                    <span className="admin-section-kicker">OVERVIEW</span>
                    <h2 id="overview-title">Portfolio content</h2>
                  </div>
                  <span className="admin-section-caption">
                    Live collection totals
                  </span>
                </div>
                <div className="admin-metric-grid">
                  {metrics.map((metric) => (
                    <MetricCard
                      key={metric.key}
                      metric={metric}
                      value={collections[metric.key].count}
                      available={collections[metric.key].available}
                    />
                  ))}
                </div>
                <p className="admin-data-caption">
                  Totals reflect records returned by the portfolio APIs; hidden
                  records are excluded by APIs that filter unpublished content.
                </p>
              </section>

              <section
                className="admin-activity-panel"
                aria-labelledby="activity-title"
              >
                <div className="admin-section-heading admin-activity-heading">
                  <div>
                    <span className="admin-section-kicker">LATEST UPDATES</span>
                    <h2 id="activity-title">Recent activity</h2>
                  </div>
                  <span className="admin-activity-period">
                    <Icon name="clock" size={15} />
                    Latest records
                  </span>
                </div>

                {activity.length > 0 ? (
                  <div className="admin-activity-list">
                    {activity.map((item) => (
                      <article className="admin-activity-item" key={item.id}>
                        <span
                          className="admin-activity-marker"
                          aria-hidden="true"
                        />
                        <div className="admin-activity-copy">
                          <span className="admin-activity-type">
                            {item.type}
                          </span>
                          <h3>{item.title}</h3>
                          {item.detail && <p>{item.detail}</p>}
                        </div>
                        <time className="admin-activity-date">
                          {item.date}
                        </time>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="admin-activity-empty">
                    {failedCollections === Object.keys(collections).length
                      ? "Recent records could not be loaded right now."
                      : failedCollections > 0
                        ? "Recent activity is limited because some records could not be loaded."
                        : "No portfolio records are available yet."}
                  </div>
                )}
              </section>

            </>
          )}

          <footer className="admin-footer">
            <span>Thoughtfully managing your next chapter.</span>
            <span>N. <span aria-hidden="true">·</span> PORTFOLIO ADMIN</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
