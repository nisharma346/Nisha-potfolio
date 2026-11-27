import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAdminToken } from "../../../../../lib/admin-auth";
import { BACKEND_URL } from "../../../../../lib/backend";

export const runtime = "nodejs";

const MAX_RESUME_SIZE = 10 * 1024 * 1024;
const RESUME_STORAGE_PREFIX = "cloudinary:raw:";
const RESUME_MIME_TYPES = new Set([
  "application/pdf",
  "application/octet-stream",
]);

function errorResponse(status, message) {
  return NextResponse.json({ success: false, message }, { status });
}

function hasPdfSignature(buffer) {
  const signature = new TextEncoder().encode("%PDF-");

  for (let offset = 0; offset + signature.length <= buffer.length; offset += 1) {
    if (signature.every((byte, index) => byte === buffer[offset + index])) {
      return true;
    }
  }

  return false;
}

function isValidResumeUrl(value) {
  if (
    typeof value !== "string" ||
    !value.toLowerCase().endsWith(".pdf")
  ) {
    return false;
  }

  if (value.startsWith(RESUME_STORAGE_PREFIX)) return true;

  try {
    const url = new URL(value);
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

export async function POST(request) {
  const token = (await cookies()).get("admin_token")?.value;
  if (!token) {
    return errorResponse(401, "Please sign in to upload a resume.");
  }

  try {
    if (!(await verifyAdminToken(token))) {
      return errorResponse(
        401,
        "Your admin session has expired. Please sign in again."
      );
    }
  } catch {
    return errorResponse(503, "The admin service is unavailable. Please try again.");
  }

  if (!request.headers.get("content-type")?.startsWith("multipart/form-data;")) {
    return errorResponse(400, "Choose a PDF resume file to upload.");
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_RESUME_SIZE + 65536
  ) {
    return errorResponse(413, "Resume files must be 10 MB or smaller.");
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse(400, "The resume upload request is invalid.");
  }

  const files = formData.getAll("resume");
  if (
    files.length !== 1 ||
    typeof files[0] === "string" ||
    typeof files[0]?.arrayBuffer !== "function"
  ) {
    return errorResponse(400, "Choose one PDF resume file to upload.");
  }

  const [file] = files;
  if (file.size === 0) {
    return errorResponse(400, "The selected resume is empty.");
  }
  if (file.size > MAX_RESUME_SIZE) {
    return errorResponse(413, "Resume files must be 10 MB or smaller.");
  }
  if (
    !file.name.toLowerCase().endsWith(".pdf") ||
    !RESUME_MIME_TYPES.has(file.type)
  ) {
    return errorResponse(400, "Choose a PDF resume file.");
  }

  if (!hasPdfSignature(new Uint8Array(await file.slice(0, 1024).arrayBuffer()))) {
    return errorResponse(400, "The selected file is not a valid PDF.");
  }

  const upstreamFormData = new FormData();
  upstreamFormData.append("resume", file, file.name);

  let response;
  try {
    response = await fetch(`${BACKEND_URL}/api/about/upload-resume`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: upstreamFormData,
      cache: "no-store",
      signal: AbortSignal.timeout(60000),
    });
  } catch {
    return errorResponse(
      503,
      "The resume service is unavailable. Please try again."
    );
  }

  let responseBody;
  try {
    responseBody = await response.text();
  } catch {
    return errorResponse(502, "The backend resume service could not be read.");
  }

  let data;
  try {
    data = JSON.parse(responseBody);
  } catch {
    if (response.status === 404) {
      return errorResponse(
        502,
        "The backend resume upload route is missing. Restart or redeploy the backend before uploading."
      );
    }

    return errorResponse(
      502,
      `The backend returned a non-JSON resume response (HTTP ${response.status}).`
    );
  }

  const validResumeUrl =
    isValidResumeUrl(data?.resumeUrl) &&
    data.about?.resumeUrl === data.resumeUrl;

  if (!response.ok || data?.success !== true || !validResumeUrl) {
    const backendMessage =
      !response.ok && typeof data?.message === "string"
        ? data.message.trim()
        : "";
    const message =
      response.status === 401 || response.status === 403
        ? "Your admin session has expired. Please sign in again."
        : response.status === 413
          ? "Resume files must be 10 MB or smaller."
          : response.status === 400
            ? backendMessage || "Choose a valid PDF resume file."
            : backendMessage.length <= 180
              ? backendMessage || "Unable to upload the resume. Please try again."
              : "Unable to upload the resume. Please try again.";
    const status =
      response.status >= 400 && response.status < 600 ? response.status : 502;
    return errorResponse(status, message);
  }

  return NextResponse.json(
    { success: true, resumeUrl: data.resumeUrl },
    { status: 201 }
  );
}
