"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useEffect, useState } from "react"

const links = [
  { href: "/remove-background", label: "Remove Background" },
  { href: "/tools", label: "Tools" },
  { href: "/pricing", label: "Pricing" },
  { href: "/developers", label: "API" },
]

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false) }
    document.addEventListener("keydown", closeOnEscape)
    return () => document.removeEventListener("keydown", closeOnEscape)
  }, [menuOpen])
  return <header className="relative z-20 mx-auto w-full max-w-[1240px] px-5 py-5 lg:px-8">
    <div className="flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-[-0.04em]" aria-label="CutoutBG home" onClick={() => setMenuOpen(false)}><span className="flex size-7 items-center justify-center rounded-[9px] bg-[var(--accent)] text-sm font-black text-[var(--accent-ink)]">C</span>Cutout<span className="text-[#718078]">BG</span></Link>
      <nav className="hidden items-center gap-7 text-sm font-medium text-[var(--muted)] md:flex" aria-label="Primary navigation">{links.map((link) => <Link key={link.href} href={link.href} className="transition-colors hover:text-[var(--foreground)]">{link.label}</Link>)}</nav>
      <div className="flex items-center gap-3"><Link href="/login" className="hidden px-2 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)] sm:block">Log in</Link><Link href="/signup" className="hidden rounded-full bg-[var(--deep)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#234c3e] sm:block">Get started</Link><button type="button" className="rounded-full border border-[var(--line)] p-2 md:hidden" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button></div>
    </div>
    {menuOpen && <nav className="mt-4 flex flex-col gap-1 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-2 shadow-sm md:hidden" aria-label="Mobile navigation">{links.map((link) => <Link key={link.href} href={link.href} className="rounded-xl px-4 py-3 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--soft)]" onClick={() => setMenuOpen(false)}>{link.label}</Link>)}<Link href="/login" className="rounded-xl px-4 py-3 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--soft)]" onClick={() => setMenuOpen(false)}>Log in</Link><Link href="/signup" className="mt-1 rounded-xl bg-[var(--deep)] px-4 py-3 text-sm font-semibold text-white" onClick={() => setMenuOpen(false)}>Get started</Link></nav>}
  </header>
}
