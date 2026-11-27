"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProject, removeProject, updateProject } from "./actions";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const emptyForm = {
  title: "",
  description: "",
  technologies: "",
  image: "",
  liveUrl: "",
  githubUrl: "",
  featured: false,
  displayOrder: "0",
};

function projectToForm(project) {
  return {
    title: project.title || "",
    description: project.description || "",
    technologies: Array.isArray(project.technologies)
      ? project.technologies.join(", ")
      : "",
    image: project.image || "",
    liveUrl: project.liveUrl || "",
    githubUrl: project.githubUrl || "",
    featured: Boolean(project.featured),
    displayOrder: String(project.displayOrder ?? 0),
  };
}

function sortProjects(projects) {
  return [...projects].sort(
    (first, second) =>
      (Number(first.displayOrder) || 0) - (Number(second.displayOrder) || 0)
  );
}

function formatProjectPayload(form) {
  return {
    ...form,
    title: form.title.trim(),
    description: form.description.trim(),
    technologies: form.technologies
      .split(",")
      .map((technology) => technology.trim())
      .filter(Boolean),
    image: form.image.trim(),
    liveUrl: form.liveUrl.trim(),
    githubUrl: form.githubUrl.trim(),
    displayOrder: Number(form.displayOrder),
  };
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

async function uploadProjectImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  let response;
  try {
    response = await fetch("/api/admin/projects/upload-image", {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error("Image upload failed because the server is unavailable.");
  }

  let responseBody;
  try {
    responseBody = await response.text();
  } catch {
    throw new Error("The upload service response could not be read.");
  }

  let data;
  try {
    data = JSON.parse(responseBody);
  } catch {
    throw new Error(
      `The upload endpoint returned a non-JSON response (HTTP ${response.status}).`
    );
  }

  if (
    !response.ok ||
    data?.success !== true ||
    typeof data?.imageUrl !== "string"
  ) {
    throw new Error(data?.message || "Unable to upload the project image.");
  }

  return data.imageUrl;
}

function ProjectForm({
  form,
  imageFile,
  formError,
  editing,
  pending,
  uploadingImage,
  onChange,
  onClearFormError,
  onImageFileChange,
  onClose,
  onSubmit,
}) {
  const [imagePreview, setImagePreview] = useState("");
  const [imageFileError, setImageFileError] = useState("");

  useEffect(() => {
    if (!imageFile || !imagePreview) return undefined;
    return () => URL.revokeObjectURL(imagePreview);
  }, [imageFile, imagePreview]);

  function handleImageSelection(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setImageFileError("Choose a JPG, JPEG, PNG, or WEBP image.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImageFileError("Image files must be 5 MB or smaller.");
      return;
    }

    setImageFileError("");
    onClearFormError();
    setImagePreview(URL.createObjectURL(file));
    onImageFileChange(file);
  }

  const previewSource = imageFile
    ? imagePreview
    : isPublicImageSource(form.image)
      ? form.image
      : "";

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
        aria-labelledby="project-form-title"
      >
        <header className="admin-project-modal-header">
          <div>
            <span className="admin-section-kicker">
              {editing ? "UPDATE YOUR WORK" : "ADD TO YOUR PORTFOLIO"}
            </span>
            <h2 id="project-form-title">
              {editing ? "Edit project" : "Add a project"}
            </h2>
          </div>
          <button
            type="button"
            className="admin-project-close"
            onClick={onClose}
            disabled={pending}
            aria-label="Close project form"
          >
            ×
          </button>
        </header>

        <form
          className="admin-project-form"
          onSubmit={(event) => {
            if (imageFileError) {
              event.preventDefault();
              return;
            }
            onSubmit(event);
          }}
        >
          <label className="admin-project-field">
            <span>Title</span>
            <input
              autoFocus
              required
              maxLength={120}
              value={form.title}
              onChange={(event) => onChange("title", event.target.value)}
              placeholder="Project name"
            />
          </label>

          <label className="admin-project-field">
            <span>Description</span>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(event) =>
                onChange("description", event.target.value)
              }
              placeholder="What does this project do?"
            />
          </label>

          <label className="admin-project-field">
            <span>Technologies</span>
            <input
              value={form.technologies}
              onChange={(event) =>
                onChange("technologies", event.target.value)
              }
              placeholder="React, Node.js, MongoDB"
            />
            <small>Separate technologies with commas.</small>
          </label>

          <div className="admin-project-field">
            <span>Upload Image</span>
            <div className="admin-project-upload-row">
              <div className="admin-project-upload-preview">
                {previewSource ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewSource}
                    alt={`${form.title || "Project"} image preview`}
                  />
                ) : (
                  <span>Project preview</span>
                )}
              </div>
              <div className="admin-project-upload-controls">
                <label className="admin-project-upload-control">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={handleImageSelection}
                    disabled={pending}
                    aria-label="Choose a project image"
                  />
                  <span>Choose File</span>
                </label>
                {imageFile && (
                  <button
                    type="button"
                    className="admin-project-clear-upload"
                    onClick={() => {
                      onImageFileChange(null);
                      setImagePreview("");
                      setImageFileError("");
                      onClearFormError();
                    }}
                    disabled={pending}
                  >
                    Remove selected image
                  </button>
                )}
                <small>
                  {imageFile
                    ? imageFile.name
                    : "JPG, JPEG, PNG, or WEBP. Maximum 5 MB."}
                </small>
                {uploadingImage && (
                  <small role="status" aria-live="polite">
                    Uploading image…
                  </small>
                )}
                {imageFileError && (
                  <small className="admin-project-upload-error" role="alert">
                    {imageFileError}
                  </small>
                )}
              </div>
            </div>
          </div>

          {formError && (
            <p className="admin-project-form-error" role="alert">
              {formError}
            </p>
          )}

          <div className="admin-project-form-row">
            <label className="admin-project-field">
              <span>Live URL</span>
              <input
                type="url"
                value={form.liveUrl}
                onChange={(event) => onChange("liveUrl", event.target.value)}
                placeholder="https://example.com"
              />
            </label>
            <label className="admin-project-field">
              <span>GitHub URL</span>
              <input
                type="url"
                value={form.githubUrl}
                onChange={(event) =>
                  onChange("githubUrl", event.target.value)
                }
                placeholder="https://github.com/..."
              />
            </label>
          </div>

          <div className="admin-project-form-row admin-project-form-options">
            <label className="admin-project-checkbox">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) =>
                  onChange("featured", event.target.checked)
                }
              />
              <span>Featured project</span>
            </label>
            <label className="admin-project-field admin-project-order-field">
              <span>Display order</span>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={form.displayOrder}
                onChange={(event) =>
                  onChange("displayOrder", event.target.value)
                }
              />
            </label>
          </div>

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
                ? uploadingImage
                  ? "Uploading image…"
                  : "Saving…"
                : editing
                  ? "Save changes"
                  : "Add project"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function ProjectCard({ project, onEdit, onDelete, deleting }) {
  return (
    <article className="admin-project-card">
      <div className="admin-project-image">
        {project.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.image} alt={`${project.title} project`} />
        ) : (
          <div className="admin-project-image-empty">Project preview</div>
        )}
        {project.featured && (
          <span className="admin-project-featured">Featured</span>
        )}
      </div>

      <div className="admin-project-card-content">
        <div className="admin-project-card-heading">
          <div>
            <span className="admin-project-order">
              DISPLAY ORDER · {project.displayOrder ?? 0}
            </span>
            <h3>{project.title}</h3>
          </div>
        </div>
        <p className="admin-project-description">{project.description}</p>

        <div className="admin-project-technologies" aria-label="Technologies">
          {project.technologies?.length ? (
            project.technologies.map((technology) => (
              <span key={technology}>{technology}</span>
            ))
          ) : (
            <span className="admin-project-no-technologies">
              No technologies listed
            </span>
          )}
        </div>

        <div className="admin-project-links">
          {project.liveUrl ? (
            <a href={project.liveUrl} target="_blank" rel="noreferrer">
              Live site <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <span className="admin-project-link-disabled">No live URL</span>
          )}
          {project.githubUrl ? (
            <a href={project.githubUrl} target="_blank" rel="noreferrer">
              GitHub <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <span className="admin-project-link-disabled">No GitHub URL</span>
          )}
        </div>
      </div>

      <footer className="admin-project-card-actions">
        <button
          type="button"
          className="admin-project-secondary-button"
          onClick={() => onEdit(project)}
          disabled={deleting}
        >
          Edit
        </button>
        <button
          type="button"
          className="admin-project-delete-button"
          onClick={() => onDelete(project)}
          disabled={deleting}
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </footer>
    </article>
  );
}

export default function ProjectsClient({ projects: initialProjects, initialError }) {
  const router = useRouter();
  const [projects, setProjects] = useState(() => sortProjects(initialProjects));
  const [loadError, setLoadError] = useState(initialError);
  const [notice, setNotice] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [isRefreshing, startRefresh] = useTransition();

  function openAddForm() {
    setNotice(null);
    setEditingProject(null);
    setForm(emptyForm);
    setFormError("");
    setImageFile(null);
    setIsFormOpen(true);
  }

  function openEditForm(project) {
    setNotice(null);
    setEditingProject(project);
    setForm(projectToForm(project));
    setFormError("");
    setImageFile(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setIsFormOpen(false);
    setEditingProject(null);
    setFormError("");
    setImageFile(null);
  }

  function updateField(field, value) {
    setFormError("");
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice(null);
    setFormError("");

    setSaving(true);

    try {
      const payload = formatProjectPayload(form);
      if (imageFile) {
        setUploadingImage(true);
        payload.image = await uploadProjectImage(imageFile);
        updateField("image", payload.image);
        setImageFile(null);
      }

      const response = editingProject
        ? await updateProject(editingProject._id, payload)
        : await createProject(payload);
      const savedProject = response.project;

      setProjects((current) =>
        sortProjects(
          editingProject
            ? current.map((project) =>
              project._id === savedProject._id ? savedProject : project
            )
            : [...current, savedProject]
        )
      );
      setLoadError("");
      setIsFormOpen(false);
      setEditingProject(null);
      setFormError("");
      setNotice({
        type: "success",
        message: response.message || "Project saved successfully.",
      });
    } catch (error) {
      setFormError(
        error.message === "BACKEND_UNAVAILABLE"
          ? "The backend is unavailable. Please try again."
          : error.message || "Unable to save the project."
      );
    } finally {
      setUploadingImage(false);
      setSaving(false);
    }
  }

  async function handleDelete(project) {
    if (
      !window.confirm(
        `Delete "${project.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setNotice(null);
    setDeletingId(project._id);

    try {
      const response = await removeProject(project._id);
      setProjects((current) =>
        current.filter((item) => item._id !== project._id)
      );
      setNotice({
        type: "success",
        message: response.message || "Project deleted successfully.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.message === "BACKEND_UNAVAILABLE"
            ? "The backend is unavailable. Please try again."
            : error.message || "Unable to delete the project.",
      });
    } finally {
      setDeletingId("");
    }
  }

  return (
    <section className="admin-projects" aria-labelledby="projects-title">
      <header className="admin-projects-heading">
        <div>
          <span className="admin-eyebrow">PORTFOLIO CONTENT</span>
          <h1 id="projects-title">Projects<span>.</span></h1>
          <p>Manage the work featured across your portfolio.</p>
        </div>
        <button
          type="button"
          className="admin-project-primary-button"
          onClick={openAddForm}
        >
          <span aria-hidden="true">+</span> Add project
        </button>
      </header>

      {notice && (
        <div
          className={`admin-project-notice is-${notice.type}`}
          role={notice.type === "error" ? "alert" : "status"}
        >
          <span aria-hidden="true">
            {notice.type === "error" ? "!" : "✓"}
          </span>
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
          <h2>Projects aren&apos;t available right now.</h2>
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
      ) : projects.length === 0 ? (
        <div className="admin-project-empty">
          <span className="admin-project-empty-mark" aria-hidden="true">
            N.
          </span>
          <span className="admin-section-kicker">A FRESH CANVAS</span>
          <h2>No projects yet</h2>
          <p>Add your first project to start building your portfolio showcase.</p>
          <button
            type="button"
            className="admin-project-primary-button"
            onClick={openAddForm}
          >
            Add your first project
          </button>
        </div>
      ) : (
        <div className="admin-project-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={openEditForm}
              onDelete={handleDelete}
              deleting={deletingId === project._id}
            />
          ))}
        </div>
      )}

      {isFormOpen && (
        <ProjectForm
          form={form}
          imageFile={imageFile}
          formError={formError}
          editing={Boolean(editingProject)}
          pending={saving}
          uploadingImage={uploadingImage}
          onChange={updateField}
          onClearFormError={() => setFormError("")}
          onImageFileChange={setImageFile}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}
