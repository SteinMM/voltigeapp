export interface Partner {
  id: string;
  name: string;
  logoUrl?: string;
  description: string;
  categories: string[];
  affiliateUrl: string;
  commission?: string;
  tags?: string[];
  featured?: boolean;
}

export const CATEGORIES = [
  "Auto's & Motoren",
  "Boeken, Literatuur & Media",
  "Duurzaam",
  "Electronica",
  "Energie",
  "Eten & Drinken",
  "Financiën & Verzekeren",
  "Gezondheid & Beauty",
  "Kinderen & Ouders",
  "Mode & Kleding",
  "Reizen",
  "Sport & Outdoor",
  "Wonen, Huis & Tuin",
] as const;

export type Category = (typeof CATEGORIES)[number];
