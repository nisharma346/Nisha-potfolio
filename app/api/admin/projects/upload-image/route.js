import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAdminToken } from "../../../../../lib/admin-auth";
import { BACKEND_URL } from "../../../../../lib/backend";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function errorResponse(status, message) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request) {
  const token = (await cookies()).get("admin_token")?.value;
  if (!token) {
    return errorResponse(401, "Please sign in to upload a project image.");
  }

  try {
    if (!(await verifyAdminToken(token))) {
      return errorResponse(401, "Your admin session has expired. Please sign in again.");
    }
  } catch {
    return errorResponse(503, "The admin service is unavailable. Please try again.");
  }

  if (!request.headers.get("content-type")?.startsWith("multipart/form-data;")) {
    return errorResponse(400, "Choose an image file to upload.");
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_SIZE + 65536) {
    return errorResponse(413, "Image files must be 5 MB or smaller.");
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse(400, "The image upload request is invalid.");
  }

  const files = formData.getAll("image");
  if (
    files.length !== 1 ||
    typeof files[0] === "string" ||
    typeof files[0]?.arrayBuffer !== "function"
  ) {
    return errorResponse(400, "Choose one image file to upload.");
  }

  const [file] = files;
  if (file.size === 0) {
    return errorResponse(400, "The selected image is empty.");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return errorResponse(413, "Image files must be 5 MB or smaller.");
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return errorResponse(400, "Choose a JPG, JPEG, PNG, or WEBP image.");
  }

  const upstreamFormData = new FormData();
  upstreamFormData.append("image", file, file.name);

  let response;
  try {
    response = await fetch(`${BACKEND_URL}/api/projects/upload-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: upstreamFormData,
      cache: "no-store",
      signal: AbortSignal.timeout(60000),
    });
  } catch {
    return errorResponse(503, "The image service is unavailable. Please try again.");
  }

  let responseBody;
  try {
    responseBody = await response.text();
  } catch {
    return errorResponse(502, "The backend image service could not be read.");
  }

  let data;
  try {
    data = JSON.parse(responseBody);
  } catch {
    if (response.status === 404) {
      return errorResponse(
        502,
        "The backend upload route is missing. Restart or redeploy the backend before uploading."
      );
    }

    return errorResponse(
      502,
      `The backend returned a non-JSON upload response (HTTP ${response.status}).`
    );
  }

  if (
    !response.ok ||
    data?.success !== true ||
    typeof data?.imageUrl !== "string"
  ) {
    const backendMessage =
      typeof data?.message === "string" ? data.message.trim() : "";
    const message =
      response.status === 401 || response.status === 403
        ? "Your admin session has expired. Please sign in again."
        : response.status === 413
          ? "Image files must be 5 MB or smaller."
          : response.status === 400
            ? "Choose a valid JPG, JPEG, PNG, or WEBP image."
            : response.status === 503
              ? "Image uploads are not configured on the backend."
              : backendMessage.length <= 180
                ? backendMessage || "Unable to upload the project image. Please try again."
                : "Unable to upload the project image. Please try again.";
    const status =
      response.status >= 400 && response.status < 600 ? response.status : 502;
    return errorResponse(status, message);
  }

  return NextResponse.json(
    { success: true, imageUrl: data.imageUrl },
    { status: 201 }
  );
}
