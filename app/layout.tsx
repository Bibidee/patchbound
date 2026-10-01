import type {Metadata} from "next";
import "./globals.css";
import {WalletProvider} from "@/components/WalletProvider";
import {Shell} from "@/components/Shell";

export const metadata: Metadata = {
  title: "PATCHBOUND / Protocol Observatory",
  description: "Trust-minimized acceptance escrow for public GitHub fixes on GenLayer Studionet.",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return <html lang="en"><body><WalletProvider><Shell>{children}</Shell></WalletProvider></body></html>;
}
