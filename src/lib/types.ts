// Shared types for the Big-Sam public site + admin.

export interface SiteSettings {
  event_name: string;
  event_tagline: string;
  event_date: string;
  event_venue: string;
  event_city: string;
  fee_amount: number;
  fee_currency: string;
  paybill_number: string;
  paybill_account: string;
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
