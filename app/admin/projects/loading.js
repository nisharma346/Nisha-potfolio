import AdminDashboard from "../dashboard/dashboard-client";

export default function ProjectsLoading() {
  return (
    <AdminDashboard pageTitle="Projects">
      <div className="admin-projects-loading" role="status">
        <span className="admin-spinner" />
        Loading projects…
      </div>
    </AdminDashboard>
  );
}
