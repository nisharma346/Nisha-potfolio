"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createExperience,
  removeExperience,
  updateExperience,
} from "./actions";

const emptyForm = {
  role: "",
  company: "",
  employmentType: "Other",
  location: "",
  startDate: "",
  endDate: "",
  currentlyWorking: false,
  description: "",
  displayOrder: "0",
  isVisible: true,
};

function sortExperiences(experiences) {
  return [...experiences].sort(
    (first, second) =>
      (Number(first.displayOrder) || 0) - (Number(second.displayOrder) || 0)
  );
}

function experienceToForm(experience) {
  return {
    role: experience.role || "",
    company: experience.company || "",
    employmentType: experience.employmentType || "Other",
    location: experience.location || "",
    startDate: experience.startDate || "",
    endDate: experience.endDate || "",
    currentlyWorking: experience.currentlyWorking ?? false,
    description: experience.description || "",
    displayOrder: String(experience.displayOrder ?? 0),
    isVisible: experience.isVisible ?? true,
  };
}

function formatExperiencePayload(form) {
  return {
    role: form.role.trim(),
    company: form.company.trim(),
    employmentType: form.employmentType.trim() || "Other",
    location: form.location.trim(),
    startDate: form.startDate.trim(),
    endDate: form.currentlyWorking ? "" : form.endDate.trim(),
    currentlyWorking: form.currentlyWorking,
    description: form.description.trim(),
    displayOrder: Number(form.displayOrder),
    isVisible: form.isVisible,
  };
}

function ExperienceForm({
  form,
  editing,
  pending,
  onChange,
  onClose,
  onSubmit,
}) {
  return (
    <div
      className="admin-project-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) onClose();
      }}
    >
      <section
        className="admin-project-modal admin-experience-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="experience-form-title"
      >
        <header className="admin-project-modal-header">
          <div>
            <span className="admin-section-kicker">
              {editing ? "UPDATE YOUR EXPERIENCE" : "ADD TO YOUR JOURNEY"}
            </span>
            <h2 id="experience-form-title">
              {editing ? "Edit experience" : "Add experience"}
            </h2>
          </div>
          <button
            type="button"
            className="admin-project-close"
            onClick={onClose}
            disabled={pending}
            aria-label="Close experience form"
          >
            ×
          </button>
        </header>

        <form className="admin-project-form" onSubmit={onSubmit}>
          <div className="admin-project-form-row">
            <label className="admin-project-field">
              <span>Job title / role</span>
              <input
                autoFocus
                required
                value={form.role}
                onChange={(event) => onChange("role", event.target.value)}
                placeholder="e.g. Software Engineer"
              />
            </label>
            <label className="admin-project-field">
              <span>Company</span>
              <input
                required
                value={form.company}
                onChange={(event) => onChange("company", event.target.value)}
                placeholder="Company name"
              />
            </label>
          </div>

          <div className="admin-project-form-row">
            <label className="admin-project-field">
              <span>Employment type</span>
              <input
                value={form.employmentType}
                onChange={(event) =>
                  onChange("employmentType", event.target.value)
                }
                placeholder="e.g. Full-time, Contract, Internship"
              />
            </label>
            <label className="admin-project-field">
              <span>Location</span>
              <input
                value={form.location}
                onChange={(event) => onChange("location", event.target.value)}
                placeholder="City or remote"
              />
            </label>
          </div>

          <div className="admin-project-form-row">
            <label className="admin-project-field">
              <span>Start date</span>
              <input
                value={form.startDate}
                onChange={(event) => onChange("startDate", event.target.value)}
                placeholder="e.g. Jan 2023"
              />
            </label>
            <label className="admin-project-field">
              <span>End date</span>
              <input
                value={form.currentlyWorking ? "" : form.endDate}
                onChange={(event) => onChange("endDate", event.target.value)}
                disabled={form.currentlyWorking}
                placeholder="e.g. Dec 2024"
              />
            </label>
          </div>

          <label className="admin-project-field">
            <span>Description</span>
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) =>
                onChange("description", event.target.value)
              }
              placeholder="Describe this role"
            />
          </label>

          <div className="admin-project-form-row admin-experience-options">
            <label className="admin-project-checkbox">
              <input
                type="checkbox"
                checked={form.currentlyWorking}
                onChange={(event) =>
                  onChange("currentlyWorking", event.target.checked)
                }
              />
              <span>Current position</span>
            </label>
            <label className="admin-project-checkbox">
              <input
                type="checkbox"
                checked={form.isVisible}
                onChange={(event) => onChange("isVisible", event.target.checked)}
              />
              <span>Visible</span>
            </label>
          </div>

          <label className="admin-project-field admin-experience-order-field">
            <span>Display order</span>
            <input
              type="number"
              step="any"
              required
              value={form.displayOrder}
              onChange={(event) =>
                onChange("displayOrder", event.target.value)
              }
            />
          </label>

          <footer className="admin-project-form-actions">
            <button
              type="button"
              className="admin-project-secondary-button"
              onClick={onClose}
              disabled={pending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-project-primary-button"
              disabled={pending}
            >
              {pending
                ? "Saving…"
                : editing
                  ? "Save changes"
                  : "Add experience"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function ExperienceCard({ experience, onEdit, onDelete, deleting }) {
  const dateRange = [
    experience.startDate,
    experience.currentlyWorking
      ? "Present"
      : experience.endDate,
  ]
    .filter(Boolean)
    .join(" – ");

  return (
    <article className="admin-experience-card">
      <div className="admin-experience-card-heading">
        <div>
          <span className="admin-project-order">
            DISPLAY ORDER · {experience.displayOrder ?? 0}
          </span>
          <h2>{experience.role}</h2>
        </div>
        <span
          className={`admin-experience-status${experience.isVisible ? " is-visible" : ""}`}
        >
          {experience.isVisible ? "Visible" : "Hidden"}
        </span>
      </div>

      <p className="admin-experience-company">{experience.company}</p>

      <div className="admin-experience-meta">
        <span>{experience.employmentType || "Other"}</span>
        {experience.location && <span>{experience.location}</span>}
        {dateRange && <span>{dateRange}</span>}
      </div>

      {experience.description && (
        <p className="admin-experience-description">
          {experience.description}
        </p>
      )}

      <footer className="admin-experience-card-actions">
        <button
          type="button"
          className="admin-project-secondary-button"
          onClick={() => onEdit(experience)}
          disabled={deleting}
        >
          Edit
        </button>
        <button
          type="button"
          className="admin-project-delete-button"
          onClick={() => onDelete(experience)}
          disabled={deleting}
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </footer>
    </article>
  );
}

export default function ExperiencesClient({
  experiences: initialExperiences,
  initialError,
}) {
  const router = useRouter();
  const [experiences, setExperiences] = useState(() =>
    sortExperiences(initialExperiences)
  );
  const [loadError, setLoadError] = useState(initialError);
  const [notice, setNotice] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [isRefreshing, startRefresh] = useTransition();

  function openAddForm() {
    setNotice(null);
    setEditingExperience(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  }

  function openEditForm(experience) {
    setNotice(null);
    setEditingExperience(experience);
    setForm(experienceToForm(experience));
    setIsFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setIsFormOpen(false);
    setEditingExperience(null);
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice(null);
    setSaving(true);

    try {
      const payload = formatExperiencePayload(form);
      const response = editingExperience
        ? await updateExperience(editingExperience._id, payload)
        : await createExperience(payload);
      const savedExperience = response.experience;

      setExperiences((current) =>
        sortExperiences(
          editingExperience
            ? current.map((experience) =>
                experience._id === savedExperience._id
                  ? savedExperience
                  : experience
              )
            : [...current, savedExperience]
        )
      );
      setLoadError("");
      setIsFormOpen(false);
      setEditingExperience(null);
      setNotice({
        type: "success",
        message: response.message || "Experience saved successfully.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.message === "BACKEND_UNAVAILABLE"
            ? "The backend is unavailable. Please try again."
            : error.message || "Unable to save the experience record.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(experience) {
    if (
      !window.confirm(
        `Delete "${experience.role}" at "${experience.company}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setNotice(null);
    setDeletingId(experience._id);

    try {
      const response = await removeExperience(experience._id);
      setExperiences((current) =>
        current.filter((item) => item._id !== experience._id)
      );
      setNotice({
        type: "success",
        message: response.message || "Experience record deleted successfully.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.message === "BACKEND_UNAVAILABLE"
            ? "The backend is unavailable. Please try again."
            : error.message || "Unable to delete the experience record.",
      });
    } finally {
      setDeletingId("");
    }
  }

  return (
    <section
      className="admin-experiences"
      aria-labelledby="experiences-title"
    >
      <header className="admin-projects-heading">
        <div>
          <span className="admin-eyebrow">PORTFOLIO CONTENT</span>
          <h1 id="experiences-title">
            Experience<span>.</span>
          </h1>
          <p>Manage the roles and milestones in your professional journey.</p>
        </div>
        <button
          type="button"
          className="admin-project-primary-button"
          onClick={openAddForm}
        >
          <span aria-hidden="true">+</span> Add experience
        </button>
      </header>

      <p className="admin-experience-note">
        Hidden experience records remain available here for editing and publishing.
      </p>

      {notice && (
        <div
          className={`admin-project-notice is-${notice.type}`}
          role={notice.type === "error" ? "alert" : "status"}
        >
          <span aria-hidden="true">{notice.type === "error" ? "!" : "✓"}</span>
          {notice.message}
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}

      {loadError ? (
        <div className="admin-project-empty">
          <span className="admin-section-kicker">UNABLE TO LOAD</span>
          <h2>Experience records aren&apos;t available right now.</h2>
          <p>{loadError}</p>
          <button
            type="button"
            className="admin-project-secondary-button"
            disabled={isRefreshing}
            onClick={() => startRefresh(() => router.refresh())}
          >
            {isRefreshing ? "Refreshing…" : "Try again"}
          </button>
        </div>
      ) : experiences.length === 0 ? (
        <div className="admin-project-empty">
          <span className="admin-project-empty-mark" aria-hidden="true">
            N.
          </span>
          <span className="admin-section-kicker">YOUR JOURNEY</span>
          <h2>No experience records yet</h2>
          <p>Add an experience record to share your professional journey.</p>
          <button
            type="button"
            className="admin-project-primary-button"
            onClick={openAddForm}
          >
            Add your first experience
          </button>
        </div>
      ) : (
        <div className="admin-experience-grid">
          {experiences.map((experience) => (
            <ExperienceCard
              key={experience._id}
              experience={experience}
              onEdit={openEditForm}
              onDelete={handleDelete}
              deleting={deletingId === experience._id}
            />
          ))}
        </div>
      )}

      {isFormOpen && (
        <ExperienceForm
          form={form}
          editing={Boolean(editingExperience)}
          pending={saving}
          onChange={updateField}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}
