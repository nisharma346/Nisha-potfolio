import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiRequest } from "../../../lib/api";
import { verifyAdminToken } from "../../../lib/admin-auth";
import AdminDashboard from "../dashboard/dashboard-client";
import TestimonialsClient from "./testimonials-client";

export const metadata = {
  title: "Testimonials — Nisha Portfolio Admin",
  description: "Manage genuine testimonials on your portfolio.",
};

export default async function AdminTestimonialsPage() {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token || !(await verifyAdminToken(token))) {
    redirect("/admin/login");
  }

  let testimonials = [];
  let loadError = "";

  try {
    const data = await apiRequest("/api/testimonials/admin", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (data.success !== true || !Array.isArray(data.testimonials)) {
      throw new Error("The testimonials response had an unexpected shape.");
    }

    testimonials = data.testimonials;
  } catch (error) {
    loadError =
      error.message === "BACKEND_UNAVAILABLE"
        ? "Testimonials could not be loaded. Check that the backend is running and try again."
        : error.message || "Testimonials could not be loaded.";
  }

  return (
    <AdminDashboard pageTitle="Testimonials">
      <TestimonialsClient
        key={`${loadError}:${testimonials.map((item) => item._id).join(",")}`}
        testimonials={testimonials}
        initialError={loadError}
      />
    </AdminDashboard>
  );
}
