"use client";

import { useMemo } from "react";
import { useT } from "@/context/TranslationContext";

import {
  buildMapUrl,
  buildRouteUrl,
  formatCurrency,
  formatIDR,
  getCurrency,
  getBookingLink,
  transportIcon,
} from "@/lib/utils";

function bookingLabel(row) {
  const transport = String(row.transport || "").toLowerCase();
  const category = String(row.category || "").toLowerCase();

  if (transport.includes("flight")) {
    return {
      icon: "✈️",
      label: "Flights",
    };
  }

  if (category.includes("hotel")) {
    return {
      icon: "🏨",
      label: "Hotel",
    };
  }

  return {
    icon: "🎫",
    label: "Book",
  };
}

export default function PrintLayout({
  tripInfo,
  rows,
  dayMap,
  region,
  rate,
  totalLocal,
  totalIDR,
}) {
  const { t } = useT();

  const currency = getCurrency(region);
  const isIDR = currency.code === "IDR";

  const meaningfulRows = rows.filter(
    (r) =>
      r.destination ||
      r.city ||
      r.notes ||
      r.from ||
      r.to ||
      Number(r.budgetLocal) > 0 ||
      Number(r.budgetIDR) > 0
  );

  const grouped = useMemo(() => {
    const map = new Map();

    for (const row of meaningfulRows) {
      const key = row.date || "__nodate__";

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key).push(row);
    }

    return [...map.entries()];
  }, [meaningfulRows]);

  return (
    <div className="print-doc bg-white text-slate-900">

      {/* =========================
          TRIP INFO
      ========================== */}

      <section className="px-8 pt-6 pb-4">

        <div className="rounded-2xl border border-[#E8EDF3] bg-[#F8FAFC] p-5">

          {tripInfo?.clientName && (
            <div className="mb-4">

              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                PREPARED FOR CLIENT
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                {tripInfo.clientName}
              </h1>

            </div>
          )}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">

            <Info
              label="Duration"
              value={tripInfo?.duration || "—"}
            />

            <Info
              label="Destinations"
              value={tripInfo?.destinations || "—"}
            />

            <Info
              label="Travel Dates"
              value={
                tripInfo?.travelDates ||
                (tripInfo?.startDate && tripInfo?.endDate
                  ? `${tripInfo.startDate} – ${tripInfo.endDate}`
                  : "—")
              }
            />

            <Info
              label="Region"
              value={region || "—"}
            />

          </div>

        </div>

      </section>

{/* =========================
    SUMMARY
========================= */}

<section className="px-8 pb-8">

  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

    {/* QUICK OVERVIEW */}

    <div className="rounded-2xl border border-[#E8EDF3] bg-[#F8FAFC] p-5">

      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        QUICK OVERVIEW
      </p>

      <div className="mt-5 grid grid-cols-2 gap-4">

        <div>
          <p className="text-3xl font-bold text-slate-900">
            {meaningfulRows.length}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Stops
          </p>
        </div>

        <div>
          <p className="text-3xl font-bold text-slate-900">
            {grouped.length}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Days
          </p>
        </div>

      </div>

      <div className="mt-5 border-t border-slate-200 pt-4">

        <div className="flex items-center justify-between text-sm">

          <span className="text-slate-500">
            Region
          </span>

          <span className="font-semibold text-slate-900">
            {region || "—"}
          </span>

        </div>

      </div>

    </div>

    {/* TRANSPORT USAGE */}

    <div className="rounded-2xl border border-[#E8EDF3] bg-[#F8FAFC] p-5">

      <div className="flex items-center justify-between">

        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          TRANSPORT USAGE
        </p>

        <span className="text-xs text-slate-400">
          {
            meaningfulRows.filter((r) => r.transport).length
          } legs
        </span>

      </div>

      <div className="mt-5 space-y-4">

        {["Flight", "Train", "Bus", "Walk"].map((type) => {

          const count = meaningfulRows.filter((r) =>
            String(r.transport || "")
              .toLowerCase()
              .includes(type.toLowerCase())
          ).length;

          if (!count) return null;

          const totalTransport =
            meaningfulRows.filter((r) => r.transport).length || 1;

          const percentage =
            Math.round((count / totalTransport) * 100);

          return (

            <div key={type}>

              <div className="mb-1 flex items-center justify-between text-sm">

                <span className="font-medium text-slate-700">
                  {type}
                </span>

                <span className="text-slate-500">
                  {count}
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200">

                <div
                  className="h-full rounded-full bg-[#2563EB]"
                  style={{
                    width: `${percentage}%`,
                  }}
                />

              </div>

            </div>

          );
        })}

      </div>

    </div>

    {/* BUDGET BREAKDOWN */}

    <div className="rounded-2xl border border-[#E8EDF3] bg-[#F8FAFC] p-5">

      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        BUDGET BREAKDOWN
      </p>

      <div className="mt-5 space-y-4">

        {[
          {
            name: "Transport",
            color: "#EF4444",
          },
          {
            name: "Hotel",
            color: "#2563EB",
          },
          {
            name: "Food",
            color: "#F59E0B",
          },
          {
            name: "Activity",
            color: "#10B981",
          },
          {
            name: "Attraction",
            color: "#8B5CF6",
          },
        ].map((category) => {

          const amount = meaningfulRows
            .filter(
              (r) =>
                String(r.category || "").toLowerCase() ===
                category.name.toLowerCase()
            )
            .reduce(
              (sum, r) =>
                sum + Number(r.budgetLocal || 0),
              0
            );

          if (!amount) return null;

          const percentage =
            totalLocal > 0
              ? Math.round((amount / totalLocal) * 100)
              : 0;

          return (

            <div key={category.name}>

              <div className="mb-1 flex items-center justify-between text-sm">

                <span className="font-medium text-slate-700">
                  {category.name}
                </span>

                <span className="text-slate-500">
                  {percentage}%
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200">

                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${percentage}%`,
                    background: category.color,
                  }}
                />

              </div>

              <div className="mt-1 text-xs text-slate-500">

                {formatCurrency(
                  amount,
                  currency
                )}

              </div>

            </div>

          );
        })}

      </div>

    </div>

  </div>

</section>
    

      {/* =========================
          ITINERARY
      ========================== */}

      <section className="px-8 pb-8">

        <h2 className="mb-5 text-xl font-bold text-slate-900">
          Itinerary
        </h2>

        {grouped.length === 0 ? (

          <div className="rounded-xl border border-dashed border-slate-300 py-20 text-center text-slate-400">
            No itinerary entries yet.
          </div>

        ) : (

          grouped.map(([date, items], idx) => {

            const dayNumber =
              date !== "__nodate__"
                ? dayMap?.[date]
                : null;

            return (

              <section
                key={date + idx}
                className="mb-8 overflow-hidden rounded-2xl border border-slate-200"
              >

                {/* DAY HEADER */}

                <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0B3B6E] text-sm font-bold text-white">
                      {dayNumber || idx + 1}
                    </div>

                    <div>

                      <h3 className="text-2xl font-bold text-slate-900">
                        DAY {dayNumber || idx + 1}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {date !== "__nodate__" ? date : "No Date"}
                      </p>

                    </div>

                  </div>

                </div>

                {/* ITEMS */}

                <div>

                  {items.map((row, rowIdx) => {

                    const localBudget = Number(row.budgetLocal || 0);
                    const idrBudget = Number(row.budgetIDR || 0);

                    const booking = bookingLabel(row);

                    return (

                      <div
                        key={row.id || rowIdx}
                        className="border-b border-slate-100 px-6 py-6 last:border-b-0"
                      >

                        <div className="flex items-start justify-between gap-6">

                          {/* LEFT */}

                          <div className="flex-1">

                            <div className="flex gap-5">

                              {/* TIME */}

                              <div className="min-w-[64px] text-sm font-semibold text-slate-900">
                                {row.time || "—"}
                              </div>

                              {/* CONTENT */}

                              <div className="flex-1">

                                <h4 className="text-[28px] font-bold leading-tight text-slate-900">
                                  {row.destination || "Untitled Stop"}
                                </h4>

                                {(row.from || row.to) && (
                                  <p className="mt-2 text-base text-slate-500">
                                    {row.from || "—"} → {row.to || "—"}
                                  </p>
                                )}

                                {row.transport && (
                                  <div className="mt-2 text-base text-slate-500">
                                    {transportIcon(row.transport)} {row.transport}
                                  </div>
                                )}

                                {/* ACTION BUTTONS */}

                                <div className="mt-4 flex flex-wrap gap-2">

                                  {row.destination && (
                                    <a
                                      href={buildMapUrl(row.destination)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
                                    >
                                      📍 Map
                                    </a>
                                  )}

                                  {row.from && row.to && (
                                    <a
                                      href={buildRouteUrl(row.from, row.to)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
                                    >
                                      🗺️ Route
                                    </a>
                                  )}

                                  {row.destination && (
                                    <a
                                      href={getBookingLink(row.destination)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
                                    >
                                      {booking.icon} {booking.label}
                                    </a>
                                  )}

                                </div>

                              </div>

                            </div>

                          </div>

                          {/* RIGHT */}

                          <div className="min-w-[180px] text-right">

                            <div className="text-xl font-bold text-slate-900">
                              {formatCurrency(localBudget, currency)}
                            </div>

                            {!isIDR && (
                              <div className="mt-1 text-sm text-slate-500">
                                {formatIDR(idrBudget)}
                              </div>
                            )}

                          </div>

                        </div>

                      </div>

                    );
                  })}

                </div>

              </section>

            );
          })

        )}

      </section>

    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>

      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-900">
        {value}
      </p>

    </div>
  );
}