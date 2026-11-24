export const metadata = {
  title: "Admin Login — Nisha Portfolio",
  description: "Secure admin portal for Nisha Portfolio",
};

/**
 * Isolated layout for all /admin/* routes.
 * Does NOT inherit the public portfolio navbar/footer.
 */
export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      {children}
    </div>
  );
}
