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

function normalizeEducation(education) {
  if (!education || typeof education !== "object") {
    throw new Error("Education details are required.");
  }

  const stringFields = [
    "degree",
    "institution",
    "fieldOfStudy",
    "startYear",
    "endYear",
    "grade",
    "description",
  ];
  const normalized = {};

  for (const field of stringFields) {
    const value = education[field];

    if (value !== undefined && typeof value !== "string") {
      throw new Error(`${field} must be text.`);
    }

    normalized[field] = typeof value === "string" ? value.trim() : "";
  }

  if (!normalized.degree || !normalized.institution) {
    throw new Error("Degree and institution are required.");
  }

  const displayOrder = Number(education.displayOrder);
  if (!Number.isFinite(displayOrder)) {
    throw new Error("Display order must be a valid number.");
  }

  if (typeof education.isVisible !== "boolean") {
    throw new Error("Visibility status must be selected.");
  }

  return {
    ...normalized,
    displayOrder,
    isVisible: education.isVisible,
  };
}

function requireEducationResponse(data) {
  if (
    data.success !== true ||
    !data.education ||
    typeof data.education._id !== "string"
  ) {
    throw new Error(
      data.message || "The server returned an invalid education record."
    );
  }

  return data;
}

function requireEducationId(id) {
  if (typeof id !== "string" || !id.trim()) {
    throw new Error("A valid education record ID is required.");
  }

  return encodeURIComponent(id.trim());
}

export async function createEducation(education) {
  const token = await getVerifiedAdminToken();
  const data = await postData(
    "/api/education",
    normalizeEducation(education),
    token
  );

  return requireEducationResponse(data);
}

export async function updateEducation(id, education) {
  const token = await getVerifiedAdminToken();
  const data = await updateData(
    `/api/education/${requireEducationId(id)}`,
    normalizeEducation(education),
    token
  );

  return requireEducationResponse(data);
}

export async function removeEducation(id) {
  const token = await getVerifiedAdminToken();
  const data = await deleteData(
    `/api/education/${requireEducationId(id)}`,
    token
  );

  if (data.success !== true) {
    throw new Error(data.message || "The education record could not be deleted.");
  }

  return data;
}
