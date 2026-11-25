"use client";

import { useState } from "react";
import { postData } from "../lib/api";

const emptyForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactForm({ email }) {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setStatus(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setStatus(null);

    try {
      await postData("/api/contact", form);
      setForm(emptyForm);
      setStatus({
        type: "success",
        message: "Thanks for reaching out. Your message has been sent.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.message === "BACKEND_UNAVAILABLE"
            ? "The contact service is unavailable right now. Please try again later."
            : error.message || "Your message could not be sent. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="contact-form-wrapper">
      <form className="contact-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            autoComplete="name"
            name="name"
            onChange={handleChange}
            required
            value={form.name}
          />
        </label>

        <label>
          Email
          <input
            autoComplete="email"
            name="email"
            onChange={handleChange}
            required
            type="email"
            value={form.email}
          />
        </label>

        <label className="contact-form-full">
          Subject
          <input
            name="subject"
            onChange={handleChange}
            required
            value={form.subject}
          />
        </label>

        <label className="contact-form-full">
          Message
          <textarea
            name="message"
            onChange={handleChange}
            required
            rows={5}
            value={form.message}
          />
        </label>

        <div className="contact-form-full contact-form-submit">
          <button
            className="primary-button"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Sending…" : "Send message"} <span>↗</span>
          </button>
        </div>
      </form>

      <p
        aria-live="polite"
        className={`contact-form-status${status ? ` is-${status.type}` : ""}`}
        role={status?.type === "error" ? "alert" : "status"}
      >
        {status?.message || ""}
      </p>

      {email && (
        <a className="contact-email-link" href={`mailto:${email}`}>
          Or email me at {email}
        </a>
      )}
    </div>
  );
}
