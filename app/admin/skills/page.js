import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiRequest } from "../../../lib/api";
import { verifyAdminToken } from "../../../lib/admin-auth";
import AdminDashboard from "../dashboard/dashboard-client";
import SkillsClient from "./skills-client";

export const metadata = {
  title: "Skills — Nisha Portfolio Admin",
  description: "Manage the skills featured on your portfolio.",
};

export default async function AdminSkillsPage() {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token || !(await verifyAdminToken(token))) {
    redirect("/admin/login");
  }

  let skills = [];
  let loadError = "";

  try {
    const data = await apiRequest("/api/skills/admin", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (data.success !== true || !Array.isArray(data.skills)) {
      throw new Error("The skills response had an unexpected shape.");
    }

    skills = data.skills;
  } catch (error) {
    loadError =
      error.message === "BACKEND_UNAVAILABLE"
        ? "Skills could not be loaded. Check that the backend is running and try again."
        : error.message || "Skills could not be loaded.";
  }

  return (
    <AdminDashboard pageTitle="Skills">
      <SkillsClient
        key={`${loadError}:${skills.map((skill) => skill._id).join(",")}`}
        skills={skills}
        initialError={loadError}
      />
    </AdminDashboard>
  );
}
