"use client";

/**
 * Tiny section heading used above each major dashboard area.
 * Decorative line + uppercase eyebrow + optional subtle aside on the right.
 */
export default function SectionHeading({ eyebrow, title, aside }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="h-px w-8 bg-accent-400" />
        <div>
          {eyebrow && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-500">
              {eyebrow}
            </p>
          )}
          <h2 className="text-[22px] leading-tight tracking-tight text-ink">
            {title}
          </h2>
        </div>
      </div>
      {aside && <div className="text-xs text-ink-muted">{aside}</div>}
    </div>
  );
}
