import { Rouge_Script, Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";

export { viewport, metadata } from "@/app/lib/metadata";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const rougeScript = Rouge_Script({
  variable: "--font-rogue-script",
  weight: "400",
  subsets: ["latin"],
})

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${rougeScript.variable} ${jetBrainsMono.variable} antialiased grid place-items-center container mx-auto`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
