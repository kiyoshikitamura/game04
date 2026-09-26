import type { Metadata } from "next";
import { GAME04_LEGAL } from "./legalConfig";

export const metadata: Metadata = {
  robots: GAME04_LEGAL.status === "draft" ? { index: false, follow: false } : { index: true, follow: true },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
