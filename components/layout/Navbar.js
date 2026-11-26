"use client";

import { useEffect, useState } from "react";

export default function Navbar({ monogram }) {
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
    <nav className="navbar" aria-label="Main navigation">
      <a href="#home" className="logo" onClick={closeMenu}>
        {monogram}<span>.</span>
      </a>

      <div
        className={`nav-links${isMenuOpen ? " is-open" : ""}`}
        id="primary-navigation"
      >
        <a href="#about" onClick={closeMenu}>About</a>
        <a href="#skills" onClick={closeMenu}>Skills</a>
        <a href="#projects" onClick={closeMenu}>Projects</a>
        <a href="#contact" onClick={closeMenu}>Contact</a>
      </div>

      <a href="#contact" className="nav-button" onClick={closeMenu}>
        Let&apos;s Talk <span>↗</span>
      </a>

      <button
        type="button"
        className={`nav-toggle${isMenuOpen ? " is-open" : ""}`}
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
  );
}
