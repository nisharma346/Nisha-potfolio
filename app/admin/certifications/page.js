import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiRequest } from "../../../lib/api";
import { verifyAdminToken } from "../../../lib/admin-auth";
import AdminDashboard from "../dashboard/dashboard-client";
import CertificationsClient from "./certifications-client";

export const metadata = {
  title: "Certifications — Nisha Portfolio Admin",
  description: "Manage certification records on your portfolio.",
};

export default async function AdminCertificationsPage() {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token || !(await verifyAdminToken(token))) {
    redirect("/admin/login");
  }

  let certifications = [];
  let loadError = "";

  try {
    const data = await apiRequest("/api/certifications/admin", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (data.success !== true || !Array.isArray(data.certifications)) {
      throw new Error("The certifications response had an unexpected shape.");
    }

    certifications = data.certifications;
  } catch (error) {
    loadError =
      error.message === "BACKEND_UNAVAILABLE"
        ? "Certifications could not be loaded. Check that the backend is running and try again."
        : error.message || "Certifications could not be loaded.";
  }

  return (
    <AdminDashboard pageTitle="Certifications">
      <CertificationsClient
        key={`${loadError}:${certifications.map((item) => item._id).join(",")}`}
        certifications={certifications}
        initialError={loadError}
      />
    </AdminDashboard>
  );
}
