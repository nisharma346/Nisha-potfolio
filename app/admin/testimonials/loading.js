import AdminDashboard from "../dashboard/dashboard-client";

export default function TestimonialsLoading() {
  return (
    <AdminDashboard pageTitle="Testimonials">
      <div className="admin-projects-loading" role="status">
        <span className="admin-spinner" />
        Loading testimonials…
      </div>
    </AdminDashboard>
  );
}
