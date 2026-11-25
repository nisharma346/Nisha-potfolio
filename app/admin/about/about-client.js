"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAbout } from "./actions";

function aboutToForm(about) {
  return {
    name: about?.name || "",
    role: about?.role || "",
    shortBio: about?.shortBio || "",
    description: about?.description || "",
    profileImage: about?.profileImage || "",
    resumeUrl: about?.resumeUrl || "",
    education: about?.education || "",
    location: about?.location || "",
    email: about?.email || "",
    isVisible: about?.isVisible ?? true,
  };
}

function AboutField({ label, name, value, onChange, required, multiline }) {
  const Input = multiline ? "textarea" : "input";

  return (
    <label
      className={`admin-about-field${multiline ? " is-multiline" : ""}`}
    >
      <span>{label}</span>
      <Input
        name={name}
        required={required}
        rows={multiline ? 4 : undefined}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
      />
    </label>
  );
}

function AboutPreview({ form, previewFailed, onImageError }) {
  return (
    <section className="admin-about-panel" aria-labelledby="about-preview-title">
      <div className="admin-about-panel-heading">
        <span className="admin-section-kicker">PROFILE IMAGE</span>
        <h2 id="about-preview-title">Current preview</h2>
      </div>
      <div className="admin-about-image-preview">
        {form.profileImage.trim() && !previewFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.profileImage.trim()}
            alt={`${form.name || "Profile"} preview`}
            onError={onImageError}
          />
        ) : (
          <span>
            {previewFailed
              ? "Image preview unavailable"
              : "No profile image URL"}
          </span>
        )}
      </div>
      <p className="admin-about-help">
        Enter an image URL below. The backend stores the URL; image uploads are
        not supported.
      </p>
    </section>
  );
}

export default function AboutClient({ about: initialAbout, initialError }) {
  const router = useRouter();
  const [about, setAbout] = useState(initialAbout);
  const [form, setForm] = useState(() => aboutToForm(initialAbout));
  const [loadError, setLoadError] = useState(initialError);
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));

    if (field === "profileImage") {
      setPreviewFailed(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!about?._id) {
      setNotice({
        type: "error",
        message: "There is no About record to update.",
      });
      return;
    }

    setNotice(null);
    setSaving(true);

    try {
      const response = await updateAbout(about._id, form);
      setAbout(response.about);
      setForm(aboutToForm(response.about));
      setPreviewFailed(false);
      setNotice({
        type: "success",
        message: response.message || "About information saved successfully.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.message === "BACKEND_UNAVAILABLE"
            ? "The backend is unavailable. Please try again."
            : error.message || "Unable to save About information.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-about" aria-labelledby="about-title">
      <header className="admin-projects-heading">
        <div>
          <span className="admin-eyebrow">PORTFOLIO CONTENT</span>
          <h1 id="about-title">
            About<span>.</span>
          </h1>
          <p>Update the information visitors see about you.</p>
        </div>
      </header>

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
          <h2>About information isn&apos;t available right now.</h2>
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
      ) : !about ? (
        <div className="admin-project-empty">
          <span className="admin-section-kicker">NO ABOUT RECORD</span>
          <h2>There is no About record to edit.</h2>
          <p>
            This page only updates an existing record and will not create a
            duplicate.
          </p>
        </div>
      ) : (
        <form className="admin-about-form" onSubmit={handleSubmit}>
          <div className="admin-about-layout">
            <fieldset className="admin-about-panel admin-about-fields" disabled={saving}>
              <legend className="admin-about-panel-heading">
                <span className="admin-section-kicker">ABOUT DETAILS</span>
                <strong>Profile information</strong>
              </legend>
              <div className="admin-about-field-grid">
                <AboutField
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  required
                />
                <AboutField
                  label="Role"
                  name="role"
                  value={form.role}
                  onChange={updateField}
                  required
                />
                <AboutField
                  label="Short bio"
                  name="shortBio"
                  value={form.shortBio}
                  onChange={updateField}
                  required
                  multiline
                />
                <AboutField
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  multiline
                />
                <AboutField
                  label="Profile image URL"
                  name="profileImage"
                  value={form.profileImage}
                  onChange={updateField}
                />
                <AboutField
                  label="Resume URL"
                  name="resumeUrl"
                  value={form.resumeUrl}
                  onChange={updateField}
                />
                <AboutField
                  label="Education"
                  name="education"
                  value={form.education}
                  onChange={updateField}
                />
                <AboutField
                  label="Location"
                  name="location"
                  value={form.location}
                  onChange={updateField}
                />
                <AboutField
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={updateField}
                />
              </div>
            </fieldset>

            <div className="admin-about-aside">
              <AboutPreview
                form={form}
                previewFailed={previewFailed}
                onImageError={() => setPreviewFailed(true)}
              />
              <fieldset
                className="admin-about-panel admin-about-visibility"
                disabled={saving}
              >
                <legend className="admin-section-kicker">
                  VISIBILITY STATUS
                </legend>
                <label className="admin-project-checkbox">
                  <input
                    type="checkbox"
                    checked={form.isVisible}
                    onChange={(event) =>
                      updateField("isVisible", event.target.checked)
                    }
                  />
                  <span>Visible</span>
                </label>
                <p className="admin-about-help">
                  The About API returns this record regardless of visibility.
                </p>
              </fieldset>
            </div>
          </div>

          <footer className="admin-about-actions">
            <span>Changes are saved to the existing About record.</span>
            <button
              type="submit"
              className="admin-project-primary-button"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </footer>
        </form>
      )}
    </section>
  );
}
