import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Donation Tracker - Hometown Coffee",
  description: "Track and manage donation requests for Hometown Coffee",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
