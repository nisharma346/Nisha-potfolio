import AdminDashboard from "../dashboard/dashboard-client";

export default function EducationLoading() {
  return (
    <AdminDashboard pageTitle="Education">
      <div className="admin-projects-loading" role="status">
        <span className="admin-spinner" />
        Loading education records…
      </div>
    </AdminDashboard>
  );
}
