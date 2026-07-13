"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  // Navigating closes the drawer; so does escape.
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Don't let the page scroll behind an open drawer.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-10 h-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  const items = NAV.filter((n) => !n.adminOnly || user.role === "admin");
  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : !!pathname?.startsWith(item.href);

  const sidebar = (
    <>
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary font-black">B</span>
          <div>
            <div className="font-extrabold leading-none">BIG-SAM</div>
            <div className="text-xs text-white/50">Admin</div>
          </div>
        </div>
        <button
          onClick={() => setMenuOpen(false)}
          className="md:hidden text-2xl leading-none text-white/60 hover:text-white px-2"
          aria-label="Close menu"
        >
          &times;
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => (
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
        <a href="/" target="_blank" className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white">
          <Icon name="external-link" size={16} /> View public site
        </a>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Desktop sidebar */}
      <aside className="w-64 bg-secondary text-white flex-col hidden md:flex fixed inset-y-0 left-0 z-30">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[80%] bg-secondary text-white flex flex-col md:hidden transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebar}
      </aside>

      {/* Main column */}
      <div className="md:ml-64">
        <header className="bg-white shadow-sm px-4 md:px-6 py-3 flex items-center gap-3 sticky top-0 z-20">
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden -ml-1 p-2 text-secondary"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <span className="block w-5 h-0.5 bg-current" />
            <span className="block w-5 h-0.5 bg-current mt-1" />
            <span className="block w-5 h-0.5 bg-current mt-1" />
          </button>

          <span className="md:hidden font-bold text-secondary">BIG-SAM</span>

          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            {/* The name is noise on a narrow screen — the role tag carries the meaning. */}
            <span className="text-sm text-slate-500 flex items-center gap-2">
              <span className="hidden sm:inline">{user.name}</span>
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{user.role}</span>
            </span>
            <button
              onClick={() => adminLogout(router)}
              className="text-sm border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="p-4 md:p-6">{children(user)}</main>
      </div>
    </div>
  );
}
