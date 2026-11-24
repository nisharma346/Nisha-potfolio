import { BACKEND_URL } from "./backend";

export async function verifyAdminToken(token) {
  const response = await fetch(`${BACKEND_URL}/api/admin/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  if (response.status === 401 || response.status === 403) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Admin session verification failed (${response.status})`);
  }

  const data = await response.json();
  if (data.success !== true || data.admin?.role !== "admin") {
    return null;
  }

  return data.admin;
}
