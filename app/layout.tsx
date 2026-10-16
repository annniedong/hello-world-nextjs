import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { HideOnLogin } from "@/components/hide-on-login";
import { MobileTabs } from "@/components/mobile-tabs";
import { Nav } from "@/components/nav";
import { getViewer } from "@/lib/viewer";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
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
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col pb-24 md:pb-0">
        <HideOnLogin>
          <Nav />
        </HideOnLogin>
        <div className="flex flex-1 flex-col">{children}</div>
        <MobileTabs signedIn={Boolean(user)} />
      </body>
    </html>
  );
}
