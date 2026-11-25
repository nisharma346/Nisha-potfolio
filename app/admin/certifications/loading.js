import AdminDashboard from "../dashboard/dashboard-client";

export default function CertificationsLoading() {
  return (
    <AdminDashboard pageTitle="Certifications">
      <div className="admin-projects-loading" role="status">
        <span className="admin-spinner" />
        Loading certifications…
      </div>
    </AdminDashboard>
  );
}
