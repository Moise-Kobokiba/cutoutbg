import type { Metadata, Viewport } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" })

export const metadata: Metadata = { metadataBase: new URL("https://cutoutbg.com"), title: "CutoutBG — Remove Image Backgrounds", description: "Remove image backgrounds and create clean transparent cutouts with CutoutBG.", icons: { icon: [{ url: "/favicon/favicon.ico" }, { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" }], apple: "/favicon/apple-touch-icon.png" }, manifest: "/favicon/site.webmanifest", openGraph: { title: "CutoutBG — Remove Image Backgrounds", description: "Clean cutouts for the images that matter.", images: [{ url: "/brand/cutoutbg-logo.png", width: 1600, height: 1600, alt: "CutoutBG logo" }] } }
export const viewport: Viewport = { themeColor: "#f6f8f5", width: "device-width", initialScale: 1 }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body className={`${inter.variable} ${display.variable}`}>{children}</body></html> }
