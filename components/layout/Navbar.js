"use client";

import { useEffect, useState } from "react";

export default function Navbar({ links, name, resumeHref }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") setIsMenuOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="portfolio-header">
      <nav className="portfolio-container portfolio-navbar" aria-label="Main navigation">
        <a href="#home" className="portfolio-logo" onClick={closeMenu}>
          {name.split(" ")[0].toUpperCase()}<span>.</span>
        </a>

        <div
          className={`portfolio-nav-links${isMenuOpen ? " is-open" : ""}`}
          id="primary-navigation"
        >
          {links.map((link) => (
            <a href={link.href} key={link.href} onClick={closeMenu}>
              {link.label}
            </a>
          ))}
        </div>

        {resumeHref && (
          <a
            href={resumeHref}
            className="portfolio-nav-resume"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
          >
            Resume <span aria-hidden="true">↗</span>
          </a>
        )}

        <button
          type="button"
          className={`portfolio-nav-toggle${isMenuOpen ? " is-open" : ""}`}
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>
    </header>
  );
}
