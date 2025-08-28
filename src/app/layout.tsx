import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";


export const metadata: Metadata = {
  title: "Watashi",
  description: "Meet your planetary companions",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  icons: {
    icon: "/SUN_ICON2.png",
    shortcut: "/SUN_ICON2.png",
    apple: "/SUN_ICON2.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>

      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
