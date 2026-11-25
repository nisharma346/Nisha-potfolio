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

function normalizeTestimonial(testimonial) {
  if (!testimonial || typeof testimonial !== "object") {
    throw new Error("Testimonial details are required.");
  }

  const stringFields = ["name", "role", "company", "message", "image"];
  const normalized = {};

  for (const field of stringFields) {
    const value = testimonial[field];

    if (value !== undefined && typeof value !== "string") {
      throw new Error(`${field} must be text.`);
    }

    normalized[field] = typeof value === "string" ? value.trim() : "";
  }

  if (!normalized.name || !normalized.message) {
    throw new Error("Name and testimonial message are required.");
  }

  const rating = Number(testimonial.rating);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be a number from 1 to 5.");
  }

  const displayOrder = Number(testimonial.displayOrder);
  if (!Number.isFinite(displayOrder)) {
    throw new Error("Display order must be a valid number.");
  }

  if (typeof testimonial.isVisible !== "boolean") {
    throw new Error("Visibility status must be selected.");
  }

  return {
    ...normalized,
    rating,
    displayOrder,
    isVisible: testimonial.isVisible,
  };
}

function requireTestimonialResponse(data) {
  if (
    data.success !== true ||
    !data.testimonial ||
    typeof data.testimonial._id !== "string"
  ) {
    throw new Error(
      data.message || "The server returned an invalid testimonial."
    );
  }

  return data;
}

function requireTestimonialId(id) {
  if (typeof id !== "string" || !id.trim()) {
    throw new Error("A valid testimonial ID is required.");
  }

  return encodeURIComponent(id.trim());
}

export async function createTestimonial(testimonial) {
  const token = await getVerifiedAdminToken();
  const data = await postData(
    "/api/testimonials",
    normalizeTestimonial(testimonial),
    token
  );

  return requireTestimonialResponse(data);
}

export async function updateTestimonial(id, testimonial) {
  const token = await getVerifiedAdminToken();
  const data = await updateData(
    `/api/testimonials/${requireTestimonialId(id)}`,
    normalizeTestimonial(testimonial),
    token
  );

  return requireTestimonialResponse(data);
}

export async function removeTestimonial(id) {
  const token = await getVerifiedAdminToken();
  const data = await deleteData(
    `/api/testimonials/${requireTestimonialId(id)}`,
    token
  );

  if (data.success !== true) {
    throw new Error(data.message || "The testimonial could not be deleted.");
  }

  return data;
}
