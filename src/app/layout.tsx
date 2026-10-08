import type { Metadata } from "next";
import { Anton, Inter_Tight, Roboto_Mono } from "next/font/google";
import { WalletProvider } from "@/components/wallet-provider";
import { AppHeader } from "@/components/app-header";
import "./globals.css";

const display = Anton({ subsets: ["latin"], weight: "400", variable: "--font-display", display: "swap" });
const body = Inter_Tight({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });
const mono = Roboto_Mono({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Verdant Relay",
  description: "Proof-backed environmental commitments on GenLayer.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <WalletProvider>
          <AppHeader />
          {children}
          <footer className="app-footer">
            <div>Verdant Relay - GenLayer StudioNet - public impact pledges reviewed from evidence packets</div>
          </footer>
        </WalletProvider>
      </body>
    </html>
  );
}
