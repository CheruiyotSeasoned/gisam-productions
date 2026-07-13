"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { headerData } from "../Header/Navigation/menuData";
import { useSiteContent } from "@/lib/useSiteContent";
import Wordmark from "@/components/BigSam/Wordmark";

/**
 * Big-Sam public site header — clean nav + Apply CTA, mobile drawer.
 */
const Header: React.FC = () => {
  const pathUrl = usePathname();
  const { data } = useSiteContent();
  const logo = data?.settings?.site_logo || "/images/logo/logo-mark.jpg";
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY >= 60);
    const onClick = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node) && navbarOpen) {
        setNavbarOpen(false);
      }
    };
    window.addEventListener("scroll", onScroll);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousedown", onClick);
    };
  }, [navbarOpen]);

  const onHome = pathUrl === "/";
  const solid = sticky || !onHome;

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        solid ? "bg-white shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Big-Sam Production home">
            <img
              src={logo}
              alt=""
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg object-cover shadow-sm ring-1 ring-black/5"
            />
            <Wordmark />
          </Link>

          <ul className="hidden lg:flex items-center gap-7">
            {headerData.map((item, i) => (
              <li key={i}>
                <Link
                  href={item.href}
                  className="text-base font-medium transition text-secondary hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Link
              href="/apply"
              className="hidden sm:inline-block bg-primary text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-primaryDark transition"
            >
              Apply Now
            </Link>
            <button
              onClick={() => setNavbarOpen(!navbarOpen)}
              className="lg:hidden p-2"
              aria-label="Toggle menu"
            >
              <span className="block w-6 h-0.5 bg-secondary"></span>
              <span className="block w-6 h-0.5 mt-1.5 bg-secondary"></span>
              <span className="block w-6 h-0.5 mt-1.5 bg-secondary"></span>
            </button>
          </div>
        </div>
      </div>

      {navbarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" />}
      <div
        ref={mobileMenuRef}
        className={`lg:hidden fixed top-0 right-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 z-50 ${
          navbarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-PowderBlueBorder">
          <Wordmark tag="" />
          <button onClick={() => setNavbarOpen(false)} aria-label="Close menu" className="text-2xl leading-none text-secondary">&times;</button>
        </div>
        <nav className="flex flex-col p-4 gap-1">
          {headerData.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              onClick={() => setNavbarOpen(false)}
              className="py-2.5 px-2 rounded text-secondary font-medium hover:bg-gray-100"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/apply"
            onClick={() => setNavbarOpen(false)}
            className="mt-3 bg-primary text-white text-center font-semibold px-4 py-3 rounded-lg"
          >
            Apply Now
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
