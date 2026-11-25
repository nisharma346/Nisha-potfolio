"use server";

import { cookies } from "next/headers";
import { deleteData, postData, updateData } from "../../../lib/api";
import { verifyAdminToken } from "../../../lib/admin-auth";

async function getVerifiedAdminToken() {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token || !(await verifyAdminToken(token))) {
    throw new Error("Your admin session has expired. Please sign in again.");
  }

  return token;
}

function normalizeCertification(certification) {
  if (!certification || typeof certification !== "object") {
    throw new Error("Certification details are required.");
  }

  const stringFields = [
    "title",
    "issuer",
    "issueDate",
    "credentialId",
    "credentialUrl",
    "image",
    "description",
  ];
  const normalized = {};

  for (const field of stringFields) {
    const value = certification[field];

    if (value !== undefined && typeof value !== "string") {
      throw new Error(`${field} must be text.`);
    }

    normalized[field] = typeof value === "string" ? value.trim() : "";
  }

  if (!normalized.title || !normalized.issuer) {
    throw new Error("Certificate title and issuer are required.");
  }

  const displayOrder = Number(certification.displayOrder);
  if (!Number.isFinite(displayOrder)) {
    throw new Error("Display order must be a valid number.");
  }

  if (typeof certification.isVisible !== "boolean") {
    throw new Error("Visibility status must be selected.");
  }

  return {
    ...normalized,
    isVisible: certification.isVisible,
    displayOrder,
  };
}

function requireCertificationResponse(data) {
  if (
    data.success !== true ||
    !data.certification ||
    typeof data.certification._id !== "string"
  ) {
    throw new Error(
      data.message || "The server returned an invalid certification."
    );
  }

  return data;
}

function requireCertificationId(id) {
  if (typeof id !== "string" || !id.trim()) {
    throw new Error("A valid certification ID is required.");
  }

  return encodeURIComponent(id.trim());
}

export async function createCertification(certification) {
  const token = await getVerifiedAdminToken();
  const data = await postData(
    "/api/certifications",
    normalizeCertification(certification),
    token
  );

  return requireCertificationResponse(data);
}

export async function updateCertification(id, certification) {
  const token = await getVerifiedAdminToken();
  const data = await updateData(
    `/api/certifications/${requireCertificationId(id)}`,
    normalizeCertification(certification),
    token
  );

  return requireCertificationResponse(data);
}

export async function removeCertification(id) {
  const token = await getVerifiedAdminToken();
  const data = await deleteData(
    `/api/certifications/${requireCertificationId(id)}`,
    token
  );

  if (data.success !== true) {
    throw new Error(data.message || "The certification could not be deleted.");
  }

  return data;
}
