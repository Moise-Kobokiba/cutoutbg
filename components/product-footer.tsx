import Link from "next/link"

export function ProductFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--panel)]">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-12 sm:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="font-display text-xl font-bold tracking-[-0.04em]">Cutout<span className="text-[#718078]">BG</span></Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--muted)]">A focused image utility for clean, transparent cutouts.</p>
        </div>
        <FooterGroup title="Product" links={[["Remove Background", "/remove-background"], ["Tools", "/tools"], ["Pricing", "/pricing"]]} />
        <FooterGroup title="Developers" links={[["API", "/developers"], ["Documentation", "/developers"]]} />
        <FooterGroup title="Company" links={[["Log in", "/login"], ["Create account", "/signup"]]} />
      </div>
      <div className="mx-auto flex max-w-[1240px] flex-col gap-2 border-t border-[var(--line)] px-5 py-5 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>© 2026 CutoutBG</span><span>Product preview — accounts and processing are coming soon.</span></div>
    </footer>
  )
}

function FooterGroup({ title, links }: { title: string; links: string[][] }) {
  return <div><h2 className="text-xs font-bold uppercase tracking-[.16em] text-[var(--muted)]">{title}</h2><nav className="mt-4 flex flex-col items-start gap-3" aria-label={`${title} links`}>{links.map(([label, href]) => <Link key={href + label} href={href} className="text-sm text-[var(--foreground)] hover:text-[var(--muted)]">{label}</Link>)}</nav></div>
}
