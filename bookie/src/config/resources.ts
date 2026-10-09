import { FileText, BadgePercent, BookOpen, type LucideIcon } from "lucide-react";

export interface ResourceItem {
  title: string;
  description: string;
  icon: LucideIcon;
  /**
   * TODO(phase-2): Populate with a real, access-controlled resource URL once
   * files are supplied. Actual protected delivery (verifying the visitor
   * submitted the form, preventing unauthenticated/direct-link access, etc.)
   * must be implemented server-side — a frontend-only check cannot stop a
   * URL from being copied and shared, so `url` stays `null` until a backend
   * exists to gate it.
   */
  url: string | null;
}

export const resources: ResourceItem[] = [
  {
    title: "Product Catalog & Technical Specs",
    description:
      "Explore our product range, technical specifications, and key capabilities.",
    icon: FileText,
    url: null,
  },
  {
    title: "Exhibition Exclusive Offer",
    description:
      "Access the exclusive materials and offers available to exhibition visitors.",
    icon: BadgePercent,
    url: null,
  },
  {
    title: "Industry Case Studies & Solutions Guide",
    description:
      "Discover practical applications, industry insights, and solution examples.",
    icon: BookOpen,
    url: null,
  },
];
