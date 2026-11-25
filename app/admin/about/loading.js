import AdminDashboard from "../dashboard/dashboard-client";

export default function AboutLoading() {
  return (
    <AdminDashboard pageTitle="About">
      <div className="admin-projects-loading" role="status">
        <span className="admin-spinner" />
        Loading About information…
      </div>
    </AdminDashboard>
  );
}
