"use client"

import { useRef, useState } from "react"

export function BeforeAfterViewer({ imageUrl }: { imageUrl: string }) {
  const [position, setPosition] = useState(52)
  const frameRef = useRef<HTMLDivElement>(null)
  const updatePosition = (clientX: number) => {
    const rect = frameRef.current?.getBoundingClientRect()
    if (!rect) return
    setPosition(Math.max(4, Math.min(96, ((clientX - rect.left) / rect.width) * 100)))
  }
  return <div ref={frameRef} className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-[#dfe9e2]" onPointerMove={(event) => { if (event.buttons === 1) updatePosition(event.clientX) }}>
    <img src={imageUrl} alt="Original image with its background" className="absolute inset-0 size-full object-cover" />
    <div className="checkerboard absolute inset-y-0 right-0 overflow-hidden" style={{ left: `${position}%` }}><img src={imageUrl} alt="Background removed preview" className="absolute inset-y-0 right-0 h-full max-w-none object-cover" style={{ width: `${100 / (1 - position / 100)}%` }} /></div>
    <div className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(19,35,30,.18)]" style={{ left: `${position}%` }}><button type="button" aria-label="Adjust comparison divider" className="absolute left-1/2 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center rounded-full border-2 border-white bg-[var(--deep)] text-white shadow-lg" onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)} onPointerMove={(event) => { if (event.buttons === 1) updatePosition(event.clientX) }}>↔</button></div>
    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[var(--deep)]">Original</span><span className="absolute right-3 top-3 rounded-full bg-[var(--deep)]/90 px-3 py-1.5 text-xs font-semibold text-white">Background removed</span>
  </div>
}
