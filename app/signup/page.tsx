import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { PrototypeForm } from "@/components/prototype-form"
export const metadata: Metadata = { title: "Create Account — CutoutBG", description: "Create your future CutoutBG account." }
export default function SignupPage() { return <><SiteHeader /><main className="mx-auto grid max-w-[1100px] gap-12 px-5 pb-24 pt-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-8 lg:pt-20"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--muted)]">Account</p><h1 className="mt-4 font-display text-5xl font-bold tracking-[-.06em]">Create your CutoutBG account</h1><p className="mt-5 max-w-md leading-7 text-[var(--muted)]">Save your place for the workspace release. Account creation is represented as a prototype for now.</p></div><section className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 sm:p-8"><PrototypeForm kind="signup" /><p className="mt-6 text-center text-sm text-[var(--muted)]">Already have an account? <Link href="/login" className="font-bold text-[var(--foreground)]">Log in</Link></p></section></main></> }
