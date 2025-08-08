import type { Metadata } from "next";
import localFont from "next/font/local";
import "../style/globals.css";
import { ApolloWrapper } from "../lib/ApolloWrapper";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
// import AppSidebar from "@/components/app-sidebar";
import Header from "@/components/header";

const geistSans = localFont({
  src: "../style/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "../style/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Event Feedback Hub",
  description:
    "Showcase App created with Next.js, turbopack, shadcn/ui, tailwind.css, and apollo server / client. ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ApolloWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              {/* <AppSidebar /> */}
              <SidebarInset>
                <Header />
                {children}
              </SidebarInset>
            </SidebarProvider>
          </ThemeProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
