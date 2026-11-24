import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getData } from "../../../lib/api";
import { verifyAdminToken } from "../../../lib/admin-auth";
import AdminDashboard from "../dashboard/dashboard-client";
import ProjectsClient from "./projects-client";

export const metadata = {
  title: "Projects — Nisha Portfolio Admin",
  description: "Manage portfolio projects.",
};

export default async function AdminProjectsPage() {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token || !(await verifyAdminToken(token))) {
    redirect("/admin/login");
  }

  let projects = [];
  let loadError = "";

  try {
    const data = await getData("/api/projects");

    if (data.success !== true || !Array.isArray(data.projects)) {
      throw new Error("The projects response had an unexpected shape.");
    }

    projects = data.projects;
  } catch (error) {
    loadError =
      error.message === "BACKEND_UNAVAILABLE"
        ? "Projects could not be loaded. Check that the backend is running and try again."
        : error.message || "Projects could not be loaded.";
  }

  return (
    <AdminDashboard pageTitle="Projects">
      <ProjectsClient
        key={`${loadError}:${projects.map((project) => project._id).join(",")}`}
        projects={projects}
        initialError={loadError}
      />
    </AdminDashboard>
  );
}
