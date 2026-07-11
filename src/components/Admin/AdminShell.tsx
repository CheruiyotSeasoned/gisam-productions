"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminGuard, adminLogout, AdminUser } from "@/lib/adminAuth";
import Icon, { IconName } from "@/components/Icon";

const NAV: { href: string; label: string; icon: IconName; exact?: boolean; adminOnly?: boolean }[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true },
  { href: "/admin/applications", label: "Applications", icon: "mic" },
  { href: "/admin/payments", label: "Payments", icon: "credit-card" },
  { href: "/admin/sponsors", label: "Sponsors", icon: "handshake" },
  { href: "/admin/content", label: "CMS Content", icon: "file-text" },
  { href: "/admin/settings", label: "Settings", icon: "settings", adminOnly: true },
];

export default function AdminShell({ children }: { children: (user: AdminUser) => React.ReactNode }) {
  const { user, loading } = useAdminGuard();
  const pathname = usePathname();
  const router = useRouter();

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-10 h-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  const isActive = (item: any) =>
    item.exact ? pathname === item.href : pathname?.startsWith(item.href);

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary text-white flex-col hidden md:flex fixed h-full">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary font-black">B</span>
            <div>
              <div className="font-extrabold leading-none">BIG-SAM</div>
              <div className="text-xs text-white/50">Admin</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.filter((n) => !n.adminOnly || user.role === "admin").map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                isActive(item) ? "bg-primary text-white font-semibold" : "text-white/70 hover:bg-white/10"
              }`}
            >
              <Icon name={item.icon} size={18} /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <a href="/" target="_blank" className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white"><Icon name="external-link" size={16} /> View public site</a>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 md:ml-64">
        <header className="bg-white shadow-sm px-6 py-3 flex justify-between items-center sticky top-0 z-10">
          <div className="md:hidden font-bold text-secondary">BIG-SAM Admin</div>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-slate-500">
              {user.name} <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{user.role}</span>
            </span>
            <button
              onClick={() => adminLogout(router)}
              className="text-sm border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="md:hidden bg-secondary text-white flex overflow-x-auto">
          {NAV.filter((n) => !n.adminOnly || user.role === "admin").map((item) => (
            <Link key={item.href} href={item.href} className={`px-4 py-3 whitespace-nowrap text-sm inline-flex items-center gap-2 ${isActive(item) ? "bg-primary" : ""}`}>
              <Icon name={item.icon} size={16} /> {item.label}
            </Link>
          ))}
        </div>

        <main className="p-4 md:p-6">{children(user)}</main>
      </div>
    </div>
  );
}
