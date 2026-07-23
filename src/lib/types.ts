// Shared types for the Big-Sam public site + admin.

export interface SiteSettings {
  event_name: string;
  event_tagline: string;
  event_date: string;
  event_venue: string;
  event_city: string;
  fee_amount: number;
  fee_currency: string;
  payment_mode: "stk" | "manual" | "free";
  paybill_number: string;
  paybill_account: string;
  paybill_business_name: string;
  till_number: string;
  application_open: boolean;
  application_deadline: string;
  application_cap: number;
  prize_1: number;
  prize_2: number;
  prize_3: number;
  top_n_recruited: number;
  whatsapp_contestant: string;
  whatsapp_sponsor: string;
  contact_email: string;
  contact_phone: string;
  post_event_mode: boolean;
  privacy_notice: string;
  site_logo: string;
  site_favicon: string;
  site_og_image: string;
}

export interface ContentBlock {
  key: string;
  title: string;
  body: string;
  data: any;
}

/** One thing Big-Sam Production does — shown on the homepage teaser and /services. */
export interface ServiceItem {
  title: string;
  text?: string;
  /** An Icon name (see components/Icon.tsx); falls back to "camera" if unknown. */
  icon?: string;
}

/** A bookable package, e.g. "Package A — KSh 30,000". */
export interface PackageItem {
  name: string;
  /** Free text, so "KSh 30,000" and "KSh 200 each" both work. */
  price: string;
  /** Bullet list of what the client gets. */
  includes: string[];
}

/** A named group of packages, e.g. "Wedding Coverage". */
export interface PackageGroup {
  name: string;
  note?: string;
  items: PackageItem[];
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
}

export interface AppGate {
  open: boolean;
  reasons: string[];
  deadline: string;
  cap: number;
  count: number;
}

export interface SiteContent {
  settings: SiteSettings;
  content: Record<string, ContentBlock>;
  faqs: Faq[];
  app_open: AppGate;
}
