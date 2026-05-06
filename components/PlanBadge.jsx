"use client";

import { planLabel, planBadgeClass } from "@/lib/plans";

/** Compact badge showing current plan. */
export default function PlanBadge({ plan, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={plan === "FREE" ? "Enter redeem code to unlock" : `Your plan: ${planLabel(plan)}`}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] transition hover:opacity-80 ${planBadgeClass(plan)}`}
    >
      {plan === "FREE" && (
        <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      )}
      {planLabel(plan)}
    </button>
  );
}
