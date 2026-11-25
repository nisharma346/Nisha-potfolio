import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiRequest } from "../../../lib/api";
import { verifyAdminToken } from "../../../lib/admin-auth";
import AdminDashboard from "../dashboard/dashboard-client";
import ExperiencesClient from "./experiences-client";

export const metadata = {
  title: "Experience — Nisha Portfolio Admin",
  description: "Manage experience records on your portfolio.",
};

export default async function AdminExperiencesPage() {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token || !(await verifyAdminToken(token))) {
    redirect("/admin/login");
  }

  let experiences = [];
  let loadError = "";

  try {
    const data = await apiRequest("/api/experiences/admin", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (data.success !== true || !Array.isArray(data.experiences)) {
      throw new Error("The experience response had an unexpected shape.");
    }

    experiences = data.experiences;
  } catch (error) {
    loadError =
      error.message === "BACKEND_UNAVAILABLE"
        ? "Experience records could not be loaded. Check that the backend is running and try again."
        : error.message || "Experience records could not be loaded.";
  }

  return (
    <AdminDashboard pageTitle="Experience">
      <ExperiencesClient
        key={`${loadError}:${experiences.map((item) => item._id).join(",")}`}
        experiences={experiences}
        initialError={loadError}
      />
    </AdminDashboard>
  );
}
