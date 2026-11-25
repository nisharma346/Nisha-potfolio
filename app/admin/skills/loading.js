import AdminDashboard from "../dashboard/dashboard-client";

export default function SkillsLoading() {
  return (
    <AdminDashboard pageTitle="Skills">
      <div className="admin-projects-loading" role="status">
        <span className="admin-spinner" />
        Loading skills…
      </div>
    </AdminDashboard>
  );
}
