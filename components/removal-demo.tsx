"use client"

import { useState } from "react"

export function RemovalDemo() {
  const [paused, setPaused] = useState(false)
  return <button type="button" aria-label={paused ? "Play background removal demonstration" : "Pause background removal demonstration"} aria-pressed={paused} onClick={() => setPaused((value) => !value)} className={`relative block w-full overflow-hidden rounded-[24px] bg-[#dfe9e2] p-3 text-left sm:p-5 ${paused ? "[&_.removal-background]:[animation-play-state:paused]" : ""}`}>
    <span className="sr-only">A background is removed while the subject remains over a transparent checkerboard.</span>
    <span className="checkerboard relative block aspect-square overflow-hidden rounded-[18px] sm:aspect-[4/3]">
      <img src="/demo-subject.png" alt="" className="removal-background absolute inset-0 size-full object-cover" />
      <img src="/demo-subject.png" alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover [clip-path:polygon(34%_35%,62%_35%,64%_39%,68%_39%,74%_43%,77%_54%,75%_62%,68%_64%,64%_62%,63%_72%,35%_72%)]" />
      <span className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-[var(--muted)]">Background removed</span>
    </span>
  </button>
}
