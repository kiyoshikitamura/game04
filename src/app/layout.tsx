import type { Metadata, Viewport } from "next";
import { ApplicationAvailability } from "./components/ApplicationAvailability";
import { readApplicationAvailability } from "@/lib/operations/server";
import "./styles.css";

export const metadata: Metadata = {
  title: "GAME04",
  description: "Identity-first Community Web Game",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Availability must be evaluated per request; a build-time snapshot could leave
// a maintenance transition invisible until the next deployment.
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const availability = await readApplicationAvailability();
  return (
    <html lang="ja">
      <body><ApplicationAvailability availability={availability}>{children}</ApplicationAvailability></body>
    </html>
  );
}
