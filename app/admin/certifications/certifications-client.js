"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadAdminImage } from "../../../lib/admin-image-upload";
import {
  createCertification,
  removeCertification,
  updateCertification,
} from "./actions";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const emptyForm = {
  title: "",
  issuer: "",
  issueDate: "",
  credentialId: "",
  credentialUrl: "",
  image: "",
  description: "",
  isVisible: true,
  displayOrder: "0",
};

function sortCertifications(certifications) {
  return [...certifications].sort(
    (first, second) =>
      (Number(first.displayOrder) || 0) - (Number(second.displayOrder) || 0)
  );
}

function certificationToForm(certification) {
  return {
    title: certification.title || "",
    issuer: certification.issuer || "",
    issueDate: certification.issueDate || "",
    credentialId: certification.credentialId || "",
    credentialUrl: certification.credentialUrl || "",
    image: certification.image || "",
    description: certification.description || "",
    isVisible: certification.isVisible ?? true,
    displayOrder: String(certification.displayOrder ?? 0),
  };
}

function formatCertificationPayload(form) {
  return {
    title: form.title.trim(),
    issuer: form.issuer.trim(),
    issueDate: form.issueDate.trim(),
    credentialId: form.credentialId.trim(),
    credentialUrl: form.credentialUrl.trim(),
    image: form.image.trim(),
    description: form.description.trim(),
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

function safeCredentialUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

function CertificationForm({
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

  return (
    <div
      className="admin-project-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) onClose();
      }}
    >
      <section
        className="admin-project-modal admin-certification-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="certification-form-title"
      >
        <header className="admin-project-modal-header">
          <div>
            <span className="admin-section-kicker">
              {editing ? "UPDATE YOUR CREDENTIAL" : "ADD A CREDENTIAL"}
            </span>
            <h2 id="certification-form-title">
              {editing ? "Edit certification" : "Add certification"}
            </h2>
          </div>
          <button
            type="button"
            className="admin-project-close"
            onClick={onClose}
            disabled={pending}
            aria-label="Close certification form"
          >
            ×
          </button>
        </header>

        <form className="admin-project-form" onSubmit={onSubmit}>
          <div className="admin-project-form-row">
            <label className="admin-project-field">
              <span>Certificate title</span>
              <input
                autoFocus
                required
                value={form.title}
                onChange={(event) => onChange("title", event.target.value)}
                placeholder="Certificate title"
              />
            </label>
            <label className="admin-project-field">
              <span>Issuer</span>
              <input
                required
                value={form.issuer}
                onChange={(event) => onChange("issuer", event.target.value)}
                placeholder="Issuing organization"
              />
            </label>
          </div>

          <div className="admin-project-form-row">
            <label className="admin-project-field">
              <span>Issue date</span>
              <input
                value={form.issueDate}
                onChange={(event) => onChange("issueDate", event.target.value)}
                placeholder="e.g. May 2025"
              />
            </label>
            <label className="admin-project-field">
              <span>Credential ID</span>
              <input
                value={form.credentialId}
                onChange={(event) =>
                  onChange("credentialId", event.target.value)
                }
                placeholder="Optional"
              />
            </label>
          </div>

          <div className="admin-project-form-row">
            <label className="admin-project-field">
              <span>Credential URL</span>
              <input
                value={form.credentialUrl}
                onChange={(event) =>
                  onChange("credentialUrl", event.target.value)
                }
                placeholder="https://..."
              />
            </label>
            <label className="admin-project-field">
              <span>Certificate image URL</span>
              <input
                value={form.image}
                onChange={(event) => onChange("image", event.target.value)}
                placeholder="https://..."
              />
            </label>
          </div>

          <div className="admin-project-field">
            <span>Certificate image (optional)</span>
            <div className="admin-project-upload-row">
              <div className="admin-project-upload-preview">
                {imageFile
                  ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imagePreview}
                        alt={`${form.title || "Certificate"} preview`}
                      />
                    )
                  : safeImageSource(form.image)
                    ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={safeImageSource(form.image)}
                          alt={`${form.title || "Certificate"} preview`}
                        />
                      )
                    : <span>Certificate preview</span>}
              </div>
              <div className="admin-project-upload-controls">
                <label className="admin-project-upload-control">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={handleImageSelection}
                    disabled={pending}
                    aria-label="Choose a certificate image"
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
            <span>Description</span>
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) =>
                onChange("description", event.target.value)
              }
              placeholder="Optional certificate details"
            />
          </label>

          <div className="admin-project-form-row">
            <label className="admin-project-checkbox">
              <input
                type="checkbox"
                checked={form.isVisible}
                onChange={(event) =>
                  onChange("isVisible", event.target.checked)
                }
              />
              <span>Visible</span>
            </label>
            <label className="admin-project-field admin-certification-order-field">
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
                  : "Add certification"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function CertificationCard({ certification, onEdit, onDelete, deleting }) {
  const imageSource = certification.image
    ? safeImageSource(certification.image)
    : "";
  const credentialUrl = certification.credentialUrl
    ? safeCredentialUrl(certification.credentialUrl)
    : "";

  return (
    <article className="admin-certification-card">
      <div className="admin-certification-heading">
        <div className="admin-certification-title-block">
          {imageSource ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="admin-certification-image"
              src={imageSource}
              alt={`${certification.title} certificate`}
              onError={(event) => {
                event.currentTarget.hidden = true;
              }}
            />
          ) : (
            <span className="admin-certification-image-placeholder">
              CERT
            </span>
          )}
          <div>
            <span className="admin-project-order">
              DISPLAY ORDER · {certification.displayOrder ?? 0}
            </span>
            <h2>{certification.title}</h2>
            <p>{certification.issuer}</p>
          </div>
        </div>
        <span
          className={`admin-certification-status${certification.isVisible ? " is-visible" : ""}`}
        >
          {certification.isVisible ? "Visible" : "Hidden"}
        </span>
      </div>

      <dl className="admin-certification-details">
        {certification.issueDate && (
          <div>
            <dt>Issue date</dt>
            <dd>{certification.issueDate}</dd>
          </div>
        )}
        {certification.credentialId && (
          <div>
            <dt>Credential ID</dt>
            <dd>{certification.credentialId}</dd>
          </div>
        )}
        {certification.credentialUrl && (
          <div className="admin-certification-credential">
            <dt>Credential URL</dt>
            <dd>
              {credentialUrl ? (
                <a href={credentialUrl} target="_blank" rel="noreferrer">
                  View credential <span aria-hidden="true">↗</span>
                </a>
              ) : (
                certification.credentialUrl
              )}
            </dd>
          </div>
        )}
        {certification.image && (
          <div>
            <dt>Certificate image</dt>
            <dd>{certification.image}</dd>
          </div>
        )}
      </dl>

      {certification.description && (
        <p className="admin-certification-description">
          {certification.description}
        </p>
      )}

      <footer className="admin-certification-actions">
        <button
          type="button"
          className="admin-project-secondary-button"
          onClick={() => onEdit(certification)}
          disabled={deleting}
        >
          Edit
        </button>
        <button
          type="button"
          className="admin-project-delete-button"
          onClick={() => onDelete(certification)}
          disabled={deleting}
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </footer>
    </article>
  );
}

export default function CertificationsClient({
  certifications: initialCertifications,
  initialError,
}) {
  const router = useRouter();
  const [certifications, setCertifications] = useState(() =>
    sortCertifications(initialCertifications)
  );
  const [loadError, setLoadError] = useState(initialError);
  const [notice, setNotice] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCertification, setEditingCertification] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [isRefreshing, startRefresh] = useTransition();

  function openAddForm() {
    setNotice(null);
    setEditingCertification(null);
    setForm(emptyForm);
    setImageFile(null);
    setIsFormOpen(true);
  }

  function openEditForm(certification) {
    setNotice(null);
    setEditingCertification(certification);
    setForm(certificationToForm(certification));
    setImageFile(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setIsFormOpen(false);
    setEditingCertification(null);
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
      const payload = formatCertificationPayload(form);
      if (imageFile) {
        setUploadingImage(true);
        payload.image = await uploadAdminImage(
          "/api/admin/certifications/upload-image",
          imageFile
        );
      }

      const response = editingCertification
        ? await updateCertification(editingCertification._id, payload)
        : await createCertification(payload);
      const savedCertification = response.certification;

      setCertifications((current) =>
        sortCertifications(
          (
            editingCertification
              ? current.map((certification) =>
                  certification._id === savedCertification._id
                    ? savedCertification
                    : certification
                )
              : [...current, savedCertification]
          )
        )
      );
      setLoadError("");
      setIsFormOpen(false);
      setEditingCertification(null);
      setImageFile(null);
      setNotice({
        type: "success",
        message: response.message || "Certification saved successfully.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.message === "BACKEND_UNAVAILABLE"
            ? "The backend is unavailable. Please try again."
            : error.message || "Unable to save the certification.",
      });
    } finally {
      setUploadingImage(false);
      setSaving(false);
    }
  }

  async function handleDelete(certification) {
    if (
      !window.confirm(
        `Delete "${certification.title}" from "${certification.issuer}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setNotice(null);
    setDeletingId(certification._id);

    try {
      const response = await removeCertification(certification._id);
      setCertifications((current) =>
        current.filter((item) => item._id !== certification._id)
      );
      setNotice({
        type: "success",
        message: response.message || "Certification deleted successfully.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.message === "BACKEND_UNAVAILABLE"
            ? "The backend is unavailable. Please try again."
            : error.message || "Unable to delete the certification.",
      });
    } finally {
      setDeletingId("");
    }
  }

  return (
    <section
      className="admin-certifications"
      aria-labelledby="certifications-title"
    >
      <header className="admin-projects-heading">
        <div>
          <span className="admin-eyebrow">PORTFOLIO CONTENT</span>
          <h1 id="certifications-title">
            Certifications<span>.</span>
          </h1>
          <p>Manage your verified certificates and credentials.</p>
        </div>
        <button
          type="button"
          className="admin-project-primary-button"
          onClick={openAddForm}
        >
          <span aria-hidden="true">+</span> Add certification
        </button>
      </header>

      <p className="admin-certification-note">
        Hidden certifications remain available here for editing and publishing.
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
          <h2>Certifications aren&apos;t available right now.</h2>
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
      ) : certifications.length === 0 ? (
        <div className="admin-project-empty">
          <span className="admin-project-empty-mark" aria-hidden="true">
            N.
          </span>
          <span className="admin-section-kicker">YOUR CREDENTIALS</span>
          <h2>No certifications yet</h2>
          <p>Add a certification when you have a genuine credential to share.</p>
          <button
            type="button"
            className="admin-project-primary-button"
            onClick={openAddForm}
          >
            Add your first certification
          </button>
        </div>
      ) : (
        <div className="admin-certification-grid">
          {certifications.map((certification) => (
            <CertificationCard
              key={certification._id}
              certification={certification}
              onEdit={openEditForm}
              onDelete={handleDelete}
              deleting={deletingId === certification._id}
            />
          ))}
        </div>
      )}

      {isFormOpen && (
        <CertificationForm
          form={form}
          imageFile={imageFile}
          editing={Boolean(editingCertification)}
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
