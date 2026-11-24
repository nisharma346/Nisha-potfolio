import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BACKEND_URL } from "../../../lib/backend";
import { verifyAdminToken } from "../../../lib/admin-auth";
import AdminDashboard from "./dashboard-client";

export const metadata = {
  title: "Admin Dashboard — Nisha Portfolio",
  description: "Manage and review portfolio content.",
};

const collections = [
  { key: "projects", path: "/api/projects", label: "Projects" },
  { key: "skills", path: "/api/skills", label: "Skills" },
  { key: "education", path: "/api/education", label: "Education" },
  {
    key: "certifications",
    path: "/api/certifications",
    label: "Certifications",
  },
  {
    key: "testimonials",
    path: "/api/testimonials",
    label: "Testimonials",
  },
];

async function fetchCollection(collection) {
  const response = await fetch(`${BACKEND_URL}${collection.path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`${collection.label} request failed (${response.status})`);
  }

  const data = await response.json();
  const items = data[collection.key];

  if (data.success !== true || !Array.isArray(items)) {
    throw new Error(`${collection.label} response had an unexpected shape`);
  }

  return {
    count: Number.isFinite(data.count) ? data.count : items.length,
    items,
  };
}

function getActivity(collectionsData) {
  const activityFields = {
    projects: ["title", "technologies"],
    skills: ["name", "category"],
    education: ["degree", "institution"],
    certifications: ["title", "issuer"],
    testimonials: ["name", "role"],
  };

  return Object.entries(collectionsData)
    .flatMap(([key, result]) => {
      if (!result.available) return [];

      const [titleField, detailField] = activityFields[key];
      return result.items.flatMap((item) => {
        const createdAt = Date.parse(item.createdAt);
        const title = item[titleField];

        if (!title || !Number.isFinite(createdAt)) return [];

        const detail = item[detailField];
        const detailText = Array.isArray(detail)
          ? detail.join(", ")
          : detail;

        return [
          {
            id: item._id || `${key}-${title}-${createdAt}`,
            type: collections.find((collection) => collection.key === key).label,
            title,
            detail: detailText || "",
            createdAt,
            date: new Intl.DateTimeFormat("en", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(new Date(createdAt)),
          },
        ];
      });
    })
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 6);
}

export default async function AdminDashboardPage() {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const admin = await verifyAdminToken(token);
  if (!admin) {
    redirect("/admin/login");
  }

  const results = await Promise.allSettled(
    collections.map((collection) => fetchCollection(collection))
  );
  const collectionsData = Object.fromEntries(
    collections.map((collection, index) => {
      const result = results[index];
      return [
        collection.key,
        result.status === "fulfilled"
          ? { ...result.value, available: true }
          : { count: null, items: [], available: false },
      ];
    })
  );

  return (
    <AdminDashboard
      collections={collectionsData}
      activity={getActivity(collectionsData)}
    />
  );
}
