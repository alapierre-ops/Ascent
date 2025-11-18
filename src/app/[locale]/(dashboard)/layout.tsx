// Layout for protected dashboard pages
// This layout will wrap all routes in the (dashboard) group

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

