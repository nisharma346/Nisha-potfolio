import AdminDashboard from "../dashboard/dashboard-client";

export default function MessagesLoading() {
  return (
    <AdminDashboard pageTitle="Contact Messages">
      <div className="admin-projects-loading" role="status">
        <span className="admin-spinner" />
        Loading contact messages…
      </div>
    </AdminDashboard>
  );
}
