'use client'

import * as React from 'react'

export function GradientBanner({
  title,
  subtitle,
  className,
}: {
  title: string
  subtitle?: string
  className?: string
}) {
  const sectionRef = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    // eslint-disable-next-line no-console
    console.info('[UI] GradientBanner', {
      className: el.className,
      size: { width: Math.round(rect.width), height: Math.round(rect.height) },
    })
  }, [])

  return (
    <section
      ref={el => {
        sectionRef.current = el
      }}
      className={[
        'relative overflow-hidden',
        'bg-gradient-to-r from-primary to-secondary',
        'px-6 py-14 sm:px-8 sm:py-20',
        className ?? '',
      ].join(' ')}
      style={{
        backgroundImage: 'url(/ttten.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      aria-label="CTF banner"
    >
      {/* Darkened overlay for better text readability */}
      <div className="pointer-events-none absolute inset-0 bg-black/40" />

      <div className="relative z-10 mx-auto max-w-6xl text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 text-base sm:text-lg text-white/90">{subtitle}</p>
        ) : null}
      </div>
    </section>
  )
}

export default GradientBanner
