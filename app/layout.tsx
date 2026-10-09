import type { Metadata } from "next";
import "@fontsource-variable/urbanist";
import "@fontsource-variable/space-grotesk";
import "./globals.css";
import { ToastProvider } from "@/components/ui";
import { SessionProvider } from "@/lib/session";

export const metadata: Metadata = {
  title: "Rankr",
  description: "AI CV ranking for recruiters",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
