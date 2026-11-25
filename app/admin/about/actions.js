"use server";

import { cookies } from "next/headers";
import { updateData } from "../../../lib/api";
import { verifyAdminToken } from "../../../lib/admin-auth";

async function getVerifiedAdminToken() {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token || !(await verifyAdminToken(token))) {
    throw new Error("Your admin session has expired. Please sign in again.");
  }

  return token;
}

function normalizeAbout(about) {
  if (!about || typeof about !== "object") {
    throw new Error("About details are required.");
  }

  const stringFields = [
    "name",
    "role",
    "shortBio",
    "description",
    "profileImage",
    "resumeUrl",
    "education",
    "location",
    "email",
  ];
  const normalized = {};

  for (const field of stringFields) {
    const value = about[field];

    if (value !== undefined && typeof value !== "string") {
      throw new Error(`${field} must be text.`);
    }

    normalized[field] = typeof value === "string" ? value.trim() : "";
  }

  if (!normalized.name || !normalized.role || !normalized.shortBio) {
    throw new Error("Name, role, and short bio are required.");
  }

  if (typeof about.isVisible !== "boolean") {
    throw new Error("Visibility status must be selected.");
  }

  normalized.isVisible = about.isVisible;

  return normalized;
}

export async function updateAbout(id, about) {
  const token = await getVerifiedAdminToken();

  if (typeof id !== "string" || !id.trim()) {
    throw new Error("A valid About record ID is required.");
  }

  const data = await updateData(
    `/api/about/${encodeURIComponent(id.trim())}`,
    normalizeAbout(about),
    token
  );

  if (
    data.success !== true ||
    !data.about ||
    data.about._id !== id
  ) {
    throw new Error(data.message || "The server returned an invalid About record.");
  }

  return data;
}
