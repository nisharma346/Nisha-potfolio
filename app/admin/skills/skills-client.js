"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSkill, removeSkill, updateSkill } from "./actions";

const emptyForm = {
  name: "",
  category: "Other",
  proficiency: "0",
  displayOrder: "0",
};

function sortSkills(skills) {
  return [...skills].sort(
    (first, second) =>
      (Number(first.displayOrder) || 0) - (Number(second.displayOrder) || 0)
  );
}

function skillToForm(skill) {
  return {
    name: skill.name || "",
    category: skill.category || "Other",
    proficiency: String(skill.proficiency ?? 0),
    displayOrder: String(skill.displayOrder ?? 0),
  };
}

function formatSkillPayload(form) {
  return {
    name: form.name.trim(),
    category: form.category.trim() || "Other",
    proficiency: Number(form.proficiency),
    displayOrder: Number(form.displayOrder),
  };
}

function SkillForm({ form, editing, pending, onChange, onClose, onSubmit }) {
  return (
    <div
      className="admin-project-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) onClose();
      }}
    >
      <section
        className="admin-project-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="skill-form-title"
      >
        <header className="admin-project-modal-header">
          <div>
            <span className="admin-section-kicker">
              {editing ? "UPDATE YOUR TOOLKIT" : "ADD TO YOUR TOOLKIT"}
            </span>
            <h2 id="skill-form-title">
              {editing ? "Edit skill" : "Add a skill"}
            </h2>
          </div>
          <button
            type="button"
            className="admin-project-close"
            onClick={onClose}
            disabled={pending}
            aria-label="Close skill form"
          >
            ×
          </button>
        </header>

        <form className="admin-project-form" onSubmit={onSubmit}>
          <label className="admin-project-field">
            <span>Skill name</span>
            <input
              autoFocus
              required
              value={form.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="e.g. React"
            />
          </label>

          <div className="admin-project-form-row">
            <label className="admin-project-field">
              <span>Category</span>
              <input
                value={form.category}
                onChange={(event) => onChange("category", event.target.value)}
                placeholder="Other"
              />
            </label>
            <label className="admin-project-field">
              <span>Proficiency (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                required
                value={form.proficiency}
                onChange={(event) =>
                  onChange("proficiency", event.target.value)
                }
              />
            </label>
          </div>

          <label className="admin-project-field admin-skill-order-field">
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
                  : "Add skill"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function SkillCard({ skill, onEdit, onDelete, deleting }) {
  return (
    <article className="admin-skill-card">
      <div className="admin-skill-card-heading">
        <div>
          <span className="admin-project-order">
            DISPLAY ORDER · {skill.displayOrder ?? 0}
          </span>
          <h2>{skill.name}</h2>
        </div>
        <span className="admin-skill-category">{skill.category || "Other"}</span>
      </div>

      <div className="admin-skill-details">
        <span>Proficiency</span>
        <strong>
          {skill.proficiency ?? 0}
          <span aria-hidden="true">%</span>
        </strong>
      </div>

      <footer className="admin-skill-card-actions">
        <button
          type="button"
          className="admin-project-secondary-button"
          onClick={() => onEdit(skill)}
          disabled={deleting}
        >
          Edit
        </button>
        <button
          type="button"
          className="admin-project-delete-button"
          onClick={() => onDelete(skill)}
          disabled={deleting}
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </footer>
    </article>
  );
}

export default function SkillsClient({ skills: initialSkills, initialError }) {
  const router = useRouter();
  const [skills, setSkills] = useState(() => sortSkills(initialSkills));
  const [loadError, setLoadError] = useState(initialError);
  const [notice, setNotice] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [isRefreshing, startRefresh] = useTransition();

  function openAddForm() {
    setNotice(null);
    setEditingSkill(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  }

  function openEditForm(skill) {
    setNotice(null);
    setEditingSkill(skill);
    setForm(skillToForm(skill));
    setIsFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setIsFormOpen(false);
    setEditingSkill(null);
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice(null);
    setSaving(true);

    try {
      const payload = formatSkillPayload(form);
      const response = editingSkill
        ? await updateSkill(editingSkill._id, payload)
        : await createSkill(payload);
      const savedSkill = response.skill;

      setSkills((current) =>
        sortSkills(
          editingSkill
            ? current.map((skill) =>
                skill._id === savedSkill._id ? savedSkill : skill
              )
            : [...current, savedSkill]
        )
      );
      setLoadError("");
      setIsFormOpen(false);
      setEditingSkill(null);
      setNotice({
        type: "success",
        message: response.message || "Skill saved successfully.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.message === "BACKEND_UNAVAILABLE"
            ? "The backend is unavailable. Please try again."
            : error.message || "Unable to save the skill.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(skill) {
    if (
      !window.confirm(
        `Delete "${skill.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setNotice(null);
    setDeletingId(skill._id);

    try {
      const response = await removeSkill(skill._id);
      setSkills((current) =>
        current.filter((item) => item._id !== skill._id)
      );
      setNotice({
        type: "success",
        message: response.message || "Skill deleted successfully.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.message === "BACKEND_UNAVAILABLE"
            ? "The backend is unavailable. Please try again."
            : error.message || "Unable to delete the skill.",
      });
    } finally {
      setDeletingId("");
    }
  }

  return (
    <section className="admin-skills" aria-labelledby="skills-title">
      <header className="admin-projects-heading">
        <div>
          <span className="admin-eyebrow">PORTFOLIO CONTENT</span>
          <h1 id="skills-title">
            Skills<span>.</span>
          </h1>
          <p>Manage the skills featured across your portfolio.</p>
        </div>
        <button
          type="button"
          className="admin-project-primary-button"
          onClick={openAddForm}
        >
          <span aria-hidden="true">+</span> Add skill
        </button>
      </header>

      <p className="admin-skills-note">
        Hidden skills remain available here for editing and publishing.
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
          <h2>Skills aren&apos;t available right now.</h2>
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
      ) : skills.length === 0 ? (
        <div className="admin-project-empty">
          <span className="admin-project-empty-mark" aria-hidden="true">
            N.
          </span>
          <span className="admin-section-kicker">A FRESH TOOLKIT</span>
          <h2>No skills yet</h2>
          <p>Add your first skill to show the technologies in your toolkit.</p>
          <button
            type="button"
            className="admin-project-primary-button"
            onClick={openAddForm}
          >
            Add your first skill
          </button>
        </div>
      ) : (
        <div className="admin-skill-grid">
          {skills.map((skill) => (
            <SkillCard
              key={skill._id}
              skill={skill}
              onEdit={openEditForm}
              onDelete={handleDelete}
              deleting={deletingId === skill._id}
            />
          ))}
        </div>
      )}

      {isFormOpen && (
        <SkillForm
          form={form}
          editing={Boolean(editingSkill)}
          pending={saving}
          onChange={updateField}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}
