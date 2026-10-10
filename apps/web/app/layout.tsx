import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Explainer Studio",
  description: "Create Hindi explainer videos from a topic or script.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="hi"><body>{children}</body></html>;
}
