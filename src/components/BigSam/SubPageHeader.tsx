"use client";

import Link from "next/link";
import Icon from "@/components/Icon";

/** Branded page header band for inner pages, with a simple breadcrumb. */
export default function SubPageHeader({
  title,
  subtitle,
  crumb,
}: {
  title: string;
  subtitle?: string;
  crumb?: string;
}) {
  return (
    <section className="relative bg-gradient-to-br from-secondary via-RegalBlue to-primary pt-36 pb-14 lg:pt-40 lg:pb-16 overflow-hidden">
      <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-ElectricAqua/20 blur-3xl" />
      <div className="container relative z-10">
        <nav className="flex items-center gap-2 text-sm text-white/70 mb-3">
          <Link href="/" className="hover:text-white">Home</Link>
          <Icon name="chevron-right" size={14} />
          <span className="text-white">{crumb || title}</span>
        </nav>
        <h1 className="!text-white text-white">{title}</h1>
        {subtitle && <p className="text-white/80 mt-3 max-w-2xl text-lg">{subtitle}</p>}
      </div>
    </section>
  );
}
