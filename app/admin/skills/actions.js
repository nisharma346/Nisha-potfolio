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

function normalizeSkill(skill) {
  if (!skill || typeof skill !== "object") {
    throw new Error("Skill details are required.");
  }

  const name = typeof skill.name === "string" ? skill.name.trim() : "";
  const category =
    typeof skill.category === "string" ? skill.category.trim() || "Other" : "";
  const proficiency = Number(skill.proficiency);
  const displayOrder = Number(skill.displayOrder);

  if (!name || !category) {
    throw new Error("Skill name and category are required.");
  }

  if (!Number.isFinite(proficiency) || proficiency < 0 || proficiency > 100) {
    throw new Error("Proficiency must be a number from 0 to 100.");
  }

  if (!Number.isFinite(displayOrder)) {
    throw new Error("Display order must be a valid number.");
  }

  return { name, category, proficiency, displayOrder };
}

function requireSkillResponse(data) {
  if (data.success !== true || !data.skill || !data.skill._id) {
    throw new Error(data.message || "The server returned an invalid skill.");
  }

  return data;
}

function requireSkillId(id) {
  if (typeof id !== "string" || !id.trim()) {
    throw new Error("A valid skill ID is required.");
  }

  return encodeURIComponent(id.trim());
}

export async function createSkill(skill) {
  const token = await getVerifiedAdminToken();
  const data = await postData("/api/skills", normalizeSkill(skill), token);

  return requireSkillResponse(data);
}

export async function updateSkill(id, skill) {
  const token = await getVerifiedAdminToken();
  const data = await updateData(
    `/api/skills/${requireSkillId(id)}`,
    normalizeSkill(skill),
    token
  );

  return requireSkillResponse(data);
}

export async function removeSkill(id) {
  const token = await getVerifiedAdminToken();
  const data = await deleteData(`/api/skills/${requireSkillId(id)}`, token);

  if (data.success !== true) {
    throw new Error(data.message || "The skill could not be deleted.");
  }

  return data;
}
