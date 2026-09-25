"use client"

import { useState } from "react"

export function RemovalDemo() {
  const [paused, setPaused] = useState(false)

  return (
    <button
      type="button"
      aria-label={paused ? "Play background removal demonstration" : "Pause background removal demonstration"}
      aria-pressed={paused}
      onClick={() => setPaused((value) => !value)}
      className={`relative block w-full overflow-hidden rounded-[24px] bg-[#dfe9e2] p-3 text-left sm:p-5 ${paused ? "[&_.removal-background]:[animation-play-state:paused]" : ""}`}
    >
      <span className="sr-only">A background is removed while the subject remains over a transparent checkerboard.</span>
      <span className="checkerboard relative block aspect-square overflow-hidden rounded-[18px] sm:aspect-[4/3]">
        <img src="/demo-subject.png" alt="" className="removal-background absolute inset-0 size-full object-cover" />
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden="true">
          <defs>
            <mask id="cutout-subject-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
              <rect width="100" height="100" fill="black" />
              <path
                fill="white"
                fillRule="evenodd"
                d="M34 35 C39 33 56 33 62 35 C63 36 63 38 64 39 C67 39 70 40 73 43 C76 46 78 50 78 55 C78 61 75 64 71 65 C68 65 66 64 64 62 L63 72 C57 74 42 74 35 72 L35 58 C34 53 33 45 34 35 Z M68 48 C71 48 73 51 73 55 C73 59 71 61 68 60 C67 59 66 58 66 56 C66 52 66 50 68 48 Z"
              />
            </mask>
          </defs>
          <image href="/demo-subject.png" width="100" height="100" preserveAspectRatio="xMidYMid slice" mask="url(#cutout-subject-mask)" />
        </svg>
        <span className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-[var(--muted)]">Background removed</span>
      </span>
    </button>
  )
}
