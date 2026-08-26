import type { ReactNode } from "react";
import { Sidebar } from "@/components/admin/Sidebar";

export const metadata = { title: { template: "%s — Admin", default: "Admin" } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-brand-sand flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1 p-6 sm:p-10">{children}</div>
    </div>
  );
}
