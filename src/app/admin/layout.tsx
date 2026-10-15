import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";

export const metadata = { title: { template: "%s — Admin", default: "Admin" } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/portal?notice=admin-denied");

  return (
    <div className="bg-brand-sand flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1 p-6 sm:p-10">{children}</div>
    </div>
  );
}
