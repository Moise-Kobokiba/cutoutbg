"use client"

import { useState } from "react"

export function RemovalDemo() {
  const [paused, setPaused] = useState(false)
  return <button type="button" aria-label={paused ? "Play background removal demonstration" : "Pause background removal demonstration"} aria-pressed={paused} onClick={() => setPaused((value) => !value)} className={`relative block w-full overflow-hidden rounded-[24px] bg-[#dfe9e2] p-3 text-left sm:p-5 ${paused ? "[&_.removal-reveal]:[animation-play-state:paused]" : ""}`}>
    <span className="sr-only">A background is removed while the subject remains over a transparent checkerboard.</span>
    <span className="checkerboard relative block aspect-[4/3] overflow-hidden rounded-[18px]">
      <img src="/demo-subject.png" alt="" className="absolute inset-0 size-full object-cover" />
      <span className="removal-reveal absolute inset-0 block origin-left bg-[var(--panel)]" aria-hidden="true" />
      <span className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-[var(--muted)]">Background removed</span>
    </span>
  </button>
}
