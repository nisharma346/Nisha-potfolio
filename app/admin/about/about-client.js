"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAbout } from "./actions";

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
const PROFILE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_RESUME_SIZE = 10 * 1024 * 1024;
const RESUME_FILE_TYPES = new Set(["application/pdf", "application/octet-stream"]);
const RESUME_STORAGE_PREFIX = "cloudinary:raw:";

function isCloudinaryResumeUrl(resumeUrl) {
  try {
    const url = new URL(resumeUrl);
    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      /^\/[^/]+\/raw\/authenticated\/s--[a-z0-9_-]+--\/v\d+\/nisha-portfolio\/about\/resumes\/resume-[0-9a-f-]{36}\.pdf$/i.test(
        url.pathname
      )
    );
  } catch {
    return false;
  }
}

function hasPdfSignature(buffer) {
  const signature = new TextEncoder().encode("%PDF-");

  for (let offset = 0; offset + signature.length <= buffer.length; offset += 1) {
    if (
      signature.every((byte, index) => byte === buffer[offset + index])
    ) {
      return true;
    }
  }

  return false;
}

function getResumeDownloadHref(resumeUrl) {
  if (typeof resumeUrl !== "string" || !resumeUrl.trim()) return "";
  if (resumeUrl.startsWith(RESUME_STORAGE_PREFIX)) return "/api/about/resume";
  if (isCloudinaryResumeUrl(resumeUrl)) return "/api/about/resume";
  if (resumeUrl.startsWith("/") && !resumeUrl.startsWith("//")) {
    return resumeUrl;
  }

  try {
    const url = new URL(resumeUrl);
    return url.protocol === "http:" || url.protocol === "https:"
      ? resumeUrl
      : "";
  } catch {
    return "";
  }
}

async function uploadProfileImage(file) {
  const formData = new FormData();
  formData.append("image", file, file.name);

  let response;
  try {
    response = await fetch("/api/admin/about/upload-image", {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error("The image upload service is unavailable. Please try again.");
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The image service returned an invalid response.");
  }

  if (
    !response.ok ||
    data?.success !== true ||
    typeof data?.imageUrl !== "string"
  ) {
    throw new Error(data?.message || "Unable to upload the profile photo.");
  }

  return data.imageUrl;
}

async function uploadResume(file) {
  const formData = new FormData();
  formData.append("resume", file, file.name);

  let response;
  try {
    response = await fetch("/api/admin/about/upload-resume", {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error("The resume upload service is unavailable. Please try again.");
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The resume service returned an invalid response.");
  }

  if (
    !response.ok ||
    data?.success !== true ||
    typeof data?.resumeUrl !== "string" ||
    !isCloudinaryResumeUrl(data.resumeUrl)
  ) {
    throw new Error(data?.message || "Unable to upload the resume.");
  }

  return data.resumeUrl;
}

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

function getResumeFileName(resumeUrl) {
  if (resumeUrl.startsWith(RESUME_STORAGE_PREFIX)) {
    const [publicId, encodedFileName] = resumeUrl
      .slice(RESUME_STORAGE_PREFIX.length)
      .split("|", 2);

    if (encodedFileName) {
      try {
        return decodeURIComponent(encodedFileName);
      } catch {
        return "Current resume PDF";
      }
    }

    return publicId.split("/").pop() || "Current resume PDF";
  }

  try {
    const url = new URL(resumeUrl);
    const originalFileName = new URLSearchParams(url.hash.slice(1)).get("filename");
    const fileName =
      originalFileName || decodeURIComponent(url.pathname.split("/").pop());
    return fileName || "Current resume";
  } catch {
    return "Current resume";
  }
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

function ResumeUpload({
  resumeUrl,
  selectedFile,
  fileInputRef,
  onFileChange,
  onRemove,
  status,
  disabled,
}) {
  const downloadHref = getResumeDownloadHref(resumeUrl);

  return (
    <section className="admin-about-panel" aria-labelledby="about-resume-title">
      <div className="admin-about-panel-heading">
        <span className="admin-section-kicker">RESUME</span>
        <h2 id="about-resume-title">Upload Resume</h2>
      </div>
      {resumeUrl ? (
        <p className="admin-about-file-name">
          Currently uploaded:{" "}
          {downloadHref ? (
            <a href={downloadHref} target="_blank" rel="noreferrer">
              {getResumeFileName(resumeUrl)}
            </a>
          ) : (
            getResumeFileName(resumeUrl)
          )}
        </p>
      ) : (
        <p className="admin-about-help">No resume is currently uploaded.</p>
      )}
      <div className="admin-about-photo-controls">
        <button
          type="button"
          className="admin-about-upload-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          Choose Resume File
        </button>
        <input
          ref={fileInputRef}
          className="admin-about-file-input"
          type="file"
          accept=".pdf,application/pdf"
          onChange={onFileChange}
          tabIndex={-1}
          aria-label="Choose a PDF resume"
        />
        {selectedFile && (
          <span className="admin-about-file-name" title={selectedFile.name}>
            Selected: {selectedFile.name}
          </span>
        )}
        {(resumeUrl || selectedFile) && (
          <button
            type="button"
            className="admin-project-secondary-button"
            onClick={onRemove}
            disabled={disabled}
          >
            Remove resume
          </button>
        )}
      </div>
      <p className="admin-about-help">
        PDF only, up to 10 MB. Save changes to upload or replace the resume.
      </p>
      {status && (
        <p className="admin-about-upload-status" role="status" aria-live="polite">
          {status}
        </p>
      )}
    </section>
  );
}

function AboutPreview({
  form,
  imageSrc,
  previewFailed,
  onImageError,
  fileName,
  fileInputRef,
  onFileChange,
  onRemoveImage,
  hasPhoto,
  saving,
}) {
  return (
    <section className="admin-about-panel" aria-labelledby="about-photo-title">
      <div className="admin-about-panel-heading">
        <span className="admin-section-kicker">HOMEPAGE HERO</span>
        <h2 id="about-photo-title">Hero profile photo</h2>
      </div>
      <div className="admin-about-image-preview">
        {imageSrc && !previewFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={`${form.name || "Profile"} preview`}
            onError={onImageError}
          />
        ) : (
          <span>
            {previewFailed
              ? "Image preview unavailable"
              : "No profile photo selected"}
          </span>
        )}
      </div>
      <div className="admin-about-photo-controls">
        <button
          type="button"
          className="admin-about-upload-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={saving}
        >
          Upload Image / Choose File
        </button>
        <input
          ref={fileInputRef}
          className="admin-about-file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileChange}
          tabIndex={-1}
          aria-label="Choose a profile photo"
        />
        {fileName && (
          <span className="admin-about-file-name" title={fileName}>
            Selected: {fileName}
          </span>
        )}
        {hasPhoto && (
          <button
            type="button"
            className="admin-project-secondary-button"
            onClick={onRemoveImage}
            disabled={saving}
          >
            {fileName ? "Remove selected photo" : "Remove profile photo"}
          </button>
        )}
      </div>
      <p className="admin-about-help">
        Shown in the homepage Hero. JPG, PNG, or WEBP up to 5 MB. A selected
        photo uploads when you save changes.
      </p>
    </section>
  );
}

export default function AboutClient({ about: initialAbout, initialError }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  const previewUrlRef = useRef("");
  const [about, setAbout] = useState(initialAbout);
  const [form, setForm] = useState(() => aboutToForm(initialAbout));
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const [uploadedResumeUrl, setUploadedResumeUrl] = useState("");
  const [resumeStatus, setResumeStatus] = useState("");
  const [resumeValidating, setResumeValidating] = useState(false);
  const [loadError, setLoadError] = useState(initialError);
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();

  useEffect(
    () => () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    },
    []
  );

  function clearSelectedImage() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }

    setSelectedImage(null);
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));

    if (field === "profileImage") {
      setPreviewFailed(false);
    }
  }

  function handleImageSelection(event) {
    const [file] = event.target.files || [];
    event.target.value = "";

    if (!file) return;

    if (!PROFILE_IMAGE_TYPES.has(file.type)) {
      setNotice({
        type: "error",
        message: "Choose a JPG, PNG, or WEBP image.",
      });
      return;
    }

    if (file.size === 0) {
      setNotice({ type: "error", message: "The selected image is empty." });
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      setNotice({
        type: "error",
        message: "Image files must be 5 MB or smaller.",
      });
      return;
    }

    clearSelectedImage();
    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;
    setSelectedImage({ file, previewUrl });
    setPreviewFailed(false);
    setNotice(null);
  }

  async function handleResumeSelection(event) {
    const [file] = event.target.files || [];
    event.target.value = "";

    if (!file) return;

    if (
      !file.name.toLowerCase().endsWith(".pdf") ||
      (file.type && !RESUME_FILE_TYPES.has(file.type))
    ) {
      setNotice({ type: "error", message: "Choose a PDF resume file." });
      return;
    }

    if (file.size === 0) {
      setNotice({ type: "error", message: "The selected resume is empty." });
      return;
    }

    if (file.size > MAX_RESUME_SIZE) {
      setNotice({
        type: "error",
        message: "Resume files must be 10 MB or smaller.",
      });
      return;
    }

    setResumeValidating(true);
    setResumeStatus("Checking the selected PDF…");
    try {
      const header = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
      if (!hasPdfSignature(header)) {
        setNotice({
          type: "error",
          message: "The selected file is not a valid PDF.",
        });
        setResumeStatus("");
        return;
      }

      setSelectedResume(file);
      setUploadedResumeUrl("");
      setResumeStatus("Selected. Save changes to upload this resume.");
      setNotice(null);
    } catch {
      setNotice({
        type: "error",
        message: "Unable to read the selected resume file.",
      });
      setResumeStatus("");
    } finally {
      setResumeValidating(false);
    }
  }

  function handleRemoveResume() {
    setSelectedResume(null);
    setUploadedResumeUrl("");
    updateField("resumeUrl", "");
    setResumeStatus("Resume removal will be saved with your changes.");
    setNotice(null);
  }

  function handleRemoveImage() {
    if (selectedImage) {
      clearSelectedImage();
      setPreviewFailed(false);
      return;
    }

    updateField("profileImage", "");
    setNotice(null);
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
    let resumeUploadAttempted = Boolean(uploadedResumeUrl);
    let resumeUploaded = Boolean(uploadedResumeUrl);

    try {
      const profileImage = selectedImage
        ? await uploadProfileImage(selectedImage.file)
        : form.profileImage;
      let resumeUrl = form.resumeUrl;

      if (selectedResume) {
        if (uploadedResumeUrl) {
          resumeUrl = uploadedResumeUrl;
        } else {
          resumeUploadAttempted = true;
          setResumeStatus("Uploading resume…");
          resumeUrl = await uploadResume(selectedResume);
          setUploadedResumeUrl(resumeUrl);
          setForm((current) => ({ ...current, resumeUrl }));
          resumeUploaded = true;
        }
        setResumeStatus("Resume uploaded. Saving About details…");
      }

      const response = await updateAbout(about._id, {
        ...form,
        profileImage,
        resumeUrl,
      });
      setAbout(response.about);
      setForm(aboutToForm(response.about));
      clearSelectedImage();
      setSelectedResume(null);
      setUploadedResumeUrl("");
      setResumeStatus(
        response.about.resumeUrl ? "Resume saved and ready to download." : ""
      );
      setPreviewFailed(false);
      setNotice({
        type: "success",
        message: response.message || "About information saved successfully.",
      });
    } catch (error) {
      if (selectedResume && resumeUploadAttempted) {
        setResumeStatus(
          resumeUploaded
            ? "Resume uploaded and saved. Other About changes were not saved; try again."
            : "Resume upload failed. Your saved resume is unchanged."
        );
      }
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
            <fieldset className="admin-about-panel admin-about-fields" disabled={saving || resumeValidating}>
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
                imageSrc={
                  selectedImage?.previewUrl || form.profileImage.trim()
                }
                previewFailed={previewFailed}
                onImageError={() => setPreviewFailed(true)}
                fileName={selectedImage?.file.name || ""}
                fileInputRef={fileInputRef}
                onFileChange={handleImageSelection}
                onRemoveImage={handleRemoveImage}
                hasPhoto={
                  Boolean(selectedImage) || Boolean(form.profileImage.trim())
                }
                saving={saving || resumeValidating}
              />
              <ResumeUpload
                resumeUrl={form.resumeUrl}
                selectedFile={selectedResume}
                fileInputRef={resumeInputRef}
                onFileChange={handleResumeSelection}
                onRemove={handleRemoveResume}
                status={resumeStatus}
                disabled={saving || resumeValidating}
              />
              <fieldset
                className="admin-about-panel admin-about-visibility"
                disabled={saving || resumeValidating}
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
              disabled={saving || resumeValidating}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </footer>
        </form>
      )}
    </section>
  );
}
