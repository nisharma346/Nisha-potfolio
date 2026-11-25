"use server";

import { cookies } from "next/headers";
import { deleteData, updateData } from "../../../lib/api";
import { verifyAdminToken } from "../../../lib/admin-auth";

async function getVerifiedAdminToken() {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token || !(await verifyAdminToken(token))) {
    throw new Error("Your admin session has expired. Please sign in again.");
  }

  return token;
}

function requireMessageId(id) {
  if (typeof id !== "string" || !id.trim()) {
    throw new Error("A valid contact message ID is required.");
  }

  return encodeURIComponent(id.trim());
}

export async function updateMessageStatus(id, status) {
  const token = await getVerifiedAdminToken();

  if (!["new", "read", "replied"].includes(status)) {
    throw new Error("Invalid contact message status.");
  }

  const data = await updateData(
    `/api/contact/${requireMessageId(id)}`,
    { status },
    token
  );

  if (data.success !== true || !data.contact || data.contact._id !== id) {
    throw new Error(data.message || "The contact message could not be updated.");
  }

  return data;
}

export async function deleteMessage(id) {
  const token = await getVerifiedAdminToken();
  const data = await deleteData(
    `/api/contact/${requireMessageId(id)}`,
    token
  );

  if (data.success !== true) {
    throw new Error(data.message || "The contact message could not be deleted.");
  }

  return data;
}
