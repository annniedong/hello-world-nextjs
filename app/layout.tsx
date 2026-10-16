import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { MobileTabs } from "@/components/mobile-tabs";
import { Nav } from "@/components/nav";
import { getViewer } from "@/lib/viewer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "NYC Captions",
    template: "%s · NYC Captions",
  },
  description:
    "Upload a photo from your NYC day, pick a voice, and let AI write the captions. Vote on the funniest ones.",
  openGraph: {
    title: "NYC Captions",
    description:
      "AI writes the captions. You pick the winners. Photos from around New York.",
    type: "website",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { user } = await getViewer();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col pb-20 md:pb-0">
        <Nav />
        <div className="flex flex-1 flex-col">{children}</div>
        <MobileTabs signedIn={Boolean(user)} />
      </body>
    </html>
  );
}
