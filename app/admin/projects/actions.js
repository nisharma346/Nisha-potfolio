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

function normalizeProject(project) {
  if (!project || typeof project !== "object") {
    throw new Error("Project details are required.");
  }

  const title = typeof project.title === "string" ? project.title.trim() : "";
  const description =
    typeof project.description === "string" ? project.description.trim() : "";
  const technologies = Array.isArray(project.technologies)
    ? project.technologies
        .filter((technology) => typeof technology === "string")
        .map((technology) => technology.trim())
        .filter(Boolean)
    : null;
  const displayOrder = Number(project.displayOrder);

  if (!title || !description || technologies === null) {
    throw new Error("Title, description, and technologies are required.");
  }

  if (
    !Number.isInteger(displayOrder) ||
    displayOrder < 0 ||
    typeof project.featured !== "boolean"
  ) {
    throw new Error("Featured status and a valid display order are required.");
  }

  return {
    title,
    description,
    technologies,
    image: typeof project.image === "string" ? project.image.trim() : "",
    liveUrl: typeof project.liveUrl === "string" ? project.liveUrl.trim() : "",
    githubUrl:
      typeof project.githubUrl === "string" ? project.githubUrl.trim() : "",
    featured: project.featured,
    displayOrder,
  };
}

function requireProjectResponse(data) {
  if (data.success !== true || !data.project) {
    throw new Error(data.message || "The server returned an invalid project.");
  }

  return data;
}

export async function createProject(project) {
  const token = await getVerifiedAdminToken();
  const data = await postData(
    "/api/projects",
    normalizeProject(project),
    token
  );

  return requireProjectResponse(data);
}

export async function updateProject(id, project) {
  const token = await getVerifiedAdminToken();

  if (typeof id !== "string" || !id.trim()) {
    throw new Error("A valid project ID is required.");
  }

  const data = await updateData(
    `/api/projects/${encodeURIComponent(id)}`,
    normalizeProject(project),
    token
  );

  return requireProjectResponse(data);
}

export async function removeProject(id) {
  const token = await getVerifiedAdminToken();

  if (typeof id !== "string" || !id.trim()) {
    throw new Error("A valid project ID is required.");
  }

  const data = await deleteData(
    `/api/projects/${encodeURIComponent(id)}`,
    token
  );

  if (data.success !== true) {
    throw new Error(data.message || "The project could not be deleted.");
  }

  return data;
}
