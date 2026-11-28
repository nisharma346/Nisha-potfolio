"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadAdminImage } from "../../../lib/admin-image-upload";
import {
  createTestimonial,
  removeTestimonial,
  updateTestimonial,
} from "./actions";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const emptyForm = {
  name: "",
  role: "",
  company: "",
  message: "",
  image: "",
  rating: "5",
  isVisible: true,
  displayOrder: "0",
};

function sortTestimonials(testimonials) {
  return [...testimonials].sort(
    (first, second) =>
      (Number(first.displayOrder) || 0) - (Number(second.displayOrder) || 0)
  );
}

function testimonialToForm(testimonial) {
  return {
    name: testimonial.name || "",
    role: testimonial.role || "",
    company: testimonial.company || "",
    message: testimonial.message || "",
    image: testimonial.image || "",
    rating: String(testimonial.rating ?? 5),
    isVisible: testimonial.isVisible ?? true,
    displayOrder: String(testimonial.displayOrder ?? 0),
  };
}

function formatTestimonialPayload(form) {
  return {
    name: form.name.trim(),
    role: form.role.trim(),
    company: form.company.trim(),
    message: form.message.trim(),
    image: form.image.trim(),
    rating: Number(form.rating),
    isVisible: form.isVisible,
    displayOrder: Number(form.displayOrder),
  };
}

function safeImageSource(value) {
  const source = value.trim();
  if (source.startsWith("/") && !source.startsWith("//")) return source;

  try {
    const url = new URL(source);
    return url.protocol === "http:" || url.protocol === "https:"
      ? source
      : "";
  } catch {
    return "";
  }
}

function TestimonialForm({
  form,
  imageFile,
  editing,
  pending,
  uploadingImage,
  onChange,
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
      onImageFileChange(null);
      setImagePreview("");
      setImageFileError("Choose a JPG, JPEG, PNG, or WEBP image.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      onImageFileChange(null);
      setImagePreview("");
      setImageFileError("Image files must be 5 MB or smaller.");
      return;
    }

    setImageFileError("");
    setImagePreview(URL.createObjectURL(file));
    onImageFileChange(file);
  }

  const previewSource = imageFile
    ? imagePreview
    : safeImageSource(form.image);

  return (
    <div
      className="admin-project-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) onClose();
      }}
    >
      <section
        className="admin-project-modal admin-testimonial-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="testimonial-form-title"
      >
        <header className="admin-project-modal-header">
          <div>
            <span className="admin-section-kicker">
              {editing ? "UPDATE TESTIMONIAL" : "ADD GENUINE FEEDBACK"}
            </span>
            <h2 id="testimonial-form-title">
              {editing ? "Edit testimonial" : "Add testimonial"}
            </h2>
          </div>
          <button
            type="button"
            className="admin-project-close"
            onClick={onClose}
            disabled={pending}
            aria-label="Close testimonial form"
          >
            ×
          </button>
        </header>

        <form className="admin-project-form" onSubmit={onSubmit}>
          <p className="admin-testimonial-guidance">
            Only add genuine feedback that you have permission to publish.
          </p>

          <div className="admin-project-form-row">
            <label className="admin-project-field">
              <span>Name</span>
              <input
                autoFocus
                required
                value={form.name}
                onChange={(event) => onChange("name", event.target.value)}
                placeholder="Person's name"
              />
            </label>
            <label className="admin-project-field">
              <span>Role</span>
              <input
                value={form.role}
                onChange={(event) => onChange("role", event.target.value)}
                placeholder="e.g. Product Manager"
              />
            </label>
          </div>

          <div className="admin-project-form-row">
            <label className="admin-project-field">
              <span>Company</span>
              <input
                value={form.company}
                onChange={(event) => onChange("company", event.target.value)}
                placeholder="Company name"
              />
            </label>
            <label className="admin-project-field">
              <span>Image URL (optional)</span>
              <input
                value={form.image}
                onChange={(event) => onChange("image", event.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </label>
          </div>

          <div className="admin-project-field">
            <span>Profile photo (optional)</span>
            <div className="admin-project-upload-row">
              <div className="admin-project-upload-preview">
                {previewSource ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewSource}
                    alt={`${form.name || "Testimonial"} photo preview`}
                  />
                ) : (
                  <span>Profile photo preview</span>
                )}
              </div>
              <div className="admin-project-upload-controls">
                <label className="admin-project-upload-control">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={handleImageSelection}
                    disabled={pending}
                    aria-label="Choose a testimonial profile photo"
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

          <label className="admin-project-field">
            <span>Message</span>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(event) => onChange("message", event.target.value)}
              placeholder="Enter the genuine testimonial"
            />
          </label>

          <div className="admin-project-form-row">
            <label className="admin-project-field">
              <span>Rating (1–5)</span>
              <input
                type="number"
                min="1"
                max="5"
                step="any"
                required
                value={form.rating}
                onChange={(event) => onChange("rating", event.target.value)}
              />
            </label>
            <label className="admin-project-field">
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
                ? uploadingImage
                  ? "Uploading image…"
                  : "Saving…"
                : editing
                  ? "Save changes"
                  : "Add testimonial"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function TestimonialCard({ testimonial, onEdit, onDelete, deleting }) {
  return (
    <article className="admin-testimonial-card">
      <div className="admin-testimonial-heading">
        <div className="admin-testimonial-identity">
          {testimonial.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={testimonial.image} alt="" />
          ) : (
            <span aria-hidden="true">
              {testimonial.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <span className="admin-project-order">
              DISPLAY ORDER · {testimonial.displayOrder ?? 0}
            </span>
            <h2>{testimonial.name}</h2>
            {(testimonial.role || testimonial.company) && (
              <p>
                {[testimonial.role, testimonial.company]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
        </div>
        <span
          className={`admin-testimonial-status${testimonial.isVisible ? " is-visible" : ""}`}
        >
          {testimonial.isVisible ? "Visible" : "Hidden"}
        </span>
      </div>

      <blockquote className="admin-testimonial-message">
        “{testimonial.message}”
      </blockquote>

      <div className="admin-testimonial-meta">
        <span>Rating: {testimonial.rating ?? 5} / 5</span>
      </div>

      <footer className="admin-testimonial-actions">
        <button
          type="button"
          className="admin-project-secondary-button"
          onClick={() => onEdit(testimonial)}
          disabled={deleting}
        >
          Edit
        </button>
        <button
          type="button"
          className="admin-project-delete-button"
          onClick={() => onDelete(testimonial)}
          disabled={deleting}
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </footer>
    </article>
  );
}

export default function TestimonialsClient({
  testimonials: initialTestimonials,
  initialError,
}) {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState(() =>
    sortTestimonials(initialTestimonials)
  );
  const [loadError, setLoadError] = useState(initialError);
  const [notice, setNotice] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [isRefreshing, startRefresh] = useTransition();

  function openAddForm() {
    setNotice(null);
    setEditingTestimonial(null);
    setForm(emptyForm);
    setImageFile(null);
    setIsFormOpen(true);
  }

  function openEditForm(testimonial) {
    setNotice(null);
    setEditingTestimonial(testimonial);
    setForm(testimonialToForm(testimonial));
    setImageFile(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setIsFormOpen(false);
    setEditingTestimonial(null);
    setImageFile(null);
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice(null);
    setSaving(true);

    try {
      const payload = formatTestimonialPayload(form);
      if (imageFile) {
        setUploadingImage(true);
        payload.image = await uploadAdminImage(
          "/api/admin/testimonials/upload-image",
          imageFile
        );
      }

      const response = editingTestimonial
        ? await updateTestimonial(editingTestimonial._id, payload)
        : await createTestimonial(payload);
      const savedTestimonial = response.testimonial;

      setTestimonials((current) =>
        sortTestimonials(
          (
            editingTestimonial
              ? current.map((testimonial) =>
                  testimonial._id === savedTestimonial._id
                    ? savedTestimonial
                    : testimonial
                )
              : [...current, savedTestimonial]
          )
        )
      );
      setLoadError("");
      setIsFormOpen(false);
      setEditingTestimonial(null);
      setImageFile(null);
      setNotice({
        type: "success",
        message: response.message || "Testimonial saved successfully.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.message === "BACKEND_UNAVAILABLE"
            ? "The backend is unavailable. Please try again."
            : error.message || "Unable to save the testimonial.",
      });
    } finally {
      setUploadingImage(false);
      setSaving(false);
    }
  }

  async function handleDelete(testimonial) {
    if (
      !window.confirm(
        `Delete the testimonial from "${testimonial.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setNotice(null);
    setDeletingId(testimonial._id);

    try {
      const response = await removeTestimonial(testimonial._id);
      setTestimonials((current) =>
        current.filter((item) => item._id !== testimonial._id)
      );
      setNotice({
        type: "success",
        message: response.message || "Testimonial deleted successfully.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.message === "BACKEND_UNAVAILABLE"
            ? "The backend is unavailable. Please try again."
            : error.message || "Unable to delete the testimonial.",
      });
    } finally {
      setDeletingId("");
    }
  }

  return (
    <section
      className="admin-testimonials"
      aria-labelledby="testimonials-title"
    >
      <header className="admin-projects-heading">
        <div>
          <span className="admin-eyebrow">PORTFOLIO CONTENT</span>
          <h1 id="testimonials-title">
            Testimonials<span>.</span>
          </h1>
          <p>Manage genuine feedback shared with permission.</p>
        </div>
        <button
          type="button"
          className="admin-project-primary-button"
          onClick={openAddForm}
        >
          <span aria-hidden="true">+</span> Add testimonial
        </button>
      </header>

      <p className="admin-testimonial-note">
        Hidden testimonials remain available here for editing and publishing.
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
          <h2>Testimonials aren&apos;t available right now.</h2>
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
      ) : testimonials.length === 0 ? (
        <div className="admin-project-empty">
          <span className="admin-project-empty-mark" aria-hidden="true">
            N.
          </span>
          <span className="admin-section-kicker">SHARED APPRECIATION</span>
          <h2>No testimonials yet</h2>
          <p>
            Add genuine feedback only when you have permission to publish it.
          </p>
          <button
            type="button"
            className="admin-project-primary-button"
            onClick={openAddForm}
          >
            Add a testimonial
          </button>
        </div>
      ) : (
        <div className="admin-testimonial-grid">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial._id}
              testimonial={testimonial}
              onEdit={openEditForm}
              onDelete={handleDelete}
              deleting={deletingId === testimonial._id}
            />
          ))}
        </div>
      )}

      {isFormOpen && (
        <TestimonialForm
          form={form}
          imageFile={imageFile}
          editing={Boolean(editingTestimonial)}
          pending={saving}
          uploadingImage={uploadingImage}
          onChange={updateField}
          onImageFileChange={setImageFile}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}
