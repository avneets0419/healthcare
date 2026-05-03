import AdminAuthWrapper from "@/components/shared/AdminAuthWrapper";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthWrapper>
      {children}
    </AdminAuthWrapper>
  );
}
