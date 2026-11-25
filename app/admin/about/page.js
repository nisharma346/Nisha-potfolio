import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiRequest } from "../../../lib/api";
import { verifyAdminToken } from "../../../lib/admin-auth";
import AdminDashboard from "../dashboard/dashboard-client";
import AboutClient from "./about-client";

export const metadata = {
  title: "About — Nisha Portfolio Admin",
  description: "Manage the About information shown on your portfolio.",
};

export default async function AdminAboutPage() {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token || !(await verifyAdminToken(token))) {
    redirect("/admin/login");
  }

  let about = null;
  let loadError = "";

  try {
    const data = await apiRequest("/api/about/admin", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (
      data.success !== true ||
      !Object.prototype.hasOwnProperty.call(data, "about") ||
      (data.about !== null &&
        (typeof data.about !== "object" || typeof data.about._id !== "string"))
    ) {
      throw new Error("The About response had an unexpected shape.");
    }

    about = data.about;
  } catch (error) {
    loadError =
      error.message === "BACKEND_UNAVAILABLE"
        ? "About information could not be loaded. Check that the backend is running and try again."
        : error.message || "About information could not be loaded.";
  }

  return (
    <AdminDashboard pageTitle="About">
      <AboutClient
        key={`${loadError}:${about?._id || "none"}:${about?.updatedAt || ""}`}
        about={about}
        initialError={loadError}
      />
    </AdminDashboard>
  );
}
