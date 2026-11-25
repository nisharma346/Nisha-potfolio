import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiRequest } from "../../../lib/api";
import { verifyAdminToken } from "../../../lib/admin-auth";
import AdminDashboard from "../dashboard/dashboard-client";
import EducationClient from "./education-client";

export const metadata = {
  title: "Education — Nisha Portfolio Admin",
  description: "Manage education records on your portfolio.",
};

export default async function AdminEducationPage() {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token || !(await verifyAdminToken(token))) {
    redirect("/admin/login");
  }

  let education = [];
  let loadError = "";

  try {
    const data = await apiRequest("/api/education/admin", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (data.success !== true || !Array.isArray(data.education)) {
      throw new Error("The education response had an unexpected shape.");
    }

    education = data.education;
  } catch (error) {
    loadError =
      error.message === "BACKEND_UNAVAILABLE"
        ? "Education records could not be loaded. Check that the backend is running and try again."
        : error.message || "Education records could not be loaded.";
  }

  return (
    <AdminDashboard pageTitle="Education">
      <EducationClient
        key={`${loadError}:${education.map((item) => item._id).join(",")}`}
        education={education}
        initialError={loadError}
      />
    </AdminDashboard>
  );
}
