import AdminDashboard from "../dashboard/dashboard-client";

export default function ExperiencesLoading() {
  return (
    <AdminDashboard pageTitle="Experience">
      <div className="admin-projects-loading" role="status">
        <span className="admin-spinner" />
        Loading experience records…
      </div>
    </AdminDashboard>
  );
}
