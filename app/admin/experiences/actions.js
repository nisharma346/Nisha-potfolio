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

function normalizeExperience(experience) {
  if (!experience || typeof experience !== "object") {
    throw new Error("Experience details are required.");
  }

  const stringFields = [
    "role",
    "company",
    "employmentType",
    "location",
    "startDate",
    "endDate",
    "description",
  ];
  const normalized = {};

  for (const field of stringFields) {
    const value = experience[field];

    if (value !== undefined && typeof value !== "string") {
      throw new Error(`${field} must be text.`);
    }

    normalized[field] = typeof value === "string" ? value.trim() : "";
  }

  if (!normalized.role || !normalized.company) {
    throw new Error("Job title and company are required.");
  }

  if (typeof experience.currentlyWorking !== "boolean") {
    throw new Error("Current position status must be selected.");
  }

  if (typeof experience.isVisible !== "boolean") {
    throw new Error("Visibility status must be selected.");
  }

  const displayOrder = Number(experience.displayOrder);
  if (!Number.isFinite(displayOrder)) {
    throw new Error("Display order must be a valid number.");
  }

  if (experience.currentlyWorking) {
    normalized.endDate = "";
  }

  return {
    ...normalized,
    employmentType: normalized.employmentType || "Other",
    displayOrder,
    currentlyWorking: experience.currentlyWorking,
    isVisible: experience.isVisible,
  };
}

function requireExperienceResponse(data) {
  if (
    data.success !== true ||
    !data.experience ||
    typeof data.experience._id !== "string"
  ) {
    throw new Error(
      data.message || "The server returned an invalid experience record."
    );
  }

  return data;
}

function requireExperienceId(id) {
  if (typeof id !== "string" || !id.trim()) {
    throw new Error("A valid experience record ID is required.");
  }

  return encodeURIComponent(id.trim());
}

export async function createExperience(experience) {
  const token = await getVerifiedAdminToken();
  const data = await postData(
    "/api/experiences",
    normalizeExperience(experience),
    token
  );

  return requireExperienceResponse(data);
}

export async function updateExperience(id, experience) {
  const token = await getVerifiedAdminToken();
  const data = await updateData(
    `/api/experiences/${requireExperienceId(id)}`,
    normalizeExperience(experience),
    token
  );

  return requireExperienceResponse(data);
}

export async function removeExperience(id) {
  const token = await getVerifiedAdminToken();
  const data = await deleteData(
    `/api/experiences/${requireExperienceId(id)}`,
    token
  );

  if (data.success !== true) {
    throw new Error(data.message || "The experience record could not be deleted.");
  }

  return data;
}
