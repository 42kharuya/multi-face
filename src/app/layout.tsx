import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/ui/BottomNav";
import SideNav from "@/components/ui/SideNav";
import TopBar from "@/components/ui/TopBar";
import AppHeader from "@/components/ui/AppHeader";
import ContextRail from "@/components/ui/ContextRail";
import { DetailPanelProvider } from "@/lib/detail-panel-context";

export const metadata: Metadata = {
  title: "MultiFace",
  description: "フェイス（多面性）で記録する SNS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700;800&family=Shippori+Mincho+B1:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full antialiased" style={{ background: "var(--mf-bg-light)", color: "var(--mf-text)" }}>
        <DetailPanelProvider>
          <div className="flex h-screen w-full overflow-hidden">
            <SideNav />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <AppHeader />
              <TopBar />
              <div className="flex flex-1 min-h-0 overflow-hidden">
                <main
                  className="flex-1 min-w-0 overflow-y-auto pb-16 md:pb-0"
                  style={{ borderRight: "0.5px solid var(--mf-line)" }}
                >
                  {children}
                </main>
                <ContextRail />
              </div>
            </div>
          </div>
          <BottomNav />
        </DetailPanelProvider>
      </body>
    </html>
  );
}
