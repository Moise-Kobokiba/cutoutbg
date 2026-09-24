import type { Metadata, Viewport } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" })

export const metadata: Metadata = {
  title: "CutoutBG — Remove Image Backgrounds",
  description: "Remove image backgrounds and create clean transparent cutouts with CutoutBG.",
  openGraph: { title: "CutoutBG — Remove Image Backgrounds", description: "Clean cutouts for the images that matter." },
}
export const viewport: Viewport = { themeColor: "#f6f8f5", width: "device-width", initialScale: 1 }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body className={`${inter.variable} ${display.variable}`}>{children}</body></html> }
