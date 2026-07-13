"use client";
import Link from "next/link";
import { useSiteContent } from "@/lib/useSiteContent";
import Wordmark from "@/components/BigSam/Wordmark";

const Footer = () => {
  const { data } = useSiteContent();
  const s = data?.settings;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-white pt-14 pb-6">
      <div className="container">
        <div className="grid md:grid-cols-5 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={s?.site_logo || "/images/logo/logo-mark.jpg"}
                alt="Big-Sam Production"
                className="h-12 w-12 rounded-lg object-cover"
              />
              <Wordmark tone="dark" />
            </div>
            <p className="text-white/70 max-w-sm">
              {s?.event_tagline || "Discovering and nurturing Kenya's next generation of vocal talent."}
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-3">Explore</h4>
            <ul className="space-y-2 text-white/70">
              <li><Link href="/apply" className="hover:text-white">Apply</Link></li>
              <li><Link href="/prizes" className="hover:text-white">Prizes</Link></li>
              <li><Link href="/how-to-enter" className="hover:text-white">How to Enter</Link></li>
              <li><Link href="/services" className="hover:text-white">Services &amp; Packages</Link></li>
              <li><Link href="/sponsors" className="hover:text-white">Sponsors</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/status" className="hover:text-white">Check Status</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3">Legal</h4>
            <ul className="space-y-2 text-white/70">
              <li><Link href="/terms" className="hover:text-white">Terms &amp; Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/refund" className="hover:text-white">Refund Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3">Contact</h4>
            <ul className="space-y-2 text-white/70">
              {s?.contact_email && <li>{s.contact_email}</li>}
              {s?.contact_phone && <li>{s.contact_phone}</li>}
              {s?.event_venue && <li>{s.event_venue}</li>}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-white/60">
          <span>© {year} Big-Sam Production. All rights reserved.</span>
          <span>Payments secured via M-Pesa · Data handled per Kenya DPA 2019</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
