import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Resurrection Platform - SAP Modernization SaaS",
  description: "Transform legacy ABAP into modern SAP CAP applications with AI",
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <div className="flex h-screen bg-gradient-to-b from-[#1a0f2e] via-[#0a0a0f] to-[#1a0f2e]">
            {/* Sidebar */}
            <AppSidebar />
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <AppHeader />
              
              {/* Page Content */}
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
          
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a0f2e',
                color: '#F7F7FF',
                border: '1px solid #5b21b6',
              },
            }}
          />
        </ErrorBoundary>
      </body>
    </html>
  );
}
