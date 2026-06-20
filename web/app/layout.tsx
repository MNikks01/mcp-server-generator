import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MCPForge — Turn any API into an MCP server",
  description:
    "Paste an OpenAPI spec (JSON or YAML) and get a production-ready, well-described MCP server in minutes — auth, validation, and good tool descriptions included. Runs in Claude Desktop.",
  keywords: ["MCP", "Model Context Protocol", "OpenAPI", "Claude", "AI agents", "MCP server generator"],
  openGraph: {
    title: "MCPForge — Turn any API into an MCP server",
    description: "Production-ready MCP servers, generated from an OpenAPI spec.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
