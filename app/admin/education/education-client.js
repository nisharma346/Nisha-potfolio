"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createEducation,
  removeEducation,
  updateEducation,
} from "./actions";

const emptyForm = {
  degree: "",
  institution: "",
  fieldOfStudy: "",
  startYear: "",
  endYear: "",
  grade: "",
  description: "",
  displayOrder: "0",
  isVisible: true,
};

function sortEducation(records) {
  return [...records].sort(
    (first, second) =>
      (Number(first.displayOrder) || 0) - (Number(second.displayOrder) || 0)
  );
}

function educationToForm(record) {
  return {
    degree: record.degree || "",
    institution: record.institution || "",
    fieldOfStudy: record.fieldOfStudy || "",
    startYear: record.startYear || "",
    endYear: record.endYear || "",
    grade: record.grade || "",
    description: record.description || "",
    displayOrder: String(record.displayOrder ?? 0),
    isVisible: record.isVisible ?? true,
  };
}

function formatEducationPayload(form) {
  return {
    degree: form.degree.trim(),
    institution: form.institution.trim(),
    fieldOfStudy: form.fieldOfStudy.trim(),
    startYear: form.startYear.trim(),
    endYear: form.endYear.trim(),
    grade: form.grade.trim(),
    description: form.description.trim(),
    displayOrder: Number(form.displayOrder),
    isVisible: form.isVisible,
  };
}

function EducationForm({
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
        className="admin-project-modal admin-education-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="education-form-title"
      >
        <header className="admin-project-modal-header">
          <div>
            <span className="admin-section-kicker">
              {editing ? "UPDATE YOUR EDUCATION" : "ADD TO YOUR JOURNEY"}
            </span>
            <h2 id="education-form-title">
              {editing ? "Edit education" : "Add education"}
            </h2>
          </div>
          <button
            type="button"
            className="admin-project-close"
            onClick={onClose}
            disabled={pending}
            aria-label="Close education form"
          >
            ×
          </button>
        </header>

        <form className="admin-project-form" onSubmit={onSubmit}>
          <div className="admin-project-form-row">
            <label className="admin-project-field">
              <span>Degree</span>
              <input
                autoFocus
                required
                value={form.degree}
                onChange={(event) => onChange("degree", event.target.value)}
                placeholder="e.g. Bachelor of Computer Applications"
              />
            </label>
            <label className="admin-project-field">
              <span>Institution</span>
              <input
                required
                value={form.institution}
                onChange={(event) =>
                  onChange("institution", event.target.value)
                }
                placeholder="Institution name"
              />
            </label>
          </div>

          <label className="admin-project-field">
            <span>Field of study</span>
            <input
              value={form.fieldOfStudy}
              onChange={(event) =>
                onChange("fieldOfStudy", event.target.value)
              }
              placeholder="e.g. Computer Applications"
            />
          </label>

          <div className="admin-project-form-row">
            <label className="admin-project-field">
              <span>Start year</span>
              <input
                value={form.startYear}
                onChange={(event) => onChange("startYear", event.target.value)}
                placeholder="e.g. 2024"
              />
            </label>
            <label className="admin-project-field">
              <span>End year</span>
              <input
                value={form.endYear}
                onChange={(event) => onChange("endYear", event.target.value)}
                placeholder="e.g. 2028 or Present"
              />
            </label>
            <label className="admin-project-field">
              <span>Grade</span>
              <input
                value={form.grade}
                onChange={(event) => onChange("grade", event.target.value)}
                placeholder="Optional"
              />
            </label>
            <label className="admin-project-field admin-education-order-field">
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
          </div>

          <label className="admin-project-field">
            <span>Description</span>
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) =>
                onChange("description", event.target.value)
              }
              placeholder="Optional details about this education record"
            />
          </label>

          <label className="admin-project-checkbox">
            <input
              type="checkbox"
              checked={form.isVisible}
              onChange={(event) => onChange("isVisible", event.target.checked)}
            />
            <span>Visible</span>
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
                  : "Add education"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function EducationCard({ record, onEdit, onDelete, deleting }) {
  const yearRange = [record.startYear, record.endYear].filter(Boolean).join(" – ");

  return (
    <article className="admin-education-card">
      <div className="admin-education-card-heading">
        <div>
          <span className="admin-project-order">
            DISPLAY ORDER · {record.displayOrder ?? 0}
          </span>
          <h2>{record.degree}</h2>
        </div>
        <span
          className={`admin-education-status${record.isVisible ? " is-visible" : ""}`}
        >
          {record.isVisible ? "Visible" : "Hidden"}
        </span>
      </div>

      <p className="admin-education-institution">{record.institution}</p>

      <dl className="admin-education-details">
        {record.fieldOfStudy && (
          <div>
            <dt>Field of study</dt>
            <dd>{record.fieldOfStudy}</dd>
          </div>
        )}
        {yearRange && (
          <div>
            <dt>Years</dt>
            <dd>{yearRange}</dd>
          </div>
        )}
        {record.grade && (
          <div>
            <dt>Grade</dt>
            <dd>{record.grade}</dd>
          </div>
        )}
      </dl>

      {record.description && (
        <p className="admin-education-description">{record.description}</p>
      )}

      <footer className="admin-education-card-actions">
        <button
          type="button"
          className="admin-project-secondary-button"
          onClick={() => onEdit(record)}
          disabled={deleting}
        >
          Edit
        </button>
        <button
          type="button"
          className="admin-project-delete-button"
          onClick={() => onDelete(record)}
          disabled={deleting}
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </footer>
    </article>
  );
}

export default function EducationClient({
  education: initialEducation,
  initialError,
}) {
  const router = useRouter();
  const [education, setEducation] = useState(() =>
    sortEducation(initialEducation)
  );
  const [loadError, setLoadError] = useState(initialError);
  const [notice, setNotice] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [isRefreshing, startRefresh] = useTransition();

  function openAddForm() {
    setNotice(null);
    setEditingEducation(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  }

  function openEditForm(record) {
    setNotice(null);
    setEditingEducation(record);
    setForm(educationToForm(record));
    setIsFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setIsFormOpen(false);
    setEditingEducation(null);
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice(null);
    setSaving(true);

    try {
      const payload = formatEducationPayload(form);
      const response = editingEducation
        ? await updateEducation(editingEducation._id, payload)
        : await createEducation(payload);
      const savedEducation = response.education;

      setEducation((current) =>
        sortEducation(
          editingEducation
            ? current.map((record) =>
                record._id === savedEducation._id ? savedEducation : record
              )
            : [...current, savedEducation]
        )
      );
      setLoadError("");
      setIsFormOpen(false);
      setEditingEducation(null);
      setNotice({
        type: "success",
        message: response.message || "Education saved successfully.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.message === "BACKEND_UNAVAILABLE"
            ? "The backend is unavailable. Please try again."
            : error.message || "Unable to save the education record.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(record) {
    if (
      !window.confirm(
        `Delete "${record.degree}" at "${record.institution}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setNotice(null);
    setDeletingId(record._id);

    try {
      const response = await removeEducation(record._id);
      setEducation((current) =>
        current.filter((item) => item._id !== record._id)
      );
      setNotice({
        type: "success",
        message: response.message || "Education record deleted successfully.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.message === "BACKEND_UNAVAILABLE"
            ? "The backend is unavailable. Please try again."
            : error.message || "Unable to delete the education record.",
      });
    } finally {
      setDeletingId("");
    }
  }

  return (
    <section className="admin-education" aria-labelledby="education-title">
      <header className="admin-projects-heading">
        <div>
          <span className="admin-eyebrow">PORTFOLIO CONTENT</span>
          <h1 id="education-title">
            Education<span>.</span>
          </h1>
          <p>Manage your academic background and milestones.</p>
        </div>
        <button
          type="button"
          className="admin-project-primary-button"
          onClick={openAddForm}
        >
          <span aria-hidden="true">+</span> Add education
        </button>
      </header>

      <p className="admin-education-note">
        Hidden education records remain available here for editing and publishing.
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
          <h2>Education records aren&apos;t available right now.</h2>
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
      ) : education.length === 0 ? (
        <div className="admin-project-empty">
          <span className="admin-project-empty-mark" aria-hidden="true">
            N.
          </span>
          <span className="admin-section-kicker">YOUR JOURNEY</span>
          <h2>No education records yet</h2>
          <p>Add your first education record to share your academic journey.</p>
          <button
            type="button"
            className="admin-project-primary-button"
            onClick={openAddForm}
          >
            Add your first record
          </button>
        </div>
      ) : (
        <div className="admin-education-grid">
          {education.map((record) => (
            <EducationCard
              key={record._id}
              record={record}
              onEdit={openEditForm}
              onDelete={handleDelete}
              deleting={deletingId === record._id}
            />
          ))}
        </div>
      )}

      {isFormOpen && (
        <EducationForm
          form={form}
          editing={Boolean(editingEducation)}
          pending={saving}
          onChange={updateField}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}
