import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiRequest } from "../../../lib/api";
import { verifyAdminToken } from "../../../lib/admin-auth";
import AdminDashboard from "../dashboard/dashboard-client";
import MessagesClient from "./messages-client";

export const metadata = {
  title: "Contact Messages — Nisha Portfolio Admin",
  description: "Review and manage contact messages.",
};

export default async function AdminMessagesPage() {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token || !(await verifyAdminToken(token))) {
    redirect("/admin/login");
  }

  let messages = [];
  let loadError = "";

  try {
    const data = await apiRequest("/api/contact", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (data.success !== true || !Array.isArray(data.contacts)) {
      throw new Error("The contact messages response had an unexpected shape.");
    }

    messages = data.contacts;
  } catch (error) {
    loadError =
      error.message === "BACKEND_UNAVAILABLE"
        ? "Contact messages could not be loaded. Check that the backend is running and try again."
        : error.message || "Contact messages could not be loaded.";
  }

  return (
    <AdminDashboard pageTitle="Contact Messages">
      <MessagesClient
        key={`${loadError}:${messages.map((message) => message._id).join(",")}`}
        messages={messages}
        initialError={loadError}
      />
    </AdminDashboard>
  );
}
